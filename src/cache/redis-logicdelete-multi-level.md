---
title: 多级缓存redis逻辑删除
order: 40
---

# 多级缓存redis逻辑删除
改方案是针对仅redis做缓存的增强因为redis做缓存无论如何还是要走io这一步所以速度上而言其实和db查询无太多变化可能会稍微变快但是整体还是网络io所以并不会有实质提升

该文档需要配置《redis缓存逻辑删除》前一篇配置[redis缓存逻辑删除](/easy-query-doc/cache/redis-logicdelete)


本章节[demo](https://github.com/xuejmnet/eq-cache-sample) https://github.com/xuejmnet/eq-cache-sample
## 性能

### 仅数据库查询1000次
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
//耗时2317(ms)
```
### 仅redis缓存获取1000次
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
    //耗时1356(ms)

```

### redis+caffeine
对象添加`MultiCacheLevel`
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
//耗时16(ms)
```


## 引入依赖
```java
        <caffeine.version>2.9.3</caffeine.version>

        <!-- https://mvnrepository.com/artifact/com.github.ben-manes.caffeine/caffeine -->
        <dependency>
            <groupId>com.github.ben-manes.caffeine</groupId>
            <artifactId>caffeine</artifactId>
            <version>${caffeine.version}</version>
        </dependency>

```


::: warning java8!!!
> java8最高支持`2.9.3^`
:::
## CacheMultiLevel
改接口为标记接口,因为二级缓存为进程内缓存,可容纳量肯定不会太多,所以通过接口来标记是否要存储到内存中
```java

public interface CacheMultiLevel {
}

```
## 新增内存缓存配置
```java

@Data
@Component
public class CacheOption {
    /**
     * 默认过期时间 5分钟
     */
    @Value("${cache.memory-expire-millis-seconds}")
    private long memoryExpireMillisSeconds = 300000;
    /**
     * 默认内存初始化数量1000
     */
    @Value("${cache.memory-initial-capacity}")
    private int memoryInitialCapacity = 1000;
    /**
     * 默认内存最大数量10000
     */
    @Value("${cache.memory-maximum-size}")
    private int memoryMaximumSize = 10000;
}

```

## 修改EasyCacheManager


```java

public class MyMultiCacheManager extends AbstractCacheManager {
    private final RedissonClient redissonClient;
    public final Cache<String, Map<String, CacheItem>> caffeineCache;

    public MyMultiCacheManager(RedissonClient redissonClient, EasyCacheOption easyCacheOption, CacheOption cacheOption) {
        super(easyCacheOption);
        this.redissonClient = redissonClient;
        this.caffeineCache = Caffeine.newBuilder()
                //初始数量
                .initialCapacity(cacheOption.getMemoryInitialCapacity())
                //最大条数
                .maximumSize(cacheOption.getMemoryMaximumSize())
                //最后一次写操作后经过指定时间过期
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


## 表对象设计
对象添加`CacheMultiLevel`接口
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

## 构建EasyCacheClient

```java

@Configuration
public class MyConfiguration {
    @Bean
    public EasyCacheClient easyCacheClient(EasyQueryClient easyQueryClient, RedissonClient redissonClient, CacheKeysProvider cacheKeysProvider, CacheOption cacheOption) {
        EasyCacheClient easyCacheClient = EasyCacheBootstrapper.defaultBuilderConfiguration()
                .optionConfigure(op -> {
                    op.setKeyPrefix("CACHE");
                    op.setCacheIndex("INDEX");
                    op.setExpireMillisSeconds(1000 * 60 * 60);//缓存1小时
                    op.setValueNullExpireMillisSeconds(1000 * 10);//null值缓存10秒
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

## 配置
`application.yml`进行配置
```yml

cache:
  memory-expire-millis-seconds: 300000
  memory-initial-capacity: 1000
  memory-maximum-size: 10000
```