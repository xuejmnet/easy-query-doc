---
title: 数据库支持
---
`easy-query`目前已经抽象了表达式,所以原则上支持所有数据库,只需要自定义实现对应数据库的增删改查接口即可,也就是[`sql-db-support`](https://github.com/xuejmnet/easy-query/tree/main/sql-db-support) 所以如果不支持对应的sql那么你可以自行扩展或者提交相应的issue

## 支持的数据库


数据库名称  | 包名  | springboot配置 | solon配置 
--- | --- | ---   | --- 
MySQL | sql-mysql  | mysql| mysql
PostgresSQL | sql-pgsql  | pgsql| pgsql
SqlServer | sql-mssql  | mssql| mssql
SqlServer RowNumber | sql-mssql  | mssql_row_number| mssql_row_number
H2 | sql-h2  | h2| h2
达梦dameng | sql-dameng  | dameng| dameng
人大金仓KingbaseES | sql-kingbase-es  | kingbase_es| kingbase_es
Oracle | sql-oracle  | oracle| oracle
SQLite | sql-sqlite  | sqlite| sqlite
ClickHouse | sql-clickhouse  | clickhouse| clickhouse