---
title: 插件助手
---

工欲善其事必先利其器,一款好用的助手插件可以帮助我们节省大量的时间去编写处理重复性劳动

## 功能介绍
- 无需构建项目，刷新Maven，使用插件可以直接生成代理类并添加接口
- sql日志批量生成无占位可直接运行的sql 快捷键shift+m
- 根据表生成对应的实体（自定义模板导出导入）

## 选择合适的版本
插件版本  | easy-query版本 | 更新内容 
--- | --- | --- 
0.0.16 | 1.8.4+  | `entityQuery`支持函数区分,SQLColumn生成分成更细的column
0.0.15 | 1.8.2+ | 支持带属性`SQLColumn`

支持的idea版本

- IntelliJ IDEA Ultimate 2023.3.2Compatible
- IntelliJ IDEA Ultimate 2023.2.5Compatible
- IntelliJ IDEA Ultimate 2023.1.5Compatible
- IntelliJ IDEA Ultimate 2022.3.3Compatible
- IntelliJ IDEA Ultimate 2022.2.5Compatible

不支持以下版本如果需要支持可以加qq群联系群主

- IntelliJ IDEA Ultimate 2022.1.4Compatible
- IntelliJ IDEA Ultimate 2021.3.3Compatible
- IntelliJ IDEA Ultimate 2021.2.4Compatible
- IntelliJ IDEA Ultimate 2021.1.3Compatible
- IntelliJ IDEA Ultimate 2020.3.4Compatible


因为插件内部附带`com.intellij.database`这个包所以社区版本的idea无法安装,如果不需要代码生成工具那么可以进群和联系群主会编译去除该插件的版本


::: warning 说明!!!
> 如果您非旗舰版idea可能无法使用当前插件您可以进群联系作者,我会给您编译一个社区版本支持的插件
:::


## 版本升级
如果你是`@EntityProxy`那么只需要升级对应的框架版本和插件版本然后重新clean即可,如果你是`@EntityFileProxy`那么升级完框架和插件版本后需要重新调用插件的`AutoCompile`让生成的代理文件重新生成一遍

## 插件下载
从idea的插件市场下载插件

<img src="/plugin-market.jpg">


## SQL格式化
Easy Query插件支持将SQL和参数进行格式化成可以执行的SQL。

<img src="/plugin-tools.png">


::: warning 注意点及说明!!!
> 数据库格式化只是简单的把参数拼接到sql中这样就可以直接运行，但是因为参数的复杂程度可能导致sql拼接不正确，所以这边不能太依赖这个插件尤其是参数中存在括号参数等会被误认为是参数从而导致拼接错误,轻易实际为准,sql预览这个只是锦上添花并不能作为实际的参考
:::

<img src="/plugin-sql-format-preview.jpg">
<img src="/plugin-sql-format-preview2.jpg">

## 快速生成接口

<img src="/startup5.png">

::: warning 说明!!!
> 如果EasyQueryImplement没有效果请检查类是否添加了`@EntityProxy`或者`@EntityFileProxy`
:::

<img src="/startup6.png">

## Entity对象生成
<img src="/plugin-database-1.png">

<img src="/plugin-database-2.png">
<img src="/plugin-database-3.png">
<img src="/plugin-database-4.png">
<img src="/plugin-database-5.png">
<img src="/plugin-database-6.png">
<img src="/plugin-database-7.png">


## 创建DTO
手动创建DTO是一件很麻烦的事情,可以在`easy-query:1.10.60^`+`插件0.0.48^`快速生成嵌套结构化对象模型,

<img src="/EQDTO1.jpg">
<img src="/EQDTO2.jpg">
<img src="/EQDTO3.jpg">
<img src="/EQDTO4.jpg">
<img src="/EQDTO5.jpg">
<img src="/EQDTO6.jpg">