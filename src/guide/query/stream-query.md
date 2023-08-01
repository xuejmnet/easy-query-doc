---
title: 大数据流式查询返回❗️❗️❗️
---
# 大数据流式查询返回
`easy-query`提供了大数据流式返回,针对大数据量的数据无法一次在内存中获取,那么可以通过使用当前方法返回对应的结果集,通常用于`excel`或者部分文件写入功能,并且支持分表分库


::: warning 注意
> 需要配合java8的`try resource`或者`try finally close`来关闭资源,并且需要自行处理`SQLException`,和`mybatis`不同的是期间无需开始事务也可以使用
:::

::: tip 注意
> 如果本次采用toStreamResult那么将不会支持`include`和`fillMany`和`fillOne`的api
:::



## 案例
```java

try(JdbcStreamResult<BlogEntity> streamResult = easyQuery.queryable(BlogEntity.class).where(o -> o.le(BlogEntity::getStar, 100)).orderByAsc(o -> o.column(BlogEntity::getCreateTime)).toStreamResult()){

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