---
title: Associated Queries
---
`eq`'s associated queries are one of `eq`'s core features, used to facilitate users returning arbitrarily structured relational data. If you have finished reading the navigation properties chapter, then the current chapter is a supplement to `eq`'s return results. `eq`'s navigation properties can not only generate complex SQL but also fetch and return data in corresponding structures.

Supports relationship settings between any columns: primary key and non-primary key, primary key and primary key, non-primary key and non-primary key, multiple columns as well.


## Structured Objects
Fetch and return to memory based on database entity navigation property configuration structure, and query at minimum cost, commonly used for internal business

## Structured DTOs
Return DTOs with the same structure as database entity objects and support adding or removing additional fields on DTOs to achieve custom return of data structures


## Summary
- 1. `include` are only used when returning database objects
- 2. `fillOne/fillMany` can handle any programmatic nesting, the disadvantage is that the returned object must contain relationship keys, such as A->B, querying B must also query `A.Id` and `B.AId`
- 3. `selectAutoInclude` is the most powerful structured return, only needs entities to establish corresponding relationships and supports any structure special handling
