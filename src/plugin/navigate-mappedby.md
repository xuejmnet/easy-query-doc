---
title: 导航属性反向生成
order: 60
category:
  - plugin
---

# 导航属性反向生成
`MappedBy`支持通过已存在的导航属性快速创建反向导航，比如我们创建了A->B的导航关系，现在希望创建反向关系，我们可以在A对象的导航属性上点击光标置于属性上,通过快捷键`alt+insert(windows)`或者`command+n(mac)`呼出快捷菜单选择`MappedBy`


<img :src="$withBase('/images/mapped-by-menu.png')">

这样即可在B目标对象上反向创建导航



::: danger 说明!!!
> 导航对象必须都是`@Table`的实体对象
:::

