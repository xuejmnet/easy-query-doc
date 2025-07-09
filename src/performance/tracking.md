---
title: 数据追踪
order: 80
---

# 数据追踪
eq提供了tracking追踪查询，支持查询结果追踪后对实体对象进行属性set后，但是大量的数据比如十万级别的对象追踪可能导致查询结果的相对缓慢因为需要对结果进行快照的克隆。

## 解决方案
对某个对象进行忽略

- 如果当前方法没有添加`@EasyQueryTrack`那么方法内所有表达式都不会进行追踪

- 如果当前方法添加了`@EasyQueryTrack`并且配置了`default-track:true`那么可以忽略本次表达式通过`asNoTracking`
```java
easyEntityQuery.queryable(SysUser.class)
        .asNoTracking()//
        .toList();
```