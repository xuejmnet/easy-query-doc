---
title: API
order: 10
---

# Cache API
Before using the cache, let's make a relatively simple introduction to the cache API


## Annotations

### CacheEntitySchema

value  | Function  
---  | --- 
Property name  | Used to describe which cache key to use


## Interfaces


### CacheKvEntity
Used to mark this API as k-v mode. Queries must provide a cache key, which is the id, for querying.

::: tip Scenario!!!
> Applicable to any object data, must be a single key
:::



### CacheAllEntity
Used to mark this API as k-v+index mode. Queries support not using keys for querying and support pagination queries.

::: tip Scenario!!!
> Applicable to config or provinces and other objects with relatively small amount of full table data
:::

## EasyCacheOption
Property  | Function  
---  | --- 
keyPrefix  | Cache prefix, default CACHE
cacheIndex  | AllCache cache index prefix, default INDEX
expireMillisSeconds  | Cache key expiration time
valueNullExpireMillisSeconds  | Cache time for null values when cache miss

## API

### EasyCacheClient

Interface  | Function  
---  | --- 
kvStorage  | Supports querying objects that implement the CacheKvEntity interface
allStorage  | Supports querying objects that implement the CacheAllEntity interface
getService  | Supports getting services injected into EasyCacheClient
deleteBy  | Used to manually clean expired data

## kvStorage
```java

BlogEntity blogEntity = easyCacheClient.kvStorage(BlogEntity.class).singleOrNull("1");

BlogEntity blogEntity = easyCacheClient.kvStorage(BlogEntity.class).filter(b -> !Objects.equals(b.getId(), "1")).singleOrNull("1");

BlogEntity blogEntity = easyCacheClient.kvStorage(BlogEntity.class).where(b -> {
    b.content().contains("123xx");
}).singleOrNull("2");

BlogEntity blogEntity = easyCacheClient.kvStorage(BlogEntity.class).useInterceptor("blog-cache").singleOrNull("1");
```

- `singleOrNull` queries by cache key
- `filter` first queries by cache key and then performs additional judgment on the query results
- `where` cache supports multi-condition caching by default
- `useInterceptor`, `noInterceptor` disable or enable interceptors, default cache interceptor behavior is the same as `eq` expression

## allStorage
```java
List<Topic> list = easyCacheClient.allStorage(Topic.class).toList();

EasyPageResult<Topic> pageResult = easyCacheClient.allStorage(Topic.class).where(o -> {
                o.title().contains("123");
            }).toPageResult(1, 2);
```

- `toList` supports cache to get all, by default it will first pull the key and then save it to the index cache
- `toPageResult` under the all cache, because we already know all the cached data, we can paginate it

