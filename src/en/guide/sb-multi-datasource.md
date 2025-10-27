---
title: Spring Boot Multi-Data Source
order: 4
---

This chapter focuses on how to encapsulate and handle multi-data sources and dynamic multi-data sources in Spring Boot. The framework itself doesn't want to over-encapsulate this processing, trying to ensure that users who need multi-data sources handle it themselves rather than providing a default. Here's an approach


# Multi-Data Source Implementation
Add default multi-data source interface

[Source code for this chapter](https://gitee.com/xuejm/easy-query/tree/main/samples/multi-datasource-demo)
```java


/**
 * create time 2024/3/13 15:21
 * If no data source is specified, return the default data source
 *
 * @author xuejiaming
 */
public interface EasyMultiEntityQuery extends EasyEntityQuery {
    /**
     * Set which data source the current context thread uses
     * @param dataSource
     */
    void setCurrent(String dataSource);

    /**
     * Return an existing data source, error if it doesn't exist
     * @param dataSource
     * @return
     */
    EasyEntityQuery getByDataSource(String dataSource);

    /**
     * Execute a method for the specified data source and return the result
     * @param dataSource
     * @param dataSourceFunction
     * @return
     * @param <TResult>
     */
    <TResult> TResult executeScope(String dataSource, Function<EasyEntityQuery,TResult> dataSourceFunction);

    /**
     * Clear current context data source
     */
    void clear();
}



```

Implement interface
```java

public class DefaultEasyMultiEntityQuery implements EasyMultiEntityQuery {
    private final Map<String, EasyEntityQuery> multi = new ConcurrentHashMap<>();
    private final ThreadLocal<String> currentDataSource = ThreadLocal.withInitial(() -> null);
    private final EasyEntityQuery easyEntityQuery;

    public DefaultEasyMultiEntityQuery(EasyEntityQuery easyEntityQuery,Map<String,EasyEntityQuery> extraEasyEntityQueryMap) {
        this.easyEntityQuery = easyEntityQuery;
        multi.putAll(extraEasyEntityQueryMap);
    }

    @Override
    public void setCurrent(String dataSource) {
        currentDataSource.set(dataSource);
    }

    @Override
    public EasyEntityQuery getByDataSource(String dataSource) {
        EasyEntityQuery entityQuery = multi.get(dataSource);
        Objects.requireNonNull(entityQuery, "entityQuery is null");
        return entityQuery;
    }

    @Override
    public <TResult> TResult executeScope(String dataSource, Function<EasyEntityQuery, TResult> dataSourceFunction) {
        EasyEntityQuery entityQuery = multi.get(dataSource);
        Objects.requireNonNull(entityQuery, "entityQuery is null");
        return dataSourceFunction.apply(entityQuery);
    }

    @Override
    public void clear() {
        currentDataSource.remove();
    }

    private EasyEntityQuery tryGetEntityQuery(){
        String ds = currentDataSource.get();
        if(ds==null){
            return easyEntityQuery;
        }
        EasyEntityQuery entityQuery = multi.get(ds);
        Objects.requireNonNull(entityQuery, "entityQuery is null");
        return entityQuery;
    }

    @Override
    public EasyQueryClient getEasyQueryClient() {
        return tryGetEntityQuery().getEasyQueryClient();
    }

    @Override
    public QueryRuntimeContext getRuntimeContext() {
        return tryGetEntityQuery().getRuntimeContext();
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityQueryable<TProxy, T> queryable(Class<T> entityClass) {
        return tryGetEntityQuery().queryable(entityClass);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityQueryable<TProxy, T> queryable(String sql, Class<T> entityClass) {
        return tryGetEntityQuery().queryable(entityClass);
    }

    @Override
    public Transaction beginTransaction(Integer isolationLevel) {
        return tryGetEntityQuery().beginTransaction(isolationLevel);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityInsertable<TProxy, T> insertable(T entity) {
        return tryGetEntityQuery().insertable(entity);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityInsertable<TProxy, T> insertable(Collection<T> entities) {
        return tryGetEntityQuery().insertable(entities);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> ExpressionUpdatable<TProxy, T> updatable(Class<T> entityClass) {
        return tryGetEntityQuery().updatable(entityClass);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityUpdatable<TProxy, T> updatable(T entity) {
        return tryGetEntityQuery().updatable(entity);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityUpdatable<TProxy, T> updatable(Collection<T> entities) {
        return tryGetEntityQuery().updatable(entities);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityDeletable<TProxy, T> deletable(T entity) {
        return tryGetEntityQuery().deletable(entity);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityDeletable<TProxy, T> deletable(Collection<T> entities) {
        return tryGetEntityQuery().deletable(entities);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> ExpressionDeletable<TProxy, T> deletable(Class<T> entityClass) {
        return tryGetEntityQuery().deletable(entityClass);
    }

    @Override
    public boolean addTracking(Object entity) {
        return tryGetEntityQuery().addTracking(entity);
    }

    @Override
    public boolean removeTracking(Object entity) {
        return tryGetEntityQuery().removeTracking(entity);
    }

    @Override
    public EntityState getTrackEntityStateNotNull(Object entity) {
        return tryGetEntityQuery().getTrackEntityStateNotNull(entity);
    }
}

```


## Creating Configuration
```java

@Configuration
public class MultiDataSourceConfiguration {
    @Bean
    public EasyMultiEntityQuery easyMultiEntityQuery(EasyEntityQuery easyEntityQuery, @Qualifier("ds2") EasyEntityQuery easyEntityQuery2){
        HashMap<String, EasyEntityQuery> extra = new HashMap<>();
        extra.put("ds2",easyEntityQuery2);
        return new DefaultEasyMultiEntityQuery(easyEntityQuery,extra);
    }

    /**
     * Users need to implement the corresponding DataSource's PlatformTransactionManager themselves
     * @return
     */
    @Bean("xxx")
    public DataSource dataSource2(){
        return DataSourceBuilder.create().driverClassName("")
                .url("")
                .username("")
                .password("").build();
    }
    /**
     * Implement transaction manager for the corresponding datasource1
     */
    @Bean(name = "xxxTransactionManager")
    public PlatformTransactionManager xxxTxManager(@Qualifier("xxx") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
    @Bean("ds2")
    public EasyEntityQuery easyQuery(/*Inject your own multi-datasource datasource*/@Qualifier("xxx")DataSource dataSource) {
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)//Required for Spring Boot to support transactions
                .replaceService(ConnectionManager.class, SpringConnectionManager.class)//Required for Spring Boot to support transactions
                .replaceService(NameConversion.class, new UnderlinedNameConversion())
                .optionConfigure(builder -> {
                    builder.setPrintSql(true);
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
        return new DefaultEasyEntityQuery(easyQueryClient);
    }
}
```

## Annotation Dynamic Processing
```java


@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface DynamicDataSource {
    /**
     * Dynamic data source
     * @return
     */
    String value() default "";
}

```

## AOP Configuration
```java

@Slf4j
@Aspect
@Configuration
public class DynamicDataSourceAspectConfiguration {
    @Autowired
    private EasyMultiEntityQuery easyMultiEntityQuery;
    @Around("execution(public * *(..)) && @annotation(com.test.mutlidatasource.aop.DynamicDataSource)")
    public Object interceptorTenantScope(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        Method method = signature.getMethod();
        DynamicDataSource dynamicDataSource = method.getAnnotation(DynamicDataSource.class); //Get annotation object through reflection
        try {
            //If dynamic setting is needed, can be implemented through Spring EL
            if(EasyStringUtil.isNotBlank(dynamicDataSource.value())){
                easyMultiEntityQuery.setCurrent(dynamicDataSource.value());
            }
            return pjp.proceed();
        }finally {
            easyMultiEntityQuery.clear();
        }
    }
}
```

## Usage
```java
//My request body
@Data
public class MyRequest {
    private String ds;
}


@RestController
@RequestMapping("/my")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class MyController {
    private final EasyMultiEntityQuery easyMultiEntityQuery;

    @RequestMapping("/test")
    @DynamicDataSource("ds2")
    public Object test(){
        return easyMultiEntityQuery.queryable(Topic.class).toList();
    }
    @RequestMapping("/test1")
    @DynamicDataSource
    public Object test1(){
        return easyMultiEntityQuery.queryable(Topic.class).toList();
    }
    // @RequestMapping("/test2")
    // @DynamicDataSource("#request.ds")//Requires Spring EL, implement yourself
    // public Object test2(@RequestBody MyRequest request){
    //     return easyMultiEntityQuery.queryable(Topic.class).toList();
    // }
    @RequestMapping("/test3")
    public Object test3(){
        List<Topic> ds2 = easyMultiEntityQuery.executeScope("ds2", eq -> {
            return eq.queryable(Topic.class).toList();
        });
        return ds2;
    }
    @RequestMapping("/test4")
    public Object test4(){
        try {
            easyMultiEntityQuery.setCurrent("ds2");
            return easyMultiEntityQuery.queryable(Topic.class).toList();
        }finally {
            easyMultiEntityQuery.clear();
        }
    }
}


```

## Using Default Configuration Multi-Data Source
```yml

easy-query:
  enable: true
  build: false #Don't use default build, then build eq instance yourself
......
```
Use yml default configuration but don't build the instance by default, build it yourself
```java

    @Bean
    @Primary
    public EasyQueryClient easyQueryClient(DataSource dataSource,EasyQueryProperties easyQueryProperties,EasyQueryInitializeOption easyQueryInitializeOption, StarterConfigurer starterConfigurer) {

        return SpringBootStarterBuilder.buildClient(dataSource, easyQueryProperties, easyQueryInitializeOption, starterConfigurer);
        // return SpringBootStarterBuilder.buildClient(dataSource, easyQueryProperties, easyQueryInitializeOption, s->{
        //     s.addService();
        // });
    }

    @Bean
    @Primary
    public EasyEntityQuery entityQuery(EasyQueryClient easyQueryClient) {
        return new DefaultEasyEntityQuery(easyQueryClient);
    }

    //Build the rest
```

