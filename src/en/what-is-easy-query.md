---
title: What is EQ
order: 1
category:
  - Startup
---

# easy-query Introduction


# QQ Group
EasyQuery Official QQ Group: 170029046

::: tip easy-query Features!!!
> The most powerful `ORM` for Java that truly understands queries, perfectly implementing both automatic and manual handling of complex object relationships
> Implicit join, implicit subquery, implicit grouping, implicit partition grouping, implicit case when, sharding, field encryption search, manual join multi-table subquery grouping, code-first automatic table structure creation, automatic assembly of structured object data......
:::

## The Evolution of easy-query
`easy-query` is a domestic ORM that began in February 2023. Its original intention was to allow Java to operate databases like .NET. The framework supports both `Java` and `Kotlin`. 🚀 The only ORM in Java that supports both strongly-typed object relational queries and strongly-typed SQL syntax queries, featuring object model filtering, implicit subqueries, implicit join, explicit subqueries, explicit join. We'll refer to this framework as `eq` for short.

## Four Super Features
- 1. Implicit Queries: Implicit Join, Implicit Subquery, Implicit Group, Implicit Partition, Implicit CaseWhen, Implicit RECURSIVE recursion
- 2. Explicit Queries: Explicit Join, Explicit Subquery, Explicit Group, Explicit Partition, Explicit CaseWhen
- 3. DTO Queries: `whereObject`, `orderByObject`, `selectAutoInclude` support filtering, sorting, and returning arbitrarily nested object structures in object mode
- 4. Support direct SQL query execution


## Target Audience
- Have `SQL` basics, know `Java Stream`, know `C# Linq`
- `JPA` or `Hibernate` users
- .NET programmers transitioning to Java - **strongly** recommend you'll have a different experience from `.net` ORM++
- Like strongly-typed DSL, tired of XML hand-written string SQL

## Advantages
- 1. Strongly-typed with intelligent hints and plugin hints
- 2. Expressions are easy to read, easy to maintain, high-performance SQL generation
- 3. Multi-database support with automatic DDL synchronization
- 4. Support mixing expressions with native SQL fragments
- 5. Fully open source and free including source code, plugins, and documentation
- 6. All configurations use Java objects, supporting seamless database switching
- 7. Can perfectly integrate with existing frameworks without conflicts
- 8. Achieves excellent balance between performance and dynamicity, meeting nearly 100% of requirements


## Disadvantages
- 1. Learning curve is relatively high at the start but low afterwards, yet very rewarding
- 2. Through APT technology, users without plugins or non-IDEA users need to compile first to get corresponding classes (plugins available for real-time compilation awareness)

## Use Cases
`eq` is suitable for any JDBC-supported relational database, and users can customize dialects. It supports data model modeling, filtering, and fetching, efficiently implementing CRUD for single and multiple tables.

Supports writing database expression queries in `DSL` mode or using `relation model` for data model relationship filtering.

## Why Choose eq
- Provides powerful object-oriented query functionality, mapping table relationships to object data structure relationships with simple APIs
- Strongly-typed can handle most errors at compile time
- Weakly-typed allows users to use string properties in dynamic scenarios combined with strongly-typed DSL
- High coverage unit tests with 2000+ unit tests
- The author uses it in production, already deployed in 5+ projects running stably for 1-2 years
- Excellent performance with outstanding performance even in other ORM tests
- Lightweight with zero dependencies, framework entirely self-implemented from scratch and controllable
- `OLTP`+`OLAP` full control, `SQL` optimization performance monster
- All SQL tries to avoid `select *`; for a database with originally 5 columns that later becomes 4 columns, the program can immediately detect errors. If using `*`, it would only make that column null, causing data confusion

If someone still asks why choose `eq`, I can responsibly tell you this framework has both very strong typing and very strong dynamic typing. You must be curious how `eq` achieves this.

`eq` uses client mode in the lower layer of strongly-typed APIs for abstraction, and client mode can support any weak typing. Someone has implemented a complete low-code framework through the client API.

In addition to implementing low-code frameworks, it's compatible with all adapted databases, and users don't need to consider differences brought by dialects.

## Database Support


| Database Name          | Package Name    | SpringBoot Config   | Solon Config        |
| ---------------------- | --------------- | ------------------- | ------------------- |
| MySQL                  | sql-mysql       | mysql               | mysql               |
| Oracle                 | sql-oracle      | oracle              | oracle              |
| PostgreSQL             | sql-pgsql       | pgsql               | pgsql               |
| SqlServer              | sql-mssql       | mssql               | mssql               |
| SqlServer RowNumber    | sql-mssql       | mssql_row_number    | mssql_row_number    |
| H2                     | sql-h2          | h2                  | h2                  |
| SQLite                 | sql-sqlite      | sqlite              | sqlite              |
| ClickHouse             | sql-clickhouse  | clickhouse          | clickhouse          |
| DaMeng                 | sql-dameng      | dameng              | dameng              |
| KingbaseES             | sql-kingbase-es | kingbase_es         | kingbase_es         |
| GaussDB                | sql-gauss-db    | gauss-db            | gauss-db            |
| DuckDB                 | sql-duckdb      | duckdb              | duckdb              |
| DB2                    | sql-db2         | db2                 | db2                 |

`eq` currently has abstracted expressions, so in principle it supports all databases. You only need to customize the corresponding database's CRUD interface, which is [`sql-db-support`](https://github.com/xuejmnet/easy-query/tree/main/sql-db-support). So if the corresponding SQL is not supported, you can extend it yourself or submit a corresponding issue.

