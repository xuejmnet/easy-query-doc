---
title: Advanced Features
order: 30
---

# Advanced Features
`easy-query`'s advanced features come from the author's years of development experience, with very strong practical significance, helping you eliminate many meaningless operations.

#### Contents
- [《EasyQuery: Logical Delete》](/en/easy-query-doc/adv/logic-delete) Data is invaluable, soft delete provides a safety net for programs, allowing users to not worry about the underlying implementation by modifying `delete` statements to `update` for automatic seamless logical delete, supporting `select`, `update`, `delete`
- [《EasyQuery: Global Interceptor》](/en/easy-query-doc/adv/interceptor) Supports entity interception before insertion and update of `entity` objects, custom conditions for `select`, `update`, `delete`, and custom `set` for `update`

## How to Add All Written Extensions to the Current ORM

For all written extensions like logical delete, interceptors, etc., if you built `easy-query` using `springboot-starter`, you only need to add `@Component` to the extension.

If you built `easy-query` yourself, you can get the corresponding `QueryConfiguration` and then `apply` the extension.

### Manual Handling
```java
 QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
        QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
        configuration.applyEncryptionStrategy(new DefaultAesEasyEncryptionStrategy());
        configuration.applyEncryptionStrategy(new Base64EncryptionStrategy());
        configuration.applyEncryptionStrategy(new MyEncryptionStrategy());
        configuration.applyEncryptionStrategy(new JavaEncryptionStrategy());
        configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
        configuration.applyInterceptor(new MyEntityInterceptor());
        configuration.applyInterceptor(new Topic1Interceptor());
        configuration.applyInterceptor(new MyTenantInterceptor());
//        configuration.applyShardingInitializer(new FixShardingInitializer());
        configuration.applyShardingInitializer(new DataSourceAndTableShardingInitializer());
        configuration.applyShardingInitializer(new TopicShardingShardingInitializer());
        configuration.applyShardingInitializer(new TopicShardingTimeShardingInitializer());
        configuration.applyShardingInitializer(new DataSourceShardingInitializer());
        configuration.applyValueConverter(new EnumConverter());
        configuration.applyValueConverter(new JsonConverter());
        configuration.applyValueConverter(new EnumValueConverter());
//        configuration.applyValueUpdateAtomicTrack(new IntegerNotNullValueUpdateAtomicTrack());
        configuration.applyColumnValueSQLConverter(new MySQLAesEncryptColumnValueSQLConverter());
        configuration.applyIncrementSQLColumnGenerator(new MyDatabaseIncrementSQLColumnGenerator());
        TableRouteManager tableRouteManager = runtimeContext.getTableRouteManager();
        tableRouteManager.addRoute(new TopicShardingTableRoute());
        tableRouteManager.addRoute(new TopicShardingTimeTableRoute());
        tableRouteManager.addRoute(new TopicShardingDataSourceTimeTableRoute());
        DataSourceRouteManager dataSourceRouteManager = runtimeContext.getDataSourceRouteManager();
        dataSourceRouteManager.addRoute(new TopicShardingDataSourceTimeDataSourceRoute());
        dataSourceRouteManager.addRoute(new TopicShardingDataSourceRoute());
```

### Solon
```java

@Configuration
public class DefaultConfiguration {
    @Bean(name = "db1",typed=true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource){
        return dataSource;
    }
    @Bean
    public void db1QueryConfiguration(@Db("db1") QueryConfiguration configuration){
        //Apply here
        configuration.applyEncryptionStrategy(new JavaEncryptionStrategy());
        configuration.applyColumnValueSQLConverter(new MySQLAESColumnValueSQLConverter());
    }
}
```
