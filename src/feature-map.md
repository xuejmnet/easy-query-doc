---
title: 功能大纲
order: 2
category:
  - Startup
---



# 功能大纲

````markmap
---
markmap:
  colorFreezeLevel: 5
  initialExpandLevel: 2
---

# easy-query

## [初识eq](https://www.easy-query.com/easy-query-doc/what-is-easy-query)
- `eq`能干什么
- `eq`适应人群
- `eq`的优点
- `eq`的缺点



## 概念
- [相关术语](https://www.easy-query.com/easy-query-doc/framework/terminology)
    - 隐式表达式
    - 显式表达式
    - include查询
    - groupJoin、隐式Group
    - DTO查询 selectAutoInclude 结构化对象
    - 数据追踪
    - 计算属性
    - 自动保存
    - 聚合根
    - 值对象
    - 脱钩
    - 所属权
    - cteViewer
    - code-first也叫auto-ddl
- [注解](/easy-query-doc/framework/annotation)
- [组件服务](/easy-query-doc/framework/replace-configure)

## 插件详解
- 快速生成ProxyEntityAvailable
- 编译生成apt文件
- 数据库表生成实体
- 格式化打印sql预览
- dto查询
- lambda表达式提示
- dsl运算符提示
- 配置项保存

## 快速入门
- [控制台案例](/easy-query-doc/startup/quick-start)
- [业务案例](/easy-query-doc/startup/step1)
- [实体设计推荐](/easy-query-doc/best-practices)



## 表达式🔥
- 单表查询
- 动态筛选排序
- 结果映射到DTO
  - 自定义DTO
  - 自定义临时对象
- 隐式join
- 隐式子查询
- 隐式group
- 隐式partition
- 隐式caseWhen
- 隐式递归树
- 显式join
- 显式子查询
- 显式partition
- 显式caseWhen

## DTO查询🔥
- 动态筛选
- 动态排序
- 结构化映射
- 结构化映射额外操作


## 内置函数
- 通用函数
- 字符串函数
- 数字函数
- 布尔函数
- 日期时间函数
- 数学函数
- 窗口分析函数

## 高级功能



## 扩展篇
- code-first auto-ddl
- cache缓存双删一致性
- 审计日志记录数据变更
- 慢sql监听


## 性能优化
- [隐式join优化](/easy-query-doc/performance/implicit-join)
- [隐式子查询优化](/easy-query-doc/performance/implicit-subquery-group-join)
- [结构化集合limit项](/easy-query-doc/performance/include-many-limit)
- [深分页反向排序](/easy-query-doc/performance/deep-page)
- [批处理](/easy-query-doc/performance/batch)
- [分页查询count慢](/easy-query-doc/performance/page)
- [include查询忽略特殊值](/easy-query-doc/performance/include)
- [数据追踪](/easy-query-doc/performance/tracking)
````