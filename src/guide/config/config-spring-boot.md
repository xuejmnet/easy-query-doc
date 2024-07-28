---
title: SpringBoot配置
---
## 前言
前面在[快速开始](../../startup/quick-start.md#springboot环境)章节中，我们知道了Easy Query如何在Spring Boot环境下使用，本章节将讲解Easy Query在Spring Boot环境下更多的功能配置。

## springboot多数据源
多数据源配置请查看[多数据源处理](./muti-datasource.md)章节

::: warning 注意点及说明!!!
> 注意自行构建的数据源如果`DataSource`不是被spring接管的`Bean`那么事务将不会生效
:::



::: warning 说明!!!
> 创建完拦截器后需要配置到`QueryConfiguration`,如果你是`springboot`并且是默认`easy-query`只需要添加`@Component`如果是`solon`那么可以查看[配置或配置到所有数据源](/easy-query-doc/guide/config/config-solon.html#solon所有配置)
> 如果您是自行构建的`easy-query`需要自行添加拦截器
```java
QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
configuration.applyEncryptionStrategy(new DefaultAesEasyEncryptionStrategy());
configuration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
configuration.applyInterceptor(new MyEntityInterceptor());
configuration.applyShardingInitializer(new DataSourceAndTableShardingInitializer());
configuration.applyValueConverter(new EnumConverter());
configuration.applyColumnValueSQLConverter(new MySQLAesEncryptColumnValueSQLConverter());
configuration.applyGeneratedKeySQLColumnGenerator(new MyDatabaseIncrementSQLColumnGenerator());
TableRouteManager tableRouteManager = runtimeContext.getTableRouteManager();
tableRouteManager.addRoute(new TopicShardingTableRoute());
DataSourceRouteManager dataSourceRouteManager = runtimeContext.getDataSourceRouteManager();
dataSourceRouteManager.addRoute(new TopicShardingDataSourceTimeDataSourceRoute());
```
:::


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



```log
Caused by: org.springframework.beans.factory.UnsatisfiedDependencyException: Error creating bean with name 'easyQueryInitializeOption' defined in class path resource [com/easy/query/sql/starter/EasyQueryStarterAutoConfiguration.class]: Unsatisfied dependency expressed through method 'easyQueryInitializeOption' parameter 1; nested exception is org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'java.util.Map<java.lang.String, com.easy.query.core.basic.extension.version.VersionStrategy>' available: expected at least 1 bean which qualifies as autowire candidate. Dependency annotations: {}
```

可能是springboot版本太低导致没有的依赖不是以空map返回而是报错

建议重写bean
```java
//    @Bean
//    @ConditionalOnMissingBean
//    public EasyQueryInitializeOption easyQueryInitializeOption(Map<String, Interceptor> interceptorMap,
//                                                               Map<String, VersionStrategy> versionStrategyMap,
//                                                               Map<String, LogicDeleteStrategy> logicDeleteStrategyMap,
//                                                               Map<String, ShardingInitializer> shardingInitializerMap,
//                                                               Map<String, EncryptionStrategy> encryptionStrategyMap,
//                                                               Map<String, ValueConverter<?, ?>> valueConverterMap,
//                                                               Map<String, TableRoute<?>> tableRouteMap,
//                                                               Map<String, DataSourceRoute<?>> dataSourceRouteMap,
//                                                               Map<String, ValueUpdateAtomicTrack<?>> valueUpdateAtomicTrackMap,
//                                                               Map<String, JdbcTypeHandler> jdbcTypeHandlerMap,
//                                                               Map<String, ColumnValueSQLConverter> columnValueSQLConverterMap,
//                                                               Map<String, IncrementSQLColumnGenerator> incrementSQLColumnGeneratorMap
//    ) {
//        return new EasyQueryInitializeOption(interceptorMap,
//                versionStrategyMap,
//                logicDeleteStrategyMap,
//                shardingInitializerMap,
//                encryptionStrategyMap,
//                valueConverterMap,
//                tableRouteMap,
//                dataSourceRouteMap,
//                valueUpdateAtomicTrackMap,
//                jdbcTypeHandlerMap,
//                columnValueSQLConverterMap,
//                incrementSQLColumnGeneratorMap);
//    }


    @Bean
    @Primary
    public EasyQueryInitializeOption easyQueryInitializeOption(Map<String, Interceptor> interceptorMap
    ) {
        return new EasyQueryInitializeOption(interceptorMap,
                versionStrategyMap,
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap(),
                Collections.emptyMap());
    }
```

# 无依赖配置
有些用户喜欢拥有非常强的强迫症,这边给出如何自行处理实现类starter,无依赖引入`easy-query`

## 创建springboot应用
下载地址 https://start.spring.io/

## 添加依赖

### 属性模式

```xml
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-jdbc</artifactId>
		</dependency>
		<dependency>
			<groupId>com.easy-query</groupId>
			<artifactId>sql-core</artifactId>
			<version>${easy-query.version}</version>
		</dependency>
<!--		自己选择对应的驱动-->
		<dependency>
			<groupId>com.easy-query</groupId>
			<artifactId>sql-mysql</artifactId>
			<version>${easy-query.version}</version>
		</dependency>
		<!-- mysql驱动 -->
		<dependency>
			<groupId>mysql</groupId>
			<artifactId>mysql-connector-java</artifactId>
			<version>8.0.31</version>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>
```
### Entity模式
```xml
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-jdbc</artifactId>
		</dependency>
		<dependency>
			<groupId>com.easy-query</groupId>
			<artifactId>sql-core</artifactId>
			<version>${easy-query.version}</version>
		</dependency>
<!--		代理模式-->
		<dependency>
			<groupId>com.easy-query</groupId>
			<artifactId>sql-api-proxy</artifactId>
			<version>${easy-query.version}</version>
		</dependency>
<!--		自己选择对应的驱动-->
		<dependency>
			<groupId>com.easy-query</groupId>
			<artifactId>sql-mysql</artifactId>
			<version>${easy-query.version}</version>
		</dependency>
<!--		用来生成代理对象-->
		<dependency>
			<groupId>com.easy-query</groupId>
			<artifactId>sql-processor</artifactId>
			<version>${easy-query.version}</version>
		</dependency>
		<!-- mysql驱动 -->
		<dependency>
			<groupId>mysql</groupId>
			<artifactId>mysql-connector-java</artifactId>
			<version>8.0.31</version>
		</dependency>

		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>
```

## 添加配置

首先我们如果需要支持springboot的事务需要再`easy-query`的`springboot-strater`处拷贝三个源码文件


```java

public class SpringConnectionManager extends DefaultConnectionManager {

    public SpringConnectionManager(EasyQueryDataSource easyDataSource, EasyConnectionFactory easyConnectionFactory, EasyDataSourceConnectionFactory easyDataSourceConnectionFactory) {
        super(easyDataSource, easyConnectionFactory, easyDataSourceConnectionFactory);
    }

    @Override
    public boolean currentThreadInTransaction() {
        return TransactionSynchronizationManager.isActualTransactionActive() || isOpenTransaction();
    }

    @Override
    public void closeEasyConnection(EasyConnection easyConnection) {
        if(easyConnection==null){
            return;
        }
        //当前没开事务,但是easy query手动开启了
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            if (super.isOpenTransaction()) {
                return;
            }
        } else {
            if (super.isOpenTransaction()) {
                throw new EasyQueryException("repeat transaction can't closed connection");
            }
        }
        DataSourceWrapper dataSourceUnit = easyDataSource.getDataSourceNotNull(easyConnection.getDataSourceName(), ConnectionStrategyEnum.ShareConnection);
        DataSourceUtils.releaseConnection(easyConnection.getConnection(), dataSourceUnit.getDataSourceUnit().getDataSource());
    }
}


public class SpringDataSourceUnit extends DefaultDataSourceUnit {
    public SpringDataSourceUnit(String dataSourceName, DataSource dataSource, int mergePoolSize, boolean warningBusy) {
        super(dataSourceName,dataSource,mergePoolSize,warningBusy);
    }

    @Override
    protected Connection getConnection() throws SQLException {
        return DataSourceUtils.getConnection(dataSource);
    }
}


public class SpringDataSourceUnitFactory implements DataSourceUnitFactory {
    private final EasyQueryOption easyQueryOption;

    public SpringDataSourceUnitFactory(EasyQueryOption easyQueryOption){

        this.easyQueryOption = easyQueryOption;
    }
    @Override
    public DataSourceUnit createDataSourceUnit(String dataSourceName, DataSource dataSource, int mergePoolSize) {
        return new SpringDataSourceUnit(dataSourceName,dataSource,mergePoolSize,easyQueryOption.isWarningBusy());
    }
}


```

## 注入bean


```java

@Configuration
public class EasyQueryConfiguration {
    
    @Bean("oracleDataSource")
    public DataSource oracleDataSource(){
        return DataSourceBuilder.create()
                .url("jdbc:h2:mem:testdb")
                .driverClassName("org.h2.Driver")
                .username("sa")
                .password("password")
                .build();
    }
    @Bean("orcale")//使用的时候通过注入指定名称即可
    public EasyQueryClient easyQueryClient(@Qualifier("oracleDataSource") DataSource dataSource){
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)
                .replaceService(NameConversion.class, UnderlinedNameConversion.class)
                .replaceService(ConnectionManager.class, SpringConnectionManager.class)
                .optionConfigure(builder -> {
//                    builder.setDeleteThrowError(easyQueryProperties.getDeleteThrow());
//                    builder.setInsertStrategy(easyQueryProperties.getInsertStrategy());
//                    builder.setUpdateStrategy(easyQueryProperties.getUpdateStrategy());
//                    builder.setMaxShardingQueryLimit(easyQueryProperties.getMaxShardingQueryLimit());
//                    builder.setExecutorMaximumPoolSize(easyQueryProperties.getExecutorMaximumPoolSize());
//                    builder.setExecutorCorePoolSize(easyQueryProperties.getExecutorCorePoolSize());
//                    builder.setThrowIfRouteNotMatch(easyQueryProperties.isThrowIfRouteNotMatch());
//                    builder.setShardingExecuteTimeoutMillis(easyQueryProperties.getShardingExecuteTimeoutMillis());
//                    builder.setQueryLargeColumn(easyQueryProperties.isQueryLargeColumn());
//                    builder.setMaxShardingRouteCount(easyQueryProperties.getMaxShardingRouteCount());
//                    builder.setExecutorQueueSize(easyQueryProperties.getExecutorQueueSize());
//                    builder.setDefaultDataSourceName(easyQueryProperties.getDefaultDataSourceName());
//                    builder.setDefaultDataSourceMergePoolSize(easyQueryProperties.getDefaultDataSourceMergePoolSize());
//                    builder.setMultiConnWaitTimeoutMillis(easyQueryProperties.getMultiConnWaitTimeoutMillis());
//                    builder.setWarningBusy(easyQueryProperties.isWarningBusy());
//                    builder.setInsertBatchThreshold(easyQueryProperties.getInsertBatchThreshold());
//                    builder.setUpdateBatchThreshold(easyQueryProperties.getUpdateBatchThreshold());
//                    builder.setPrintSql(easyQueryProperties.isPrintSql());
//                    builder.setStartTimeJob(easyQueryProperties.isStartTimeJob());
//                    builder.setDefaultTrack(easyQueryProperties.isDefaultTrack());
//                    builder.setRelationGroupSize(easyQueryProperties.getRelationGroupSize());
//                    builder.setKeepNativeStyle(easyQueryProperties.isKeepNativeStyle());
//                    builder.setNoVersionError(easyQueryProperties.isNoVersionError());
//                    builder.setReverseOffsetThreshold(easyQueryProperties.getReverseOffsetThreshold());
                })
                .useDatabaseConfigure(new OracleDatabaseConfiguration())
                .build();

        return easyQueryClient;
    }
    
    @Bean
    public EasyEntityQuery easyEntityQuery(EasyQueryClient easyQueryClient){
        return new DefaultEasyEntityQuery(easyQueryClient);
    }
}
```

## 添加配置文件
```yml
server:
  port: 8080

spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/easy-sharding-test?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
    username: root
    password: root
```

## 添加控制器
```java

@RestController
@RequestMapping("/my")
public class MyController {
    @Autowired
    private EasyEntityQuery easyEntityQuery;
    @GetMapping("/test")
    public Object test() {
        return "hello world";
    }
}
```