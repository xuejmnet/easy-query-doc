---
title: 分页
order: 10
---

# 分页
`easy-query`提供了非常简易的分页查询功能,方便用户进行数据结果的分页查询
## 简单分页
```java
   EasyPageResult<Topic> topicPageResult = easyQuery
                .queryable(Topic.class)
                .where(o -> o.isNotNull(Topic::getId))
                .toPageResult(1, 20);

==> Preparing: SELECT  COUNT(1)  FROM t_topic t WHERE t.`id` IS NOT NULL
<== Total: 1
==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM t_topic t WHERE t.`id` IS NOT NULL LIMIT 20
<== Total: 20
```
## join分页
```java
EasyPageResult<BlogEntity> page = easyQuery
            .queryable(Topic.class)
            .innerJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
            .where((t, t1) -> t1.isNotNull(BlogEntity::getTitle).then(t).eq(Topic::getId, "3"))
            .select(BlogEntity.class, (t, t1) -> t1.columnAll().columnIgnore(BlogEntity::getId))
            .toPageResult(1, 20);

==> Preparing: SELECT  COUNT(1)  FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL AND t.`id` = ?
==> Parameters: 3(String)
<== Total: 1, Query Use: 3(ms)
==> Preparing: SELECT t1.`create_time`,t1.`update_time`,t1.`create_by`,t1.`update_by`,t1.`deleted`,t1.`title`,t1.`content`,t1.`url`,t1.`star`,t1.`publish_time`,t1.`score`,t1.`status`,t1.`order`,t1.`is_top`,t1.`top` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL AND t.`id` = ? LIMIT 1
==> Parameters: 3(String)
<== Total: 1, Query Use: 2(ms)
```

## group分页
```java
EasyPageResult<BlogEntity> page = easyQuery
                .queryable(Topic.class)
                .innerJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                .where((t, t1) -> t1.isNotNull(BlogEntity::getTitle))
                .groupBy((t, t1)->t1.column(BlogEntity::getId))
                .select(BlogEntity.class, (t, t1) -> t1.column(BlogEntity::getId).columnSum(BlogEntity::getScore))
                .toPageResult(1, 20);

==> Preparing: SELECT  COUNT(1)  FROM (SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id`) t2
<== Total: 1, Query Use: 8(ms)
==> Preparing: SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id` LIMIT 20
<== Total: 20, Query Use: 2(ms)
```

## 自定义分页返回结果
`easy-query`提供了自定义分页返回结果,用户可以自行定义分页结果,[《替换框架行为❗️❗️❗️》](/easy-query-doc/guide/config/replace-configure) 

### 替换接口
`EasyPageResultProvider`


方法  | 参数 | 描述  
--- | --- | --- 
createPageResult | long pageIndex, long pageSize,long total, List\<T\> data  | 返回`toPageResult`的分页对象
createShardingPageResult | long pageIndex, long pageSize,long total, List\<T\> data,SequenceCountLine sequenceCountLine  | 返回`toShardingPageResult`的分页对象

### 默认实现
```java

public class DefaultEasyPageResultProvider implements EasyPageResultProvider{
    @Override
    public <T> EasyPageResult<T> createPageResult(long pageIndex, long pageSize,long total, List<T> data) {
        return new DefaultPageResult<>(total,data);
    }

    @Override
    public <T> EasyPageResult<T> createShardingPageResult(long pageIndex, long pageSize,long total, List<T> data,SequenceCountLine sequenceCountLine) {
        return new DefaultShardingPageResult<>(total,data,sequenceCountLine);
    }
}


public class DefaultPageResult<T> implements EasyPageResult<T> {
    private final long total;
    private final List<T> data;

    public DefaultPageResult(long total, List<T> data) {
        this.total = total;

        this.data = data;
    }

    public long getTotal() {
        return total;
    }

    public List<T> getData() {
        return data;
    }
}

public interface EasyShardingPageResult<T> extends EasyPageResult<T>{
    List<Long> getTotalLines();
}


public class DefaultShardingPageResult<T> implements EasyShardingPageResult<T> {
    private final long total;
    private final List<T> data;
    private final SequenceCountLine sequenceCountLine;

    public DefaultShardingPageResult(long total, List<T> data,SequenceCountLine sequenceCountLine) {
        this.total = total;

        this.data = data;
        this.sequenceCountLine = sequenceCountLine;
    }

    public long getTotal() {
        return total;
    }

    public List<T> getData() {
        return data;
    }

    @Override
    public List<Long> getTotalLines() {
        return sequenceCountLine.getTotalLines();
    }
}

```