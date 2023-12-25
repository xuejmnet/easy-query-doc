---
title: 插件助手
---

工欲善其事必先利其器,一款好用的助手插件可以帮助我们节省大量的时间去编写处理重复性劳动
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
- IntelliJ IDEA Ultimate 2022.1.4Compatible
- IntelliJ IDEA Ultimate 2021.3.3Compatible
- IntelliJ IDEA Ultimate 2021.2.4Compatible
- IntelliJ IDEA Ultimate 2021.1.3Compatible
- IntelliJ IDEA Ultimate 2020.3.4Compatible


因为插件内部附带`com.intellij.database`这个包所以社区版本的idea无法安装,如果不需要代码生成工具那么可以进群和联系群主会编译去除该插件的版本
## 🔔交流QQ群
::: center
<img src="/qrcode.jpg" alt="群号: 170029046" class="no-zoom" style="width:200px;">

#### EasyQuery官方QQ群: 170029046
:::

## 下载
从idea的插件市场下载插件

<img src="/plugin-market.jpg">

### 插件功能介绍
- 自动apt文件编译 如果你是proxy模式那么这个插件可以帮助你快速实现apt的proxy类 快捷键shift+p
- sql日志批量生成无占位可直接运行的sql 快捷键shift+m
- 根据表生成对应的实体（自定义模板导出导入）


<img src="/plugin-tools.png">


::: warning 注意点及说明!!!
> 数据库格式化只是简单的把参数拼接到sql中这样就可以直接运行，但是因为参数的复杂程度可能导致sql拼接不正确，所以这边不能太依赖这个插件尤其是参数中存在括号参数等会被误认为是参数从而导致拼接错误,轻易实际为准,sql预览这个只是锦上添花并不能作为实际的参考
:::

<img src="/plugin-sql-format-preview.jpg">
<img src="/plugin-sql-format-preview2.jpg">

## Entity对象生成
<img src="/plugin-database-1.png">

<img src="/plugin-database-2.png">
<img src="/plugin-database-3.png">
<img src="/plugin-database-4.png">
<img src="/plugin-database-5.png">
<img src="/plugin-database-6.png">
<img src="/plugin-database-7.png">

## apt自动生成


## EntityQuery