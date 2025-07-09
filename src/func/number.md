---
title: 数字函数
order: 30
---

## avg
对属性进行求平均值


参数  | 说明  
---  | --- 
distinct  | 是否需要重载

聚合函数`filter`支持额外操作隐式case when

```java
List<Draft3<BigDecimal, BigDecimal, BigDecimal>> blogs = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score().avg(),
                t_blog.score().avg(true),
                //只统计标题带[小说]字样的平均分数
                t_blog.score().avg().filter(() -> {
                    t_blog.title().like("小说");
                })
        )).toList();
```


## sum | sumInt | sumLong | sumBigDecimal
对属性进行求和

参数  | 说明  
---  | --- 
distinct  | 是否需要重载

聚合函数`filter`支持额外操作隐式case when

```java

List<Draft4<Number, Integer, Long, BigDecimal>> blogs = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score().sum(),
                t_blog.score().sumInt(true),
                t_blog.score().sumLong(true),
                //只统计标题带[小说]字样的总分数
                t_blog.score().sumBigDecimal().filter(() -> {
                    t_blog.title().like("小说");
                })
        )).toList();
```



## 加减乘除

加减乘除默认支持链式且会自动添加括号来支持用户表达式行为

::: waning 说明!!!
> 默认`add`函数返回的是`BigDecimal`相关的类型表达式所以需要用户自行`as`一下
> 默认`subtract`函数返回的是`BigDecimal`相关的类型表达式所以需要用户自行`as`一下
> 默认`multiply`函数返回的是`BigDecimal`相关的类型表达式所以需要用户自行`as`一下
> 默认`divide`函数返回的是`BigDecimal`相关的类型表达式所以需要用户自行`as`一下
:::

## add(加)
两个数字类型的求和

```java
     List<Draft4<BigDecimal, Integer, Long, BigDecimal>> list = easyEntityQuery.queryable(BlogEntity.class)
                    .select(t_blog -> Select.DRAFT.of(
                            t_blog.score().add(1),
                            t_blog.score().add(1).asInteger(),
                            t_blog.score().add(1).asLong(),
                            t_blog.score().add(t_blog.score())
                    )).toList();
```

## subtract(减)
两个数字类型的求差值

```java

List<Draft4<BigDecimal, Integer, Long, BigDecimal>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score().subtract(1),
                t_blog.score().subtract(1).asInteger(),
                t_blog.score().subtract(1).asLong(),
                t_blog.score().subtract(t_blog.score())
        )).toList();
```

## multiply(乘)
两个数字类型的求乘积

```java

List<Draft2<BigDecimal, BigDecimal>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score().multiply(2),
                t_blog.score().multiply(t_blog.score())
        )).toList();
```

## divide(除)
两个数字类型的相除

```java

List<Draft2<BigDecimal, BigDecimal>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score().divide(2),
                t_blog.score().divide(t_blog.score())
        )).toList();
```


## 数据库函数相关搜索
数据库加减乘除