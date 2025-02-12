---
title: easy-qeury 简介
---

# easy-qeury 简介


# QQ群
EasyQuery官方QQ群: 170029046

::: tip easy-query特性!!!
> 一款兼具`dsl`的操控性和`object relation query`的便捷性，同时具备两者的orm
:::

## easy-qeury 的发展
`easy-query`是一款始于2023年2月份的一款国产orm,初衷是让java也可以拥有和.net一样的操作数据库,该框架同时支持`java`和`kotlin`,🚀 java下唯一一款同时支持强类型对象关系查询和强类型SQL语法查询的ORM,拥有对象模型筛选、隐式子查询、隐式join、显式子查询、显式join,后续我们对该框架简称`eq`

## 使用人群
- 有`sql`基础，会`java stream`或者属性`java lambda`
- .net程序员转java的`墙裂`推荐你会拥有和.net orm不一样的体验++

## 使用场景
`eq`适用于任意支持jdbc的关系型数据库,并且用户可以自定义方言,支持数据模型建模筛选拉取,可以很高效的实现单表多表的crud

支持`dsl`模式编写数据库表达式查询数据也可以用`relation model`来实现数据模型关系筛选

## 为什么选择eq
如果有人问为什么选择`eq`,那么我可以很负责任的告诉你该框架拥有非常强的强类型和非常强度动态类型,你一定很神奇,`eq`是如何做到的

`eq`为了抽象在强类型api的下层使用了client模式,而client模式则可以支持任意弱类型,已有人通过client的api实现了一整套低代码框架,

除了实现低代码框架外还兼容所有已经适配的数据库,对用户而言无需考虑方言带来的差异