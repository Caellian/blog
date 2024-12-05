---
title: "Rust Type Metaprogramming - Part 2"
summary: "Can't do nothin' with types you can't access. In this post I cover how to access type lists built in the previous article."
prev: "2024/rust_metaprogramming"
publish: false
tags:
  - Rust
  - metaprogramming
  - abstraction
---

## Introduction

In order to make our lives easier, and allow ourselves to treat the forward type
iterator as an actual type list, we'll define a `TypeIndex` trait that allows us to access n-th element of our `TypeList`.

We also need a way to access n-th element from the type list at runtime.

## Existing Solutions

As we'll have to perform operations on const numbers we'll use
[`typenum`](https://github.com/paholg/typenum) crate. Rust does support [const generics](https://github.com/rust-lang/rust/issues/44580), but const expressions aren't stable ([yet]()). 

Our `TypeIndex` trait declaration is rather simple:
<div data-copy></div>

```rust
use typenum::Unsigned;
trait TypeIndex<N: Unsigned> {
    type Value;
}
```

Our implementation of the trait, should look something like:

```rust
use std::ops::Sub;
use typenum::{Gr, Sub1, Unsigned, U0, U1};

impl<L> TypeIndex<U0> for L
where
    L: TypeList,
{
    type Value = L::Head;
}

impl<N, L> TypeIndex<N> for L
where
    N: Unsigned + Sub<U1>,
    L: TypeList,
    Sub1<N>: Unsigned
{
    type Value = <L::Tail as TypeIndex<Sub1<N>>>::Value;
}
```

Except the implementation above doesn't work. The compiler errors, stating that `typenum` _could_ at some
point implement `Sub1<N>: Unsigned` for `U0`. This is wrong as there's no number
lesser than `N = 0` which would satisfy the `Unsigned` constraint, so `typenum`
won't do that - the compiler can't understand semantics though.

The compiler also gives us a hint on how to solve this through that same error
message: while we can't guarantee the **upstream** crate won't change and break
our code, we _can_ guarantee that _our_ code won't do so because then it won't
compile. So what we need is to express the same semantics, only without relying
on `typenum` as our discriminant between `L::Head` and `<L::Tail as
Get<Sub1<N>>>::Value` cases.

To achieve this we want to copy `Sub1` from typenum, which is a type alias:
```rust
type Sub1<N> = <N as std::op::Sub<B1>>::Output;
```

## Decrement

In order to handle counting, we need our own `Decrease` trait so that we can implement it for existing `typenum` number types:

```rust
trait Decrease {
    type Value;
}

impl Decrease for U1 {
    type Value = U0;
}

impl Decrease for U2 {
    type Value = U1;
}

impl Decrease for U3 {
    type Value = U2;
}
// 61 more...
```

We can use macros again to reduce total amount of code:
<div data-copy/>

```rust
trait Decrease {
    type Value;
}

macro_rules! impl_decrease {
    ($current:ident, $next:ident) => {
        impl Decrease for typenum::$current {
            type Value = typenum::$next;
        }
    };
}

macro_rules! all_seq_pairs {
    ($m: ident, $ta: ident) => {};
    ($m: ident, $ta: ident, $tb: ident) => {
        $m!{$tb, $ta}
    };
    ($m: ident, $ta: ident, $tb: ident, $($tt: ident),*) => {
        $m!{$tb, $ta}
        all_seq_pairs!{$m, $tb, $($tt),*}
    };
}

#[rustfmt::skip]
all_seq_pairs!(impl_decrease,
    U0,U1,U2,U3,U4,U5,U6,U7,U8,U9,
    U10,U11,U12,U13,U14,U15,U16,U17,U18,U19,
    U20,U21,U22,U23,U24,U25,U26,U27,U28,U29,
    U30,U31,U32,U33,U34,U35,U36,U37,U38,U39,
    U40,U41,U42,U43,U44,U45,U46,U47,U48,U49,
    U50,U51,U52,U53,U54,U55,U56,U57,U58,U59,
    U60,U61,U62,U63
);
```

## Final Indexing

Now with our own decrement operator, we can finally express bounds for
`TypeIndex` unambiguously:
<div data-copy />

```rust
// Handle cases where N > U0
impl<N, L> TypeIndex<N> for L
where
    L: TypeList,
    // N is a number that can be decreased i.e. not U0
    N: Unsigned + Decrease,
    // decrease result is Unsigned number type
    <N as Decrease>::Value: Unsigned,
    // tail must be indexable
    L::Tail: TypeIndex<<N as Decrease>::Value>,
{
    type Value = <L::Tail as TypeIndex<<N as Decrease>::Value>>::Value;
}

// If N is U0, then we return L::Head
impl<L> TypeIndex<typenum::U0> for L
where
    L: TypeList,
{
    type Value = L::Head;
}
```

With this addition, we can substitute our previous chain of expressions with a
single indexing operator and the compiler will handle recursive normalization on its own:

```rust
type SixthElement = <SomeTypeList as TypeIndex<typenum::U5>>::Value;
```

You can try out this code on
[playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=8808f62a62639ff630368a31a3d70a2f)
([gist](https://gist.github.com/rust-play/8808f62a62639ff630368a31a3d70a2f)).
