---
title: 分页查询
---

# 分页
`easy-query`提供了非常简易的分页查询功能,方便用户进行数据结果的分页查询


::: tip 说明!!!
> `pageIndex`起始为1
:::

## 简单分页
```java
   EasyPageResult<Topic> topicPageResult = easyQuery
                .queryable(Topic.class)
                .where(o -> o.id().isNotNull())
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
            .innerJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
            .where((t, t1) -> {

                t1.title().isNotNull();
                t.id().eq("3");
            })
            .select(BlogEntity.class, (t, t1) -> Select.of(
                t1.FETCHER.allFieldsExclude(t1.id())
            ))
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
                .innerJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
                .where((t, t1) -> t1.title().isNotNull())
                .groupBy((t, t1)-> GrouopKeys.of(t1.id()))
                .select(BlogEntity.class, group -> Select.of(
                    group.key1().as("id"),
                    group.score().sum().as("score")
                ))//t1.column(BlogEntity::getId).columnSum(BlogEntity::getScore)
                .toPageResult(1, 20);

==> Preparing: SELECT  COUNT(1)  FROM (SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id`) t2
<== Total: 1, Query Use: 8(ms)
==> Preparing: SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id` LIMIT 20
<== Total: 20, Query Use: 2(ms)
```

## 自定义分页返回结果
`easy-query`提供了自定义分页返回结果,用户可以自行定义分页结果,[《替换框架行为❗️❗️❗️》](/easy-query-doc/config/replace-configure) 

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

### 自己实现分页返回实现
比如`mybatis-plus`默认返回不是data是records,那么eq应该如何才能实现返回records呢
```java

public class MyPageResult<T> extends DefaultPageResult<T> {
    public MyPageResult(long total, List<T> data) {
        super(total, data);
    }
    //重写getData方法，因为jackson默认返回不关心字段只关注getXXX方法
    @JsonProperty("records")
    @Override
    public List<T> getData() {
        return super.getData();
    }
}
```
实现`EasyPageResultProvider`接口我们只需要继承默认的`DefaultEasyPageResultProvider`即可没必要自己实现一个
```java

public class MyEasyPageResultProvider extends DefaultEasyPageResultProvider {
    @Override
    public <T> EasyPageResult<T> createPageResult(long pageIndex, long pageSize, long total, List<T> data) {
        return new MyPageResult<>(total,data);
    }
}

```
最后参考替换框架实现文档来实现替换默认实现[点我查看](/easy-query-doc/framework/replace-configure)

## 无依赖使用自己的PageResult
很多时候框架提供的`EasyPageResult<T>`提供了方便的同时让整个项目高度依赖`easy-query`这是一个非常不好的事情,所以`easy-query`在1.4.25提供了自定义`PageResult<TResult>`结果,并且提供了链式方法调用方便开发人员

### 框架提供的分页器
`Pager<TEntity,TPageResult>` 用户可以自行实现分页

### 添加自己的分页返回结果接口
```java
//接口
public interface PageResult<T> {
    /**
     * 返回总数
     * @return
     */
    long getTotalCount();

    /**
     * 结果内容 
     * @return
     */
    List<T> getList();
}

//实现
public class MyPageResult<TEntity> implements PageResult<TEntity> {
    private final long total;
    private final List<TEntity> list;

    public MyPageResult(long total, List<TEntity> list){

        this.total = total;
        this.list = list;
    }
    @Override
    public long getTotalCount() {
        return total;
    }

    @Override
    public List<TEntity> getList() {
        return list;
    }
}

```
### 自定义pager
```java

public class MyPager<TEntity> implements Pager<TEntity,PageResult<TEntity>> {
    private final long pageIndex;
    private final long pageSize;
    private final long pageTotal;

    public MyPager(long pageIndex, long pageSize){
        this(pageIndex,pageSize,-1);
    }
    public MyPager(long pageIndex, long pageSize, long pageTotal){

        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
        this.pageTotal = pageTotal;
    }
    @Override
    public PageResult<TEntity> toResult(Query<TEntity> query) {
        EasyPageResult<TEntity> pageResult = query.toPageResult(pageIndex, pageSize,pageTotal);
        return new MyPageResult<>(pageResult.getTotal(),pageResult.getData());
    }
}
```

### 测试代码
```java
//业务代码返回自定义PageResult<TEntity>
PageResult<TopicGenericKey> pageResult = easyQuery
        .queryable(TopicGenericKey.class)
        .whereById("1")
        .toPageResult(new MyPager<>(1, 2));
Assert.assertEquals(1,pageResult.getTotalCount());
Assert.assertEquals("1",pageResult.getList().get(0).getId());
```