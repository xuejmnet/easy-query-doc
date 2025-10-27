---
title: Reverse Generate Navigation Properties
order: 60
category:
  - plugin
---

# Reverse Generate Navigation Properties
`MappedBy` supports quickly creating reverse navigation through existing navigation properties. For example, if we created an A->B navigation relationship and now want to create the reverse relationship, we can place the cursor on the navigation property of object A and invoke the shortcut menu with `alt+insert (Windows)` or `command+n (Mac)` and select `MappedBy`.


<img :src="$withBase('/images/mapped-by-menu.png')">

This way, you can create reverse navigation on the target object B.



::: danger Note!!!
> Navigation objects must all be entity objects with `@Table`
:::

