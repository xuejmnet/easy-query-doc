---
title: api
order: 10
---

# cache api
在使用缓存前我们先对缓存api做一个相对简单的介绍


## 注解

### CacheEntitySchema

value  | 功能  
---  | --- 
属性名  | 用来描述缓存key是哪个


## 接口


### CacheKvEntity
用来标记这个api是k-v模式,查询必须提供缓存key也就是id来进行查询

::: tip 场景!!!
> 适用于任意对象数据,必须是单key
:::



### CacheAllEntity
用来标记这个api是k-v+index模式,查询支持不使用key来查询支持分页查询

::: tip 场景!!!
> 适用于config或者省等相对全部表数据不多的对象
:::


## api

### EasyCacheClient

接口  | 功能  
---  | --- 
kvStorage  | 支持对CacheKvEntity接口实现的对象查询
allStorage  | 支持对CacheAllEntity接口实现的对象查询
getService  | 支持获取注入到EasyCacheClient的服务
deleteBy  | 用来手动清理过期数据

## kvStorage
```java

BlogEntity blogEntity = easyCacheClient.kvStorage(BlogEntity.class).singleOrNull("1");

BlogEntity blogEntity = easyCacheClient.kvStorage(BlogEntity.class).filter(b -> !Objects.equals(b.getId(), "1")).singleOrNull("1");

BlogEntity blogEntity = easyCacheClient.kvStorage(BlogEntity.class).where(b -> {
    b.content().contains("123xx");
}).singleOrNull("2");

BlogEntity blogEntity = easyCacheClient.kvStorage(BlogEntity.class).useInterceptor("blog-cache").singleOrNull("1");
```

- `singleOrNull`按缓存key进行查询
- `filter`先按缓存key进行查询然后对查询的结果进行额外判断
- `where`缓存默认支持多条件缓存
- `useInterceptor`、`noInterceptor`禁用或启用拦截器，默认缓存拦截器行为和`eq`表达式一样

## allStorage
```java
List<Topic> list = easyCacheClient.allStorage(Topic.class).toList();

EasyPageResult<Topic> pageResult = easyCacheClient.allStorage(Topic.class).where(o -> {
                o.title().contains("123");
            }).toPageResult(1, 2);
```

- `toList`支持缓存获取所有,默认会现将key拉取然后保存到index的索引缓存下
- `toPageResult`在all的缓存下因为已经知道缓存所有数据所以可以对其进行分页