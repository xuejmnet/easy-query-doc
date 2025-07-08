---
title: 缓存
---

# 缓存
`easy-query`在`3.0.44^`正式完善了缓存相关包,经过作者多年的经验对缓存在使用上和一致性上提供了相对平衡的一个点,
支持两种一致性方案

- 1.cdc缓存一致性
- 2.延迟删除+逻辑删除缓存一致性

有时候数据库是否有开启binlog或者是否有cdc权限并不是我们能控制的，所以如果用户对数据库进行直接操作我们可以通过第二种解决方案来实现

并且支持多级缓存，文档将提供redis+caffeine的二级缓存模式来加快缓存的拉取


## 模式
`easy-cache`提供了二种模式


模式  | 描述  
--- | --- 
kv |  采用k-v键值对拥有最高效的性能,仅支持对象缓存id查询仅支持返回单一对象
all |  采用k-v+index模式


## 缓存key
默认缓存key是`CACHE:Topic:99`存储value为hash表也就是`Map<String,Map<String,Object>>`的形式进行存储，二级key作为查询时的sql条件,如果sql条件存在关联关系表则会将整个sql进行md5(sql+parameter)作为二级key存储因为存在关联表后整个sql会变得很长,当然你也可以替换掉默认的缓存实现`CacheKeyFactory`只需实现`String getKey(ClientQueryable<?> entityQueryable)`方法函数即可