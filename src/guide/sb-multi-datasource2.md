---
title: springboot多数据源baomidou
order: 5
---

本章节针对springboot进行如何多数据源使用baomidou提供的 [`DynamicRoutingDataSource`](https://github.com/baomidou/dynamic-datasource) 作为多数据源

本章节文档相关demo由用户[GrayFaith](https://gitee.com/GrayFaith_admin/ManagementSystem-cloudBE) 提供


## 注入多数据源
根据文档相关在·springboot·下注入`DynamicRoutingDataSource`数据源

## eq的配置文件修改
将eq的配置文件中的配置`easy-query.build`改为`false`表示默认不进行build

```yml
easy-query:
  build: false
```
这么设置那么`eq`将不会对其进行默认的实例build

## 编写多数据源`eq 实例`接口
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

@Slf4j
@Data
public class DefaultEasyMultiEntityQuery implements EasyMultiEntityQuery {
	private final Map<String, EasyEntityQuery> multi = new ConcurrentHashMap<>();
	private final ThreadLocal<String> currentDataSource = ThreadLocal.withInitial(() -> null);
	private final DynamicRoutingDataSource dynamicRoutingDataSource;

	private final String primary;
	private final JsonConverter jsonConverter;
	private final SnowflakePrimaryKeyGenerator snowflakePrimaryKeyGenerator;
	private final EasyEntityQuery defaultEasyEntityQuery;

	public DefaultEasyMultiEntityQuery(DynamicRoutingDataSource dynamicRoutingDataSource,
									   String primary,
									   JsonConverter jsonConverter,
									   SnowflakePrimaryKeyGenerator snowflakePrimaryKeyGenerator) {
		this.dynamicRoutingDataSource = dynamicRoutingDataSource;
		this.primary = primary;
		this.jsonConverter = jsonConverter;
		this.snowflakePrimaryKeyGenerator = snowflakePrimaryKeyGenerator;
		this.defaultEasyEntityQuery = buildDefaultEasyQuery(primary);
		refreshDataSource();
	}

	/**
	 * <br/>
	 * 清空EasyEntityQuery实例列表
	 * <br/>
	 * 添加并构建新的EasyEntityQuery实例
	 */
	private void refreshDataSource() {
		if (!multi.isEmpty()) {
			// 如果不为空,那么清空掉eq实例map
			multi.clear();
		}
		// 遍历数据源Map并构建EasyEntityQuery实例,dynamicRoutingDataSource这个是spring的bean但是里面的datasource并不是
		//所以用spring的事务是不会生效的
		dynamicRoutingDataSource.getDataSources().forEach((key, value) -> {
			if (!key.equals(this.primary)) {
				multi.put(key, buildEasyQuery(key, dynamicRoutingDataSource));
			}
		});
	}

	/**
	 * 构建默认的EasyEntityQuery对象
	 *
	 * @param primaryDataBase 默认数据库名
	 * @return 默认的EasyEntityQuery对象
	 */
	public EasyEntityQuery buildDefaultEasyQuery(String primaryDataBase) {
		EasyQueryBuilderConfiguration easyQueryBuilderConfiguration = EasyQueryBootstrapper.defaultBuilderConfiguration()
				// 直接注册动态数据源包装类
				.setDefaultDataSource(dynamicRoutingDataSource)
				//springboot下必须用来支持事务
				.replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)
				//springboot下必须用来支持事务
				.replaceService(ConnectionManager.class, SpringConnectionManager.class)
				.replaceService(NameConversion.class, new UnderlinedNameConversion())
				.optionConfigure(builder -> {
					builder.setPrintSql(true);
					builder.setDefaultTrack(true);
					builder.setKeepNativeStyle(true);
					builder.setDeleteThrowError(false);
				});
		// 判断数据库方言
		// 数据库方言需要自行添加
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
			// 如果在这之外,说明可能是未支持的数据库种类,方言就设置为默认
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
				// 直接注册动态数据源包装类
				.setDefaultDataSource(dataSource)
				// springboot下必须用来支持事务
				.replaceService(DataSourceUnitFactory.class, SpringDataSourceUnitFactory.class)
				// springboot下必须用来支持事务
				.replaceService(ConnectionManager.class, SpringConnectionManager.class)
				.replaceService(NameConversion.class, new UnderlinedNameConversion())
				.optionConfigure(builder -> {
					builder.setPrintSql(true);
					builder.setDefaultTrack(true);
					builder.setKeepNativeStyle(true);
					builder.setDeleteThrowError(false);
				});
		// 判断数据库方言
		// 数据库方言需要自行添加
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
			// 如果在这之外,说明可能是未支持的数据库种类,方言就设置为默认
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
		queryConfiguration.applyValueConverter(jsonConverter);
//         queryConfiguration.applyValueUpdateAtomicTrack(new IntegerNotValueUpdateAtomicTrack());
//         queryConfiguration.applyColumnValueSQLConverter(new MySQLAesEncryptColumnValueSQLConverter());
		queryConfiguration.applyPrimaryKeyGenerator(snowflakePrimaryKeyGenerator);
		return new DefaultEasyEntityQuery(easyQueryClient);
	}

	/**
	 * 尝试获取当前使用数据源的EasyEntityQuery对象
	 *
	 * @return EasyEntityQuery实例
	 */
	private EasyEntityQuery tryGetEntityQuery() {
		String dataSourceName = DynamicDataSourceContextHolder.peek();
		if (StringUtils.isBlank(dataSourceName)) {
			// 如果没有提供数据源名称,直接返回默认对象
			return this.defaultEasyEntityQuery;
		}
		EasyEntityQuery easyEntityQuery = multi.get(dataSourceName);
		// 如果需要获取的EQ不存在
		if (multi.get(dataSourceName) == null) {
			// 尝试获取数据源并重新构建
			refreshDataSource();
			if (multi.get(dataSourceName) != null) {
				// 刷新后存在,那么将新对象返回
				easyEntityQuery = multi.get(dataSourceName);
			} else {
				// 如果还是没有,那么则使用默认的
				easyEntityQuery = this.defaultEasyEntityQuery;
			}
		}
		Objects.requireNonNull(easyEntityQuery, "entityQuery为空");
		return easyEntityQuery;
	}

	@Override
	public void setCurrent(String dataSource) {
		currentDataSource.set(dataSource);
	}

	@Override
	public EasyEntityQuery getByDataSource(String dataSource) {
		EasyEntityQuery entityQuery = multi.get(dataSource);
		Objects.requireNonNull(entityQuery, "entityQuery为空");
		return entityQuery;
	}

	@Override
	public <TResult> TResult executeScope(String dataSource, Function<EasyEntityQuery, TResult> dataSourceFunction) {
		EasyEntityQuery entityQuery = multi.get(dataSource);
		Objects.requireNonNull(entityQuery, "entityQuery为空");
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


## 创建配置
```java

@Configuration
public class MultiDataSourceConfiguration {
    
	@Value("${spring.datasource.dynamic.primary:mysql_master}")
	private String primary;

	@Bean
	public DefaultEasyMultiEntityQuery easyMultiEntityQuery(
			DataSource dataSource

	) {
		// 注册数据源
		DynamicRoutingDataSource dynamicRoutingDataSource = (DynamicRoutingDataSource) dataSource;
		return new DefaultEasyMultiEntityQuery(dynamicRoutingDataSource, primary);
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