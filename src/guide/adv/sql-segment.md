---
title: 自定义SQL片段
---


# 自定义SQL片段
`easy-query`默认提供了数据库自定义`SQL`片段,其中 [《CaseWhen》](/easy-query-doc/guide/query/case-when) 就是有数据库自定义片段来自行实现api

如何设计api完全可以看用户自行实现。

## 分组求第一条
`OVER(Partition By ... Order By ...)` 采用pgsql语法来实现