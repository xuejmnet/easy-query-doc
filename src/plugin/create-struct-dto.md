---
title: CreateStructDTO
order: 40
category:
  - plugin
---

# CreateStructDTO
结构化DTO 是一种`eq`对象关系树的传输对象映射 快捷 易于阅读 的方式来实现快速返回结构化关系数据的一种功能

- 支持按任意属性拉取需要的属性
- 支持任意层级的自定义设置

## 1.创建dto(必须)
手动创建DTO是一件很麻烦的事情,可以在`easy-query:1.10.60^`+`插件0.0.48^`快速生成嵌套结构化对象模型,

<img :src="$withBase('/images/EQDTO1.jpg')">

## 2.配置常用忽略属性(可选)
用来配置一些不需要返回给前端的属性比如pwd或者deleted 或者deleted_time这种
<img :src="$withBase('/images/EQDTO2.jpg')">
<img :src="$withBase('/images/EQDTO3.jpg')">
<img :src="$withBase('/images/EQDTO4.jpg')">

## 3.勾选需要返回的属性(必须)
将需要返回的属性勾选上,关联属性不勾选eq也会自动生成sql
<img :src="$withBase('/images/EQDTO5.jpg')">

## 4.查看dto文件
查看dto文件并且导入未导入的属性包
<img :src="$withBase('/images/EQDTO6.jpg')">