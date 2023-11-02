---
title: 高级功能
order: 30
---

# 高级功能
`easy-query`的高级功能来自于作者多年的开发经验总结,具有非常强悍的实际实践意义,可以帮你摆脱很多无意义的操作



#### 目录
- [《EasyQuery:逻辑删除》](/easy-query-doc/guide/adv/logic-delete) 数据的无价,软删除可以给程序带来后悔药,让用户无需关心底层通过修改`delete`语句为`update`来实现自动无感逻辑删除,支持`select`、`update`、`delete`
- [《EasyQuery:全局拦截器》](/easy-query-doc/guide/adv/interceptor) 支持`entity`对象的插入、更新前的实体拦截修改，`select`、`update`、`delete`的条件自定义,`update`的`set`自定义


## 编写的所有扩展如何添加到当前orm中

编写的所有扩展比如逻辑删除,拦截器等,如果你是用`springboot-starter`构建的`easy-query`那么只需要在扩展上添加`@Component`

如果你是自行构建的`easy-query`那么可以获取对应的`QueryConfiguration`然后`apply`扩展

### 自行处理
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

### solon
```java

@Configuration
public class DefaultConfiguration {
    @Bean(name = "db1",typed=true)
    public DataSource db1DataSource(@Inject("${db1}") HikariDataSource dataSource){
        return dataSource;
    }
    @Bean
    public void db1QueryConfiguration(@Db("db1") QueryConfiguration configuration){
        //在这边进行apply
        configuration.applyEncryptionStrategy(new JavaEncryptionStrategy());
        configuration.applyColumnValueSQLConverter(new MySQLAESColumnValueSQLConverter());
    }
}
```