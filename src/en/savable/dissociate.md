---
title: Object Dissociation Relationship Removal
order: 100
---

# Object Dissociation Relationship Removal
Breaking the association relationship between objects, meaning at the memory or database level, no longer maintaining the original reference.


::: danger Note!!!
> `eq`'s data dissociation is not infinite level, it performs data save, modify, and dissociate based on user-specified query paths. Data dissociation and deletion will not extend infinitely to the entire object tree. By default, during save, it starts from the aggregate root and ends at the value object's aggregate root or save path, with no further operations after that
:::

# Types of Dissociation
Object dissociation is mainly divided into two categories:
- Active dissociation, initiated by aggregate root objects to dissociate value objects, supports (`SET_NULL` and `DELETE`)
- Passive dissociation, initiated by value objects to dissociate aggregate roots, supports (`SET_NULL`)

These two types of dissociation have the following differences

## Active Dissociation
Active dissociation is initiated by the aggregate root. For example, `bank` and `bankCard`, when actively saving the aggregate root bank, dissociate from `bankCard`. It can be `SET_NULL` or `DELETE`, depending on whether the database constraint allows null.

## Passive Dissociation
Passive dissociation is initiated by value objects. For example, bankCard and user, when actively saving bankCard, initiate dissociation from user. However, this kind of dissociation only allows `SET_NULL` dissociation. If it's `DELETE` method, it must be initiated by the aggregate root.

