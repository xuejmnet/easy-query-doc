---
title: 格式化打印sql预览
order: 30
category:
  - plugin
---

## 控制台日志sql格式化预览

Easy Query插件支持将SQL和参数进行格式化成可以执行的SQL。

::: warning 注意点及说明!!!
> 数据库格式化只是简单的把参数拼接到sql中这样就可以直接运行，但是因为参数的复杂程度可能导致sql拼接不正确，所以这边不能太依赖这个插件尤其是参数中存在括号参数等会被误认为是参数从而导致拼接错误,轻易实际为准,sql预览这个只是锦上添花并不能作为实际的参考
:::

<img :src="$withBase('/images/plugin-sql-format-preview.jpg')">
<img :src="$withBase('/images/plugin-sql-format-preview2.jpg')">



::: warning 注意点及说明!!!
> 一个完成的日志必须包含`==> Preparing:`和`==> Parameters:`可以包含更多的但是必须包含这两个，格式化的时候按相近sql和参数进行分别填充
:::

## 相关搜索
`SQLFormatPreview`