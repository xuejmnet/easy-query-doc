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
  initialExpandLevel: 3
---

# easy-query

## [初识eq](/easy-query-doc/what-is-easy-query)


<!-- ## 优缺点

- 链接
- **强调** ~~删除线~~ *斜体* ==高亮==
- 多行
  文字
- `行内代码`
-
    ```js
    console.log('code block');
    ```
- Katex
  - $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$
- 现在我们可以通过 `maxWidth` 选项自动换行非常非常非常非常非常非常非常非常非常非常长的内容 -->



## 核心概念
- [相关术语](/easy-query-doc/framework/terminology)
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


## 快速入门
- [控制台案例](/easy-query-doc/startup/quick-start)
- [业务案例](/easy-query-doc/startup/step1)
- [实体设计推荐](/easy-query-doc/best-practices)

## code-first auto-ddl
<!-- - 链接
- **强调** ~~删除线~~ *斜体* ==高亮==
- 多行
  文字
- `行内代码`
-
    ```js
    console.log('code block');
    ```
- Katex
  - $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$
- 现在我们可以通过 `maxWidth` 选项自动换行非常非常非常非常非常非常非常非常非常非常长的内容 -->


## 基础表达式
- 单表查询
- 动态筛选排序
- 临时对象返回
- DTO直接返回


## 进阶表达式
- 多表隐式join
- 多表隐式子查询
- 多表隐式动态筛选排序

## 结构对象返回
- include结构化对象
- include结构化DTO
- include结构化DTO额外操作


## 内置函数
- 通用函数
- 字符串函数
- 数字函数
- 布尔函数
- 日期时间函数
- 数学函数
- 窗口分析函数

## 高级功能


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