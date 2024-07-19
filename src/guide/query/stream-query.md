---
title: 大数据流式查询返回❗️❗️❗️
---
# 大数据流式查询返回
`easy-query`提供了大数据流式返回,针对大数据量的数据无法一次在内存中获取,那么可以通过使用当前方法返回对应的结果集,通常用于`excel`或者部分文件写入功能,并且支持分表分库


::: warning 注意
> 需要配合java8的`try resource`或者`try finally close`来关闭资源,并且需要自行处理`SQLException`,和`mybatis`不同的是期间无需开始事务也可以使用
> 如果您是mysql、pgsql那么请查看文档底部问题
> mysql数据库那么需要默认在连接字符串添加配置信息`useCursorFetch=true`,譬如`jdbc:mysql://127.0.0.1:3306/eq_db?useCursorFetch=true`
> pgsql数据库那么需要满足`fechSize设置需要 > 0`、`jdbc连接字符串不能加 preferQueryMode =simple`、`需要设置autocommit为false`
:::

::: tip 注意
> 如果本次采用toStreamResult那么将不会支持`include`和`fillMany`和`fillOne`的api
:::

# toStreamResult

## API
参数  | 作用 | 描述
--- | --- | --- 
fetchSize | 设置每次拉取的大小  | 用来放置流式拉取一次性拉取过多数据用户可以自行设置
`SQLConsumer<Statement>` | 设置`statement`的参数属性  | 比如`fetchSize`、`fetchDirection`等等

## 案例
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
参数  | 作用 | 描述
--- | --- | --- 
`Function<Stream<T>,TR>` | 拉取器  | 用来返回处理迭代结果
fetchSize | 设置每次拉取的大小  | 用来放置流式拉取一次性拉取过多数据用户可以自行设置
`SQLConsumer<Statement>` | 设置`statement`的参数属性  | 比如`fetchSize`、`fetchDirection`等等

## 案例

```java
    Optional<Topic> traceId1 = easyProxyQuery.queryable(TopicProxy.createTable())
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)
                .where(o -> o.eq(o.t().id(), "1"))
                .fetch(o -> {
                    return o.findFirst();
                },1);

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 2(ms)

Set<Topic> traceId1 = easyProxyQuery.queryable(TopicProxy.createTable())
            .where(o -> o.eq(o.t().id(), "1"))
            .fetch(o -> {
                return o.peek(x -> x.setTitle(traceId)).collect(Collectors.toSet());
            },100);

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
<== Time Elapsed: 3(ms)

```

## 分批消费
`2.0.5^`版本支持
```java

try(JdbcStreamResult<BlogEntity> streamResult = easyEntityQuery.queryable(BlogEntity.class).toStreamResult(1000)){
    //每20个一组消费
    streamResult.toChunk(20, blogs -> {
        Assert.assertTrue(blogs.size()<=20);
        //处理 blogs
    });
}catch (SQLException e){
    throw new RuntimeException(e);
}
```
//自定义中断
```java

try(JdbcStreamResult<BlogEntity> streamResult = easyEntityQuery.queryable(BlogEntity.class).toStreamResult(1000)){
    //每20个一组消费
    streamResult.toChunk(20, blogs -> {
        Assert.assertTrue(blogs.size()<=20);
        //处理 blogs
        return false;//如果需要中断
    });
}catch (SQLException e){
    throw new RuntimeException(e);
}
```

# 问题

## mysql不生效
https://blog.csdn.net/dkz97/article/details/116355022

## pgsql不生效
https://blog.csdn.net/dkz97/article/details/115643516

## 相关搜索
`流式结果` `流式查询` `迭代返回` `游标查询`

## chunk分批处理
`2.0.5^`版本支持

`toChunk`支持include处理

处理所有数据
```java

easyEntityQuery.queryable(BlogEntity.class)
        .orderBy(b -> {//注意排序不要出现重复即可
            b.createTime().asc();
            b.id().asc();
        })
        .toChunk(20, blogs -> {//每次消费20个
            Assert.assertTrue(blogs.size()<=20);
            //处理业务 blogs
        });
```
自定义中断
```java

easyEntityQuery.queryable(BlogEntity.class)
        .orderBy(b -> {//注意排序不要出现重复即可
            b.createTime().asc();
            b.id().asc();
        })
        .toChunk(20, blogs -> {//每次消费20个
            Assert.assertTrue(blogs.size()<=20);
            //处理业务 blogs

            return false;//如果返回false那么就不在后续处理了
        });
```