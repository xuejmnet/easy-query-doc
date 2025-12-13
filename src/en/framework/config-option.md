---
title: Configuration Parameter Options (Important)❗️❗️❗️
order: 10
---
# Configurable Parameter Options
Before use, we hope users can first review the optional configuration items, which will help understand how to optimize

::: danger Breaking Changes!!!
> The framework has made some configuration changes from v2-v3. Please refer to [v2 upgrade to v3](/easy-query-doc/en/v2-v3)
> The framework has made some configuration changes from v2-v3. Please refer to [v2 upgrade to v3](/easy-query-doc/en/v2-v3)
> The framework has made some configuration changes from v2-v3. Please refer to [v2 upgrade to v3](/easy-query-doc/en/v2-v3)
:::



## Default Configuration Items
Configuration Name  | Default Value | Description  
--- | --- | --- 
database | `DatabaseEnum.DEFAULT`  | Defaults to SQL92-compliant syntax. If your database is within `easy-query`'s supported database range, please select the correct database you're using
deleteThrow | `true`  | `easy-query` defaults to not allowing physical deletion for data safety. This doesn't mean delete operations can't be executed, but that delete statements can't be generated after executing delete. It's recommended to use logical deletion to avoid this. For example, `delete from t_user where uid=1` will become `update t_user set deleted=1 where uid=1` after using logical deletion. The framework implements this function by default when using logical deletion, users still use the `deletable` method to call and execute
nameConversion | `underlined`  | Currently has two options, though users can also implement the `NameConversion` interface themselves. Currently available: `default`, `underlined`, `upper_underlined`, `lower_camel_case`, `upper_camel_case`. Enabling `default` means the default object-to-database mapping relationship is by property name. For example, property name `userAge` corresponds to database column `userAge`. `underlined` means using underscore - `userAge` corresponds to database column `user_age`. Of course, after global settings, you can also manually specify the corresponding column name on `@Column` [Related content](/easy-query-doc/en/framework/mapping-db)
insertStrategy | `ONLY_NOT_NULL_COLUMNS`  | `insert` command defaults to inserting non-null columns. If a table has `id` and `name`, when the `name` column is null, the generated SQL will not specify the `name` column, like `insert into t_user (id) values(?)`. If the `name` column is not null, the generated SQL will be `insert into t_user (id,name) values(?,?)`. If the inserted collection has some null columns and some non-null columns, calling batch will generate n SQLs, merging the same SQLs together. So choose according to your needs (the default configuration is very good)
updateStrategy | `ALL_COLUMNS`  | Default update command generated statement will update all columns of the entire object, not judging whether it's null. If needed, you can set whether null, not null, or all columns update
insertBatchThreshold | 1024  | If insertable adds an object collection of 1024 or more at once, it will merge the same SQL to improve execution efficiency. The connection string needs to add `rewriteBatchedStatements=true` (mysql). Can manually use or disable by calling the batch method of insert or update, like greater than or equal to 3. Don't ask why not default `batch` because `batch` some JDBC drivers or databases don't return the correct affected row count
updateBatchThreshold | 1024  | If updatable adds an object collection of 1024 or more at once, it will merge the same SQL to improve execution efficiency. The connection string needs to add `rewriteBatchedStatements=true` (mysql). Can manually use or disable by calling the batch method of insert or update, like greater than or equal to 3. Don't ask why not default `batch` because `batch` some JDBC drivers or databases don't return the correct affected row count
logClass | -  | Under `spring-boot`, defaults to `com.easy.query.sql.starter.logging.Slf4jImpl` implementation. If you're not using `spring-boot`, you can implement yourself or use console logging `LogFactory.useStdOutLogging()`
queryLargeColumn | `true`  | Defaults to still querying columns marked as `large` under `@Column`. If you don't want to query, it's recommended to set the corresponding column to `@UpdateIgnore` with `updateSetInTrackDiff = true` under the premise of setting it as `large`, to prevent unqueried results from also being updated to null after all-column update
printSql | `true`  | Whether to print executed SQL. This is different from log because considering sometimes you may need to view SQL rather than output log. So if set to true, the executed SQL and execution results will be recorded in logs as `log.info()`. If you haven't set log, you still can't see the corresponding executed SQL
relationGroupSize | 512 | Maximum associated IDs supported per query for include's associated query. If exceeded, will be executed as two statements, like greater than or equal to 1. Can be set separately at `.configure(o->o.setGroupSize(20))`
noVersionError | true | When an object has a version number and is an expression update, if the version number `withVersion` is not added, it will error. The corresponding version number must be set. If you don't want error, you can ignore it through `ignoreVersion`
warningColumnMiss| `true` | When JDBC's resultSet's columnName cannot be mapped to entity property, will output log.warning. `true`: means warning. `false`: means no warning
sqlParameterPrint| DEFAULT | SQL parameter printing optional MYBATIS mode with one more space after comma
mapToBeanStrict| true | Whether JDBC result set mapping to bean uses property strict mode
defaultSchema| null | When entity's schema is empty and defaultSchema is not empty, use defaultSchema
resultSizeLimit| -1 | Limit global data fetch to at most how many rows. Not effective when less than or equal to 0. If set to 100 and subsequent queries need to expand, can set separately at `.configure(o->o.setResultSizeLimit(100000))`
mapKeyConversion| -  | When using map to return results, how to handle resultSet converted to map keys. Defaults to supporting all uppercase, all lowercase, removing underscores, and can also keep underscores
printNavSql| true | Whether associated queries print secondary subquery SQL
propertyMode| `PropertyModeEnum.SAME_AS_ENTITY`  | Indicates entity properties are lowercase first letter (to be compatible with lambda and lambdakt modes). There's also `PropertyModeEnum.SAME_AS_ENTITY`. If you're in entity mode, it's recommended to use this
relationTableAppend| `RelationTableAppendEnum.SMART` | `SMART` means intelligently add `relationTable` implicit join. `DEFAULT` requires wrapping in `if` code block when code execution doesn't execute to navigation property
mappingStrategy| `EntityMappingStrategyEnum.PROPERTY_FIRST` | Mapping relationship between objects. Defaults to mapping by `column name`. Can choose `property name` or `column name + property name`
includeLimitMode| `IncludeLimitModeEnum.PARTITION` | When fetching many sub-items, if sub-items have limit set to limit return count, defaults to `partition` to improve performance but some databases don't support it. MySQL5.7 users can choose `union_all` to support include+limit
saveComment| `false` | `true`: then persist `@Column(comment="...")` and `@Table(comment="...")` annotations to EntityMetadata and ColumnMetadata
maxInClauseSize| `9999999` | When `.where(o -> o.id().in(ids))` can form `(id in (:p1,:p2) or id in(:p3,:p4))` according to the set `maxInClauseSize`
defaultCondition| `like` | Users can choose `like` or `contains`. The difference is that `like` treats the user's percent sign `%` as a wildcard, while `contains` treats the percent sign `%` as part of the searched content
autoIncludeTable| `throw` | When users use database table objects in `selectAutoInclude`, an error will be thrown. Users can also choose `warning` or `ignore` (recommend `throw`)

## Sharding-Specific Configuration

Configuration Name  | Default Value | Description  
--- | --- | --- 
sharding | `false`  | Whether to enable sharding. Not enabled by default. New configuration in 3.0.3^
connectionMode | `SYSTEM_AUTO`  | By default, the framework changes the connection mode for sharding connections to automatic. The framework will handle it automatically without user specification. Of course, users can also specify the connection mode themselves. 1. `MEMORY_STRICTLY` memory strict mode, meaning if cross-table or cross-database queries exist, this query will strictly control memory, querying all tables at once as much as possible. For a single database, if querying all tables, each table needs a `connection`, so a single query may exhaust the connection pool or even be insufficient. So usually works with the configuration parameter `maxShardingQueryLimit` as a limit. 2. `CONNECTION_STRICTLY` connection count limit, still using `maxShardingQueryLimit` as the maximum connection count, using as few connections as possible to execute cross-shard query merging. Mainly affects aggregation mode after sharding, whether to use stream aggregation or memory aggregation. Generally, users don't need to set.
maxShardingQueryLimit❗️ | `5`  | Suppose a single query involves querying across 13 tables. Because the query doesn't have a sharding key, this query will group 13 tables under the same database into 5 per group, dividing into 3 groups with the last group having 3 tables. The current query will acquire 5 connections at once. These 5 connections will be limited by the `defaultDataSourceMergePoolSize` parameter, then returned to the `DataSource` connection pool after this query is completed. This parameter cannot be set larger than the `DataSource`'s `pool-size`, otherwise it may cause the program to freeze, because if the connection pool is 20 and a single query needs 21, it will keep waiting until timeout and still can't get 21
defaultDataSourceMergePoolSize❗️ | `0`  | If any of your tables are sharded, you must set this value, and must be set less than or equal to the `DataSource` connection pool size. Suppose the connection pool size is 100, then this value can be set to 60, 70, 80, or even 100, but cannot be larger than the connection pool, and must be greater than or equal to `maxShardingQueryLimit`. If the connection pool is 100 and the current value is set to 10, it means all threads only have 10 connections within the connection pool that can be used for shard aggregation queries (10 per data source)
multiConnWaitTimeoutMillis | `5000`  | By default, for shard connection acquisition operations greater than 1, deduct from the total of `defaultDataSourceMergePoolSize`. For example, with 100 connection pool and shard set to 10, if 3 threads all need 5 shard aggregations, one thread definitely can't acquire, so it will wait for the default 5 seconds. If after this time the first two still haven't finished querying, it will throw an error
warningBusy | `true`  | During shard aggregation, because multiple connections need to be acquired at once, still using the above case, suppose the third thread acquired 5 connections but the acquisition time exceeded 80% of `multiConnWaitTimeoutMillis` time, the framework will print that acquiring connections is busy. You may need to readjust this value of `defaultDataSourceMergePoolSize` and adjust the connection pool size
maxShardingRouteCount | `128`  | When conditional sharding exceeds how much to error, default 128. That is, for example, select where update where delete where routes to too many tables will error. For entity operations like update object, insert, delete object, this condition won't be judged
defaultDataSourceName | `ds0`  | Default sharding datasource name. If you don't need database sharding, you don't need to set this value
shardingExecuteTimeoutMillis | `60000`  | Shard aggregation timeout default 60 seconds in units (ms), including CRUD
throwIfRouteNotMatch | `true`  | Whether to error when query doesn't match route. Default is if not choose to save, return default value. For example, sharding by time, if the starting shard table is January 2020, then if you query 2019 or query future time, the framework internally doesn't have this time yet, so the route obtained by this query is empty. You can choose not to error and return default value, like toList will be an empty collection, count will be 0, etc.
executorMaximumPoolSize | `0`  | Maximum shard aggregation thread count. Default 0 will use `Executors.newCachedThreadPool` thread pool. If you need to set or customize, please set to at least maxShardingQueryLimit*shard count. After setting value, will use bounded queue thread pool
executorCorePoolSize | `Math.min(processors, 4)`  | Only effective when `executorMaximumPoolSize`>0. Where `processors` is `Runtime.getRuntime().availableProcessors()`
executorQueueSize | `1024`  | Only effective when `executorMaximumPoolSize`>0. Thread pool bounded queue size
startTimeJob| `false` | When using the system default time-based sharding, setting this configuration to `true` will add corresponding system tables in memory. The principle is to start a scheduled task thread to execute
shardingFetchSize| `1000` | Default fetch size setting under sharding
shardingQueryInTransaction| serializable | `serializable` queries within transactions will set maxShardingQueryLimit to 1 to go serial to prevent dirty reads because current transactions are not allowed under concurrent queries. You can also use `concurrency` to ignore current transaction queries. Performance-wise, `concurrency` is prioritized. `serializable` will ensure relative data consistency. You can also manually set queryable().useMaxShardingQueryLimit(n)


## spring-boot
Configuration file can directly configure the above options
```yml

easy-query:
  enable: true
  name-conversion: underlined
  database: mysql
  #If executing physical delete statement will error. If changed to false, can later allow through allowDeleteStatement
  delete-throw: true
  #Print SQL display (requires framework to have default log to print with log.info)
  print-sql: true
  #Entity mapping to dto/vo uses property matching mode
  #Supports property_only column_only column_and_property property_first
  mapping-strategy: property_first
  ......
```

## Non-spring-boot
```java
 EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setDeleteThrowError(true);//Set to not allow physical deletion
                    op.setPrintSql(true);//Set to print executed SQL info in log.info mode
                    ......//Here used to configure system default configuration options
                })
                .replaceService(NameConversion.class, UnderlinedNameConversion.class)//Replace framework internal property and column conversion mode to uppercase to underscore
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())//Set dialect syntax etc. to MySQL's
                .build();
```
