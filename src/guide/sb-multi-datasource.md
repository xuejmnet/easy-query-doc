---
title: springboot多数据源
order: 4
---

本章节针对springboot进行如何多数据源,动态多数据源进行封装处理。框架内部本身不想对该处理进行过多的封装尽可能保证需要多数据源的用户自行处理而不是提供默认的这边提供一个思路


# 多数据源实现
添加默认多数据源接口

[本章节源码](https://gitee.com/xuejm/easy-query/tree/main/samples/multi-datasource-demo)
```java


/**
 * create time 2024/3/13 15:21
 * 如果当前没有指定数据源则返回默认数据源
 *
 * @author xuejiaming
 */
public interface EasyMultiEntityQuery extends EasyEntityQuery {
    /**
     * 设置当前上下文线程使用哪个数据源
     * @param dataSource
     */
    void setCurrent(String dataSource);

    /**
     * 返回一个存在的数据源没有就报错
     * @param dataSource
     * @return
     */
    EasyEntityQuery getByDataSource(String dataSource);

    /**
     * 执行指定数据源的方法并且返回结果
     * @param dataSource
     * @param dataSourceFunction
     * @return
     * @param <TResult>
     */
    <TResult> TResult executeScope(String dataSource, Function<EasyEntityQuery,TResult> dataSourceFunction);

    /**
     * 清楚当前上下文数据源
     */
    void clear();
}



```

实现接口
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


## 创建配置
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
     * 需要用户自行实现对应的DataSource的PlatformTransactionManager
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
     * 实现对应datasource1的事务管理器
     */
    @Bean(name = "xxxTransactionManager")
    public PlatformTransactionManager xxxTxManager(@Qualifier("xxx") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
    @Bean("ds2")
    public EasyEntityQuery easyQuery(/*注入您自己的多数据源datasource*/@Qualifier("xxx")DataSource dataSource) {
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)//springboot下必须用来支持事务
                .replaceService(ConnectionManager.class, SpringConnectionManager.class)//springboot下必须用来支持事务
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

## 注解动态处理
```java


@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface DynamicDataSource {
    /**
     * 动态数据源
     * @return
     */
    String value() default "";
}

```

## aop配置
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
        DynamicDataSource dynamicDataSource = method.getAnnotation(DynamicDataSource.class); //通过反射拿到注解对象
        try {
            //如果需要动态设置可以通过springEL来实现
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

## 使用
```java
//我的请求体
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
    // @DynamicDataSource("#request.ds")//需要springEL自行实现
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

## 使用默认配置多数据源
```yml

easy-query:
  enable: true
  build: false #不使用默认的build,然后自行构建eq示实例
......
```
使用yml的默认配置但是不对其进行默认的实例构建自行构建
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

    //构建剩余的
```