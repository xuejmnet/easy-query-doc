---
title: Large Data Stream Query Return❗️❗️❗️
order: 140
---
# Large Data Stream Query Return
`easy-query` provides large data stream return. For large data volume that cannot be obtained in memory at once, you can use this method to return the corresponding result set. Usually used for `excel` or some file writing functions, and supports sharding.

::: warning Note
> Need to use with Java 8's `try resource` or `try finally close` to close resources, and need to handle `SQLException` by yourself. Unlike `mybatis`, no need to start transaction during use.
> If you use MySQL or PostgreSQL, please check the issues at the bottom of the document.
> For MySQL database, you need to add configuration information `useCursorFetch=true` in the connection string by default, for example `jdbc:mysql://127.0.0.1:3306/eq_db?useCursorFetch=true`
> For PostgreSQL database, it needs to satisfy `fetchSize setting needs to be > 0`, `jdbc connection string cannot add preferQueryMode=simple`, `needs to set autocommit to false`
:::

::: tip Note
> If using toStreamResult this time, it will not support `include`, `fillMany` and `fillOne` APIs
:::

# toStreamResult

## API
Parameter  | Function | Description
--- | --- | --- 
fetchSize | Set the size of each fetch  | Used to prevent stream fetch from pulling too much data at once, users can set it themselves
`SQLConsumer<Statement>` | Set `statement` parameter properties  | Such as `fetchSize`, `fetchDirection`, etc.

## Case
```java

try(JdbcStreamResult<BlogEntity> streamResult = easyQuery.queryable(BlogEntity.class).where(o -> o.le(BlogEntity::getStar, 100)).orderByAsc(o -> o.column(BlogEntity::getCreateTime)).toStreamResult(1000)){

            LocalDateTime begin = LocalDateTime.of(2020, 1, 1, 1, 1, 1);
            int i = 0;
            for (BlogEntity blog : streamResult.getStreamIterable()) {
                String indexStr = String.valueOf(i);
                Assert.assertEquals(indexStr, blog.getId());
                Assert.assertEquals(indexStr, blog.getCreateBy());
                Assert.assertEquals(begin.plusDays(i), blog.getCreateTime());
                Assert.assertEquals(indexStr, blog.getUpdateBy());
                Assert.assertEquals(begin.plusDays(i), blog.getUpdateTime());
                Assert.assertEquals("title" + indexStr, blog.getTitle());
//            Assert.assertEquals("content" + indexStr, blog.getContent());
                Assert.assertEquals("http://blog.easy-query.com/" + indexStr, blog.getUrl());
                Assert.assertEquals(i, (int) blog.getStar());
                Assert.assertEquals(0, new BigDecimal("1.2").compareTo(blog.getScore()));
                Assert.assertEquals(i % 3 == 0 ? 0 : 1, (int) blog.getStatus());
                Assert.assertEquals(0, new BigDecimal("1.2").multiply(BigDecimal.valueOf(i)).compareTo(blog.getOrder()));
                Assert.assertEquals(i % 2 == 0, blog.getIsTop());
                Assert.assertEquals(i % 2 == 0, blog.getTop());
                Assert.assertEquals(false, blog.getDeleted());
                i++;
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `star` <= ? ORDER BY `create_time` ASC
==> Parameters: false(Boolean),100(Integer)
<== Time Elapsed: 6(ms)

```

# fetch

## API
Parameter  | Function | Description
--- | --- | --- 
`Function<Stream<T>,TR>` | Fetcher  | Used to return processed iteration results
fetchSize | Set the size of each fetch  | Used to prevent stream fetch from pulling too much data at once, users can set it themselves
`SQLConsumer<Statement>` | Set `statement` parameter properties  | Such as `fetchSize`, `fetchDirection`, etc.

## Case

```java
    Optional<Topic> traceId1 = easyProxyQuery.queryable(TopicProxy.createTable())
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)
                .where(o -> o.eq(o.t().id(), "1"))
                .streamBy(o -> {
                    return o.findFirst();
                },1);

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)

Set<Topic> traceId1 = easyProxyQuery.queryable(TopicProxy.createTable())
            .where(o -> o.eq(o.t().id(), "1"))
            .streamBy(o -> {
                return o.peek(x -> x.setTitle(traceId)).collect(Collectors.toSet());
            },100);

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 3(ms)

```

## Batch Consumption
Supported since `2.0.54^` version
```java

try(JdbcStreamResult<BlogEntity> streamResult = easyEntityQuery.queryable(BlogEntity.class).toStreamResult(1000)){
    //Consume 20 at a time
    streamResult.toChunk(20, blogs -> {
        Assert.assertTrue(blogs.size()<=20);
        //Process blogs
    });
}catch (SQLException e){
    throw new RuntimeException(e);
}
```
//Custom interruption
```java

try(JdbcStreamResult<BlogEntity> streamResult = easyEntityQuery.queryable(BlogEntity.class).toStreamResult(1000)){
    //Consume 20 at a time
    streamResult.toChunk(20, blogs -> {
        Assert.assertTrue(blogs.size()<=20);
        //Process blogs
        return false;//If need to interrupt
    });
}catch (SQLException e){
    throw new RuntimeException(e);
}
```

# Issues

## MySQL Not Working
https://blog.csdn.net/dkz97/article/details/116355022

## PostgreSQL Not Working
https://blog.csdn.net/dkz97/article/details/115643516

## Related Searches
`Stream Result` `Stream Query` `Iterator Return` `Cursor Query`

## chunk Batch Processing
Supported since `2.0.54^` version

`toChunk` supports include processing

Process all data:
```java

easyEntityQuery.queryable(BlogEntity.class)
        .orderBy(b -> {//Note that sorting should not have duplicates
            b.createTime().asc();
            b.id().asc();
        })
        .toChunk(20, blogs -> {//Consume 20 at a time
            Assert.assertTrue(blogs.size()<=20);
            //Process business blogs
        });
```
Custom interruption:
```java

easyEntityQuery.queryable(BlogEntity.class)
        .orderBy(b -> {//Note that sorting should not have duplicates
            b.createTime().asc();
            b.id().asc();
        })
        .toChunk(20, blogs -> {//Consume 20 at a time
            Assert.assertTrue(blogs.size()<=20);
            //Process business blogs

            return false;//If return false then no further processing
        });
```

