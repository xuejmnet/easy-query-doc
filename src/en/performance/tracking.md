---
title: Data Tracking
order: 80
---

# Data Tracking
eq provides tracking query, which supports tracking query results. After setting properties on entity objects, a large amount of data, such as hundreds of thousands of objects being tracked, may cause relatively slow query results because snapshots of the results need to be cloned.

## Solution
Ignore certain objects

- If the current method does not have `@EasyQueryTrack` added, then all expressions within the method will not be tracked

- If the current method has `@EasyQueryTrack` added and configured with `default-track:true`, then you can ignore this expression through `asNoTracking`
```java
easyEntityQuery.queryable(SysUser.class)
        .asNoTracking()//
        .toList();
```

