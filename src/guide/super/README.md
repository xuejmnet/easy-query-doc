---
title: 超级功能
order: 30
---

# 超级功能
`easy-query`的超级功能主要是分表分库和读写分离,作者有着多年的分库分表经验,并且在其他语言上也有一套相对完善的分表分库orm扩展
(sharding-core)[https://github.com/dotnetcore/sharding-core]



#### 目录
- [《EasyQuery:逻辑删除》](/easy-query-doc/guide/adv/logic-delete) 数据的无价,软删除可以给程序带来后悔药,让用户无需关心底层通过修改`delete`语句为`update`来实现自动无感逻辑删除,支持`select`、`update`、`delete`
- [《EasyQuery:全局拦截器》](/easy-query-doc/guide/adv/interceptor) 支持`entity`对象的插入、更新前的实体拦截修改，`select`、`update`、`delete`的条件自定义,`update`的`set`自定义