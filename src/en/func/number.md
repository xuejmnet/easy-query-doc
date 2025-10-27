---
title: Number Functions
order: 30
---

## avg
Calculate the average value of a property


Parameter  | Description  
---  | --- 
distinct  | Whether deduplication is needed

Aggregate function `filter` supports additional operations with implicit case when

```java
List<Draft3<BigDecimal, BigDecimal, BigDecimal>> blogs = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score().avg(),
                t_blog.score().avg(true),
                //Only calculate average score for titles containing "novel"
                t_blog.score().avg().filter(() -> {
                    t_blog.title().like("小说");
                })
        )).toList();
```


## sum | sumInt | sumLong | sumBigDecimal
Calculate the sum of properties

Parameter  | Description  
---  | --- 
distinct  | Whether deduplication is needed

Aggregate function `filter` supports additional operations with implicit case when

```java

List<Draft4<Number, Integer, Long, BigDecimal>> blogs = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score().sum(),
                t_blog.score().sumInt(true),
                t_blog.score().sumLong(true),
                //Only calculate total score for titles containing "novel"
                t_blog.score().sumBigDecimal().filter(() -> {
                    t_blog.title().like("小说");
                })
        )).toList();
```



## Addition, Subtraction, Multiplication and Division

Addition, subtraction, multiplication and division support chaining by default and will automatically add parentheses to support user expression behavior

::: warning Notice!!!
> By default, the `add` function returns a `BigDecimal` related type expression, so users need to `as` it themselves
> By default, the `subtract` function returns a `BigDecimal` related type expression, so users need to `as` it themselves
> By default, the `multiply` function returns a `BigDecimal` related type expression, so users need to `as` it themselves
> By default, the `divide` function returns a `BigDecimal` related type expression, so users need to `as` it themselves
:::

## add (Addition)
Sum of two number types

```java
     List<Draft4<BigDecimal, Integer, Long, BigDecimal>> list = easyEntityQuery.queryable(BlogEntity.class)
                    .select(t_blog -> Select.DRAFT.of(
                            t_blog.score().add(1),
                            t_blog.score().add(1).asInteger(),
                            t_blog.score().add(1).asLong(),
                            t_blog.score().add(t_blog.score())
                    )).toList();
```

## subtract (Subtraction)
Difference between two number types

```java

List<Draft4<BigDecimal, Integer, Long, BigDecimal>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score().subtract(1),
                t_blog.score().subtract(1).asInteger(),
                t_blog.score().subtract(1).asLong(),
                t_blog.score().subtract(t_blog.score())
        )).toList();
```

## multiply (Multiplication)
Product of two number types

```java

List<Draft2<BigDecimal, BigDecimal>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score().multiply(2),
                t_blog.score().multiply(t_blog.score())
        )).toList();
```

## divide (Division)
Division of two number types

```java

List<Draft2<BigDecimal, BigDecimal>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score().divide(2),
                t_blog.score().divide(t_blog.score())
        )).toList();
```


## Database Function Related Search
Database addition subtraction multiplication division

