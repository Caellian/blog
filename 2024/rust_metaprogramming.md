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

For one of my classes, I wrote a discrete event simulation library in Rust. The
reasons I wrote it were...

- I like Rust.
- I did very little research into existing libraries.
- I needed filler for the essay as I covered the assigned topic and didn't have
  much content.
- I didn't like requirements some existing libraries imposed on data I used in
  my simulation.
- I have an adventurous spirit and like exploring topics I know little about,
  mostly through code.

I had several good references I used while doing so:
- [`sympy`](https://gitlab.com/team-simpy/simpy)
  - found this _after_ writing my thing, would've saved me time
  - listing it as a good alternative to quickly get started with simulation modeling
- [`sim`](https://github.com/ndebuhr/sim) - the library I used but didn't like
  the requirements of
  - taught me about [DEVS](https://en.wikipedia.org/wiki/DEVS) and diffent noise
    functions
- [`sequent`](https://github.com/kindredgroup/sequent)
  - seductively tempted me into implementing backtracking
- [`asynchronix`](https://github.com/asynchronics/asynchronix)
  - showed me all the things I want, but don't have time to implement properly

## Introduction

I wanted to build something dumb simple to use that doesn't have as steep
learning curve as some other solutions in the space have. So I made
[`litesim`](https://github.com/Caellian/litesim) (and described it in the essay
😄). The professor was like:

> I'm not sure _why_ you did it, that's much more than I asked for and it wasn't necessary. <span
> data-paraphrase></span>

which I guess is true, but I also felt like there was nothing simple enough for
use cases like mine, where I was on a tight schedule and needed to write a
simulation **fast**, without wasting time learning how to use 10 new concepts
introduced by a library that's supposed to make things simpler.

The biggest deal breaker was that the library I tried using required my data to
support things like serialization even though I never planned on storing an
in-flight model as it was supposed to be just a simple demo.

So instead of making a simulation, I made a discrete event simulation library
that I felt was the appropriate substitute. You could argue that the library was
a bigger time hog, but don't try me because I win arguments even when I know I'm
wrong. <span data-tone=half-joke></span>

### litesim

Litesim erases almost all library internals and leaves the end-user with a clean
slate when they're modelling a system. It's based on
[DEVS](https://en.wikipedia.org/wiki/DEVS) so the whole simulation is built out
of composable models (though it deviates a lot from the fromalism). The only
structs the user generally needs to interact with are `SystemModel`, `Simulation` and `ModelCtx`.

A simple ping-pong example requires less than 50 lines of code and very little
understanding of how the library works:

```rust
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
<div data-copy />

```rust
pub trait TypeList {
    type Head;
    type Tail: TypeList;
}
```

Now we can start implementing it for tuples we want to support:
```rust
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
<div data-copy/>

```rust
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
<div data-copy/>

```rust
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
<div data-copy/>

```rust
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
trait TypeSpaceFunction<T> {
    type Value = (Transformed, T);
}
```

One notable difference is that in Rust, we can associate trait implementations
with some other data which simplifies how we handle conditionals:

```rust
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
<div data-copy />

```rust
trait Apply {
    type Value;
}
```
and declare our "method":
```rust
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
<div data-copy />

```rust
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