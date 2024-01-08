---
title: "Rust Metaprogramming - Part 1"
summary: "They say macros are Rust equivalent of C++ metaprograming. No they ain't and I can prove it."
next: "2024/rust_metaprogramming_part2"
toot: "111705676105732187"
tags:
  - Rust
  - metaprogramming
  - abstraction
---

## Introduction

This article covers type metaprogramming principles in Rust via examples based on [`litesim`](https://github.com/Caellian/litesim).

It will go over type transformations that are necessary in order to provide
end-users with a type safe interface while reducing the amount of library
internals they're exposed to.

This is generally done with macros, and when people in Rust community say
metaprogramming they usually refer to writing procedural macros. But that isn't
ideal in some scenarios and allows end-users to violate API requirements which
can in turn cause undefined behavior.

For reference, I've only managed to find the posts that describe metaprogramming
via macros in context of Rust:
- ["Understanding and Implementing Rust's Metaprogramming"](https://reintech.io/blog/understanding-implementing-rust-metaprogramming) by [_Reintech_](https://reintech.io/)
- ["That's so Rusty: Metaprogramming"](https://dev.to/imaculate3/that-s-so-rusty-metaprogramming-49mj) by [_imaculate_](https://imaculate.github.io/)
- ["Metaprogramming with macros"](https://subscription.packtpub.com/book/web-development/9781800560819/2/ch02lvl1sec07/metaprogramming-with-macros) by [_packt_ publishing](https://packtpub.com)
- ["Rust Macros — Advanced Use Cases, Metaprogramming Mastery, and Code Generation"](https://medium.com/@alexandragrosu03/rust-macros-advanced-use-cases-metaprogramming-mastery-and-code-generation-6c8216af5086) by [_Alexandra Grosu_](https://medium.com/@alexandragrosu03)
- and so on...

Another approach I came across, in article ["Type-directed metaprogramming in
Rust"](https://willcrichton.net/notes/type-directed-metaprogramming-in-rust/) by
[_Will Crichton_](https://willcrichton.net), is using rustc API (rust compiler)
directly in order to achieve similar goals as this post tries to accomplish, but
internal rustc API is unstable which makes this approach both harder to
implement and time consuming to maintain across versions.
- I find it to be a great introduction to rust internals, HIR and AST representations.
- It makes sense to use it if one is developing something along the lines of [`c2rust`](https://github.com/immunant/c2rust/).

In general, metaprogramming (the kind I'm referring to) causes your codebase to
grow in both size and complexity (for both C++ and Rust), but in turn yields
nicer to use API interfaces that are much stricter, safer and concise to use.
Conversely, macros can be even more verbose, are somewhat easier to write, but
(in general) don't impose any additional bounds on the data that _can be passed_
into your API.

The following section summarizes the goals of `litesim` and why macros aren't
ideal for its use case.

### litesim

Litesim erases almost all library internals and leaves the end-user with a clean
slate when they're modelling a system. It's based on
[DEVS](https://en.wikipedia.org/wiki/DEVS) so the whole simulation is built out
of composable models (though it deviates a lot from the fromalism). The only
structs the user generally needs to interact with are `SystemModel`, `Simulation` and `ModelCtx`.

A simple ping-pong example would look like the following:

```rust
//#! name:"example"
use litesim::prelude::*;

pub struct Player;

#[litesim_model]
impl<'s> Model<'s> for Player {
    #[input(signal)]
    fn receive(&mut self, ctx: ModelCtx<'s>) -> Result<(), SimulationError> {
        ctx.schedule_update(Now)?;
        Ok(())
    }

    #[output(signal)]
    fn send(&self) -> Result<(), SimulationError>;

    fn handle_update(&mut self, ctx: ModelCtx<'s>) -> Result<(), SimulationError> {
        log::info!(
            "Player {} got the ball at {}",
            ctx.model_id.as_ref(),
            ctx.time
        );
        self.send(In(ctx.rand_range(0.0..1.0)))?;
        Ok(())
    }
}

fn main() {
    env_logger::builder()
        .filter_level(log::LevelFilter::Info)
        .init();

    let mut system = SystemModel::new();

    system.push_model("p1", Player);
    system.push_model("p2", Player);

    system.push_route(connection!(p1::send), connection!(p2::receive));
    system.push_route(connection!(p2::send), connection!(p1::receive));

    let mut sim = Simulation::new(rand::thread_rng(), system, 0.0).expect("invalid model");

    sim.schedule_event(0.5, Signal(), connection!(p1::receive))
        .expect("unable to schedule initial event");

    sim.run_until(50.0).expect("simulation error");
}
```

Most of the heavy lifting is done by the `#[litesim_model]` proc macro. This
macro does a lot of code transformation in the background in order to make the
`impl` block look as simple as it does.

In minimal form, implementing `Model<'s>` with it looks like:
```rust
//#! name:"example"
#[litesim_model]
impl<'s> Model<'s> for MyModel {}
```

The _generated code is type safe_, but if the user implements the `Model<'s>`
trait without the macro, they're allowed to send arbitrary data into outputs
which is not ideal. The macro ensures correctness by filling in specified output
parameter types manually into invoked function signature, but bad inputs really
only fail because argument and specified generic types don't match, not because
the function doesn't exist or some bounds weren't satisfied.

That's bad because the library assumes the provided type will be the same as the
one specified on the connecting input connector of another model. The other
model (generally) can't tell the address doesn't hold a valid type which can
then cause undefined behavior. Even assuming the layout of both types is
identical, it's still a semantic error and likely violates the API of the
receiving model.

There is no sane way to support this use case without resorting to type
metaprogramming. Macros can't handle the use case where `Model<'s>` might change
interface and lookup table(s) based on types litesim isn't aware of. So in order
to tackle this, I'd like to replace `Model<'s>` with something like:
```rust
//#! file:"model.rs"  hide-lines
trait Model<'s, I, O> {
  // details...
}
```

## What Lists Are Made Of

We're trying to specify different model inputs and outputs as a list of types.
Rust doesn't have variable argument generics
([yet](https://github.com/rust-lang/rfcs/issues/376)), but it does have
primitive that can convey similar information - **tuples**. The same is
generally used by C++ metaprogramming libraries such as
[`hana`](https://boostorg.github.io/hana/).

Tuple is a runtime type though, and the language doesn't have support for
operations we expect a list to support, and specifically doesn't support them
for _types_. Traits however allow us to add such information and `rustc` can
deal with it properly.

In order to have a useful type list, we need a way to destructure the list into
a **head** element and **tail** (remaining elements).

Type lists in C++ metaprogramming are built on the same principles, though they
are nicer to work with because of vararg generic support.

## Type List Type

We start by defining a trait we can use to specify some arbitrary type list. Due
to lack of vararg generics there will be an upper bound to our list but thanks
to macros we can make it arbitrarily large. Realistically, we don't expect
models with more than 64 inputs and outputs.

We declare our list trait with some basic properties:

```rust
//#! copy file:"type_list.rs"
pub trait TypeList {
    type Head;
    type Tail: TypeList;
}
```

Now we can start implementing it for tuples we want to support:
```rust
//#! file:"type_list.rs"
impl TypeList for () {
    type Head = !;
    type Tail = ();
}
// Uhm...
```

We can't use never type `!`
([again/yet](https://github.com/rust-lang/rust/issues/35121)) so we'll resort to
using unit `()` instead. Using `!` would've provided us with much cleaner error
messages and automagically handled bounds checking we'll have to deal with at a
later point. No matter, we will do without it.

```rust
//#! file:"type_list.rs"
pub trait TypeList {
    type Head;
    type Tail: TypeList;
}

impl TypeList for () {
    type Head = ();
    type Tail = ();
}

impl<A> TypeList for (A,) {
    type Head = A;
    type Tail = ();
}

impl<A, B> TypeList for (A, B) {
    type Head = A;
    type Tail = (B,);
}

impl<A, B, C> TypeList for (A, B, C) {
    type Head = A;
    type Tail = (B, C);
}
// 61 more...
```

Now that we've written out the first four cases, we can politely ask our
friendly neighborhood LLM to convert it into a macro for us:

```rust
//#! copy file:"type_list.rs"
macro_rules! impl_type_list {
    () => {
        impl TypeList for () {
            type Head = ();
            type Tail = ();
        }
    };
    
    ($A:ident) => {
        impl<$A> TypeList for ($A,) {
            type Head = $A;
            type Tail = ();
        }
    };
    
    ($A:ident, $($B:ident),*) => {
        impl<$A, $($B),*> TypeList for ($A, $($B),*) {
            type Head = $A;
            type Tail = ($($B,)*);
        }
    };
}
```

And apply some macro magic I picked up from
[`piccolo`](https://github.com/kyren/piccolo/issues/38#issuecomment-1819824923) 🪄:

```rust
//#! copy file:"util.rs"
macro_rules! smaller_tuples_too {
    ($m: ident, $ty: ident) => {
        $m!{}
        $m!{$ty}
    };
    ($m: ident, $ty: ident, $($tt: ident),*) => {
        smaller_tuples_too!{$m, $($tt),*}
        $m!{$ty, $($tt),*}
    };
}

// short for calling smaller_tuples_too with 64 arguments
macro_rules! all_supported_tuples {
    ($m: ident) => {
        #[rustfmt::skip]
        smaller_tuples_too!($m,
            A, B, C, D, E, F, G, H, I, J,
            K, L, M, N, O, P, Q, R, S, T,
            U, V, W, X, Y, Z, AA, AB, AC, AD,
            AE, AF, AG, AH, AI, AJ, AK, AL, AM, AN,
            AO, AP, AQ, AR, AS, AT, AU, AV, AW, AX,
            AY, AZ, BA, BB, BC, BD, BE, BF, BG, BH,
            BI, BJ, BK, BL
        );
    };
}
```

Combining the two macros allows us to generate 64 implementations of the
trait with a single macro call:

```rust
//#! copy file:"type_list.rs"
all_supported_tuples!(impl_type_list);
```

And just like that we've built a forward type iterator. You can give it a try in
the
[playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=9bab9b8c8284f08f50a1d2269da203f6)
([gist](https://gist.github.com/rust-play/9bab9b8c8284f08f50a1d2269da203f6)).

You'll notice that it's quite a pickle to access n-th element as we have to
reaffirm the type of `Tail` for each level.

We have to reaffirm the `Tail` event though we have specified that `Tail:
TypeList`, because the compiler can't just assume the next `Tail` is being
accessed from `TypeList` vtable because the result `Tail` might implement some
other trait that also has a `Tail` associated type. `Tail` might be a bad
example because it's unique in our context, but consider the following:
```rust
//#! name:"example"
trait MyTrait {
    type Error;
}
impl MyTrait for u32 {
    type Error = std::io::Error;
}

type Ambiguous = u32::Error; // Which Error?
type Explicit = <u32 as TryFrom<i32>>::Error; // TryFromIntError
```

We'll deal with this issue in a later post, I just wanted to acknowledge it at
this point. The operations we'll deal with in this post don't require indexing.

## Function Traits

In order to map types, we have to figure out how to transfer the concept of a
function into type space.

When it comes to compiled languages, there's typically a clear hierarchy
defining different types of data the compiler works with:

- Kind
- Type
- Constant value
- Runtime value

We won't conscern ourself with kinds and I listed them mostly for completeness -
AFAICT Rust doesn't have a concept of kinds (like [haskell
does](https://wiki.haskell.org/Kind)).

Conversion is (generally) only possible in the order the items are listed. In
many cases the compiler handles conversion automatically (e.g. allowing us to
call a const function with runtime arguments).

So in order for our types to stay in the type space, all conversion has to
happen inside it and we can't use constant functions for instance. That's
because constant functions deal with values and we want to manipulate types.

Rust allows us to handle type projection via type aliases much as C++ does. In
Rust however, we rely on traits instead of classes for the same functionality:

```rust
//#! name:"example"
trait TypeSpaceFunction<T> {
    type Value = (Transformed, T);
}
```

One notable difference is that in Rust, we can associate trait implementations
with some other data which simplifies how we handle conditionals:

```rust
//#! name:"example"
trait SplitFunction {
    type Value;
}
impl<T> SplitFunction for MyType<T> {
    type Value = T;
}
impl<T> SplitFunction for [T; N] {
    type Value = T;
}
```

In C++ template metaprogramming, we'd rely on using ifs in constant expressions
to achieve similar results because C++ allows evaluating types in constant
expressions. Rust is more strict so the type system is separate.

## Type Mapping

In order to transform our list of inputs `(A, B, C)` into a return type we're
expecting from our function:
```rust
//#! name:"example"
type Result = (
    (&'static str, &'static dyn Handler<Self, A>),
    (&'static str, &'static dyn Handler<Self, B>),
    (&'static str, &'static dyn Handler<Self, C>),
);
```
we need a way to perform a mapping operation on types.

Mapping is a composition of iteration which we have already built, application
of some projection and collection in the same container we iterated over. So in
order to perform projection we need to figure out how to express it efficiently.
Ideally in a way we can re(ab)use multiple times.

### Apply Operator

We start with a trait - our version of "call this thing":

```rust
//#! copy file:"mapping.rs"
trait Apply {
    type Value;
}
```
and declare our "method":
```rust
//#! file:"model.rs"
struct ToInputConnector<Model> {
    _phantom: std::marker::PhantomData<Model>,
}
```
We're using `Phantom` in `ToInputConnector` because rust will require us to
restrict `'s` while we're trying to implement `Apply` in the signature.
`ToInputConnector` also contains any types that stay constant throughout the
mapping operation. The `ToInputConnector` type will never be constructed or used
at runtime, as it's effectively used just as an implementation discriminant, so
we don't need to worry about providing any constructors.

Then we can specify how the method is applied, i.e. the body of the method:
```rust
//#! file:"model.rs"
impl<M, T> Apply for (ToInputConnector<M>, T)
where
    M: 'static,
    T: 'static,
{
    type Value = (&'static str, &'static dyn Handler<M, T>);
}
```
You'll notice we're implementing the method for a tuple of method and arguments
(in this case a single one), that's because we have no other way of passing
compile time information into `Apply`:

- If we tried storing `T` as a generic on `Apply`, we wouldn't be able to invoke
it for different types.
- Conversly, if we tried storing it on `ToInputConnector`, then our mapping
wouldn't be agnostic with respect to method it's applying.

So, in general, **variable types** are stored in the tuple we're calling `Apply`
on and **non-variable types** (such as `M` in the example case) should go into
the signature struct (`ToInputConnector`).

Note that multiple variable arguments will change how you implement
`TypeMapping` in the following section.

### Collector

Now that we're done with _application_ part of our mapping, we need a
**collector** that would allow us to create a tuple from a list of mapped input
types.

Sadly, this is a place we have to declare multiple implementations again for
each tuple size. As always, macros come to the rescue:

```rust
//#! copy file:"mapping.rs"
pub trait TypeMapping<Method> {
    type Value;
}

macro_rules! impl_mapping {
    () => {
        impl<Method> TypeMapping<Method> for ()
        {
            type Value = ();
        }
    };
    ($($A: ident),+) => {
        impl<Method, $($A),+> TypeMapping<Method> for ($($A,)+)
        where
            $((Method, $A): Apply),+
        {
            type Value = (
                $(<(Method, $A) as Apply>::Value,)+
            );
        }
    };
}

all_supported_tuples!(impl_mapping);
```
`TypeMapping` implementations here will change somewhat if your use case calls
for multiple variable types or lifetimes. They should be part of the tuple the
`TypeMapping` is implemented for.

You can see a simplified version without the constant `M` type (for model) on the
[playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=10f15816801e32933ed6777c02da93d2)([gist](https://gist.github.com/rust-play/10f15816801e32933ed6777c02da93d2)).

While writing this article, I also noticed that mapping with lifetimes doesn't
seem to work, so I removed the system lifetime from `ToInputConnector`
signature. Compiler seems to fail at normalizing associated types on a trait
that is implemented for struct with a lifetime ([minimal
reproduction](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=b539abe29f693183c9b785c6f904f508);
[rustc issue](https://github.com/rust-lang/rust/issues/106569)). 

For future reference (once the issue get fixed), lifetimes go on the
discriminant struct if they don't change through the mapping or are paired with
types in tuples the `TypeMapping` is implemented for if they do.

## Profit

Our new `Model` trait and implementation for `Player` looks as following:
```rust
//#! file:"model.rs"
struct ToInputConnector<Model> {
    _phantom: std::marker::PhantomData<Model>,
}
impl<M, T> Apply for (ToInputConnector<M>, T)
where
    M: 'static,
    T: 'static,
{
    type Value = (&'static str, &'static dyn Handler<M, T>);
}
struct ToOutputConnector;
impl<T> Apply for (ToOutputConnector, T)
    T: 'static,
{
    type Value = &'static str;
}

trait Model<'s, I: TypeList, O: TypeList>: Sized {
    fn input_connectors(&self) -> <I as TypeMapping<ToInputConnector<Self>>>::Value
    where
        I: TypeMapping<ToInputConnector<Self>>;

    fn output_connectors(&self) -> <O as TypeMapping<ToOutputConnector>>::Value
    where
        O: TypeMapping<ToOutputConnector>;

    // other functions...
}

struct Ball;
struct Player;

impl<'s> Model<'s, (Ball,), (Ball,)> for Player {
    fn input_connectors(&self) -> <(Ball,) as TypeMapping<ToInputConnector<Self>>>::Value
    where
        (Ball,): TypeMapping<ToInputConnector<Self>>,
    {
        (("recieve", handle_ball),)
    }
    fn output_connectors(&self) -> <(Ball,) as TypeMapping<ToOutputConnector>>::Value
    where
        (Ball,): TypeMapping<ToOutputConnector>,
    {
        ("send",)
    }
}

fn handle_ball(_model: &mut Player, _event: Ball) -> Result<(), String> {
    Ok(())
}
```

With that, connectors are done. I want to point out that the implementation
above (somewhat) successfully replaces a whole bunch of complicated code that
was previously generated by `#[litesim_model]`:
```rust
//#! file:"model.rs"
impl<'s> Model<'s> for Player {
    fn input_connectors(&self) -> Vec<&'static str> {
        vec!["receive"]
    }
    fn get_input_handler<'h>(&self, index: usize) -> Option<Box<dyn ErasedHandler<'h, 's>>>
    where
        's: 'h,
    {
        match index {
            0usize => {
                let handler: Box<&dyn Handler<&mut Player, Event<()>) -> Result<(), SimulationError>> = Box::new(
                    &(|_: &mut Player, _: Event<()>| {
                        // details...
                    }),
                );
                return Some(handler);
            }
            _ => return None,
        }
    }
    fn output_connectors(&self) -> Vec<OutputConnectorInfo> {
        vec![
            OutputConnectorInfo::new::<()>("send"),
        ]
    }
    // other functions...
}
```

Notably:
- We got rid of type erasure for `Handler`.
  - Now the `Model` will have to be type-erased in order for us to store it in a
    `Vec`. That's however much safer and we can now hide a whole bunch of
    implementation details from end-users (e.g. `ErasedHandler`,
    `OutputConnectorInfo`).
- Type signature dictates the number of connector labels and handlers, which
  prevents invalid use.
  - Previously, the library would internally panic with somewhat obscure stack
    traces which made it hard for end-users to realize they're violating API
    requirements.
- Accessing a handler function and connector names is now (at least on this
  level) a `O(1)` operation instead of `O(n)`.
  - As the compiler knows where are handlers are, it can go crazy with
    optimizations.
  - `O(n)` doesn't capture the fact that we could've had _a lot_ of jumps on our
    hot path.

In the process, we've also lost the ability to change the number of inputs and
outputs at runtime, but that part of functionality required a rework anyway as
it wasn't completely sound. I was forced to use `Vec` with dynamic type checking
without code introduced in this article. The original plan was defining a
separate `DynamicModel` trait so that `litesim` can avoid runtime type checking
for models with static interfaces.

We'll deal with the consumption of generated type signatures in a later post, as
well as going over how we can write a getter for our type lists and bridge
indices from runtime to compile time.
