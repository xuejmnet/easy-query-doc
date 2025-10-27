---
title: Navigation Properties & Relationship Properties
---
# Navigation Properties & Relationship Properties
`eq` provides very comprehensive navigation properties, supporting standard models (using equality for object relationships) and non-standard models (using comma-separated properties or prefix-matching properties), supporting the following:
- `One-to-One`
- `One-to-Many`
- `Many-to-One`
- `Many-to-Many (with entity)`
- `Many-to-Many (without entity)`
- `One Penetration`
- Non-standard mode object relationships (columns are comma-separated, or columns are path prefix matching)

This can greatly meet users' daily needs and ensure perfect use and adaptation of the framework

Using navigation properties can greatly facilitate users' daily development, and when using implicit join, it also allows dynamic join, which manual join cannot do

By default, implicit Join and implicit subquery both use `LEFT JOIN`. You can set `@Navigate(required=true)` so that the implicit relationship will become `INNER JOIN`, thereby slightly improving query performance



::: tip Note!!!
> `eq` supports creating object relationship navigation properties between any columns of any objects as corresponding relationships
:::
