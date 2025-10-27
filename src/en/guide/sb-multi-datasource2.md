---
title: Spring Boot Multi-Data Source baomidou
order: 5
---

This chapter focuses on how to use [`DynamicRoutingDataSource`](https://github.com/baomidou/dynamic-datasource) provided by baomidou as multi-data source in Spring Boot

The demo related to this chapter's documentation is provided by user [GrayFaith](https://gitee.com/GrayFaith_admin/ManagementSystem-cloudBE)


## Injecting Multi-Data Source
According to relevant documentation, inject `DynamicRoutingDataSource` data source in Spring Boot

## Modifying eq Configuration File
Change `easy-query.build` in eq configuration file to `false`, indicating no default build

```yml
easy-query:
  build: false
```
With this setting, `eq` will not perform its default instance build

## Writing Multi-Data Source `eq Instance` Interface
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

@Slf4j
@Data
public class DefaultEasyMultiEntityQuery implements EasyMultiEntityQuery {
	private final Map<String, EasyEntityQuery> multi = new ConcurrentHashMap<>();
	private final ThreadLocal<String> currentDataSource = ThreadLocal.withInitial(() -> null);
	private final DynamicRoutingDataSource dynamicRoutingDataSource;

	private final String primary;
	private final EasyEntityQuery defaultEasyEntityQuery;

	public DefaultEasyMultiEntityQuery(DynamicRoutingDataSource dynamicRoutingDataSource,
									   String primary) {
		this.dynamicRoutingDataSource = dynamicRoutingDataSource;
		this.primary = primary;
		this.defaultEasyEntityQuery = buildDefaultEasyQuery(primary);
		refreshDataSource();
	}

	/**
	 * <br/>
	 * Clear EasyEntityQuery instance list
	 * <br/>
	 * Add and build new EasyEntityQuery instances
	 */
	private void refreshDataSource() {
		if (!multi.isEmpty()) {
			// If not empty, clear the eq instance map
			multi.clear();
		}
		// Traverse the data source Map and build EasyEntityQuery instances. dynamicRoutingDataSource is a Spring bean, but the datasources inside are not
		// So Spring transactions won't take effect
		dynamicRoutingDataSource.getDataSources().forEach((key, value) -> {
			if (!key.equals(this.primary)) {
				multi.put(key, buildEasyQuery(key, dynamicRoutingDataSource));
			}
		});
	}

	/**
	 * Build default EasyEntityQuery object
	 *
	 * @param primaryDataBase Default database name
	 * @return Default EasyEntityQuery object
	 */
	public EasyEntityQuery buildDefaultEasyQuery(String primaryDataBase) {
		EasyQueryBuilderConfiguration easyQueryBuilderConfiguration = EasyQueryBootstrapper.defaultBuilderConfiguration()
				// Directly register dynamic data source wrapper class
				.setDefaultDataSource(dynamicRoutingDataSource)
				// Required for Spring Boot to support transactions
				.replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)
				// Required for Spring Boot to support transactions
				.replaceService(ConnectionManager.class, SpringConnectionManager.class)
				.replaceService(NameConversion.class, new UnderlinedNameConversion())
				.optionConfigure(builder -> {
					builder.setPrintSql(true);
					builder.setDefaultTrack(true);
					builder.setDeleteThrowError(false);
				});
		// Determine database dialect
		// Database dialect needs to be added by yourself
		if (primaryDataBase.toLowerCase().startsWith("mysql_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new MySQLDatabaseConfiguration());
		} else if (primaryDataBase.toLowerCase().startsWith("oracle_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new OracleDatabaseConfiguration());
		} else if (primaryDataBase.toLowerCase().startsWith("db2_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new DB2DatabaseConfiguration());
		} else if (primaryDataBase.toLowerCase().startsWith("sql-server_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new MsSQLDatabaseConfiguration());
		} else if (primaryDataBase.toLowerCase().startsWith("pg-sql_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new PgSQLDatabaseConfiguration());
		} else if (primaryDataBase.toLowerCase().startsWith("h2_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new H2DatabaseConfiguration());
		} else if (primaryDataBase.toLowerCase().startsWith("sql-lite_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new SQLiteDatabaseConfiguration());
		} else if (primaryDataBase.toLowerCase().startsWith("click-house_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new ClickHouseDatabaseConfiguration());
		} else if (primaryDataBase.toLowerCase().startsWith("da-meng_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new DamengDatabaseConfiguration());
		} else if (primaryDataBase.toLowerCase().startsWith("gauss-db")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new GaussDBDatabaseConfiguration());
		} else if (primaryDataBase.toLowerCase().startsWith("king-base-es")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new KingbaseESDatabaseConfiguration());
		} else {
			// If outside of these, it may be an unsupported database type, set dialect to default
			easyQueryBuilderConfiguration.useDatabaseConfigure(new DefaultDatabaseConfiguration());
		}
		EasyQueryClient easyQueryClient = easyQueryBuilderConfiguration.build();
		QueryConfiguration queryConfiguration = easyQueryClient.getRuntimeContext().getQueryConfiguration();
//         queryConfiguration.applyEncryptionStrategy(new DefaultAesEasyEncryptionStrategy());
//         queryConfiguration.applyEncryptionStrategy(new Base64EncryptionStrategy());
//         queryConfiguration.applyEncryptionStrategy(new MyEncryptionStrategy());
//         queryConfiguration.applyEncryptionStrategy(new JavaEncryptionStrategy());
//         queryConfiguration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
//         queryConfiguration.applyInterceptor(new MyEntityInterceptor());
//         queryConfiguration.applyInterceptor(new Topic1Interceptor());
//         queryConfiguration.applyInterceptor(new MyTenantInterceptor());
//         queryConfiguration.applyShardingInitializer(new FixShardingInitializer());
//         queryConfiguration.applyShardingInitializer(new DataSourceAndTableShardingInitializer());
//         queryConfiguration.applyShardingInitializer(new TopicShardingShardingInitializer());
//         queryConfiguration.applyShardingInitializer(new TopicShardingTimeShardingInitializer());
//         queryConfiguration.applyShardingInitializer(new DataSourceShardingInitializer());
//         queryConfiguration.applyValueConverter(new EnumConverter());
//		   queryConfiguration.applyValueConverter(jsonConverter);
//         queryConfiguration.applyValueUpdateAtomicTrack(new IntegerNotValueUpdateAtomicTrack());
//         queryConfiguration.applyColumnValueSQLConverter(new MySQLAesEncryptColumnValueSQLConverter());
//		   queryConfiguration.applyPrimaryKeyGenerator(snowflakePrimaryKeyGenerator);
		return new DefaultEasyEntityQuery(easyQueryClient);
	}

	public EasyEntityQuery buildEasyQuery(String dataBaseType, DataSource dataSource) {
		EasyQueryBuilderConfiguration easyQueryBuilderConfiguration = EasyQueryBootstrapper.defaultBuilderConfiguration()
				// Directly register dynamic data source wrapper class
				.setDefaultDataSource(dataSource)
				// Required for Spring Boot to support transactions
				.replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)
				// Required for Spring Boot to support transactions
				.replaceService(ConnectionManager.class, SpringConnectionManager.class)
				.replaceService(NameConversion.class, new UnderlinedNameConversion())
				.optionConfigure(builder -> {
					builder.setPrintSql(true);
					builder.setDefaultTrack(true);
					builder.setDeleteThrowError(false);
				});
		// Determine database dialect
		// Database dialect needs to be added by yourself
		String dataBaseName = dataBaseType.toLowerCase();
		if (dataBaseName.startsWith("mysql_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new MySQLDatabaseConfiguration());
		} else if (dataBaseName.startsWith("oracle_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new OracleDatabaseConfiguration());
		} else if (dataBaseName.startsWith("db2_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new DB2DatabaseConfiguration());
		} else if (dataBaseName.startsWith("sql-server_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new MsSQLDatabaseConfiguration());
		} else if (dataBaseName.startsWith("pg-sql_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new PgSQLDatabaseConfiguration());
		} else if (dataBaseName.startsWith("h2_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new H2DatabaseConfiguration());
		} else if (dataBaseName.startsWith("sql-lite_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new SQLiteDatabaseConfiguration());
		} else if (dataBaseName.startsWith("click-house_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new ClickHouseDatabaseConfiguration());
		} else if (dataBaseName.startsWith("da-meng_")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new DamengDatabaseConfiguration());
		} else if (dataBaseName.startsWith("gauss-db")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new GaussDBDatabaseConfiguration());
		} else if (dataBaseName.startsWith("king-base-es")) {
			easyQueryBuilderConfiguration.useDatabaseConfigure(new KingbaseESDatabaseConfiguration());
		} else {
			// If outside of these, it may be an unsupported database type, set dialect to default
			easyQueryBuilderConfiguration.useDatabaseConfigure(new DefaultDatabaseConfiguration());
		}
		EasyQueryClient easyQueryClient = easyQueryBuilderConfiguration.build();
		QueryConfiguration queryConfiguration = easyQueryClient.getRuntimeContext().getQueryConfiguration();
//         queryConfiguration.applyEncryptionStrategy(new DefaultAesEasyEncryptionStrategy());
//         queryConfiguration.applyEncryptionStrategy(new Base64EncryptionStrategy());
//         queryConfiguration.applyEncryptionStrategy(new MyEncryptionStrategy());
//         queryConfiguration.applyEncryptionStrategy(new JavaEncryptionStrategy());
//         queryConfiguration.applyLogicDeleteStrategy(new MyLogicDelStrategy());
//         queryConfiguration.applyInterceptor(new MyEntityInterceptor());
//         queryConfiguration.applyInterceptor(new Topic1Interceptor());
//         queryConfiguration.applyInterceptor(new MyTenantInterceptor());
//         queryConfiguration.applyShardingInitializer(new FixShardingInitializer());
//         queryConfiguration.applyShardingInitializer(new DataSourceAndTableShardingInitializer());
//         queryConfiguration.applyShardingInitializer(new TopicShardingShardingInitializer());
//         queryConfiguration.applyShardingInitializer(new TopicShardingTimeShardingInitializer());
//         queryConfiguration.applyShardingInitializer(new DataSourceShardingInitializer());
//         queryConfiguration.applyValueConverter(new EnumConverter());
		// queryConfiguration.applyValueConverter(jsonConverter);
//         queryConfiguration.applyValueUpdateAtomicTrack(new IntegerNotValueUpdateAtomicTrack());
//         queryConfiguration.applyColumnValueSQLConverter(new MySQLAesEncryptColumnValueSQLConverter());
		// queryConfiguration.applyPrimaryKeyGenerator(snowflakePrimaryKeyGenerator);
		return new DefaultEasyEntityQuery(easyQueryClient);
	}

	/**
	 * Try to get EasyEntityQuery object for the currently used data source
	 *
	 * @return EasyEntityQuery instance
	 */
	private EasyEntityQuery tryGetEntityQuery() {
		String dataSourceName = DynamicDataSourceContextHolder.peek();
		if (StringUtils.isBlank(dataSourceName)) {
			// If no data source name is provided, directly return the default object
			return this.defaultEasyEntityQuery;
		}
		EasyEntityQuery easyEntityQuery = multi.get(dataSourceName);
		// If the EQ to be obtained does not exist
		if (multi.get(dataSourceName) == null) {
			// Try to get the data source and rebuild
			refreshDataSource();
			if (multi.get(dataSourceName) != null) {
				// Exists after refresh, then return the new object
				easyEntityQuery = multi.get(dataSourceName);
			} else {
				// If still doesn't exist, then use the default
				easyEntityQuery = this.defaultEasyEntityQuery;
			}
		}
		Objects.requireNonNull(easyEntityQuery, "entityQuery is null");
		return easyEntityQuery;
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
    
	@Value("${spring.datasource.dynamic.primary:mysql_master}")
	private String primary;

	@Bean
	public DefaultEasyMultiEntityQuery easyMultiEntityQuery(
			DataSource dataSource

	) {
		// Register data source
		DynamicRoutingDataSource dynamicRoutingDataSource = (DynamicRoutingDataSource) dataSource;
		return new DefaultEasyMultiEntityQuery(dynamicRoutingDataSource, primary);
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

