---
title: Cache
---

# Cache
`easy-query` formally improved the cache-related package in `3.0.44^`. Based on years of experience, the author provides a relatively balanced point between cache usage and consistency, supporting two consistency schemes:

- 1. CDC cache consistency
- 2. Deferred deletion + logical deletion cache consistency

Sometimes whether the database has binlog enabled or has CDC permissions is not within our control, so if users directly operate the database, we can implement it through the second solution.

It also supports multi-level caching. The documentation will provide a Redis + Caffeine two-level cache mode to accelerate cache retrieval.


## Modes
`easy-cache` provides two modes:


Mode  | Description  
--- | --- 
kv |  Uses k-v key-value pairs with the highest performance, only supports object cache id queries, only supports returning single objects
all |  Uses k-v+index mode


## Cache Key
The default cache key is `CACHE:Topic:99`, stored as a hash table, i.e., in the form of `Map<String,Map<String,Object>>`. The second-level key is used as the SQL condition during queries. If the SQL condition contains associated relationship tables, the entire SQL will be md5(sql+parameter) as the second-level key because the entire SQL becomes very long after associated tables. Of course, you can also replace the default cache implementation `CacheKeyFactory` by just implementing the `String getKey(ClientQueryable<?> entityQueryable)` method.
