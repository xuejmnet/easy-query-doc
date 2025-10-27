---
title: Redis Cache Logical Deletion
order: 30
---

# Redis Cache Logical Deletion
This solution is another option. If your database cannot enable or does not support CDC tools, you can adopt this solution.

This chapter's [demo](https://github.com/xuejmnet/eq-cache-sample) https://github.com/xuejmnet/eq-cache-sample


::: tip Notice!!!
> Because eq adopts the lazy loading class feature, in the first step of using cache, it is recommended that after eq is instantiated, the framework can directly load all entity data to eq, which is convenient for subsequent retrieval of corresponding entity information through tableName
```java
Set<String> scanClasses = EasyPackageUtil.scanClasses("com.ml.shop.domain", true, false);
EntityMetadataManager entityMetadataManager = easyQueryClient.getRuntimeContext().getEntityMetadataManager();
for (String scanClass : scanClasses) {
    entityMetadataManager.getEntityMetadata(EasyClassUtil.getClassForName(scanClass));
}
```
:::




## Technical Requirements
- 1. Need Redis, can also be replaced with other cache
- 2. Table design needs to support logical deletion

## Dependency Introduction
Need to additionally introduce an independent cache dependency package
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

## Table Object Design
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
Implement the `CacheManager` interface. By default, there is already an abstract class `CacheManager` implementation. You only need to implement additional methods.
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
Because inserts, updates, and deletions cannot get the cache key of the affected objects, when expressions like `update table set xxx where xxx` are triggered without entity objects, you need to manually get the cache keys of the affected objects.
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

## Create a Cache Cleaner
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

**Note:** `cacheKeysProvider.getCacheKeys` is a time-consuming database query operation, so it needs to be executed in an asynchronous thread. Of course, you can also use MQ to publish the trigger and have another thread process it.

## Build EasyCacheClient

```java

@Configuration
public class MyConfiguration {
    @Bean
    public EasyCacheClient easyCacheClient(EasyQueryClient easyQueryClient, RedissonClient redissonClient, CacheKeysProvider cacheKeysProvider) {
        EasyCacheClient easyCacheClient = EasyCacheBootstrapper.defaultBuilderConfiguration()
                .optionConfigure(op -> {
                    op.setKeyPrefix("CACHE");
                    op.setCacheIndex("INDEX");
                    op.setExpireMillisSeconds(1000 * 60 * 60);//Cache for 1 hour
                    op.setValueNullExpireMillisSeconds(1000 * 10);//Cache null values for 10 seconds
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
## Testing
### 1. Create Object
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
2025-07-07 15:09:20.920  INFO 43102 --- [pool-2-thread-1] com.eq.rediscache2.cache.MyCacheManager  : Operation:INSERT,Cache:com.eq.rediscache2.domain.SysUser,key:d906d03e-d8de-413e-b6f0-ba1c06a54f55 deleted
```

### 2. Update Object
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
2025-07-07 15:10:34.042  INFO 43102 --- [pool-2-thread-2] com.eq.rediscache2.cache.MyCacheManager  : Operation:UPDATE,Cache:com.eq.rediscache2.domain.SysUser,key:d906d03e-d8de-413e-b6f0-ba1c06a54f55 deleted
```

### 3. Expression Update
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
2025-07-07 15:12:27.421  INFO 43236 --- [pool-2-thread-1] com.eq.rediscache2.cache.MyCacheManager  : Operation:UPDATE,Cache:com.eq.rediscache2.domain.SysUser,key:d906d03e-d8de-413e-b6f0-ba1c06a54f55 deleted
```

### 4. Update Entity Column
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
2025-07-07 15:13:11.069  INFO 43236 --- [pool-2-thread-1] com.eq.rediscache2.cache.MyCacheManager  : Operation:UPDATE,Cache:com.eq.rediscache2.domain.SysUser,key:d906d03e-d8de-413e-b6f0-ba1c06a54f55 deleted
```

### 5. Expression Delete
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
2025-07-07 15:15:53.112  INFO 43331 --- [pool-2-thread-1] com.eq.rediscache2.cache.MyCacheManager  : Operation:DELETE,Cache:com.eq.rediscache2.domain.SysUser,key:94d5caab-f21a-4f8e-8dc8-040af5e19877 deleted
```

### 6. Delete Entity
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
2025-07-07 15:17:01.013  INFO 43331 --- [pool-2-thread-2] com.eq.rediscache2.cache.MyCacheManager  : Operation:DELETE,Cache:com.eq.rediscache2.domain.SysUser,key:739522e9-6f99-4964-adc7-8ca8d2c78c9d deleted
```


### 7. Query Using Cache
Same id will only query the database for the first time, all subsequent queries go through Redis
```java

    @GetMapping("/getById")
    public Object getById(@RequestParam("id") String id) {
        return easyCacheClient.kvStorage(SysUser.class).singleOrNull(id);
    }
```


## Using MQ for Decoupling
If you have MQ or other programs that can be asynchronously decoupled, you don't need to write `MyCacheCleaner`

### Define Cache Publisher

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

Publish events through `mq.publish(json)`, and then subscribe to related events for processing.

### Build EasyCacheClient After Using MQ
```java

    @Bean
    public EasyCacheClient easyCacheClient(EasyQueryClient easyQueryClient, RedissonClient redissonClient, CacheKeysProvider cacheKeysProvider) {
        EasyCacheClient easyCacheClient = EasyCacheBootstrapper.defaultBuilderConfiguration()
                 .optionConfigure(op -> {
                    op.setKeyPrefix("CACHE");
                    op.setCacheIndex("INDEX");
                    op.setExpireMillisSeconds(1000 * 60 * 60);//Cache for 1 hour
                    op.setValueNullExpireMillisSeconds(1000 * 10);//Cache null values for 10 seconds
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

### Listener Service Consumes Cache
```java
@Autowired
private CacheKeysProvider cacheKeysProvider;
@Autowired
private EasyCacheClient easyCacheClient;

@EventListener
public void onEvent(CacheClearEvent event) {
    System.out.println("-----Cache clear event received-----");
    CacheMethodEnum cacheMethodEnum = CacheMethodEnum.enumOfOrDefault(event.getExecuteMethod(), CacheMethodEnum.UNKNOWN);
    List<CacheKey> cacheKeys = cacheKeysProvider.getCacheKeys(event.getBeforeTime(), event.getReceivedTime(), event.getTableName(), cacheMethodEnum, event.getCacheId());
    for (CacheKey cacheKey : cacheKeys) {
        easyCacheClient.deleteBy(cacheKey);
    }
}

```

