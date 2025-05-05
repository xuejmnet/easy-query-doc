---
title: 返回结果篇章
---

`eq`不仅仅可以以数据库实体作为返回结果,也可以通过自定义返回结果`VO、DTO`无需用户内存映射转换
- 隐式赋值自定义结果`select(vo.class,o -> Select.of(...))`
- 显式赋值自定义结果`select(o -> new proxy()...)`
- 系统自带元组草稿类型`select(o -> Select.DRAFT.of(...))`
- 系统自带部分元组类型`select(o -> Select.PART.of(...))`