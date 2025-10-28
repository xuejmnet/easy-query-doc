---
title: Feature Outline
order: 2
category:
  - Startup
---



# Feature Outline

````markmap
---
markmap:
  colorFreezeLevel: 5
  initialExpandLevel: 2
---

# easy-query

## [Introduction to eq](/easy-query-doc/en/what-is-easy-query)
- What can `eq` do
- Who is `eq` for
- Advantages of `eq`
- Disadvantages of `eq`



## [Framework Content](/easy-query-doc/en/framework/terminology)
- [Related Terminology](/easy-query-doc/en/framework/terminology)
    - Implicit Expressions
    - Explicit Expressions
    - Include Queries
    - groupJoin, Implicit Group
    - DTO Query selectAutoInclude Structured Objects
    - Data Tracking
    - Computed Properties
    - Auto Save
    - Aggregate Root
    - Value Objects
    - Decoupling
    - Ownership
    - cteViewer
    - code-first also called auto-ddl
- [Parameter Configuration](/easy-query-doc/en/framework/config-option)
- [Dialect Keywords](/easy-query-doc/en/framework/key-word)
- [Annotations](/easy-query-doc/en/framework/annotation)
- [Component Services](/easy-query-doc/en/framework/replace-configure)
- [Object-Database Mapping Rules](/easy-query-doc/en/framework/mapping-db)

## Quick Start
- [Console Case](/easy-query-doc/en/startup/quick-start)
- [Business Case](/easy-query-doc/en/startup/step1)
- [Entity Design Recommendations](/easy-query-doc/en/best-practices)



## [Plugin Details](/easy-query-doc/en/plugin/)
- [Configuration Saving](/easy-query-doc/en/plugin/setting)
- [Quick Generate ProxyEntityAvailable](/easy-query-doc/en/plugin/easy-query-implement)
- [Compile Generate apt Files](/easy-query-doc/en/plugin/compile)
- [Format Print SQL Preview](/easy-query-doc/en/plugin/console-log-format)
- [Structured DTO Creation](/easy-query-doc/en/plugin/create-struct-dto)
- [DTO Structure Smart Tips](/easy-query-doc/en/plugin/struct-dto-tip)
- [Navigation Property Quick Generation](/easy-query-doc/en/plugin/navigate-generate)
- [Navigation Property Reverse Generation](/easy-query-doc/en/plugin/navigate-mappedby)
- [Lambda Expression Tips](/easy-query-doc/en/plugin/lambda-alias)
- [DSL Operator Tips](/easy-query-doc/en/plugin/dsl-compare-operator)
- [Database Table Generate Entity](/easy-query-doc/en/plugin/table2entity)

## Expressions🔥
- Single Table Query
- Dynamic Filtering and Sorting
- Result Mapping to DTO
  - Custom DTO
  - Custom Temporary Objects
- Implicit join
- Implicit Subquery
- Implicit group
- Implicit partition
- Implicit caseWhen
- Implicit Recursive Tree
- Explicit join
- Explicit Subquery
- Explicit partition
- Explicit caseWhen
- Native SQL Fragments
  - Execute SQL Fragments
  - Type SQL Fragments
- Expression Writing Instructions🔥

## DTO Query🔥
- Dynamic Filtering
- Dynamic Sorting
- Structured Mapping
- Structured Mapping Additional Operations


## Built-in Functions
- General Functions
- String Functions
- Number Functions
- Boolean Functions
- Date Time Functions
- Math Functions
- Window Analysis Functions

## Advanced Features



## Extension
- code-first auto-ddl
- cache consistency with double deletion
- Audit Log Record Data Changes
- Slow SQL Listening


## Performance Optimization
- [Implicit join Optimization](/easy-query-doc/en/performance/implicit-join)
- [Implicit Subquery Optimization](/easy-query-doc/en/performance/implicit-subquery-group-join)
- [Structured Collection limit Items](/easy-query-doc/en/performance/include-many-limit)
- [Deep Pagination Reverse Sorting](/easy-query-doc/en/performance/deep-page)
- [Batch Processing](/easy-query-doc/en/performance/batch)
- [Pagination Query count Slow](/easy-query-doc/en/performance/page)
- [include Query Ignore Special Values](/easy-query-doc/en/performance/include)
- [Data Tracking](/easy-query-doc/en/performance/tracking)
````
