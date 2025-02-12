---
title: 功能目录指引
---

## 基础功能
- [select](/easy-query-doc/ability/select) 查询表,自定定义返回列,自定义返回结果
- [insert](/easy-query-doc/ability/insert) 基础的插入数据、忽略null、不忽略null、返回自增主键、批量插入
- [update](/easy-query-doc/ability/update) 基础的修改数据、忽略null、不忽略null、表达式更新、对象更新、差异追踪更新、并发更新、批量更新
- [delete](/easy-query-doc/ability/delete) 基础的删除数据、逻辑删除、物理删除、忽略逻辑删除
- [transaction](/easy-query-doc/ability/transaction) 提供了基础的事务功能，支持非spring或其他框架下使用事务
- [insertOrUpdate](/easy-query-doc/ability/insertOrUpdate) 原生数据库方言实现存在忽略或者存在更新性能更好

## 额外功能
- [include,includes](/easy-query-doc/query/relation) 一对一 一对多 多对一 多对多的关联关系说明
- [selectAutoInclude](/easy-query-doc/query/select-auto-include) 自动接口化DTO和自动`include(s)`
- [分页](/easy-query-doc/query/paging) 支持分页结果返回、自定义分页结果
- [DTO、VO直接返回]
- [批处理]
- [分组]
- [排序]
- [原生sql]
- [动态表名]
- [关联查询]
- [动态条件]
- [动态排序]
- [计算属性]
- [逻辑删除]
- [全局拦截器]
- [数据加密查询]
- [数据追踪]
- [乐观锁]
- [分库,分表]
- [PARTITION BY]