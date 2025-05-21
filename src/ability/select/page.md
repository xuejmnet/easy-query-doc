---
title: 分页查询
order: 70
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
                .innerJoin(BlogEntity.class, (t_topic, t_blog) -> t_topic.id().eq(t_blog.id()))
                .where((t_topic, t_blog) -> t_blog.title().isNotNull())
                .groupBy((t_topic, t_blog)-> GrouopKeys.of(t_blog.id()))
                .select(BlogEntity.class, group -> Select.of(
                    group.key1().as("id"),
                    //group.sum(t->t.t2.score()).as("score")//上下写法一样就是集合方法和属性方法的区别
                    group.groupTable().t2.score().sum().as("score")
                ))//t1.column(BlogEntity::getId).columnSum(BlogEntity::getScore)
                .toPageResult(1, 20);

==> Preparing: SELECT  COUNT(1)  FROM (SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id`) t2
<== Total: 1, Query Use: 8(ms)
==> Preparing: SELECT t1.`id`,SUM(t1.`score`) AS `score` FROM t_topic t INNER JOIN t_blog t1 ON t.`id` = t1.`id` WHERE t1.`title` IS NOT NULL GROUP BY t1.`id` LIMIT 20
<== Total: 20, Query Use: 2(ms)
```

## 自定义分页返回结果
`easy-query`提供了自定义分页返回结果,用户可以自行定义分页结果,[《替换框架行为❗️❗️❗️》](/easy-query-doc/framework/replace-configure) 

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

## 实现MybatisPlus的SearchCount
有部分小伙伴希望`eq`提供类似`MybatisPlus`的`SearchCount`的功能,一个`boolean`值就能来设置分页是否需要查询`count`,其实`toPageResult`第三个参数用户自行传入`total`即可，当用户传入`total`后框架则使用传入的`total`不再对表达式进行`count`查询,只需要前后端配合将第一次`total`传给用户后续一直交互即可

当然也有部分小伙伴希望通过一个`boolean`值来控制那么我们应该如何实现呢,请看下面案例

### 实现Pager
`Pager`的第二个泛型可以用框架的也可以自行定义
```java

public class SearchCountPager<TEntity> implements Pager<TEntity, PageResult<TEntity>> {
    private final long pageIndex;
    private final long pageSize;
    private final boolean searchCount;

    public SearchCountPager(long pageIndex, long pageSize, boolean searchCount) {
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
        this.searchCount = searchCount;
    }

    @Override
    public PageResult<TEntity> toResult(PageAble<TEntity> query) {
        if (searchCount) {
            EasyPageResult<TEntity> pageResult = query.toPageResult(pageIndex, pageSize);
            return new MyPageResult<>(pageResult.getTotal(), pageResult.getData());
        }
        //设置每次获取多少条
        long take = pageSize <= 0 ? 0 : pageSize;
        //设置当前页码最小1
        long index = pageIndex <= 0 ? 1 : pageIndex;
        //需要跳过多少条
        long offset = (index - 1) * take;
        List<TEntity> list = ((Query<TEntity>) query).limit(offset, take).toList();
        return new MyPageResult<>(-1, list);
    }

    public static <TEntity> SearchCountPager<TEntity> of(long pageIndex, long pageSize, boolean search){
        return new SearchCountPager<>(pageIndex,pageSize,search);
    }
}

```

### 查询count
```java

PageResult<Topic> pageResult = easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.title().like("123");
        }).toPageResult(SearchCountPager.of(1, 10, true));


==> Preparing: SELECT COUNT(*) FROM `t_topic` WHERE `title` LIKE ?
==> Parameters: %123%(String)
<== Time Elapsed: 3(ms)
<== Total: 1
==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `title` LIKE ? LIMIT 10
==> Parameters: %123%(String)
<== Time Elapsed: 2(ms)
<== Total: 10
```

### 不查询count
```java

PageResult<Topic> pageResult = easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.title().like("123");
        }).toPageResult(SearchCountPager.of(1, 10, false));



==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `title` LIKE ? LIMIT 10
==> Parameters: %123%(String)
<== Time Elapsed: 2(ms)
<== Total: 10
```

## 反向排序分页
当我们在使用分页查询的时候
具体原理看下图
<!-- <img src="/reverse.png"> -->
<img :src="$withBase('/images/reverse.png')">


### 配置项

配置名称  | 默认值 | 描述  
--- | --- | --- 
reverseOffsetThreshold| 0 | 反向排序偏移量阈值,比如设置为`10000`那么分页的时候如果offset>设置的值`10000`并且offset>(total*0.5)也就是查询偏移量超过了总数的一半那么会启用反向排序

编程式开启
```java

easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
        .setDefaultDataSource(dataSource)
        .optionConfigure(op -> {
            op.setReverseOffsetThreshold(10);
        })
        .useDatabaseConfigure(new MySQLDatabaseConfiguration())
        .build();
```

### 案例
案例我们可以知晓当我们的偏移量大于总数的一半且大于反排阈值10的时候那么`asc`会变成`desc`,然后深分页会变成浅分页
```java

EasyPageResult<Topic> pageResult = easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.id().isNotNull();
        }).orderBy(t_topic -> t_topic.createTime().asc()).toPageResult(7, 10);


==> Preparing: SELECT COUNT(*) FROM `t_topic` WHERE `id` IS NOT NULL
<== Time Elapsed: 3(ms)
<== Total: 1
==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` IS NOT NULL ORDER BY `create_time` DESC LIMIT 10 OFFSET 31
<== Time Elapsed: 3(ms)
<== Total: 10
```

### 运行时不启用反排
```java


EasyPageResult<Topic> pageResult = easyEntityQuery.queryable(Topic.class)
        .configure(op->{
            //设置不使用反排分页
            op.setReverseOrder(false);
        })
        .where(t_topic -> {
            t_topic.id().isNotNull();
        }).orderBy(t_topic -> t_topic.createTime().asc())
        .toPageResult(7, 10);


==> Preparing: SELECT COUNT(*) FROM `t_topic` WHERE `id` IS NOT NULL
<== Time Elapsed: 2(ms)
<== Total: 1
==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` IS NOT NULL ORDER BY `create_time` ASC LIMIT 10 OFFSET 60
<== Time Elapsed: 3(ms)
<== Total: 10
```