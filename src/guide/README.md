---
title: 使用指南
icon: creative
---

## 指南

[![License](https://img.shields.io/badge/license-Apache2-blue.svg)](https://github.com/xuejmnet/easy-query/blob/main/LICENSE)

[![Stargazers over time](https://starchart.cc/xuejmnet/easy-query.svg)](https://starchart.cc/xuejmnet/easy-query)

### EasyQuery
`EasyQuery`是一款`JAVA ORM`,提供强类型对象查询功能,支持单表多表查询,并且支持多种自定义特性,支持分库分表,读写分离,目前仅支持`MySQL`。



- QQ群: 326308290
- 问题反馈请前往:

[https://github.com/xuejmnet/easy-query/issues](https://github.com/xuejmnet/easy-query/issues) 


或者 

[https://gitee.com/xuejm/easy-query/issues](https://gitee.com/xuejm/easy-query/issues)

### 特性

- [x] 全局默认、自定义软删除，可以自己实现软删除或者使用系统默认定义的软删除
- [x] 全局自定义拦截器，支持查询、修改、删除条件拦截器，对象插入、修改拦截器、修改set字段拦截器
- [x] 单表查询、多表join查询
- [x] 自定义更新、实体更新、条件更新
- [x] 追踪查询，差异更新实体
- [x] 自定义分库分表(未实现)

### 学习指南
`EasyQuery`目前除了基础的增删改查外未来还将支持分库分表，读写分离，字段加密等企业级功能

#### 基础
- [《EasyQuery:数据新增》](/guide/basic/insert)
- [《EasyQuery:数据修改》](/guide/basic/update)