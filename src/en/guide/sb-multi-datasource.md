---
title: Spring Boot Multi-Data Source
order: 4
---

This chapter focuses on how to encapsulate and handle multi-data sources and dynamic multi-data sources in Spring Boot. The framework itself doesn't want to over-encapsulate this processing, trying to ensure that users who need multi-data sources handle it themselves rather than providing a default. Here's an approach

The case code related to the current document is provided by group member [LYX9527](https://github.com/LYX9527)

## Exclude Default Data Source
Since `springboot` defaults to a single data source and uses automatic data source configuration, we first exclude `springboot`'s automatic data source


[Source code for this chapter](https://github.com/xuejmnet/eq-multi-datasource)
```java
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})//Exclude data source auto configuration
@EnableTransactionManagement//Enable transactions
public class MDSApplication {
    public static void main(String[] args) {
        SpringApplication.run(MDSApplication.class, args);
    }

}
```

## Multi-Data Source Implementation
Add default multi-data source interface, mainly for user operations such as setting the current data source
```java


/**
 * create time 2024/3/13 15:21
 * If no data source is specified, return the default data source
 *
 * @author xuejiaming
 */
public interface EasyMultiEntityQuery extends EasyEntityQuery {
    /**
     * Get current data source
     * @return
     */
    String getCurrentDataSource();
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
    private final String primaryDataSource;
    private final EasyEntityQuery easyEntityQuery;

    public DefaultEasyMultiEntityQuery(String primaryDataSource,EasyEntityQuery easyEntityQuery, Map<String, EasyEntityQuery> extraEasyEntityQueryMap) {
        this.primaryDataSource = primaryDataSource;
        this.easyEntityQuery = easyEntityQuery;
        multi.putAll(extraEasyEntityQueryMap);
    }

    @Override
    public String getCurrentDataSource() {
        String ds = currentDataSource.get();
        if(ds==null){
            return primaryDataSource;
        }
        return ds;
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

    private EasyEntityQuery tryGetEntityQuery() {
        String ds = currentDataSource.get();
        if (ds == null) {
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
    public <TProxy extends ProxyEntity<TProxy, T>, T> EntityQueryable<TProxy, T> queryable(TProxy tProxy) {
        return tryGetEntityQuery().queryable(tProxy);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityQueryable<TProxy, T> queryable(String sql, Class<T> entityClass) {
        return tryGetEntityQuery().queryable(entityClass);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityQueryable<TProxy, T> queryable(String sql, Class<T> entityClass, Collection<Object> params) {
        return tryGetEntityQuery().queryable(sql, entityClass, params);
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
    public <TProxy extends ProxyEntity<TProxy, T>, T> EntityInsertable<TProxy, T> insertable(TProxy tProxy) {
        return tryGetEntityQuery().insertable(tProxy);
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
    public <TProxy extends ProxyEntity<TProxy, T>, T> ExpressionUpdatable<TProxy, T> expressionUpdatable(TProxy tProxy) {
        return tryGetEntityQuery().expressionUpdatable(tProxy);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntityUpdatable<TProxy, T> updatable(T entity) {
        return tryGetEntityQuery().updatable(entity);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T> EntityUpdatable<TProxy, T> entityUpdatable(TProxy tProxy) {
        return tryGetEntityQuery().entityUpdatable(tProxy);
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
    public <TProxy extends ProxyEntity<TProxy, T>, T> ExpressionDeletable<TProxy, T> expressionDeletable(TProxy tProxy) {
        return tryGetEntityQuery().expressionDeletable(tProxy);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T> EntityDeletable<TProxy, T> entityDeletable(TProxy tProxy) {
        return tryGetEntityQuery().entityDeletable(tProxy);
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
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntitySavable<TProxy, T> savable(T entity) {
        return tryGetEntityQuery().savable(entity);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T> EntitySavable<TProxy, T> savable(TProxy tProxy) {
        return tryGetEntityQuery().savable(tProxy);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T extends ProxyEntityAvailable<T, TProxy>> EntitySavable<TProxy, T> savable(Collection<T> entities) {
        return tryGetEntityQuery().savable(entities);
    }

    @Override
    public <TProxy extends ProxyEntity<TProxy, T>, T> DbSet<TProxy, T> createDbSet(TProxy tProxy) {
        return tryGetEntityQuery().createDbSet(tProxy);
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

## Create a Configuration Class
Create a configuration class to receive data source configuration from yml
```java
@Data
@ConfigurationProperties(prefix = "spring.datasource")
@Component
public class DynamicDataSourceProperties {
    private Map<String, DataSourceProperties> dynamic = new LinkedHashMap<>();
}

```
## Dynamic Bean Registration Factory
```java

@Component
public class DynamicBeanFactory implements BeanFactoryPostProcessor, ApplicationContextAware {
    private static final Logger logger = LoggerFactory.getLogger(DynamicBeanFactory.class);
    private static ConfigurableListableBeanFactory beanFactory;
    private static ApplicationContext applicationContext;

    public static void registerBean(Object bean) {
        String beanName = bean.getClass().getSimpleName();
        registerBean(beanName, bean);
    }

    private static boolean isBeanExists(String beanName) {
        return getConfigurableBeanFactory().containsBean(beanName);
    }

    public static void registerBean(String beanName, Object bean) {
        if (isBeanExists(beanName)) {
            logger.warn("BeanName:[ {} ] already exists, will not register, ignored", beanName);
            return;
        }
        ConfigurableListableBeanFactory factory = getConfigurableBeanFactory();
        factory.autowireBean(bean);
        factory.registerSingleton(beanName, bean);
    }

    public static ConfigurableListableBeanFactory getConfigurableBeanFactory() {
        ConfigurableListableBeanFactory factory;
        if (null != beanFactory) {
            factory = beanFactory;
        } else {
            if (!(applicationContext instanceof ConfigurableApplicationContext)) {
                throw new RuntimeException("applicationContext is not ConfigurableApplicationContext");
            }

            factory = ((ConfigurableApplicationContext) applicationContext).getBeanFactory();
        }

        return factory;
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        DynamicBeanFactory.beanFactory = beanFactory;
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        DynamicBeanFactory.applicationContext = applicationContext;
    }
}

```


## Create Configuration
```java

@Configuration
public class MultiDataSourceConfiguration {

    private final DynamicDataSourceProperties props;

    public MultiDataSourceConfiguration(DynamicDataSourceProperties props) {
        String logImplClass = "com.easy.query.sql.starter.logging.Slf4jImpl";
        try {
            Class<?> aClass = Class.forName(logImplClass);
            if (Log.class.isAssignableFrom(aClass)) {
                Class<? extends Log> logClass = EasyObjectUtil.typeCastNullable(aClass);
                LogFactory.useCustomLogging(logClass);
            } else {
                LogFactory.useStdOutLogging();
                System.out.println("cant found log:[" + logImplClass + "]!!!!!!");
            }
        } catch (ClassNotFoundException e) {
            System.err.println("cant found log:[" + logImplClass + "]!!!!!!");
            e.printStackTrace();
        }
        this.props = props;
        props.getDynamic().keySet().forEach(key -> {
            DataSourceProperties kp = props.getDynamic().get(key);
            DataSource source = DataSourceBuilder.create()
                    .type(kp.getType())
                    .driverClassName(kp.getDriverClassName())
                    .url(kp.getUrl())
                    .username(kp.getUsername())
                    .password(kp.getPassword()).build();
            DynamicBeanFactory.registerBean(key + "DataSource", source);
            EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                    .setDefaultDataSource(source)
                    .replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)//Required in springboot to support transactions
                    .replaceService(ConnectionManager.class, SpringConnectionManager.class)//Required in springboot to support transactions
                    .replaceService(NameConversion.class, new UnderlinedNameConversion())
                    .optionConfigure(builder -> {
                        //You can add some configurations here if you need
//                        builder.setPrintSql(true);
                    })
                    .useDatabaseConfigure(new MySQLDatabaseConfiguration())
//                    .useDatabaseConfigure(new PgSQLDatabaseConfiguration())//Configure as needed
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
            DefaultEasyEntityQuery defaultEasyEntityQuery = new DefaultEasyEntityQuery(easyQueryClient);
            DynamicBeanFactory.registerBean(key, defaultEasyEntityQuery);
            DataSourceTransactionManager dataSourceTransactionManager = new DataSourceTransactionManager(source);
            DynamicBeanFactory.registerBean(key + "TransactionManager", dataSourceTransactionManager);
        });


    }

    @Bean
    public EasyMultiEntityQuery easyMultiEntityQuery() {
        HashMap<String, EasyEntityQuery> extra = new HashMap<>();
        EasyEntityQuery easyEntityQuery = SpringUtils.getBean("primary");
        props.getDynamic().keySet().forEach(key -> {
            EasyEntityQuery eq = SpringUtils.getBean(key);
            extra.put(key, eq);
        });
        return new DefaultEasyMultiEntityQuery("primary", easyEntityQuery, extra);
    }
}
```
## Configuration File
```yml
spring:
  datasource:
    dynamic:
      primary:
        type: com.zaxxer.hikari.HikariDataSource
        url: jdbc:mysql://127.0.0.1:3316/eq-multi-ds1?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
        username: root
        password: root
        driver-class-name: com.mysql.cj.jdbc.Driver
      ds2:
        type: com.zaxxer.hikari.HikariDataSource
        url: jdbc:mysql://127.0.0.1:3316/eq-multi-ds2?serverTimezone=GMT%2B8&characterEncoding=utf-8&useSSL=false&allowMultiQueries=true&rewriteBatchedStatements=true
        username: root
        password: root
        driver-class-name: com.mysql.cj.jdbc.Driver

easy-query:
  build: false
```

## Test API
```java

@Slf4j
@RestController
@RequiredArgsConstructor(onConstructor_ = @Autowired)
@RequestMapping("/api/test")
public class TestController {
    private final EasyMultiEntityQuery easyMultiEntityQuery;

    @GetMapping("/ds1")
    public Object ds1() {
        DatabaseCodeFirst databaseCodeFirst = easyMultiEntityQuery.getDatabaseCodeFirst();
        databaseCodeFirst.createDatabaseIfNotExists();
        CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommand(Arrays.asList(SysUser.class));
        codeFirstCommand.executeWithTransaction(s->s.commit());
        return "ds1-ok";
    }
    @GetMapping("/ds2")
    public Object ds2() {
        try {
            easyMultiEntityQuery.setCurrent("ds2");
            DatabaseCodeFirst databaseCodeFirst = easyMultiEntityQuery.getDatabaseCodeFirst();
           databaseCodeFirst.createDatabaseIfNotExists();
            CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommand(Arrays.asList(SysUser.class));
            codeFirstCommand.executeWithTransaction(s->s.commit());
            return "ds2-ok";
        }finally {
            easyMultiEntityQuery.clear();
        }
    }
}


```
Request data source `ds1` which is `primary` datasource configuration
```shell
curl http://localhost:8081/api/test/ds1
```
```log

2025-11-17T16:31:40.187+08:00  INFO 79832 --- [nio-8081-exec-1] c.easy.query.core.util.EasyDatabaseUtil  : check db sql:select 1 from information_schema.schemata where schema_name='eq-multi-ds1'
2025-11-17T16:31:40.205+08:00  INFO 79832 --- [nio-8081-exec-1] c.easy.query.core.util.EasyDatabaseUtil  : create db sql:CREATE DATABASE IF NOT EXISTS `eq-multi-ds1` default charset utf8mb4 COLLATE utf8mb4_general_ci;
2025-11-17T16:31:40.286+08:00  INFO 79832 --- [nio-8081-exec-1] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2025-11-17T16:31:40.308+08:00  INFO 79832 --- [nio-8081-exec-1] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2025-11-17T16:31:40.359+08:00  INFO 79832 --- [nio-8081-exec-1] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Preparing: 
CREATE TABLE IF NOT EXISTS `t_user` ( 
`id` VARCHAR(255) NOT NULL ,
`name` VARCHAR(255) NULL , 
 PRIMARY KEY (`id`)
) Engine=InnoDB;
2025-11-17T16:31:40.435+08:00  INFO 79832 --- [nio-8081-exec-1] c.e.q.core.util.EasyJdbcExecutorUtil     : <== Total: 0
```
Request data source `ds2`
```shell
curl http://localhost:8081/api/test/ds2
```
```log

2025-11-17T16:32:33.626+08:00  INFO 79832 --- [nio-8081-exec-4] c.easy.query.core.util.EasyDatabaseUtil  : check db sql:select 1 from information_schema.schemata where schema_name='eq-multi-ds2'
2025-11-17T16:32:33.639+08:00  INFO 79832 --- [nio-8081-exec-4] c.easy.query.core.util.EasyDatabaseUtil  : create db sql:CREATE DATABASE IF NOT EXISTS `eq-multi-ds2` default charset utf8mb4 COLLATE utf8mb4_general_ci;
2025-11-17T16:32:33.660+08:00  INFO 79832 --- [nio-8081-exec-4] com.zaxxer.hikari.HikariDataSource       : HikariPool-2 - Starting...
2025-11-17T16:32:33.675+08:00  INFO 79832 --- [nio-8081-exec-4] com.zaxxer.hikari.HikariDataSource       : HikariPool-2 - Start completed.
2025-11-17T16:32:33.706+08:00  INFO 79832 --- [nio-8081-exec-4] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Preparing: 
CREATE TABLE IF NOT EXISTS `t_user` ( 
`id` VARCHAR(255) NOT NULL ,
`name` VARCHAR(255) NULL , 
 PRIMARY KEY (`id`)
) Engine=InnoDB;
2025-11-17T16:32:33.997+08:00  INFO 79832 --- [nio-8081-exec-4] c.e.q.core.util.EasyJdbcExecutorUtil     : <== Total: 0

```

## Annotation Dynamic Processing
We find that manually processing datasource is cumbersome, we can implement it through custom annotations and AOP

```java

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface DS {
    /**
     * Dynamic data source
     *
     */
    String value() default "";
}


```

## AOP Configuration
```java

@Aspect
@Component
public class DynamicDataSourceAspect {
    @Autowired
    private EasyMultiEntityQuery easyMultiEntityQuery;

    @Around("execution(public * *(..)) && @annotation(com.eq.mds.annotation.DS)")
    public Object interceptorTenantScope(ProceedingJoinPoint pjp) throws Throwable {



        MethodSignature signature = (MethodSignature) pjp.getSignature();
        Method method = signature.getMethod();
        DS dynamicDataSource = method.getAnnotation(DS.class); //Get annotation object through reflection
        try {
            //If you need dynamic setting, you can implement it through springEL
            if (EasyStringUtil.isNotBlank(dynamicDataSource.value())) {
                easyMultiEntityQuery.setCurrent(dynamicDataSource.value());
            }
            return pjp.proceed();
        } finally {
            easyMultiEntityQuery.clear();
        }
    }
}

```

## Usage
Add request method dsc, delete all data sources
```java

    @GetMapping("/dsc")
    @DS("ds2")
    public Object dsc() {
        List<SysUser> list = easyMultiEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.name().like("123");
                }).toList();
        return list;
    }


```
```shell
http://localhost:8081/api/test/dsc
```
```log
java.sql.SQLSyntaxErrorException: Unknown database 'eq-multi-ds2'
	at com.mysql.cj.jdbc.exceptions.SQLError.createSQLException(SQLError.java:112) ~[mysql-connector-j-9.2.0.jar:9.2.0]
	at com.mysql.cj.jdbc.exceptions.SQLExceptionsMapping.translateException(SQLExceptionsMapping.java:114) ~[mysql-connector-j-9.2.0.jar:9.2.0]
	at com.mysql.cj.jdbc.ConnectionImpl.createNewIO(ConnectionImpl.java:837) ~[mysql-connector-j-9.2.0.jar:9.2.0]
	at com.mysql.cj.jdbc.ConnectionImpl.<init>(ConnectionImpl.java:420) ~[mysql-connector-j-9.2.0.jar:9.2.0]
	at com.mysql.cj.jdbc.ConnectionImpl.getInstance(ConnectionImpl.java:238) ~[mysql-connector-j-9.2.0.jar:9.2.0]
	at com.mysql.cj.jdbc.NonRegisteringDriver.connect(NonRegisteringDriver.java:180) ~[mysql-connector-j-9.2.0.jar:9.2.0]
	at com.zaxxer.hikari.util.DriverDataSource.getConnection(DriverDataSource.java:138) ~[HikariCP-3.3.1.jar:na]
	at com.zaxxer.hikari.pool.PoolBase.newConnection(PoolBase.java:353) ~[HikariCP-3.3.1.jar:na]
```

From the above error, we can see that the data source has been switched through AOP
