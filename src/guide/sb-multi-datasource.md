---
title: springboot多数据源
order: 4
---

本章节针对springboot进行如何多数据源,动态多数据源进行封装处理。框架内部本身不想对该处理进行过多的封装尽可能保证需要多数据源的用户自行处理而不是提供默认的这边提供一个思路

## 排除默认数据源
因为`springboot`默认是单数据源，并且使用了自动数据源配置，所以我们首先把`springboot`的自动数据源排除掉


[本章节源码](https://github.com/xuejmnet/eq-multi-datasource)
```java
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})//排除数据源自动配置
public class MDSApplication {
    public static void main(String[] args) {
        SpringApplication.run(MDSApplication.class, args);
    }

}
```

## 多数据源实现
添加默认多数据源接口，主要用于用户的操作比如设置当前数据源
```java


/**
 * create time 2024/3/13 15:21
 * 如果当前没有指定数据源则返回默认数据源
 *
 * @author xuejiaming
 */
public interface EasyMultiEntityQuery extends EasyEntityQuery {
    /**
     * 获取当前数据源
     * @return
     */
    String getCurrentDataSource();
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

## 新建一个配置类
新建一个配置类来接受yml的数据源配置
```java
@Data
@ConfigurationProperties(prefix = "spring.datasource")
@Component
public class DynamicDataSourceProperties {
    private Map<String, DataSourceProperties> dynamic = new LinkedHashMap<>();
}

```
## 动态bean注册工程
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
            logger.warn("BeanName:[ {} ] 已存在,不再注册,已忽略", beanName);
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


## 创建配置
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
            DataSource source = DataSourceBuilder.create().driverClassName(kp.getDriverClassName())
                    .url(kp.getUrl())
                    .username(kp.getUsername())
                    .password(kp.getPassword()).build();
            DynamicBeanFactory.registerBean(key + "DataSource", source);
            EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                    .setDefaultDataSource(source)
                    .replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)//springboot下必须用来支持事务
                    .replaceService(ConnectionManager.class, SpringConnectionManager.class)//springboot下必须用来支持事务
                    .replaceService(NameConversion.class, new UnderlinedNameConversion())
                    .optionConfigure(builder -> {
                        //这边可以搞一写配置如果你需要的话
//                        builder.setPrintSql(true);
                    })
                    .useDatabaseConfigure(new MySQLDatabaseConfiguration())
//                    .useDatabaseConfigure(new PgSQLDatabaseConfiguration())//自行配置处理
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
## 配置文件
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

## 测试api
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
请求数据源`ds1`也就是`primary`的datasource配置
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
请求数据源`ds2`
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

## 注解动态处理
我们发现手动处理datasource比较麻烦可以通过自定义注解加aop来实现

```java

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
public @interface DS {
    /**
     * 动态数据源
     *
     */
    String value() default "";
}


```

## aop配置
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
        DS dynamicDataSource = method.getAnnotation(DS.class); //通过反射拿到注解对象
        try {
            //如果需要动态设置可以通过springEL来实现
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

## 使用
新增请求方法dsc，删除所有的数据源
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

通过上述报错我们可以看到数据源通过aop已经实现了切换
