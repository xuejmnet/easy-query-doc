---
title: Filter Objects
order: 11
---

# Filter Objects
`eq` provides rich expression support for object relationship path filtering and collection filtering.

Get users whose names contain `zhang san`:
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(m -> {
            //If you use like, you need to handle the percent sign and underscore in parameters yourself
            m.name().contains("zhang san");
            m.age().gt(20);

            //Native SQL assertion
            m.expression().sql("{0} != {1}",c->{
                c.expression(m.name());
                c.value("XiaoMing");
            });

            //The following are dynamic conditions
            if(true/false){
                m.name().contains("zhang san");
            }
            //Both methods above work

            m.name().contains(true/false,"zhang san");
        }).toList();


//If parameters might be null causing NPE, use dynamic where
List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(true/false,m -> {//The entire where expression executes or not
            m.name().contains("zhang san");
            m.age().gt(20);
        }).toList();
```

If there are many parameters and common business pagination queries, you can use `filterConfigure`:

```java

String name="zhang san";
Integer age=null;
List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)//Can implement custom filter, parameters that are null or empty won't participate in business logic
        .where(m -> {
            m.name().contains(name);
            m.age().gt(age);
        }).toList();
```

::: tip Global Configuration!!!
> If users want to use the default value filter mode globally, they can replace the system interface `ValueFilterFactory` to implement [Default Behavior Replacement](/en/easy-query-doc/framework/replace-configure). It's only recommended to override the `getQueryValueFilter` method here.
:::

# Implicit Filtering
`Implicit filtering` or `Path filtering`: When a property is associated with other entities (such as OneToOne, OneToMany, ManyToOne, ManyToMany relationships), we can access these properties through "paths" and add legal expressions. We call these properties navigation properties. Navigation properties mainly include two types: one is `object` and the other is `collection`.

## Implicit Object Filtering
When associated properties are objects, you can filter directly through the property path:
```java
List<SysBankCard> list = easyEntityQuery.queryable(SysBankCard.class)
        .where(bank_card -> {
            bank_card.bank().name().like("ICBC");//If condition doesn't take effect, no join will occur
        }).toList();



    SELECT
        t.`id`,
        t.`uid`,
        t.`code`,
        t.`type`,
        t.`bank_id`,
        t.`open_time` 
    FROM
        `t_bank_card` t 
    INNER JOIN
        `t_bank` t1 
            ON t1.`id` = t.`bank_id` 
    WHERE
        t1.`name` LIKE '%ICBC%'
```
::: tip Note!!!
> Currently, when using object for associated properties, `leftJoin` is used by default. If you can ensure the target property definitely exists, add `required=true` to the associated property and the system will use `innerJoin` to ensure consistency. For details, refer to [Performance Chapter](/en/easy-query-doc/performance/implicit-join)
:::

## Implicit Collection Filtering
When associated properties are collections, you can filter the collection additionally to ensure data accuracy:
```java
//Filter banks, the condition is that the bank owns at least one savings card, any means satisfying any one
List<SysBank> banks = easyEntityQuery.queryable(SysBank.class)
        .where(bank -> {
            //Collection bankCards has any item satisfying type = Savings Card
            bank.bankCards().any(card -> {
                card.type().eq("Savings Card");
            });
        }).toList();


//When there's only one condition, you can use flatElement to expand the collection, principle is also any
List<SysBank> banks = easyEntityQuery.queryable(SysBank.class)
        .where(bank -> {
            bank.bankCards().flatElement().type().eq("Savings Card");
        }).toList();



    SELECT
        t.`id`,
        t.`name`,
        t.`create_time` 
    FROM
        `t_bank` t 
    WHERE
        EXISTS (SELECT
            1 FROM `t_bank_card` t1 
        WHERE
            t1.`bank_id` = t.`id` 
            AND t1.`type` = 'Savings Card' 
        LIMIT
            1)
```

::: tip Note!!!
> When there are too many collection properties to filter or multiple collection filter calls, it will generate multiple subqueries causing performance degradation. It's recommended to [refer to the performance chapter](/en/easy-query-doc/performance/implicit-subquery-group-join)
:::

## Condition Comparison

Method  | SQL | Description  
--- | --- | --- 
gt | >  | Column greater than value
ge | >=  | Column greater than or equal to value
eq | =  | Column equals value
ne | <>  | Column not equal to value
le | <=  | Column less than or equal to value
lt | < | Column less than value
likeMatchLeft | like word%  | Column left match
likeMatchRight | like %word  | Column right match
like | like %word%  | Column contains value
notLikeMatchLeft | not like word%  | Column not match left
notLikeMatchRight | not like %word  | Column not match right
notLike | not like %word%  | Column not contains value
startsWith | like word%  | Column left match
endsWith | like %word  | Column right match
contains | like %word%  | Column contains value
isNull | is null  | Column is null
isNotNull | is not null  | Column is not null
isEmpty | -  | Column is empty
isNotEmpty | -  | Column is not empty
isBlank | -  | Column is empty including empty string
isNotBlank| -  | Column is not empty including empty string
in | in  | Column in collection, returns False if collection is empty
notIn | not in  | Column not in collection, returns True if collection is empty
rangeOpenClosed | < x <=  | Interval (left..right] = {x \| left < x <= right} Generally used for ranges like time, smaller time first then larger time
rangeOpen | < x <  | Interval (left..right) = {x \| left < x < right} Generally used for ranges like time, smaller time first then larger time
rangeClosedOpen | <= x <  | [left..right) = {x \| left <= x < right} Generally used for ranges like time, smaller time first then larger time
rangeClosed | <= x <=  | \[left..right\] = {x \| left <= x <= right} Generally used for ranges like time, smaller time first then larger time
exists | exists  | Using subquery queryable
notExists | not exists  | Using subquery queryable

## Implicit Subquery Collection Methods

Method  | Parameter  | Function 
---  | ---  | --- 
any  | Condition expression | Determines if at least one item in the collection satisfies the assertion condition
none  | Condition expression | Determines if none of the items in the collection satisfy the assertion condition
all  | Condition expression | Determines if the collection before the all function satisfies the all standard (for empty collection, all assertion is always true)
count | None or column | No parameter means get the count of filtered collection or count of corresponding column
sum | Column | Means get the sum of filtered collection's corresponding column
avg | Column | Means get the average of filtered collection's corresponding column
max | Column | Means get the maximum of filtered collection's corresponding column
min | Column | Means get the minimum of filtered collection's corresponding column
joining | Column | Means get the combination of filtered collection's corresponding column separated by commas
where | Condition expression | Means get the filtered collection
distinct | None | Means get distinct sum count avg etc of filtered collection
first | None | Means get the first item of filtered collection
element | Index | Means get the nth item of filtered collection, n is the index parameter
elements | Index range | Means get the collection within the index range of filtered collection
anyValue | None | Means get whether filtered collection exists, returns boolean
noneValue | None | Means get whether filtered collection doesn't exist, returns boolean
orderBy | Sort expression | Means sort the filtered collection

# Condition Combination AND and OR
Using condition and and or in where is a very common method to combine multiple conditions to filter data results. However, we need to explain this API in two parts: one for `EasyEntityQuery` and the other for `EasyQueryClient`.

# EntityQuery's OR
Simply put, `or` internally uses `or` to connect, `and` internally uses `and` to connect, `where` and `join on` default to `and`:
```java

List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(o -> {
                o.id().eq("2" );
                o.id().eq("3" );
                o.or(() -> {
                        o.id().eq("4" );
                        o.id().eq("5" );
                });
        })
        .toList();


SELECT
    `id`,
    `create_time`,
    `update_time`,
    `create_by`,
    `update_by`,
    `deleted`,
    `title`,.....
FROM
    `t_blog` 
WHERE
    `deleted` = false 
    AND `id` = '2' 
    AND `id` = '3' 
    AND (
        `id` = '4' 
        OR `id` = '5'
    )
```

```java




        List<Topic> list = easyEntityQuery.queryable(Topic.class)
                .where(o -> {
                    o.title().ne("title0");//==0
                    o.or(()->{
                        o.title().eq("1");
                        o.title().eq("2");
                        o.title().eq("3");
                        o.and(()->{
                            o.title().eq("4");
                            o.title().eq("5");
                            o.title().eq("6");
                            o.or(()->{
                                o.title().eq("7");
                                o.title().eq("8");
                                o.title().eq("9");
                            });
                            o.title().eq("10");
                            o.title().eq("11");
                            o.title().eq("12");
                        });

                        o.title().eq("13");
                        o.title().eq("14");
                        o.title().eq("15");
                    });
                })
                .toList();

Through the expression you can see that the direct relationships inside or are conditions 1,2,3, one and block and 13,14,15 all connected by or
SELECT
    `id`,
    `stars`,
    `title`,
    `create_time` 
FROM
    `t_topic` 
WHERE
    `title` <> 'title0' 
    AND (
        `title` = '1' 
        OR `title` = '2' 
        OR `title` = '3' 
        OR (
            `title` = '4' 
            AND `title` = '5' 
            AND `title` = '6' 
            AND (
                `title` = '7' 
                OR `title` = '8' 
                OR `title` = '9'
            ) 
            AND `title` = '10' 
            AND `title` = '11' 
            AND `title` = '12'
        ) 
        OR `title` = '13' 
        OR `title` = '14' 
        OR `title` = '15'
    )
```

# Non-EntityQuery OR Condition Query
`where` provides `and` and `or` keywords by default and provides generic versions, so users can combine corresponding conditions through `and` and `or`. Conditions are connected by and by default.

- `and(()->{condition})` means `and` internal conditions are wrapped in parentheses, and the relationship with the previous condition is `AND`
- `or(()->{condition})` means `or` internal conditions are wrapped in parentheses, and the relationship with the previous condition is `OR`

## Examples
If `and` internally uses `or` to connect, then `and` can be viewed as parentheses `(....or....or....)`:
```java
Topic topic = easyQueryClient.queryable(Topic.class)
                .where(o -> o.eq("id", "1").and(() -> {
                            o.like("title", "Hello")
                                .or()
                                .eq("title", "I'm title")
                                .or()
                                .le("createTime", LocalDateTime.now());
                        })).firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? AND (`title` LIKE ? OR `title` = ? OR `create_time` <= ?) LIMIT 1
==> Parameters: 1(String),%Hello%(String),I'm title(String),2023-07-05T06:25:17.356(LocalDateTime)
<== Time Elapsed: 4(ms)
<== Total: 1
```

Without `and`, all using `or`, with where as a unit, they will be combined with and:
```java
List<Topic> topic2 = easyQueryClient.queryable(Topic.class)
                .where(o -> o.like("title", "Hello")
                        .or()
                        .eq("title", "I'm title")
                        .or()
                        .le("createTime", LocalDateTime.now())).toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE (`title` LIKE ? OR `title` = ? OR `create_time` <= ?)
==> Parameters: %Hello%(String),I'm title(String),2023-07-05T06:30:24.572(LocalDateTime)
<== Time Elapsed: 2(ms)
<== Total: 43
```
Combination with logical delete:
```java
BlogEntity blog = easyQueryClient.queryable(BlogEntity.class)
                .where(o -> o.eq("id", "1").and(() ->{
                     o.like("title", "Hello")
                                .or()
                                .eq("title", "I'm title")
                                .or()
                                .le("createTime", LocalDateTime.now());
                })).firstOrNull();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `id` = ? AND (`title` LIKE ? OR `title` = ? OR `create_time` <= ?) LIMIT 1
==> Parameters: false(Boolean),1(String),%Hello%(String),I'm title(String),2023-07-05T06:33:07.090(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1


BlogEntity blog1 = easyQueryClient.queryable(BlogEntity.class)
        .where(o -> o.like("title", "Hello")
                .or()
                .eq("title", "I'm title")
                .or()
                .le("createTime", LocalDateTime.now())).firstOrNull();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND (`title` LIKE ? OR `title` = ? OR `create_time` <= ?) LIMIT 1
==> Parameters: false(Boolean),%Hello%(String),I'm title(String),2023-07-05T06:34:07.310(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1
```

Multiple `and` connected by `or`:
```java
Topic topic3 = easyQueryClient.queryable(Topic.class)
                .where(o -> o.eq("id", "1").or(
                        () -> o.like("title", "Hello")
                                .eq("title", "I'm title")
                                .le("createTime", LocalDateTime.now())
                )).firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE (`id` = ? OR (`title` LIKE ? AND `title` = ? AND `create_time` <= ?)) LIMIT 1
==> Parameters: 1(String),%Hello%(String),I'm title(String),2023-07-05T06:35:32.079(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 1
```

Multi-column `or` condition fuzzy search, passing in `List<String>` name collection, need to query topic id and title containing results:

```java

List<String> searchValues = Arrays.asList("1", "XiaoMing", "XiaoHong");
List<Topic> list = easyQueryClient
        .queryable(Topic.class)
        .where(o -> o.isBank("id"))
        .where(o -> {
                for (String searchValue : searchValues) {
                o.and(() -> { //Each and represents a parenthesis, inside the parentheses use or to connect
                        o.like("id", searchValue)
                                .or().like("title", searchValue);
                });
                }
        })
        .toList();


==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE IFNULL(`id`,?) = ? AND (`id` LIKE ? OR `title` LIKE ?) AND (`id` LIKE ? OR `title` LIKE ?) AND (`id` LIKE ? OR `title` LIKE ?)
==> Parameters: (String),(String),%1%(String),%1%(String),%XiaoMing%(String),%XiaoMing%(String),%XiaoHong%(String),%XiaoHong%(String)
<== Time Elapsed: 53(ms)
<== Total: 0
```

