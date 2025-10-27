---
title: Multi-Level Cache Redis Logical Deletion
order: 40
---

# Multi-Level Cache Redis Logical Deletion
This solution is an enhancement for using only Redis as cache, because using Redis as cache still requires I/O operations regardless, so in terms of speed, there is actually not much difference from DB queries. It may be slightly faster, but overall there is still network I/O, so there is no substantial improvement.

This document requires configuration from the previous chapter "Redis Cache Logical Deletion" [Redis Cache Logical Deletion](/easy-query-doc/cache/redis-logicdelete)


This chapter's [demo](https://github.com/xuejmnet/eq-cache-sample) https://github.com/xuejmnet/eq-cache-sample
## Performance

### Database Query Only 1000 Times
```java

@GetMapping("/getdb1000ById")
public Object getdb1000ById(@RequestParam("id") String id) {
    long start = System.currentTimeMillis();
    for (int i = 0; i < 1000; i++) {

        easyEntityQuery.queryable(SysUser.class).whereById(id).singleNotNull();
    }
    long end = System.currentTimeMillis();
    return (end-start)+"(ms)";
}
//Time elapsed 2317(ms)
```
### Redis Cache Only 1000 Times
```java

    @GetMapping("/get1000ById")
    public Object get1000ById(@RequestParam("id") String id) {
        long start = System.currentTimeMillis();
        for (int i = 0; i < 1000; i++) {
            easyCacheClient.kvStorage(SysUser.class).singleOrNull(id);
        }
        long end = System.currentTimeMillis();
        return (end-start)+"(ms)";
    }
    //Time elapsed 1356(ms)

```

### Redis + Caffeine
Add `MultiCacheLevel` to the object
```java

    @GetMapping("/get1000ById")
    public Object get1000ById(@RequestParam("id") String id) {
        long start = System.currentTimeMillis();
        for (int i = 0; i < 1000; i++) {
            easyCacheClient.kvStorage(SysUser.class).singleOrNull(id);
        }
        long end = System.currentTimeMillis();
        return (end-start)+"(ms)";
    }
//Time elapsed 16(ms)
```


## Introduce Dependency
```java
        <caffeine.version>2.9.3</caffeine.version>

        <!-- https://mvnrepository.com/artifact/com.github.ben-manes.caffeine/caffeine -->
        <dependency>
            <groupId>com.github.ben-manes.caffeine</groupId>
            <artifactId>caffeine</artifactId>
            <version>${caffeine.version}</version>
        </dependency>

```


::: warning Java8!!!
> Java8 supports up to `2.9.3^`
:::
## CacheMultiLevel
This interface is a marker interface. Because the second-level cache is an in-process cache, the capacity is definitely not too much, so the interface is used to mark whether to store in memory.
```java

public interface CacheMultiLevel {
}

```
## Add Memory Cache Configuration
```java

@Data
@Component
public class CacheOption {
    /**
     * Default expiration time 5 minutes
     */
    @Value("${cache.memory-expire-millis-seconds}")
    private long memoryExpireMillisSeconds = 300000;
    /**
     * Default memory initialization quantity 1000
     */
    @Value("${cache.memory-initial-capacity}")
    private int memoryInitialCapacity = 1000;
    /**
     * Default memory maximum quantity 10000
     */
    @Value("${cache.memory-maximum-size}")
    private int memoryMaximumSize = 10000;
}

```

## Modify EasyCacheManager


```java

public class MyMultiCacheManager extends AbstractCacheManager {
    private final RedissonClient redissonClient;
    public final Cache<String, Map<String, CacheItem>> caffeineCache;

    public MyMultiCacheManager(RedissonClient redissonClient, EasyCacheOption easyCacheOption, CacheOption cacheOption) {
        super(easyCacheOption);
        this.redissonClient = redissonClient;
        this.caffeineCache = Caffeine.newBuilder()
                //Initial capacity
                .initialCapacity(cacheOption.getMemoryInitialCapacity())
                //Maximum size
                .maximumSize(cacheOption.getMemoryMaximumSize())
                //Expire after specified time since last write operation
                .expireAfterWrite(cacheOption.getMemoryExpireMillisSeconds(), TimeUnit.MILLISECONDS)
                .build();
    }

    @Nullable
    @Override
    public CacheItem getCacheItem(String cacheKey, String conditionKey, Class<?> entityClass) {
        String entityCacheKey = getCacheKey(entityClass, cacheKey);
        return getCacheItem(entityCacheKey, conditionKey, CacheUtil.isMultiCacheEntity(entityClass));
    }
    private CacheItem getCacheItem(String key, String conditionKey, boolean multiCacheEntity) {
        if (multiCacheEntity) {
            Map<String, CacheItem> cacheItemMap = getMemoryCache(key);
            CacheItem cacheItem = cacheItemMap.get(conditionKey);
            if (cacheItem == null) {
                CacheItem redissonCacheItem = getRedissonCacheItem(key, conditionKey);
                if (redissonCacheItem != null && !redissonCacheItem.cacheIsExpired()) {
                    cacheItemMap.put(conditionKey, redissonCacheItem);
                    return redissonCacheItem;
                }
            }
            return cacheItem;
        }
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

    @NotNull
    private Map<String, CacheItem> getMemoryCache(String key) {
        Map<String, CacheItem> cacheItemMap = caffeineCache.get(key, k -> {
            return new ConcurrentHashMap<>();
        });
        if (cacheItemMap == null) {
            throw new EasyQueryInvalidOperationException("cache item is null");
        }
        return cacheItemMap;
    }

    @Override
    public void setCacheItem(String cacheKey, String conditionKey, CacheItem cacheItem, Class<?> entityClass, long expireMillisSeconds) {
        String entityCacheKey = getCacheKey(entityClass, cacheKey);
        boolean multiCacheEntity = CacheUtil.isMultiCacheEntity(entityClass);
        RMap<String, String> entityJsonMap = redissonClient.getMap(entityCacheKey);
        boolean mapExists = entityJsonMap.isExists();
        if (multiCacheEntity) {
            Map<String, CacheItem> cacheItemMap = getMemoryCache(entityCacheKey);
            cacheItemMap.put(conditionKey, cacheItem);
        }
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
        boolean multiCacheEntity = CacheUtil.isMultiCacheEntity(cacheKey.getEntityClass());
        String deleteCacheKey = getCacheKey(cacheKey.getEntityClass(), cacheKey.getKey());
        if (multiCacheEntity) {
            caffeineCache.invalidate(deleteCacheKey);
        }
        redissonClient.getMap(deleteCacheKey).delete();
    }
}
```


## Table Object Design
Add `CacheMultiLevel` interface to the object
```java

@Data
@Table("sys_user")
@EntityProxy
@CacheEntitySchema
public class SysUser extends BaseEntity implements CacheMultiLevel,CacheKvEntity,ProxyEntityAvailable<SysUser , SysUserProxy> {
    private String name;
    private Integer age;
}


```

## Build EasyCacheClient

```java

@Configuration
public class MyConfiguration {
    @Bean
    public EasyCacheClient easyCacheClient(EasyQueryClient easyQueryClient, RedissonClient redissonClient, CacheKeysProvider cacheKeysProvider, CacheOption cacheOption) {
        EasyCacheClient easyCacheClient = EasyCacheBootstrapper.defaultBuilderConfiguration()
                .optionConfigure(op -> {
                    op.setKeyPrefix("CACHE");
                    op.setCacheIndex("INDEX");
                    op.setExpireMillisSeconds(1000 * 60 * 60);//Cache for 1 hour
                    op.setValueNullExpireMillisSeconds(1000 * 10);//Cache null values for 10 seconds
                })
                .replaceService(EasyQueryClient.class, easyQueryClient)
                .replaceService(RedissonClient.class, redissonClient)
                .replaceService(cacheOption)
                .replaceService(EasyCacheManager.class, MyMultiCacheManager.class).build();

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

## Configuration
Configure in `application.yml`
```yml

cache:
  memory-expire-millis-seconds: 300000
  memory-initial-capacity: 1000
  memory-maximum-size: 10000
```

