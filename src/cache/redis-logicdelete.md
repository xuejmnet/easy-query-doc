---
title: redis缓存逻辑删除
order: 30
---

# redis缓存逻辑删除
该方案是另一种选择,如果您的数据库无法开启或者不支持cdc工具那么可以采用该方案

## 技术要求
- 1.需要有redis也可以换成别的缓存
- 2.表设计需要支持逻辑删除

## 依赖引入
需要额外引入一个独立的缓存以来包
```xml
    <dependency>
        <groupId>com.easy-query</groupId>
        <artifactId>sql-cache</artifactId>
        <version>${easy-query.version}</version>
    </dependency>
    <dependency>
        <groupId>org.redisson</groupId>
        <artifactId>redisson</artifactId>
        <version>${redisson.version}</version>
    </dependency>
```

## 表对象设计
```java
@Data
public class BaseEntity {
    @Column(primaryKey = true)
    private String id;
    @UpdateIgnore
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @LogicDelete(strategy = LogicDeleteStrategyEnum.LOCAL_DATE_TIME)
    @UpdateIgnore
    private LocalDateTime deleteTime;
}


@Data
@Table("sys_user")
@EntityProxy
@CacheEntitySchema
public class SysUser extends BaseEntity implements CacheKvEntity,ProxyEntityAvailable<SysUser , SysUserProxy> {
    private String name;
    private Integer age;
}


```

## CacheManager
实现`CacheManager`接口,默认已经有一个抽象类`CacheManager`实现只需要实现额外方法即可
```java

public class MyCacheManager extends AbstractCacheManager {

    private final RedissonClient redissonClient;

    public MyCacheManager(RedissonClient redissonClient, EasyCacheOption easyCacheOption) {
        super(easyCacheOption);
        this.redissonClient = redissonClient;
    }

    @Nullable
    @Override
    public CacheItem getCacheItem(String cacheKey, String conditionKey, Class<?> entityClass) {
        String entityCacheKey = getCacheKey(entityClass, cacheKey);
        return getCacheItem(entityCacheKey, conditionKey);
    }
    private CacheItem getCacheItem(String key, String conditionKey) {
        return getRedissonCacheItem(key, conditionKey);
    }

    private CacheItem getRedissonCacheItem(String key, String conditionKey) {
        RMap<String, String> map = redissonClient.getMap(key);
        String cacheItemJson = map.get(conditionKey);
        if (cacheItemJson != null) {
            return fromJson(cacheItemJson, CacheItem.class);
        }
        return null;
    }


    @Override
    public void setCacheItem(String cacheKey, String conditionKey, CacheItem cacheItem, Class<?> entityClass, long expireMillisSeconds) {
        String entityCacheKey = getCacheKey(entityClass, cacheKey);
        RMap<String, String> entityJsonMap = redissonClient.getMap(entityCacheKey);
        boolean mapExists = entityJsonMap.isExists();
        entityJsonMap.put(conditionKey, toJson(cacheItem));
        if (!mapExists) {
            entityJsonMap.expire(Duration.ofMillis(expireMillisSeconds));
        }
    }

    @Override
    public <T> String toJson(T object) {
        return JsonUtil.object2JsonStr(object);
    }

    @Override
    public <T> T fromJson(String json, Class<T> clazz) {
        return JsonUtil.jsonStr2Object(json,clazz);
    }

    @Override
    protected void deleteBy0(CacheKey cacheKey) {
        String deleteCacheKey = getCacheKey(cacheKey.getEntityClass(), cacheKey.getKey());
        redissonClient.getMap(deleteCacheKey).delete();
    }
}

```

## CacheKeysProvider
因为新增修改删除存在无法获取到受影响对象的缓存key所以当触发比如`update table set xxx where xxx`的表达式更新无实体对象时需要认为手动获取受影响对象的缓存key
```java

public class MyCacheKeysProvider extends AbstractCacheKeysProvider {
    private final EasyQueryClient easyQueryClient;

    public MyCacheKeysProvider(EasyQueryClient easyQueryClient) {
        super(easyQueryClient);
        this.easyQueryClient = easyQueryClient;
    }

    @Override
    protected List<String> getCacheKeysByExpression(LocalDateTime triggerTime, LocalDateTime receivedTime, EntityMetadata entityMetadata, CacheMethodEnum clearMethod, CacheEntitySchema cacheEntitySchema) {
        LocalDateTime endTime = receivedTime.plusSeconds(1);
        if (CacheMethodEnum.UPDATE == clearMethod) {
            return easyQueryClient.queryable(entityMetadata.getEntityClass())
                    .where(o -> o.ge("updateTime", triggerTime).le("updateTime", endTime))
                    .select(String.class, o -> {
                        o.column(cacheEntitySchema.value());
                    })
                    .toList();
        }
        if (CacheMethodEnum.DELETE == clearMethod) {

            return easyQueryClient.queryable(entityMetadata.getEntityClass())
                    .disableLogicDelete()
                    .where(o -> o.ge("deleteTime", triggerTime).le("deleteTime", endTime))
                    .select(String.class, t -> {
                        t.column(cacheEntitySchema.value());
                    })
                    .toList();
        }
        if (CacheMethodEnum.INSERT == clearMethod) {

            return easyQueryClient.queryable(entityMetadata.getEntityClass())
                    .where(o -> o.ge("createTime", triggerTime).le("createTime", endTime))
                    .select(String.class, t -> {
                        t.column(cacheEntitySchema.value());
                    })
                    .toList();
        }

        throw new EasyQueryInvalidOperationException("cant get expression cache keys");
    }
}
```

## 新建一个缓存清除
```java

public class MyCacheCleaner {
    private static final ExecutorService _commonExecutor;

    static {
        _commonExecutor = Executors.newCachedThreadPool();
    }

    private final TriggerEvent triggerEvent;
    private final CacheKeysProvider cacheKeysProvider;
    private final EasyCacheClient easyCacheClient;

    public MyCacheCleaner(TriggerEvent triggerEvent, CacheKeysProvider cacheKeysProvider, EasyCacheClient easyCacheClient) {
        this.triggerEvent = triggerEvent;
        this.cacheKeysProvider = cacheKeysProvider;
        this.easyCacheClient = easyCacheClient;
    }

    public void clean() {
        QueryRuntimeContext runtimeContext = triggerEvent.getRuntimeContext();
        ConnectionManager connectionManager = runtimeContext.getConnectionManager();
        boolean inTransaction = connectionManager.currentThreadInTransaction();
        if (inTransaction) {
            Transaction transaction = connectionManager.getTransactionOrNull();
            if (transaction == null) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        clearTrigger();
                    }
                });
            } else {
                transaction.registerListener(new TransactionListener() {
                    @Override
                    public void afterCommit() {
                        clearTrigger();
                    }
                });
            }
        } else {
            clearTrigger();
        }
    }

    private void clearTrigger() {
        _commonExecutor.submit(() -> {
            List<CacheKey> cacheKeys = cacheKeysProvider.getCacheKeys(triggerEvent);
            for (CacheKey cacheKey : cacheKeys) {
                easyCacheClient.deleteBy(cacheKey);
            }
        });
    }
}

```

**注意：**`cacheKeysProvider.getCacheKeys`为查询数据库的耗时操作所以需要再异步线程中执行,当然也可以使用mq将trigger进行publish后有另外线程处理

## 构建EasyCacheClient

```java

@Configuration
public class MyConfiguration {
    @Bean
    public EasyCacheClient easyCacheClient(EasyQueryClient easyQueryClient, RedissonClient redissonClient, CacheKeysProvider cacheKeysProvider) {
        EasyCacheClient easyCacheClient = EasyCacheBootstrapper.defaultBuilderConfiguration()
                .optionConfigure(op -> {
                    op.setKeyPrefix("CACHE");
                    op.setCacheIndex("INDEX");
                    op.setExpireMillisSeconds(1000 * 60 * 60);//缓存1小时
                    op.setValueNullExpireMillisSeconds(1000 * 10);//null值缓存10秒
                })
                .replaceService(EasyQueryClient.class, easyQueryClient)
                .replaceService(RedissonClient.class, redissonClient)
                .replaceService(EasyCacheManager.class, MyCacheManager.class).build();

        easyQueryClient.addTriggerListener(triggerEvent -> {
            boolean cacheEntity = EasyCacheUtil.isCacheEntity(triggerEvent.getEntityClass());
            if (cacheEntity) {
                new MyCacheCleaner(triggerEvent, cacheKeysProvider, easyCacheClient).clean();
            }
        });
        return easyCacheClient;
    }

    @Bean
    public CacheKeysProvider cacheKeysProvider(EasyQueryClient easyQueryClient) {
        return new MyCacheKeysProvider(easyQueryClient);
    }

    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer()
                .setConnectionMinimumIdleSize(10)
                .setDatabase(2)
                .setAddress("redis://127.0.0.1:55001");
        config.useSingleServer().setPassword("redispw");
        StringCodec codec = new StringCodec();
        config.setCodec(codec);
        return Redisson.create(config);
    }
}

```
## 测试
### 1.创建对象
```java

    @GetMapping("/insert")
    public Object insert() {

        SysUser sysUser = new SysUser();
        sysUser.setName("UserName");
        sysUser.setAge(1);
        easyEntityQuery.insertable(sysUser).executeRows();
        return sysUser;
    }


2025-07-07 15:09:20.906  INFO 43102 --- [nio-8080-exec-4] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Preparing: INSERT INTO `sys_user` (`id`,`create_time`,`update_time`,`name`,`age`) VALUES (?,?,?,?,?)
2025-07-07 15:09:20.906  INFO 43102 --- [nio-8080-exec-4] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Parameters: d906d03e-d8de-413e-b6f0-ba1c06a54f55(String),2025-07-07T15:09:20.901(LocalDateTime),2025-07-07T15:09:20.901(LocalDateTime),UserName(String),1(Integer)
2025-07-07 15:09:20.919  INFO 43102 --- [nio-8080-exec-4] c.e.q.core.util.EasyJdbcExecutorUtil     : <== Total: 1
2025-07-07 15:09:20.920  INFO 43102 --- [pool-2-thread-1] com.eq.rediscache2.cache.MyCacheManager  : 操作:INSERT,缓存:com.eq.rediscache2.domain.SysUser,key:d906d03e-d8de-413e-b6f0-ba1c06a54f55被删除
```

### 2.修改对象
```java


@GetMapping("/updateEntity")
public Object updateEntity() {
    SysUser sysUser = easyEntityQuery.queryable(SysUser.class).firstNotNull();
    sysUser.setName(UUID.randomUUID().toString());
    easyEntityQuery.updatable(sysUser).executeRows();
    return sysUser;
}


2025-07-07 15:10:34.010  INFO 43102 --- [nio-8080-exec-7] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Preparing: UPDATE `sys_user` SET `update_time` = ?,`name` = ?,`age` = ? WHERE `delete_time` IS NULL AND `id` = ?
2025-07-07 15:10:34.010  INFO 43102 --- [nio-8080-exec-7] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Parameters: 2025-07-07T15:10:34.005(LocalDateTime),55cba6ca-dec8-430a-8d16-a386a2b5a428(String),1(Integer),d906d03e-d8de-413e-b6f0-ba1c06a54f55(String)
2025-07-07 15:10:34.041  INFO 43102 --- [nio-8080-exec-7] c.e.q.core.util.EasyJdbcExecutorUtil     : <== Total: 1
2025-07-07 15:10:34.042  INFO 43102 --- [pool-2-thread-2] com.eq.rediscache2.cache.MyCacheManager  : 操作:UPDATE,缓存:com.eq.rediscache2.domain.SysUser,key:d906d03e-d8de-413e-b6f0-ba1c06a54f55被删除
```

### 3.表达式更新
```java

@GetMapping("/updateExpression")
public Object updateExpression() {
    SysUser sysUser = easyEntityQuery.queryable(SysUser.class).firstNotNull();
    String newName = UUID.randomUUID().toString();
    sysUser.setName(newName);
    easyEntityQuery.updatable(SysUser.class)
            .setColumns(s -> {
                s.name().set(newName);
            }).whereById(sysUser.getId()).executeRows();
    return sysUser;
}


2025-07-07 15:12:27.411  INFO 43236 --- [pool-2-thread-1] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Preparing: SELECT t.`id` FROM `sys_user` t WHERE t.`delete_time` IS NULL AND t.`update_time` >= ? AND t.`update_time` <= ?
2025-07-07 15:12:27.411  INFO 43236 --- [pool-2-thread-1] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Parameters: 2025-07-07T15:12:27.384(LocalDateTime),2025-07-07T15:12:29.407(LocalDateTime)
2025-07-07 15:12:27.419  INFO 43236 --- [pool-2-thread-1] c.e.q.core.util.EasyJdbcExecutorUtil     : <== Time Elapsed: 8(ms)
2025-07-07 15:12:27.420  INFO 43236 --- [pool-2-thread-1] c.e.q.c.b.j.e.i.e.DefaultJdbcResult      : <== Total: 1
2025-07-07 15:12:27.421  INFO 43236 --- [pool-2-thread-1] com.eq.rediscache2.cache.MyCacheManager  : 操作:UPDATE,缓存:com.eq.rediscache2.domain.SysUser,key:d906d03e-d8de-413e-b6f0-ba1c06a54f55被删除
```

### 4.对象更新列
```java

    @GetMapping("/updateEntityColumn")
    public Object updateEntityColumn() {
        SysUser sysUser = easyEntityQuery.queryable(SysUser.class).firstNotNull();
        String newName = UUID.randomUUID().toString();
        sysUser.setName(newName);

        easyEntityQuery.updatable(sysUser)
                .setColumns(s -> s.FETCHER.name())
                .executeRows();
        return sysUser;
    }

2025-07-07 15:13:11.058  INFO 43236 --- [nio-8080-exec-5] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Preparing: UPDATE `sys_user` SET `name` = ?,`update_time` = ? WHERE `delete_time` IS NULL AND `id` = ?
2025-07-07 15:13:11.058  INFO 43236 --- [nio-8080-exec-5] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Parameters: 94a16e51-05d6-481f-8d65-6c213e56557b(String),2025-07-07T15:13:11.056(LocalDateTime),d906d03e-d8de-413e-b6f0-ba1c06a54f55(String)
2025-07-07 15:13:11.068  INFO 43236 --- [nio-8080-exec-5] c.e.q.core.util.EasyJdbcExecutorUtil     : <== Total: 1
2025-07-07 15:13:11.069  INFO 43236 --- [pool-2-thread-1] com.eq.rediscache2.cache.MyCacheManager  : 操作:UPDATE,缓存:com.eq.rediscache2.domain.SysUser,key:d906d03e-d8de-413e-b6f0-ba1c06a54f55被删除
```

### 5.表达式删除
```java

@GetMapping("/deleteExpression")
public Object deleteExpression() {
    SysUser sysUser = easyEntityQuery.queryable(SysUser.class).firstNotNull();
    easyEntityQuery.deletable(SysUser.class)
            .where(s -> {
                s.id().eq(sysUser.getId());
            }).executeRows();
    return null;
}

2025-07-07 15:15:53.101  INFO 43331 --- [pool-2-thread-1] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Preparing: SELECT t.`id` FROM `sys_user` t WHERE t.`delete_time` >= ? AND t.`delete_time` <= ?
2025-07-07 15:15:53.102  INFO 43331 --- [pool-2-thread-1] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Parameters: 2025-07-07T15:15:53.079(LocalDateTime),2025-07-07T15:15:55.098(LocalDateTime)
2025-07-07 15:15:53.111  INFO 43331 --- [pool-2-thread-1] c.e.q.core.util.EasyJdbcExecutorUtil     : <== Time Elapsed: 9(ms)
2025-07-07 15:15:53.112  INFO 43331 --- [pool-2-thread-1] c.e.q.c.b.j.e.i.e.DefaultJdbcResult      : <== Total: 1
2025-07-07 15:15:53.112  INFO 43331 --- [pool-2-thread-1] com.eq.rediscache2.cache.MyCacheManager  : 操作:DELETE,缓存:com.eq.rediscache2.domain.SysUser,key:94d5caab-f21a-4f8e-8dc8-040af5e19877被删除
```

### 6.对象删除
```java

@GetMapping("/deleteEntity")
public Object deleteEntity() {
    SysUser sysUser = easyEntityQuery.queryable(SysUser.class).firstNotNull();
    easyEntityQuery.deletable(sysUser).executeRows();
    return null;
}

2025-07-07 15:17:00.997  INFO 43331 --- [nio-8080-exec-1] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Preparing: UPDATE `sys_user` SET `delete_time` = ? WHERE `delete_time` IS NULL AND `id` = ?
2025-07-07 15:17:00.998  INFO 43331 --- [nio-8080-exec-1] c.e.q.core.util.EasyJdbcExecutorUtil     : ==> Parameters: 2025-07-07T15:17:00.996(LocalDateTime),739522e9-6f99-4964-adc7-8ca8d2c78c9d(String)
2025-07-07 15:17:01.012  INFO 43331 --- [nio-8080-exec-1] c.e.q.core.util.EasyJdbcExecutorUtil     : <== Total: 1
2025-07-07 15:17:01.013  INFO 43331 --- [pool-2-thread-2] com.eq.rediscache2.cache.MyCacheManager  : 操作:DELETE,缓存:com.eq.rediscache2.domain.SysUser,key:739522e9-6f99-4964-adc7-8ca8d2c78c9d被删除
```


### 7.使用缓存查询
相同id仅第一次会查询数据库后续全部走redis
```java

    @GetMapping("/getById")
    public Object getById(@RequestParam("id") String id) {
        return easyCacheClient.kvStorage(SysUser.class).singleOrNull(id);
    }
```


## 使用mq进行解耦
如果你有mq或者其他可以异步解耦的程序可以不编写`MyCacheCleaner`

### 定义缓存发送者

```java

public class MyCacheEventPublisher {

    private final TriggerEvent triggerEvent;
    private final CacheKeysProvider cacheKeysProvider;

    public MyCacheEventPublisher(TriggerEvent triggerEvent, CacheKeysProvider cacheKeysProvider) {
        this.triggerEvent = triggerEvent;
        this.cacheKeysProvider = cacheKeysProvider;
    }

    public void publish() {
        QueryRuntimeContext runtimeContext = triggerEvent.getRuntimeContext();
        ConnectionManager connectionManager = runtimeContext.getConnectionManager();
        boolean inTransaction = connectionManager.currentThreadInTransaction();
        if (inTransaction) {
            Transaction transaction = connectionManager.getTransactionOrNull();
            if (transaction == null) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        publishCacheEvent();
                    }
                });
            } else {
                transaction.registerListener(new TransactionListener() {
                    @Override
                    public void afterCommit() {
                        publishCacheEvent();
                    }
                });
            }
        } else {
            publishCacheEvent();
        }
    }

    private void publishCacheEvent() {
            List<CacheDeleteEvent> cacheEvents = cacheKeysProvider.getCacheEvents(triggerEvent);
            for (CacheDeleteEvent cacheEvent : cacheEvents) {
                String jsonStr = JsonUtil.object2JsonStr(cacheEvent);
//                mq.publish(json);
            }

    }
}

```

通过`mq.publish(json)`进行事件发布，后续订阅相关事件进行处理

### 使用mq后构建EasyCacheClient
```java

    @Bean
    public EasyCacheClient easyCacheClient(EasyQueryClient easyQueryClient, RedissonClient redissonClient, CacheKeysProvider cacheKeysProvider) {
        EasyCacheClient easyCacheClient = EasyCacheBootstrapper.defaultBuilderConfiguration()
                 .optionConfigure(op -> {
                    op.setKeyPrefix("CACHE");
                    op.setCacheIndex("INDEX");
                    op.setExpireMillisSeconds(1000 * 60 * 60);//缓存1小时
                    op.setValueNullExpireMillisSeconds(1000 * 10);//null值缓存10秒
                })
                .replaceService(EasyQueryClient.class, easyQueryClient)
                .replaceService(RedissonClient.class, redissonClient)
                .replaceService(EasyCacheManager.class, MyCacheManager.class).build();

        easyQueryClient.addTriggerListener(triggerEvent -> {
            boolean cacheEntity = EasyCacheUtil.isCacheEntity(triggerEvent.getEntityClass());
            if(cacheEntity){
                new MyCacheEventPublisher(triggerEvent,cacheKeysProvider).publish();
            }
        });
        return easyCacheClient;
    }
```

### 监听服务消费缓存
```java
@Autowired
private CacheKeysProvider cacheKeysProvider;
@Autowired
private EasyCacheClient easyCacheClient;

@EventListener
public void onEvent(CacheClearEvent event) {
    System.out.println("-----缓存清除事件收到了-----");
    CacheMethodEnum cacheMethodEnum = CacheMethodEnum.enumOfOrDefault(event.getExecuteMethod(), CacheMethodEnum.UNKNOWN);
    List<CacheKey> cacheKeys = cacheKeysProvider.getCacheKeys(event.getBeforeTime(), event.getReceivedTime(), event.getTableName(), cacheMethodEnum, event.getCacheId());
    for (CacheKey cacheKey : cacheKeys) {
        easyCacheClient.deleteBy(cacheKey);
    }
}

```