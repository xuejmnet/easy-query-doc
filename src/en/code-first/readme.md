---
title: code-first
---

# code-first
A special development method, different from the conventional `db-first` where you develop the database first and then develop the code, `code-first` is to develop business logic first and write code first, then use code to generate the tables needed by the database

::: warning Note!!!
> Currently this feature is still in early preview. The APIs may change in the future. It can be used directly for test code.
:::


::: warning Note!!!
> For security reasons, the `execute syncTableCommand` provided by `eq` will only create databases, create tables, and add columns. Operations such as manually modifying table names, manually modifying column names, and deleting tables need to be executed manually and will not be included in the `syncTables` interface
:::
