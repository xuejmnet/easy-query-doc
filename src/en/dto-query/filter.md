---
title: DTO Filter
order: 10
---

## DTO Filter
Convert frontend requests into Java objects and pass them to the API to filter expressions, simplifying many repetitive query conditions when users write form submissions. By default, flat properties are supported. Add multi-level navigation on flat request object properties, such as `@EasyWhereCondition(propName = "bankCards.code")`. If `ToMany` is encountered, the query will be converted to a subquery and the same navigation node will be merged. If it is `ToOne`, it will be converted to `join`, consistent with user-written DSL by default.

## API

| Method | Description |
| ------------------------------ | ---------------------------- |
| `whereObject(Object)` | Pass in an object to implement where generation after parsing the current object to filter result set |

## Default Behavior
The framework provides the `@EasyWhereCondition` annotation with a default behavior of `like`. Users can modify the default behavior to `like` or `contains` through the `defaultCondition` configuration item. The difference is that `like` treats the user's percent sign `%` as a wildcard, while `contains` treats the percent sign `%` as part of the searched content.

## EasyWhereCondition Annotation
| Property | Default | Description |
| ----------------- | ------ | ----------------------------------------------------------------------------------------- |
| strict | true | Strict mode, error if property is not mapped to object, also error if table `tableIndex` is not in current context |
| tableIndex | 0 | Which table the current condition is used to query |
| allowEmptyStrings | false | Whether to allow empty strings, if allowed it means empty will also be added to expression instead of being ignored |
| propName | "" | The property name mapped to the database object for the current property, empty means using the current property name, supports implicit join and implicit subquery |
| type | LIKE | Which expression to build conditions with between the current property and database object property, supports setting default behavior when building eq instance |
| mode | SINGLE | `SINGLE`: represents current property is one-to-one database column, `MULTI_OR`: represents current value to multiple database columns connected with or |
| propNames | [] | Which property columns the current property maps to, for example if frontend passes `keyword` field that needs to search `name` or `idCard`, you can use this property with `mode=MULIT_OR` |
| tablesIndex | [] | Can be different length from propNames, different means 0 main table |

::: warning Note!!!

> Properties support like by default, you can specify conditions. If the query property is inconsistent with the database object property, you can rewrite it through `propName`
> 
:::



```java

@Data
public class BlogQuery2Request {

    /**
     * Title
     */
    @EasyWhereCondition
    private String title;
    /**
     * Content
     */
    @EasyWhereCondition
    private String content;
    /**
     * Stars
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.EQUAL)
    private Integer star;
    /**
     * Publish time
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_LEFT_CLOSED,propName = "publishTime")
    private LocalDateTime publishTimeBegin;
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_RIGHT_CLOSED,propName = "publishTime")
    private LocalDateTime publishTimeEnd;
    /**
     * Score
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.GREATER_THAN_EQUAL)
    private BigDecimal score;
    /**
     * Status
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.LESS_THAN_EQUAL)
    private Integer status;
    /**
     * Order
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.GREATER_THAN)
    private BigDecimal order;
    /**
     * Is top
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.NOT_EQUAL)
    private Boolean isTop;
    /**
     * statusList doesn't have a corresponding property name so it needs to be rewritten to map to status
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.IN,propName = "status")
    private List<Integer> statusList=new ArrayList<>();
    /**
     * statusNotList doesn't have a corresponding property name so it needs to be rewritten to map to status
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.NOT_IN,propName = "status")
    private List<Integer> statusNotList=new ArrayList<>();
}
```

## Dynamic Query Condition 1

```java

 BlogQuery2Request query = new BlogQuery2Request();
query.setOrder(BigDecimal.valueOf(1));
query.setContent("Title");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class)
        .whereObject(query).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` >= ? AND `publish_time` <= ? AND `order` = ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%Title%(String),2023-07-14T22:37:47.865(LocalDateTime),2023-07-14T22:37:47.865(LocalDateTime),1(BigDecimal),1(Integer),2(Integer)
<== Time Elapsed: 4(ms)
<== Total: 0



BlogQuery2Request query = new BlogQuery2Request();
query.setContent("Title");
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class)
        .whereObject(query).toList();


==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%Title%(String),2023-07-14T22:37:47.880(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 2(ms)
<== Total: 0
```

## Property One-to-Many Query

One property of object corresponds to multiple columns of database query

```java

@Data
public class BlogQueryRequest implements ObjectSort {

    /**
     * Title
     */
    @EasyWhereCondition
    private String title;
    /**
     * Title2
     */
    @EasyWhereCondition(mode = EasyWhereCondition.Mode.MULTI_OR,propNames = {"title","content"})
    private String title2;
    /**
     * Title3
     */
    @EasyWhereCondition(mode = EasyWhereCondition.Mode.MULTI_OR,propNames = {"id","content"},type = EasyWhereCondition.Condition.EQUAL)
    private String title3;
    /**
     * Content
     */
    @EasyWhereCondition(propName = "url")
    private String content;
    /**
     * Stars
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.EQUAL)
    private Integer star;
    /**
     * Publish time
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_LEFT_CLOSED,propName = "publishTime")
    private LocalDateTime publishTimeBegin;
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_RIGHT_CLOSED,propName = "publishTime")
    private LocalDateTime publishTimeEnd;
    /**
     * Score
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.GREATER_THAN_EQUAL)
    private BigDecimal score;
    /**
     * Status
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.LESS_THAN_EQUAL)
    private Integer status;
    /**
     * Order
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.GREATER_THAN)
    private BigDecimal order;
    /**
     * Is top
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.NOT_EQUAL)
    private Boolean isTop;
    @EasyWhereCondition(type = EasyWhereCondition.Condition.IN,propName = "status")
    private List<Integer> statusList=new ArrayList<>();
    @EasyWhereCondition(type = EasyWhereCondition.Condition.NOT_IN,propName = "status")
    private List<Integer> statusNotList=new ArrayList<>();


    private List<String> orders=new ArrayList<>();
    @Override
    public void configure(ObjectSortBuilder builder) {
        for (String order : orders) {
            builder.orderBy(order,true);
        }
    }
}


BlogQueryRequest blogQueryRequest = new BlogQueryRequest();
blogQueryRequest.setTitle("123");
blogQueryRequest.setTitle2("123");
blogQueryRequest.setTitle3("123");
blogQueryRequest.setContent("123");
blogQueryRequest.setStar(123);
blogQueryRequest.setPublishTimeBegin(LocalDateTime.now());
blogQueryRequest.setPublishTimeEnd(LocalDateTime.now());
blogQueryRequest.setScore(new BigDecimal("123"));
blogQueryRequest.setStatus(1);
blogQueryRequest.setOrder(new BigDecimal("12"));
blogQueryRequest.setIsTop(false);
blogQueryRequest.getOrders().add("status");
blogQueryRequest.getOrders().add("score");
String sql = easyQuery.queryable(BlogEntity.class)
        .whereObject(true, blogQueryRequest)
        .orderByObject(true, blogQueryRequest)
        .toSQL();
Assert.assertEquals("SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `title` LIKE ? AND (`title` LIKE ? OR `content` LIKE ?) AND (`id` = ? OR `content` = ?) AND `url` LIKE ? AND `star` = ? AND `publish_time` >= ? AND `publish_time` <= ? AND `score` >= ? AND `status` <= ? AND `order` > ? AND `is_top` <> ? ORDER BY `status` ASC,`score` ASC", sql);

```

## Property Implicit Filter
`whereObject` uses implicit join and implicit subquery
```java

/**
 * create time 2025/8/10 21:18
 * {@link SysUser}
 *
 * @author xuejiaming
 */
@Data
public class SysUserQueryDTO2 {

    @EasyWhereCondition(propName = "bankCards.code",type = EasyWhereCondition.Condition.STARTS_WITH)
    private String bankCardCode;
    @EasyWhereCondition(propName = "bankCards.bank.name", type = EasyWhereCondition.Condition.IN)
    private List<String> bankCardBankNames;
    @EasyWhereCondition(propName = "bankCards.type",type = EasyWhereCondition.Condition.CONTAINS)
    private String bankCardType;
    @EasyWhereCondition(propName = "bankCards.type",type = EasyWhereCondition.Condition.ENDS_WITH)
    private String bankCardType2;
    @EasyWhereCondition(propName = "bankCards.type",type = EasyWhereCondition.Condition.CONTAINS)
    private String bankCardType3;
}
```

::: tip Note!!!
> After adding @link, you will get corresponding plugin hints when writing propName
:::

```java

SysUserQueryDTO2 queryDTO = new SysUserQueryDTO2();
queryDTO.setBankCardCode("123%");
queryDTO.setBankCardType("Savings_Card");
queryDTO.setBankCardType2("SavingsCard");
queryDTO.setBankCardType3("SavingsCard");
queryDTO.setBankCardBankNames(Arrays.asList("ICBC","CCB"));
List<SysUser> list = easyEntityQuery.queryable(SysUser.class)
        .configure(s->s.getBehavior().add(EasyBehaviorEnum.ALL_SUB_QUERY_GROUP_JOIN))
        .whereObject(queryDTO)
        .where(user -> {
        })
        .toList();

SELECT t.`id`, t.`name`, t.`phone`, t.`age`, t.`create_time`
FROM `t_sys_user` t
	LEFT JOIN (
		SELECT t1.`uid` AS `uid`, COUNT(1) > 0 AS `__any2__`
		FROM `t_bank_card` t1
			INNER JOIN `t_bank` t3 ON t3.`id` = t1.`bank_id`
		WHERE LOCATE('123%', t1.`code`) = 1
			AND t3.`name` IN ('ICBC', 'CCB')
			AND LOCATE('Savings_Card', t1.`type`) > 0
			AND t1.`type` LIKE CONCAT('%', 'SavingsCard')
			AND t1.`type` LIKE CONCAT('%', 'SavingsCard', '%')
		GROUP BY t1.`uid`
	) t2
	ON t2.`uid` = t.`id`
WHERE IFNULL(t2.`__any2__`, false) = true
```

## Dynamic Condition Multi-table Join

Specify which table of the join the current property corresponds to by modifying the `tableIndex` or `tablesIndex` (the difference is whether the property corresponds to multiple properties) of `@EasyWhereCondition`

| Type | Build Condition |
| ------------- | ------------------ |
| String | Not null and not empty |
| Integer | Not null |
| Short | Not null |
| Double | Not null |
| Float | Not null |
| BigDecimal | Not null |
| LocalDateTime | Not null |
| List | Not null and not empty |
| Array | Not null and not empty |

## Replace whereObject Implementation

`easy-query` uses interface mode to implement `whereObject` by default. Users can replace framework behavior or even implement `@EasyWhereCondition` themselves

### How to Replace Framework Behavior

[《Replace Framework Behavior ❗️❗️❗️》](/easy-query-doc/en/framework/replace-configure)

### Interface

`WhereObjectQueryExecutor` default implementation `DefaultWhereObjectQueryExecutor`

You can implement this yourself and use your own annotations in conjunction

## Related Search

`annotation query` `dynamic query` `json query` `object query` `dto query` `form query`


