---
title: 性能
order: 40
---
# easy-query「性能」对比

本文主要是展示了easy-query和 Mybatis-Flex 和 Mybaits-Plus 的「性能」对比。Mybaits-Plus 是一个非常优秀 Mybaits 增强框架，
其开源于 2016 年，有很多的成功案例。Mybatis-Flex是一款最新开源的高性能orm数据库

本文只阐述了「性能」方面的对比。

## 测试方法
使用 h2 数据库，在初始化的时候分别为easy-query和 mybatis-flex 和 mybatis-plus 创建三个不同的数据库， 但是完全一样的数据结构、数据内容和数据量（每个库 2w 条数据）。

开始之前先进行预热，之后通过打印时间戳的方式进行对比，谁消耗的时间越少，则性能越高（每次测试 10 轮）。

测试源码：
[https://github.com/xuejmnet/easy-query-benchmark](https://github.com/xuejmnet/easy-query-benchmark)

::: tip 测试说明
> 在以下的所有测试中，有可能因为每个人的电脑性能不同，测试的结果会有所不同。
:::

## 测试单条数据查询

Mybatis-Flex 的代码如下：

```java
QueryWrapper queryWrapper = new QueryWrapper();
queryWrapper.where(FLEX_ACCOUNT.ID.ge(100)
.or(FLEX_ACCOUNT.USER_NAME.eq("admin" + ThreadLocalRandom.current().nextInt(10000))));
mapper.selectOneByQuery(queryWrapper);
```
EasyQuery 的代码如下：

```java
easyQuery.queryable(EasyQueryAccount.class)
                .where(o->o.eq(EasyQueryAccount::getId,100)
                        .or()
                        .eq(EasyQueryAccount::getUserName,"admin" + ThreadLocalRandom.current().nextInt(10000)))
                .firstOrNull();
```

Mybatis-Plus 的代码如下：

```java
QueryWrapper queryWrapper = new QueryWrapper();
queryWrapper.ge("id", 100);
queryWrapper.or();
queryWrapper.eq("user_name", "admin" + ThreadLocalRandom.current().nextInt(10000));
queryWrapper.last("limit 1");
mapper.selectOne(queryWrapper);
```

10 轮的测试结果：

```
---------------
>>>>>>>testFlexSelectOne:46
>>>>>>>testEasySelectOne:42
>>>>>>>testPlusSelectOneWithLambda:355
>>>>>>>testPlusSelectOne:341
---------------
>>>>>>>testFlexSelectOne:41
>>>>>>>testEasySelectOne:38
>>>>>>>testPlusSelectOneWithLambda:335
>>>>>>>testPlusSelectOne:318
---------------
>>>>>>>testFlexSelectOne:41
>>>>>>>testEasySelectOne:34
>>>>>>>testPlusSelectOneWithLambda:362
>>>>>>>testPlusSelectOne:317
---------------
>>>>>>>testFlexSelectOne:41
>>>>>>>testEasySelectOne:43
>>>>>>>testPlusSelectOneWithLambda:302
>>>>>>>testPlusSelectOne:280
---------------
>>>>>>>testFlexSelectOne:36
>>>>>>>testEasySelectOne:31
>>>>>>>testPlusSelectOneWithLambda:293
>>>>>>>testPlusSelectOne:337
---------------
>>>>>>>testFlexSelectOne:35
>>>>>>>testEasySelectOne:32
>>>>>>>testPlusSelectOneWithLambda:272
>>>>>>>testPlusSelectOne:259
---------------
>>>>>>>testFlexSelectOne:44
>>>>>>>testEasySelectOne:32
>>>>>>>testPlusSelectOneWithLambda:273
>>>>>>>testPlusSelectOne:270
---------------
>>>>>>>testFlexSelectOne:35
>>>>>>>testEasySelectOne:29
>>>>>>>testPlusSelectOneWithLambda:259
>>>>>>>testPlusSelectOne:251
---------------
>>>>>>>testFlexSelectOne:31
>>>>>>>testEasySelectOne:31
>>>>>>>testPlusSelectOneWithLambda:254
>>>>>>>testPlusSelectOne:246
---------------
>>>>>>>testFlexSelectOne:30
>>>>>>>testEasySelectOne:34
>>>>>>>testPlusSelectOneWithLambda:251
>>>>>>>testPlusSelectOne:244
```

::: tip 测试结论
> Easy-Query和Mybatis-Flex 的查询单条数据的速度相当，大概是 Mybatis-Plus 的 5 ~ 10+ 倍。因为是查询单条数据所以可以近似理解为表达式生成sql的能力差距大概是5-10倍
:::

## 测试列表(List)数据查询

要求返回的数据为 10 条数据。

Mybatis-Flex 的代码如下：

```java
QueryWrapper queryWrapper = new QueryWrapper();
queryWrapper.where(FLEX_ACCOUNT.ID.ge(100).or(FLEX_ACCOUNT.USER_NAME
.eq("admin" + ThreadLocalRandom.current().nextInt(10000))))
.limit(10);
mapper.selectListByQuery(queryWrapper);
```
Easy-Query 的代码如下：

```java

easyQuery.queryable(EasyQueryAccount.class)
        .where(o->o.ge(EasyQueryAccount::getId,100)
                .or()
                .eq(EasyQueryAccount::getUserName,"admin" + ThreadLocalRandom.current().nextInt(10000)))
        .limit(10).toList();
```

Mybatis-Plus 的代码如下：

```java
QueryWrapper queryWrapper = new QueryWrapper();
queryWrapper.ge("id", 100);
queryWrapper.or();
queryWrapper.eq("user_name", "admin" + ThreadLocalRandom.current().nextInt(10000));
queryWrapper.last("limit 10");
mapper.selectList(queryWrapper);
```

10 轮的测试结果：

```
---------------
>>>>>>>testFlexSelectTop10:40
>>>>>>>testEasySelectTop10:37
>>>>>>>testPlusSelectTop10WithLambda:259
>>>>>>>testPlusSelectTop10:245
---------------
>>>>>>>testFlexSelectTop10:39
>>>>>>>testEasySelectTop10:33
>>>>>>>testPlusSelectTop10WithLambda:256
>>>>>>>testPlusSelectTop10:245
---------------
>>>>>>>testFlexSelectTop10:39
>>>>>>>testEasySelectTop10:34
>>>>>>>testPlusSelectTop10WithLambda:249
>>>>>>>testPlusSelectTop10:238
---------------
>>>>>>>testFlexSelectTop10:39
>>>>>>>testEasySelectTop10:32
>>>>>>>testPlusSelectTop10WithLambda:248
>>>>>>>testPlusSelectTop10:238
---------------
>>>>>>>testFlexSelectTop10:38
>>>>>>>testEasySelectTop10:32
>>>>>>>testPlusSelectTop10WithLambda:249
>>>>>>>testPlusSelectTop10:237
---------------
>>>>>>>testFlexSelectTop10:40
>>>>>>>testEasySelectTop10:29
>>>>>>>testPlusSelectTop10WithLambda:243
>>>>>>>testPlusSelectTop10:243
---------------
>>>>>>>testFlexSelectTop10:37
>>>>>>>testEasySelectTop10:29
>>>>>>>testPlusSelectTop10WithLambda:247
>>>>>>>testPlusSelectTop10:244
---------------
>>>>>>>testFlexSelectTop10:36
>>>>>>>testEasySelectTop10:29
>>>>>>>testPlusSelectTop10WithLambda:248
>>>>>>>testPlusSelectTop10:244
---------------
>>>>>>>testFlexSelectTop10:35
>>>>>>>testEasySelectTop10:27
>>>>>>>testPlusSelectTop10WithLambda:245
>>>>>>>testPlusSelectTop10:245
---------------
>>>>>>>testFlexSelectTop10:34
>>>>>>>testEasySelectTop10:25
>>>>>>>testPlusSelectTop10WithLambda:247
>>>>>>>testPlusSelectTop10:239

```

::: tip 测试结论
> 本次查询10条的情况下可以看到Easy-Query已经略微快于Mybatis-Flex,依然是 Mybatis-Plus 的 5 ~ 10+ 倍
:::


## 测试列表(List1W)数据查询

要求返回的数据为 10000 条数据。

Mybatis-Flex 的代码如下：

```java
QueryWrapper queryWrapper = new QueryWrapper();
queryWrapper.where(FLEX_ACCOUNT.ID.ge(100).or(FLEX_ACCOUNT.USER_NAME
.eq("admin" + ThreadLocalRandom.current().nextInt(10000))))
.limit(10000);
mapper.selectListByQuery(queryWrapper);
```
Easy-Query 的代码如下：

```java

easyQuery.queryable(EasyQueryAccount.class)
        .where(o->o.ge(EasyQueryAccount::getId,100)
                .or()
                .eq(EasyQueryAccount::getUserName,"admin" + ThreadLocalRandom.current().nextInt(10000)))
        .limit(10000).toList();
```

Mybatis-Plus 的代码如下：

```java
QueryWrapper queryWrapper = new QueryWrapper();
queryWrapper.ge("id", 100);
queryWrapper.or();
queryWrapper.eq("user_name", "admin" + ThreadLocalRandom.current().nextInt(10000));
queryWrapper.last("limit 10000");
mapper.selectList(queryWrapper);
```

10 轮的测试结果：

```
---------------
>>>>>>>testFlexSelectTop10000:12812
>>>>>>>testEasySelectTop10000:3981
>>>>>>>testPlusSelectTop10000WithLambda:7821
>>>>>>>testPlusSelectTop10000:7807
---------------
>>>>>>>testFlexSelectTop10000:12806
>>>>>>>testEasySelectTop10000:3965
>>>>>>>testPlusSelectTop10000WithLambda:7794
>>>>>>>testPlusSelectTop10000:7798
---------------
>>>>>>>testFlexSelectTop10000:12759
>>>>>>>testEasySelectTop10000:3977
>>>>>>>testPlusSelectTop10000WithLambda:7851
>>>>>>>testPlusSelectTop10000:7780
---------------
>>>>>>>testFlexSelectTop10000:12779
>>>>>>>testEasySelectTop10000:3964
>>>>>>>testPlusSelectTop10000WithLambda:7803
>>>>>>>testPlusSelectTop10000:7805
---------------
>>>>>>>testFlexSelectTop10000:12969
>>>>>>>testEasySelectTop10000:3984
>>>>>>>testPlusSelectTop10000WithLambda:7856
>>>>>>>testPlusSelectTop10000:7780
---------------
>>>>>>>testFlexSelectTop10000:12743
>>>>>>>testEasySelectTop10000:3974
>>>>>>>testPlusSelectTop10000WithLambda:7784
>>>>>>>testPlusSelectTop10000:7772
---------------
>>>>>>>testFlexSelectTop10000:12662
>>>>>>>testEasySelectTop10000:3969
>>>>>>>testPlusSelectTop10000WithLambda:7776
>>>>>>>testPlusSelectTop10000:7745
---------------
>>>>>>>testFlexSelectTop10000:12721
>>>>>>>testEasySelectTop10000:3985
>>>>>>>testPlusSelectTop10000WithLambda:7790
>>>>>>>testPlusSelectTop10000:7755
---------------
>>>>>>>testFlexSelectTop10000:12731
>>>>>>>testEasySelectTop10000:3953
>>>>>>>testPlusSelectTop10000WithLambda:7762
>>>>>>>testPlusSelectTop10000:7751
---------------
>>>>>>>testFlexSelectTop10000:12728
>>>>>>>testEasySelectTop10000:3975
>>>>>>>testPlusSelectTop10000WithLambda:7759
>>>>>>>testPlusSelectTop10000:7771

```

::: tip 测试结论
> 本次查询10000条的情况下可以看到Easy-Query已经完全快于Mybatis-Flex大概是其3倍,是 Mybatis-Plus 的2 倍,本次结果可以得出Mybatis-Flex的优点是快速生成sql,但是在jdbc到bean对象的转换是相对低效的
:::

## 分页查询


Mybatis-Flex 的代码如下：

```java
QueryWrapper queryWrapper = new QueryWrapper()
    .where(FLEX_ACCOUNT.ID.ge(100));
mapper.paginate(page, pageSize, 20000, queryWrapper);
```

Easy-Query 的代码如下：

```java

easyQuery.queryable(EasyQueryAccount.class)
        .where(o-> o.ge(EasyQueryAccount::getId,100))
        .toPageResult(page,pageSize,20000);
```
Mybatis-Plus 的代码如下：

```java
LambdaQueryWrapper<PlusAccount> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.ge(PlusAccount::getId, 100);
    queryWrapper.eq(PlusAccount::getEmail, "michael@gmail.com");
Page<PlusAccount> p = Page.of(page, pageSize, 20000, false);
mapper.selectPage(p, queryWrapper);
```

10 轮的测试结果：

```
---------------
>>>>>>>testFlexPaginate:41
>>>>>>>testEasyPaginate:21
>>>>>>>testPlusPaginate:246
---------------
>>>>>>>testFlexPaginate:39
>>>>>>>testEasyPaginate:20
>>>>>>>testPlusPaginate:243
---------------
>>>>>>>testFlexPaginate:35
>>>>>>>testEasyPaginate:20
>>>>>>>testPlusPaginate:239
---------------
>>>>>>>testFlexPaginate:33
>>>>>>>testEasyPaginate:19
>>>>>>>testPlusPaginate:236
---------------
>>>>>>>testFlexPaginate:32
>>>>>>>testEasyPaginate:18
>>>>>>>testPlusPaginate:234
---------------
>>>>>>>testFlexPaginate:32
>>>>>>>testEasyPaginate:18
>>>>>>>testPlusPaginate:235
---------------
>>>>>>>testFlexPaginate:31
>>>>>>>testEasyPaginate:18
>>>>>>>testPlusPaginate:238
---------------
>>>>>>>testFlexPaginate:31
>>>>>>>testEasyPaginate:18
>>>>>>>testPlusPaginate:233
---------------
>>>>>>>testFlexPaginate:32
>>>>>>>testEasyPaginate:18
>>>>>>>testPlusPaginate:232
---------------
>>>>>>>testFlexPaginate:31
>>>>>>>testEasyPaginate:18
>>>>>>>testPlusPaginate:232
```

::: tip 测试结论
> 分页查询速度 Easy-Query快于Mybatis-Flex 远快于 Mybatis-Plus ，大概是 Mybatis-Plus 的 5~10 倍左右。
:::



## 数据更新


Mybatis-Flex 的代码如下：

```java
FlexAccount flexAccount = new FlexAccount();
flexAccount.setUserName("testInsert" + i);
flexAccount.setNickname("testInsert" + i);

QueryWrapper queryWrapper = QueryWrapper.create()
    .where(FLEX_ACCOUNT.ID.ge(9200))
    .and(FLEX_ACCOUNT.ID.le(9300))
    .and(FLEX_ACCOUNT.USER_NAME.like("admin"))
    .and(FLEX_ACCOUNT.NICKNAME.like("admin"));

mapper.updateByQuery(flexAccount, queryWrapper);
```


Easy-Query 的代码如下：

```java
easyQuery.updatable(EasyQueryAccount.class)
                .set(EasyQueryAccount::getUserName,"testInsert" + i)
                .set(EasyQueryAccount::getNickname,"testInsert" + i)
                .where(o->o.ge(EasyQueryAccount::getId,9000).le(EasyQueryAccount::getId,9100)
                        .like(EasyQueryAccount::getUserName,"admin")
                        .like(EasyQueryAccount::getNickname,"admin"))
                .executeRows();
```

Mybatis-Plus 的代码如下：

```java
PlusAccount plusAccount = new PlusAccount();
plusAccount.setUserName("testInsert" + i);
plusAccount.setNickname("testInsert" + i);

LambdaUpdateWrapper<PlusAccount> updateWrapper = new LambdaUpdateWrapper<>();
updateWrapper.ge(PlusAccount::getId, 9000);
updateWrapper.le(PlusAccount::getId, 9100);
updateWrapper.like(PlusAccount::getUserName, "admin");
updateWrapper.like(PlusAccount::getNickname, "admin");

mapper.update(plusAccount, lambdaUpdateWrapper);
```

10 轮的测试结果：

```
---------------
>>>>>>>testFlexUpdate:38
>>>>>>>testEasyUpdate:30
>>>>>>>testPlusUpdate:196
---------------
>>>>>>>testFlexUpdate:29
>>>>>>>testEasyUpdate:24
>>>>>>>testPlusUpdate:183
---------------
>>>>>>>testFlexUpdate:27
>>>>>>>testEasyUpdate:22
>>>>>>>testPlusUpdate:187
---------------
>>>>>>>testFlexUpdate:27
>>>>>>>testEasyUpdate:21
>>>>>>>testPlusUpdate:180
---------------
>>>>>>>testFlexUpdate:25
>>>>>>>testEasyUpdate:20
>>>>>>>testPlusUpdate:187
---------------
>>>>>>>testFlexUpdate:24
>>>>>>>testEasyUpdate:20
>>>>>>>testPlusUpdate:183
---------------
>>>>>>>testFlexUpdate:27
>>>>>>>testEasyUpdate:20
>>>>>>>testPlusUpdate:180
---------------
>>>>>>>testFlexUpdate:23
>>>>>>>testEasyUpdate:21
>>>>>>>testPlusUpdate:176
---------------
>>>>>>>testFlexUpdate:24
>>>>>>>testEasyUpdate:19
>>>>>>>testPlusUpdate:179
---------------
>>>>>>>testFlexUpdate:21
>>>>>>>testEasyUpdate:23
>>>>>>>testPlusUpdate:177
```

::: tip 测试结论
> 数据更新速度Easy-Query快于Mybatis-Flex 远快于 Mybatis-Plus，大概是 Mybatis-Plus 的 5~10+ 倍。
:::

## 更多的测试

想进一步进行更多测试的同学，可以到 [https://github.com/xuejmnet/easy-query-benchmark](https://github.com/xuejmnet/easy-query-benchmark)
下载源码后，添加其他方面的测试。
