---
title: Configuration Parameters (Important)❗️❗️❗️
order: 10
---
# Configurable Parameter Options
Before using, hope users can first review the optional configuration items once, which helps understand how to optimize.

::: danger Breaking Changes!!!
> Framework has some configuration changes from v2 to v3. For details, see [v2 to v3 upgrade](/en/easy-query-doc/v2-v3)
> Framework has some configuration changes from v2 to v3. For details, see [v2 to v3 upgrade](/en/easy-query-doc/v2-v3)
> Framework has some configuration changes from v2 to v3. For details, see [v2 to v3 upgrade](/en/easy-query-doc/v2-v3)
:::

## Default Configuration Items
Configuration Name  | Default | Description  
--- | --- | --- 
database | `DatabaseEnum.DEFAULT`  | By default uses SQL92 compliant syntax. If your database is within `easy-query`'s supported database range, please select the correct database you're using.
deleteThrow | `true`  | `easy-query` doesn't allow physical deletion by default for data security. This doesn't mean delete operations can't be executed, but delete statements can't be generated after executing delete. Recommend using logical deletion to avoid this. For example, `delete from t_user where uid=1` will become `update t_user set deleted=1 where uid=1` after using logical deletion. Framework implements this function by default with logical deletion, users still use `deletable` method to call execution.
nameConversion | `underlined`  | Currently two choices, users can also implement `NameConversion` interface themselves. Currently optional: `default`, `underlined`, `upper_underlined`, `lower_camel_case`, `upper_camel_case`. Enabling `default` means default object-to-database mapping is property name, e.g. property name `userAge` corresponds to database `userAge` column. `underlined` means using underscore, `userAge` will correspond to database `user_age` column. After global setting, can also manually specify corresponding column name in `@Column` [Related content](/en/easy-query-doc/framework/mapping-db)
insertStrategy | `ONLY_NOT_NULL_COLUMNS`  | `insert` command defaults to non-null column insertion. If a table has `id` and `name`, when `name` column is null, generated SQL won't specify `name` column like `insert into t_user (id) values(?)`. If `name` column is not null, generated SQL will be `insert into t_user (id,name) values(?,?)`. If inserting collection with some columns null and some non-null, calling batch will generate n SQLs, merging same SQLs together. So choose according to your needs (default configuration is already good).
updateStrategy | `ALL_COLUMNS`  | By default, update command generated statement will update all columns of entire object, won't check if null. If needed, can set whether null, not null, or all columns update.
insertBatchThreshold | 1024  | If insertable adds object collection ≥1024 at once, will merge same SQL to improve execution efficiency. Connection string needs to add `rewriteBatchedStatements=true` (mysql). Can manually use or disable by calling insert or update's batch method. E.g. ≥3. Don't ask why not default `batch`, because `batch` some jdbc drivers or databases won't return correct affected row count.
updateBatchThreshold | 1024  | If updatable adds object collection ≥1024 at once, will merge same SQL to improve execution efficiency. Connection string needs to add `rewriteBatchedStatements=true` (mysql). Can manually use or disable by calling insert or update's batch method. E.g. ≥3. Don't ask why not default `batch`, because `batch` some jdbc drivers or databases won't return correct affected row count.
logClass | -  | Under `spring-boot` default is `com.easy.query.sql.starter.logging.Slf4jImpl` implementation. If you're non-`spring-boot`, can implement yourself or use console logging `LogFactory.useStdOutLogging()`
queryLargeColumn | `true`  | By default still queries columns marked as `large` under `@Column`. If don't want to query, suggest setting as `large` and setting corresponding column as `@UpdateIgnore` with `updateSetInTrackDiff = true` to prevent unqueried results from being updated to null after full column update.
printSql | `true`  | Whether to print executed SQL. This is different from log, considering sometimes may need to view SQL without log output. So if set to true, executed SQL and results will be recorded in log as `log.info()`. If you haven't set log, still won't see corresponding executed SQL.
relationGroupSize | 512 | Single query maximum supported association ids for include association query. If exceeded, will execute as two statements. E.g. ≥1. Can set separately in `.configure(o->o.setGroupSize(20))`.
noVersionError | true | When object has version number and is expression update, if version number `withVersion` not added, will error. Must set corresponding version number. If don't want error, can use `ignoreVersion` to ignore.
warningColumnMiss| `true` | When jdbc's resultSet's columnName can't map to entity property, will output log.warning. `true`: means warning. `false`: means no warning.
sqlParameterPrint| DEFAULT | SQL parameter printing. Can choose MYBATIS mode with extra comma and space.
mapToBeanStrict| true | Whether to use property strict mode when mapping jdbc result set to bean.
defaultSchema| null | When entity's schema is empty and defaultSchema is not empty, use defaultSchema.
resultSizeLimit| -1 | Limit global fetch data to at most how many rows. ≤0 not effective. If set to 100, subsequent queries need to increase can set separately in `.configure(o->o.setResultSizeLimit(100000))`.
mapKeyConversion| -  | When using map to return results, how to handle resultSet to map key. Default supports all uppercase, all lowercase, remove underscore, can also keep underscore.
printNavSql| true | Whether to print secondary subquery SQL for association query.
propertyMode| `PropertyModeEnum.SAME_AS_ENTITY`  | Indicates entity property is lowercase first letter (to be compatible with lambda and lambdakt mode). Another is `PropertyModeEnum.SAME_AS_ENTITY`. If you're entity mode, suggest using this.
relationTableAppend| `RelationTableAppendEnum.SMART` | `SMART` means intelligently add `relationTable` implicit join, `DEFAULT` needs code execution not executing to navigation property needs `if` code block wrapping.
mappingStrategy| `EntityMappingStrategyEnum.PROPERTY_FIRST` | Mapping relationship between objects. Default maps by `column name`, can choose `property name` or `column name + property name`.
includeLimitMode| `IncludeLimitModeEnum.PARTITION` | When many sub-items are fetched, if sub-item sets limit to restrict return count, default uses `partition` to improve performance but some databases don't support. MySQL5.7 users can choose `union_all` to support include+limit.
saveComment| `false` | `true`: keeps `@Column(comment="...")` and `@Table(comment="...")` annotation to EntityMetadata and ColumnMetadata.
maxInClauseSize| `9999999` | When `.where(o -> o.id().in(ids))` can form `(id in (:p1,:p2) or id in(:p3,:p4))` according to set `maxInClauseSize`.

## Sharding Specific Configuration

Configuration Name  | Default | Description  
--- | --- | --- 
sharding | `false`  | Whether to enable sharding. Not enabled by default. 3.0.3^ new configuration.
connectionMode | `SYSTEM_AUTO`  | By default framework changes sharding connection mode to auto, framework handles automatically, no need for users to specify. Of course users can specify connection mode themselves. 1. `MEMORY_STRICTLY` memory strict mode, means if cross-table or cross-database query exists, this query will strictly control memory, query all tables at once as much as possible. For single database querying all tables, each table needs one `connection`, so may exhaust connection pool connections in single query or even not enough. So generally used with below config parameter `maxShardingQueryLimit` as limit. 2. `CONNECTION_STRICTLY` connection count limit, still uses `maxShardingQueryLimit` as maximum connections, uses as few connections as possible to execute cross-shard query merge. Mainly affects aggregation mode after sharding, whether to use streaming aggregation or memory aggregation. Generally users don't need to set.
maxShardingQueryLimit❗️ | `5`  | Assume single query involves 13 cross-table queries. Because query doesn't have sharding key, this query will group 13 tables in same database into groups of 5, forming 3 groups with last group of 3 tables. Current query will acquire 5 connections at once, these 5 connections will be limited by `defaultDataSourceMergePoolSize` parameter, then returned to `DataSource` connection pool after this query completes. This parameter can't be set larger than `DataSource`'s `pool-size`, otherwise may cause program deadlock. Because if connection pool is 20, if single query needs 21, will keep waiting until timeout and still can't acquire 21.
defaultDataSourceMergePoolSize❗️ | `0`  | If your tables have sharding tables, must set this value, and must set ≤ `DataSource` connection pool size. Assume connection pool size is 100, this value can be set to 60, 70, 80, or even 100, but can't be larger than connection pool, and must be ≥ `maxShardingQueryLimit`. If connection pool 100 and current value set to 10, means all threads only have 10 connections in connection pool for sharding aggregation query (10 per data source).
multiConnWaitTimeoutMillis | `5000`  | By default for sharding connection acquisition >1 operations, deduct from `defaultDataSourceMergePoolSize` total. Like above 100 connection pool with sharding set to 10. If 3 threads all need 5 sharding aggregations, definitely one thread can't acquire. Will wait for default 5 seconds. If exceeds this time and still can't acquire because first two haven't finished querying, will throw error.
warningBusy | `true`  | When sharding aggregation needs to acquire multiple connections at once. Still above case, assume third thread acquired 5 connections but acquisition time exceeded 80% of `multiConnWaitTimeoutMillis` time, framework will print acquiring connection is busy. You may need to readjust `defaultDataSourceMergePoolSize` value and connection pool size.
maxShardingRouteCount | `128`  | Error when condition sharding exceeds how many, default 128. For example select where, update where, delete where routes to too many tables will error. Entity operations like update object, insert, delete object won't check this condition.
defaultDataSourceName | `ds0`  | Default sharding data source name. If you don't need sharding, no need to set this value.
shardingExecuteTimeoutMillis | `60000`  | Sharding aggregation timeout default 60 seconds unit(ms), includes CRUD.
throwIfRouteNotMatch | `true`  | Whether to error when query doesn't match route. Default is if don't choose save then return default value. For example shard by time, start shard table is January 2020. If you query 2019 or query future time, framework internally doesn't have this time yet so route acquired for this query is empty. You can choose not to error and return default value. E.g. toList returns empty collection, count returns 0, etc.
executorMaximumPoolSize | `0`  | Sharding aggregation maximum thread count. Default 0 will use `Executors.newCachedThreadPool` thread pool. If need to set or customize, please set to at least maxShardingQueryLimit*shard count. After setting value will use bounded queue thread pool.
executorCorePoolSize | `Math.min(processors, 4)`  | Only effective when `executorMaximumPoolSize`>0. Where `processors` is `Runtime.getRuntime().availableProcessors()`.
executorQueueSize | `1024`  | Only effective when `executorMaximumPoolSize`>0. Thread pool bounded queue size.
startTimeJob| `false` | When using system default time-based sharding, setting this config to `true`, framework will add corresponding system tables in memory. Principle is starting a scheduled task thread to execute.
shardingFetchSize| `1000` | Default fetch size setting under sharding.
shardingQueryInTransaction| serializable | `serializable` in-transaction query will set maxShardingQueryLimit to 1 for serial processing to prevent dirty reads because concurrent query under current transaction not possible. Can also use `concurrency` to ignore current transaction query. Performance-wise `concurrency` priority. `serializable` ensures relative data consistency. Can also manually set queryable().useMaxShardingQueryLimit(n).

## spring-boot
Can directly configure above options through configuration file:
```yml

easy-query:
  enable: true
  name-conversion: underlined
  database: mysql
  #Will error if executing physical delete statement. If change to false, can allow later through allowDeleteStatement
  delete-throw: true
  #Print SQL display (needs framework default log to print with log.info)
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
                    op.setDeleteThrowError(true);//Set not allow physical deletion
                    op.setPrintSql(true);//Set to print executed SQL info in log.info mode
                    ......//Here for configuring system default configuration options
                })
                .replaceService(NameConversion.class, UnderlinedNameConversion.class)//Replace framework internal property and column conversion mode to uppercase to underscore
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())//Set dialect syntax etc. to mysql's
                .build();
```

