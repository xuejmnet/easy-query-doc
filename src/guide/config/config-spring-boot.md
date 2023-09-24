---
title: SpringBoot配置
---

# SpringBoot配置


## 获取最新

[https://central.sonatype.com/](https://central.sonatype.com/) 搜索`com.easy-query`获取最新安装包



## spring-boot工程
```xml
<properties>
    <easy-query.version>latest-version</easy-query.version>
</properties>
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-springboot-starter</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```
```yml
#配置文件
easy-query:
  #是否启动默认true
  enable: true
  #支持的数据库
  database: mysql
  #对象属性和数据库列名的转换器
  name-conversion: underlined
  #当执行物理删除是否报错,true表示报错,false表示不报错,默认true,如果配置为true,可以通过allowDeleteStament来实现允许
  delete-throw: true
  #是否打印sql 默认true 需要配置log信息才可以 默认实现sl4jimpl
  print-sql: true
```
```java
//依赖注入
@Autowired
private EasyQueryClient easyQueryClient;//通过字符串属性方式来实现查询

//推荐
@Autowired
private EasyQuery easyQuery;//对EasyQueryClient的增强通过lambda方式实现查询(推荐)

//推荐
@Autowired
private EasyProxyQuery easyProxyQuery;//对EasyQueryClient的增强通过apt代理模式实现强类型(推荐)
```


## springboot多数据源
因为`easy-query`默认仅支持单数据源如果需要支持多数据源可以通过手动构建`EasyQuery`的Bean实例

```java
    @Bean("ds2")
    public EasyQuery easyQuery(DataSource dataSource) {
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)//springboot下必须用来支持事务
                .replaceService(ConnectionManager.class, SpringConnectionManager.class)//springboot下必须用来支持事务
                .replaceService(NameConversion.class, new UnderlinedNameConversion())
                .optionConfigure(builder -> {
                    builder.setDeleteThrowError(easyQueryProperties.getDeleteThrow());
                    builder.setInsertStrategy(easyQueryProperties.getInsertStrategy());
                    builder.setUpdateStrategy(easyQueryProperties.getUpdateStrategy());
                    builder.setMaxShardingQueryLimit(easyQueryProperties.getMaxShardingQueryLimit());
                    builder.setExecutorMaximumPoolSize(easyQueryProperties.getExecutorMaximumPoolSize());
                    builder.setExecutorCorePoolSize(easyQueryProperties.getExecutorCorePoolSize());
                    builder.setThrowIfRouteNotMatch(easyQueryProperties.isThrowIfRouteNotMatch());
                    builder.setShardingExecuteTimeoutMillis(easyQueryProperties.getShardingExecuteTimeoutMillis());
                    builder.setQueryLargeColumn(easyQueryProperties.isQueryLargeColumn());
                    builder.setMaxShardingRouteCount(easyQueryProperties.getMaxShardingRouteCount());
                    builder.setExecutorQueueSize(easyQueryProperties.getExecutorQueueSize());
                    builder.setDefaultDataSourceName(easyQueryProperties.getDefaultDataSourceName());
                    builder.setDefaultDataSourceMergePoolSize(easyQueryProperties.getDefaultDataSourceMergePoolSize());
                    builder.setMultiConnWaitTimeoutMillis(easyQueryProperties.getMultiConnWaitTimeoutMillis());
                    builder.setWarningBusy(easyQueryProperties.isWarningBusy());
                    builder.setInsertBatchThreshold(easyQueryProperties.getInsertBatchThreshold());
                    builder.setUpdateBatchThreshold(easyQueryProperties.getUpdateBatchThreshold());
                    builder.setPrintSql(easyQueryProperties.isPrintSql());
                    builder.setStartTimeJob(easyQueryProperties.isStartTimeJob());
                    builder.setDefaultTrack(easyQueryProperties.isDefaultTrack());
                    builder.setRelationGroupSize(easyQueryProperties.getRelationGroupSize());
                    builder.setNoVersionError(easyQueryProperties.isNoVersionError());
                })
                .useDatabaseConfigure(new MySQLDatabaseConfiguration())
                .build();
//         QueryConfiguration queryConfiguration = easyQueryClient.getRuntimeContext().getQueryConfiguration();

//         configuration.applyEncryptionStrategy(new DefaultAesEasyEncryptionStrategy());
//         configuration.applyEncryptionStrategy(new Base64EncryptionStrategy());
//         configuration.applyEncryptionStrategy(new MyEncryptionStrategy());
//         configuration.applyEncryptionStrategy(new JavaEncryptionStrategy());
//         configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
//         configuration.applyInterceptor(new MyEntityInterceptor());
//         configuration.applyInterceptor(new Topic1Interceptor());
//         configuration.applyInterceptor(new MyTenantInterceptor());
// //        configuration.applyShardingInitializer(new FixShardingInitializer());
//         configuration.applyShardingInitializer(new DataSourceAndTableShardingInitializer());
//         configuration.applyShardingInitializer(new TopicShardingShardingInitializer());
//         configuration.applyShardingInitializer(new TopicShardingTimeShardingInitializer());
//         configuration.applyShardingInitializer(new DataSourceShardingInitializer());
//         configuration.applyValueConverter(new EnumConverter());
//         configuration.applyValueConverter(new JsonConverter());
//         configuration.applyValueUpdateAtomicTrack(new IntegerNotValueUpdateAtomicTrack());
//         configuration.applyColumnValueSQLConverter(new MySQLAesEncryptColumnValueSQLConverter());
//         configuration.applyGeneratedKeySQLColumnGenerator(new MyDatabaseIncrementSQLColumnGenerator());
        return new EasyQuery(easyQueryClient);
    }
```


## SpringBoot 启动报错
::: danger 注意
> 因为默认添加了track的aop如果启动报错那么就添加一下aop
:::
```log
java.lang.IllegalStateException: Unable to load cache item
	at org.springframework.cglib.core.internal.LoadingCache.createEntry(LoadingCache.java:79) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.core.internal.LoadingCache.get(LoadingCache.java:34) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.core.AbstractClassGenerator$ClassLoaderData.get(AbstractClassGenerator.java:134) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.core.AbstractClassGenerator.create(AbstractClassGenerator.java:319) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.proxy.Enhancer.createHelper(Enhancer.java:572) ~[spring-core-5.3.29.jar:5.3.29]
	at org.springframework.cglib.proxy.Enhancer.createClass(Enhancer.java:419) ~[spring-core-5.3.29.jar:5.3.29]
```
主要原因是
- 缺少aop依赖
- aop组件版本不对

解决办法添加对应的依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

## 多数据源
默认仅支持单个数据源的处理

用户也可以自行构建其他数据库或者其他数据源的`easy-query`

```java

@Configuration
public class MyConfiguration {
    @Bean("myeq")
    public EasyQuery easyQuery1(DataSource dataSource){//数据源是你要的即可
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)//支持spring事务
                .replaceService(ConnectionManager.class, SpringConnectionManager.class)//支持spring事务
                .replaceService(NameConversion.class, UnderlinedNameConversion.class)
                .optionConfigure(builder -> {
                    //配置和springboot的配置一样
                    builder.setDeleteThrowError(easyQueryProperties.getDeleteThrow());
                    builder.setInsertStrategy(easyQueryProperties.getInsertStrategy());
                    builder.setUpdateStrategy(easyQueryProperties.getUpdateStrategy());
                    builder.setMaxShardingQueryLimit(easyQueryProperties.getMaxShardingQueryLimit());
                    builder.setExecutorMaximumPoolSize(easyQueryProperties.getExecutorMaximumPoolSize());
                    builder.setExecutorCorePoolSize(easyQueryProperties.getExecutorCorePoolSize());
                    builder.setThrowIfRouteNotMatch(easyQueryProperties.isThrowIfRouteNotMatch());
                    builder.setShardingExecuteTimeoutMillis(easyQueryProperties.getShardingExecuteTimeoutMillis());
                    builder.setQueryLargeColumn(easyQueryProperties.isQueryLargeColumn());
                    builder.setMaxShardingRouteCount(easyQueryProperties.getMaxShardingRouteCount());
                    builder.setExecutorQueueSize(easyQueryProperties.getExecutorQueueSize());
                    builder.setDefaultDataSourceName(easyQueryProperties.getDefaultDataSourceName());
                    builder.setDefaultDataSourceMergePoolSize(easyQueryProperties.getDefaultDataSourceMergePoolSize());
                    builder.setMultiConnWaitTimeoutMillis(easyQueryProperties.getMultiConnWaitTimeoutMillis());
                    builder.setWarningBusy(easyQueryProperties.isWarningBusy());
                    builder.setInsertBatchThreshold(easyQueryProperties.getInsertBatchThreshold());
                    builder.setUpdateBatchThreshold(easyQueryProperties.getUpdateBatchThreshold());
                    builder.setPrintSql(easyQueryProperties.isPrintSql());
                    builder.setStartTimeJob(easyQueryProperties.isStartTimeJob());
                    builder.setDefaultTrack(easyQueryProperties.isDefaultTrack());
                    builder.setRelationGroupSize(easyQueryProperties.getRelationGroupSize());
                    builder.setNoVersionError(easyQueryProperties.isNoVersionError());
                })
                .useDatabaseConfigure(new OracleDatabaseConfiguration())
                .build();
        return new DefaultEasyQuery(easyQueryClient);
    }
}

```