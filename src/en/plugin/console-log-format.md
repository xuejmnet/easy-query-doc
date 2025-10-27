---
title: Format Print SQL Preview
order: 30
category:
  - plugin
---

## Console Log SQL Format Preview

The Easy Query plugin supports formatting SQL and parameters into executable SQL.

::: warning Note and Explanation!!!
> Database formatting simply concatenates parameters into SQL so it can be run directly. However, due to the complexity of parameters, SQL concatenation may be incorrect. So don't rely too much on this plugin, especially when parameters contain parentheses, which may be mistaken for parameters, causing concatenation errors. The reality prevails. SQL preview is just icing on the cake and cannot be used as an actual reference.
:::

<img :src="$withBase('/images/plugin-sql-format-preview.jpg')">
<img :src="$withBase('/images/plugin-sql-format-preview2.jpg')">



::: warning Note and Explanation!!!
> A complete log must contain `==> Preparing:` and `==> Parameters:`. It can contain more, but must contain these two. When formatting, fill in the nearby SQL and parameters separately.
:::

## Related Searches
`SQLFormatPreview`

