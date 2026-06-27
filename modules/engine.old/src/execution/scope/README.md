# Scope

There's a need for states to be present at different levels which will be stored and accessed as a
key-value dictionary. There'll be a **global scope** which will be accessible throughout a program's
runtime. Each _process_ and _routine_ shall get their own **scope stacks** independent of others. As
control moves into a nesting, a **local scope frame** will be pushed into the stack, and popped as
control moves out. For each **scope frame**, the key-value dictionary will contain keys defined in/for
the **scope frame** and all frames that are ancestors of the **scope frame**. If a key is present in
multiple considered frames, the deepest value starting from the **scope frame** is taken. In essence,
child frame keys 'shadow' ancestor frame key values.

A **scope** encapsulates two kinds of data structures: **context**, and **symbol table**. A
**scope frame** encapsulates a **symbol table frame** and a set of **context frames** (one for each
_syntax element_ group).

## Context

A group of _syntax elements_ (related to one kind of functionality, e.g. programming elements in the
[library](../../library/)) may require a set of runtime **states** and **flags** shared among the
_syntax elements_, is to be called a **Context**.

There'll be a **global context** and **local context** instance one for each _process_. There'll be
such sets for each _syntax element group_. As control recursively jumps between a _process_ and
_routines_ the **contexts** will be passed along.

## Symbol Table

Some _syntax elements_ may create a dynamically named states (like a variable). They should be able
to be defined, fetched, and updated by their name (identifier). They'll be exposed as a **Symbol Table**.

There'll be a **global symbol table** and **local symbol table** instance one for each _process_ and
_routine_.

## Utils

### Layered Map

A tree data structure where each node contains a key-value dictionary. A projection from any node
yields a flat key-value dictionary which contains the keys with their values in the node's key-value
dictionary augmented with all new keys and values encounter while parsing up to the root node. If a
key is present in multiple nodes, the value in the lowest node is taken; in essence, child keys shadow
ancestor keys.

This data structure is intended to address the scoping problem, where a scope contains all unique
members of the scope and all other unique members of its ancestors; if two levels have same keys,
the youngest value is taken.

This will be used to create **Contexts** and **Symbol Tables**.

### Example

```text
K1    K2   K3   K4   K5   K6   K7   K8      K9   KA
========================== A ========================
| a -- b -- c -- d ------- i                        |  1
=====================================================
          ====== B ======     ==== D ===   ==== E ===
          | e -- f -- h |     | j -- k |   | l -----|  2
          ===============     ==========   ==========
               = C =                            = F =
               | g |                            | m |  3
               =====                            =====
```

`A`, `B`, `C`, `D`, `E`, `F` are the nodes.

```text
key-values of A: K1(a), K2(b), K3(c), K4(d), K6(i)
key-values of B:               K3(e), K4(f), K5(h)
key-values of C:                      K4(g)
key-values of D:                                    K7(j), K8(k)
key-values of E:                                                  K9(l)
key-values of F:                                                  KA(m)

projecting from A returns: K1(a), K2(b), K3(c), K4(d),        K6(i)
projecting from B returns: K1(a), K2(b), K3(e), K4(f), K5(h), K6(i)
projecting from C returns: K1(a), K2(b), K3(e), K4(g), K5(h), K6(i)
projecting from D returns: K1(a), K2(b), K3(c), K4(d),        K6(i), K7(j), K8(k)
projecting from E returns: K1(a), K2(b), K3(c), K4(d),        K6(i),               K9(l)
projecting from F returns: K1(a), K2(b), K3(c), K4(d),        K6(i),               K9(l), KA(m)
```
