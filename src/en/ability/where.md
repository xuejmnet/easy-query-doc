---
title: where Advanced
order: 20
---

## API

::: tip Dynamic Control where Effectiveness!!!
> If the first parameter is true, it means the current where needs to be executed, otherwise it doesn't need to be. For example, `where(false,o->o.id().eq("123"))` because the first parameter is `false`, the entire `where` will not take effect. If the first parameter is not written, the current `where` is considered effective
:::


| Method | Description|
| ------------------------------ | ---------------------------- |
| `where(expression)`            | Pass in expression method to filter dataset results|
| `whereObject(Object)`          | Pass in an object to implement where generation after parsing the current object to filter dataset results|
| `whereById(Object)`            | Pass in an id to filter the database collection. The current table must have one and only one primary key, otherwise an error will be thrown |
| `whereByIds(array)`            | Pass in an id collection to filter the database collection. The current table must have one and only one primary key, otherwise an error will be thrown   |


```java

@Data
@Table("t_topic")
@EntityProxy
@EasyAssertMessage("Topic information not found")
@EasyAlias("t_topic")//Adding this annotation allows the plugin to quickly help you generate aliases
@FieldNameConstants
public class Topic implements ProxyEntityAvailable<Topic, TopicProxy> {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;
}
```

## `where(expression)`
In the expression chain, you can use a single `where` to describe the filtering of the current expression. Of course, you can also use multiple `wheres` to combine. Multiple wheres will `append` to each other if there's no `select` or `groupBy` between them.
The input parameter of `where` represents an alias variable of the current table. If you're familiar with Java's `stream api` or dotnet's `linq`, you can write the current expression very easily.

### Single Table where
For single table where input parameters, we only have one alias of the current table to describe the current table. Because of context constraints, users cannot use other tables outside the current expression, which can reduce many mental burdens for users when writing DSL.

```java

easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.title().like("123");
            t_topic.stars().gt(1);
        }).toList();
//The above and below syntax are the same
easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.title().like("123");
        })
        .where(t_topic -> {
            t_topic.stars().gt(1);
        }).toList();

//Of course, if your `where` only has one condition, the braces can also be omitted (this is basic lambda knowledge, no excessive explanation)

easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> t_topic.title().like("123"))
        .where(t_topic -> t_topic.stars().gt(1)).toList();
```

### Multi-table where
For multi-table `where`, there are two choices for input parameter count: one with 1 parameter representing the main table, and one with n parameters representing main table + join tables*n in order. The on after join is processed the same way.
```java
easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class,(t_topic, t_blog) -> {
            t_topic.id().eq(t_blog.id());
        })
        .where((t_topic, t_blog) -> {
            t_topic.title().like("123");
            t_blog.status().eq(1);
        }).toList();
```



# Dynamic Conditions

By uploading JSON objects through Spring Boot to implement conditional queries, there are currently two solutions: one is to build where through dynamic conditions, and the other is to implement dynamic queries through object objects.

## Default Configuration

| Mode     | Advantages                            | Disadvantages                                                     |
| -------- | ------------------------------- | -------------------------------------------------------- |
| Dynamic Conditions | Can implement any complex condition building        | Too complex for most business scenarios                               |
| Object Query | Can quickly implement condition queries based on DTO | Conditions only support and, and property names need to be consistent. Inconsistent ones need manual mapping to be consistent |

## Dynamic Conditions

The framework provides multiple dynamic condition methods

- `if` condition wrapper
- First parameter `boolean` of API, first parameter `boolean` of where
- `filterConfigure`

::: code-tabs
@tab Object Mode

```java

BlogQuery1Request query = new BlogQuery1Request();
query.setOrder(BigDecimal.valueOf(1));
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyEntityQuery.queryable(BlogEntity.class)
    .where(o -> {

            //When query.getContext is not empty, add query condition content like query.getContext
            o.content().like(EasyStringUtil.isNotBlank(query.getContent()), query.getContent());
            //The above and below have the same effect, choose which one to use yourself
            if(EasyStringUtil.isNotBlank(query.getContent())){
                o.content().like(query.getContent());
            }

            //When query.getOrder is not null, add query condition content = query.getContext
            o.order().eq(query.getOrder() != null, query.getOrder());
            //When query.getPublishTimeBegin() is not null, add left closed interval, same for right side publishTimeBegin <= publishTime <= publishTimeEnd
            o.publishTime().rangeClosed(query.getPublishTimeBegin() != null, query.getPublishTimeBegin(), query.getPublishTimeEnd() != null, query.getPublishTimeEnd());
            //Add in condition
            o.status().in(EasyCollectionUtil.isNotEmpty(query.getStatusList()), query.getStatusList());
    })
    .where(query.getOrder() != null,o -> {
            //When query.getOrder is not null, add query condition content = query.getContext
            o.order().eq(query.getOrder());
    }).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `order` = ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0



BlogQuery1Request query = new BlogQuery1Request();
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyQuery.queryable(BlogEntity.class)
    .where(o -> {

            //When query.getContext is not empty, add query condition content like query.getContext
            o.content().like(EasyStringUtil.isNotBlank(query.getContent()), query.getContent());
            //When query.getOrder is not null, add query condition content = query.getContext
            o.order().eq(query.getOrder() != null, query.getOrder());//Not effective
            //When query.getPublishTimeBegin() is not null, add left closed interval, same for right side publishTimeBegin <= publishTime <= publishTimeEnd
            o.publishTime().rangeClosed(query.getPublishTimeBegin() != null, query.getPublishTimeBegin(), query.getPublishTimeEnd() != null, query.getPublishTimeEnd());
            //Add in condition
            o.status().in(EasyCollectionUtil.isNotEmpty(query.getStatusList()), query.getStatusList());

    }).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0
```

@tab Property Mode

```java

BlogQuery1Request query = new BlogQuery1Request();
query.setOrder(BigDecimal.valueOf(1));
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyQueryClient.queryable(BlogEntity.class)
    .where(o -> o
            //When query.getContext is not empty, add query condition content like query.getContext
            .like(EasyStringUtil.isNotBlank(query.getContent()), "content", query.getContent())
            //When query.getOrder is not null, add query condition content = query.getContext
            .eq(query.getOrder() != null, "order", query.getOrder())
            //When query.getPublishTimeBegin() is not null, add left closed interval, same for right side publishTimeBegin <= publishTime <= publishTimeEnd
            .rangeClosed("publishTime", query.getPublishTimeBegin() != null, query.getPublishTimeBegin(), query.getPublishTimeEnd() != null, query.getPublishTimeEnd())
            //Add in condition
            .in(EasyCollectionUtil.isNotEmpty(query.getStatusList()), "status", query.getStatusList())
    ).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `order` = ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0



BlogQuery1Request query = new BlogQuery1Request();
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyQueryClient.queryable(BlogEntity.class)
    .where(o -> o
            //When query.getContext is not empty, add query condition content like query.getContext
            .like(EasyStringUtil.isNotBlank(query.getContent()), "content", query.getContent())
            //When query.getOrder is not null, add query condition content = query.getContext
            .eq(query.getOrder() != null, "order", query.getOrder())//Not effective
            //When query.getPublishTimeBegin() is not null, add left closed interval, same for right side publishTimeBegin <= publishTime <= publishTimeEnd
            .rangeClosed("publishTime", query.getPublishTimeBegin() != null, query.getPublishTimeBegin(), query.getPublishTimeEnd() != null, query.getPublishTimeEnd())
            //Add in condition
            .in(EasyCollectionUtil.isNotEmpty(query.getStatusList()), "status", query.getStatusList())
    ).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0
```

:::

## Condition Acceptance

`1.4.31^` and above versions support `ValueFilter` condition receiver. The default behavior of `Queryable` is `AnyValueFilter.DEFAULT` which accepts all conditions. The framework provides an optional `NotNullOrEmptyValueFilter.DEFAULT`. When the passed condition parameter value is non-null and in the case of a string non-empty, it will be added to the condition. Only effective for where conditions. And only when the left side is a property rather than a property function. If the left side is a function, it will not take effect.


If there's an implicit join, the `2.3.0^` version can handle it more intelligently.

`3.0.46^` version adds `NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS` which supports propagation to the entire DSL including implicit subqueries, implicit groupJoin, and implicit partition. If users need to implement it themselves, they can implement the interface by changing from `ValueFilter` to `PropagationValueFilter`.

Users can also customize the implementation interface.

```java
public interface ValueFilter {
    boolean accept(TableAvailable table, String property, Object value);
}

public class AnyValueFilter implements ValueFilter {
    public static final ValueFilter DEFAULT=new AnyValueFilter();
    private AnyValueFilter(){

    }
    @Override
    public boolean accept(TableAvailable table, String property, Object value) {
        return true;
    }
}
public class NotNullOrEmptyValueFilter implements ValueFilter {
    public static final ValueFilter DEFAULT=new NotNullOrEmptyValueFilter();
    @Override
    public boolean accept(TableAvailable table, String property, Object value) {
        if(value==null){
            return false;
        }
        if(value instanceof String){
            return EasyStringUtil.isNotBlank((String) value);
        }
        return true;
    }
}

```

```java

BlogQuery1Request query = new BlogQuery1Request();
query.setOrder(BigDecimal.valueOf(1));
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyEntityQuery.queryable(BlogEntity.class)
    .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)//Set non-null string non-empty, subsequent where will be added to conditions
    .where(o -> {

            //When query.getContext is not empty, add query condition content like query.getContext
            o.content().like(query.getContent());
            //When query.getOrder is not null, add query condition content = query.getContext
            o.order().eq(query.getOrder());
            //When query.getPublishTimeBegin() is not null, add left closed interval, same for right side publishTimeBegin <= publishTime <= publishTimeEnd
            o.publishTime().rangeClosed(query.getPublishTimeBegin(), query.getPublishTimeEnd());
            //Add in condition
            o.status().in(query.getStatusList());
    }).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `order` = ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0



BlogQuery1Request query = new BlogQuery1Request();
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> result = easyQuery.queryable(BlogEntity.class)
    .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)//Set non-null string non-empty, subsequent where will be added to conditions
    .where(o -> {

            //When query.getContext is not empty, add query condition content like query.getContext
            o.content().like(query.getContent());
            //When query.getOrder is not null, add query condition content = query.getContext
            o.order().eq(query.getOrder());//Not effective
            //When query.getPublishTimeBegin() is not null, add left closed interval, same for right side publishTimeBegin <= publishTime <= publishTimeEnd
            o.publishTime().rangeClosed(query.getPublishTimeBegin(), query.getPublishTimeEnd());
            //Add in condition
            o.status().in(query.getStatusList());

    }).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` >= ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),1(BigDecimal),2023-07-14T22:05:24.971(LocalDateTime),2023-07-14T22:05:24.971(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 5(ms)
<== Total: 0
```

```java
  String toSql = easyQuery
                .queryable(Topic.class)
                .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                .leftJoin(BlogEntity.class, (t,t1, t2) -> t.eq(t2, Topic::getId, BlogEntity::getId))
                .leftJoin(BlogEntity.class, (t, t1, t2, t3) -> t.eq(t3, Topic::getId, BlogEntity::getId))
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)//Set non-null string non-empty, subsequent where will be added to conditions
                .where(o -> o.eq(Topic::getId, ""))
                //.filterConfigure(AnyValueFilter.DEFAULT)//Restore if there's no custom where after, no need to restore
                .limit(1, 2)
                .toSQL();
// SELECT t.`id`,t.`stars`,t.`title`,t.`create_time` FROM `t_topic` t
// LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id`
// LEFT JOIN `t_blog` t2 ON t2.`deleted` = ? AND t.`id` = t2.`id`
// LEFT JOIN `t_blog` t3 ON t3.`deleted` = ? AND t.`id` = t3.`id`
// LIMIT 2 OFFSET 1

```

Condition interception. If most of my where conditions conform and a few don't, you can ensure the rest can proceed by returning early for non-conforming ones.

```java
String id="";
String userName=null;
String nickname="BBB";
Boolean leftEnable=true;


    String sql = easyQuery.queryable(DefTable.class)
            .leftJoin(DefTableLeft1.class, (t, t1) -> t.eq(t1, DefTable::getId, DefTableLeft1::getDefId))
            .filterConfigure((t, p, v) -> {//table, property, value respectively
                if ("id".equals(p)) { //Regardless of what the comparison result is for .eq(DefTable::getId, id), this method with property as id will be added to the condition
                    return true;
                }
                return NotNullOrEmptyValueFilter.DEFAULT.accept(t, p, v);
            })
            .where((t, t1) -> t
                    .eq(DefTable::getId, id)//Although id is empty, it's still added to the SQL
                    .eq(DefTable::getUserName, userName)
                    .eq(DefTable::getNickname, nickname)
                    .then(t1).eq(DefTableLeft1::getEnable, leftEnable)).toSQL();
// SELECT t.id,t.user_name,t.nickname,t.enable,t.score,t.mobile,t.avatar,t.number,t.status,t.created,t.options FROM t_def_table t
// LEFT JOIN t_def_table_left1 t1 ON t.id = t1.def_id
// WHERE t.id = ? AND t.nickname = ? AND t1.enable = ?


```

::: warning Note and Explanation!!!

> Must be written before the corresponding `where` for subsequent `where` to take effect. Users can customize, for example, conditions that are met prioritize the first boolean condition of `eq, ge, gt`, etc., and then judge `valueFilter`. If there are multiple `wheres` and some wheres need customization, you can use `filterConfigure(AnyValueFilter.DEFAULT)` to restore to accepting all parameters. Generally used for queries, it can reduce a lot of judgments.
> 
:::

The condition acceptance default interface `ValueFilter`. If you customize and directly implement this, subqueries of the same expression will not take effect and still need to be handled manually. To make subqueries of the same expression take effect, please use the `PropagationValueFilter` interface to implement related operations. By default, `.filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)` can be changed to `.filterConfigure(NotNullOrEmptyValueFilter.DEFAULT_PROPAGATION_SUPPORTS)` so that subqueries of the same expression will also ignore parameters that are null or empty.

::: warning Note and Explanation!!!

What are subqueries of the same expression? They are subqueries not injected by `easyEntityQuery` bean, such as `o.userList()....` or `o.expression().subQueryable(xxx.class)`. We consider these types of subqueries as subqueries of the same expression. Subqueries created by `easyEntityQuery.queryable(xxx.class)` are considered subqueries of different expressions and have independent configurations.
:::

## Property One-to-One Query

One property of an object corresponds to one column queried from the database.

`@EasyWhereCondition`

| Property              | Default Value | Description                                                                                      |
| ----------------- | ------ | ----------------------------------------------------------------------------------------- |
| strict            | true   | Strict mode. If the property is not mapped to the object, report error. If table `tableIndex` is not in the current context, also report error            |
| tableIndex        | 0      | Which table the current condition is used to query                                                                    |
| allowEmptyStrings | false  | Whether to allow empty strings. If allowed, empty strings will also be added to the expression instead of being ignored                               |
| propName          | ""     | The property name mapped from the current property to the database object. Empty means using the current property name. Supports implicit join and implicit subquery        |
| type              | LIKE   | What kind of expression to build the condition between the current property and the database object property                                              |
| mode              | SINGLE | `SINGLE`: indicates current property is one-to-one database column, `MULTI_OR`: indicates current value corresponds to multiple database columns and connected with or |
| propNames         | []     | Which two property columns the current property maps to                                                                |
| tablesIndex       | []     | Can be different length from propNames. Different means 0 main table                                           |

::: warning Note!!!

> Properties default support like. Can specify condition. If query property is inconsistent with database object property, can be rewritten through `propName`
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
     * Star count
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
     * statusList doesn't have corresponding property name, so need to rewrite to map to status
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.IN,propName = "status")
    private List<Integer> statusList=new ArrayList<>();
    /**
     * statusNotList doesn't have corresponding property name, so need to rewrite to map to status
     */
    @EasyWhereCondition(type = EasyWhereCondition.Condition.NOT_IN,propName = "status")
    private List<Integer> statusNotList=new ArrayList<>();
}
```

## Dynamic Query Condition 1

```java

 BlogQuery2Request query = new BlogQuery2Request();
query.setOrder(BigDecimal.valueOf(1));
query.setContent("标题");
query.setPublishTimeBegin(LocalDateTime.now());
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class)
        .whereObject(query).toList();

==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` >= ? AND `publish_time` <= ? AND `order` = ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),2023-07-14T22:37:47.865(LocalDateTime),2023-07-14T22:37:47.865(LocalDateTime),1(BigDecimal),1(Integer),2(Integer)
<== Time Elapsed: 4(ms)
<== Total: 0



BlogQuery2Request query = new BlogQuery2Request();
query.setContent("标题");
query.setPublishTimeEnd(LocalDateTime.now());
query.setStatusList(Arrays.asList(1,2));

List<BlogEntity> queryable = easyQuery.queryable(BlogEntity.class)
        .whereObject(query).toList();


==> Preparing: SELECT `id`,`create_time`,`update_time`,`create_by`,`update_by`,`deleted`,`title`,`content`,`url`,`star`,`publish_time`,`score`,`status`,`order`,`is_top`,`top` FROM `t_blog` WHERE `deleted` = ? AND `content` LIKE ? AND `publish_time` <= ? AND `status` IN (?,?)
==> Parameters: false(Boolean),%标题%(String),2023-07-14T22:37:47.880(LocalDateTime),1(Integer),2(Integer)
<== Time Elapsed: 2(ms)
<== Total: 0
```

## Property One-to-Many Query

One property of an object corresponds to multiple columns queried from the database.

```java

@Data
public class BlogQueryRequest implements ObjectSort {

    /**
     * Title
     */
    @EasyWhereCondition
    private String title;
    /**
     * Title
     */
    @EasyWhereCondition(mode = EasyWhereCondition.Mode.MULTI_OR,propNames = {"title","content"})
    private String title2;
    /**
     * Title
     */
    @EasyWhereCondition(mode = EasyWhereCondition.Mode.MULTI_OR,propNames = {"id","content"},type = EasyWhereCondition.Condition.EQUAL)
    private String title3;
    /**
     * Content
     */
    @EasyWhereCondition(propName = "url")
    private String content;
    /**
     * Star count
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

## Property Implicit Filtering
`whereObject` using implicit join and implicit subquery
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
> After adding @link, when you write propName, you will get corresponding plugin hints
:::

```java

SysUserQueryDTO2 queryDTO = new SysUserQueryDTO2();
queryDTO.setBankCardCode("123%");
queryDTO.setBankCardType("储蓄_卡");
queryDTO.setBankCardType2("储蓄卡");
queryDTO.setBankCardType3("储蓄卡");
queryDTO.setBankCardBankNames(Arrays.asList("工商银行","建设银行"));
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
			AND t3.`name` IN ('工商银行', '建设银行')
			AND LOCATE('储蓄_卡', t1.`type`) > 0
			AND t1.`type` LIKE CONCAT('%', '储蓄卡')
			AND t1.`type` LIKE CONCAT('%', '储蓄卡', '%')
		GROUP BY t1.`uid`
	) t2
	ON t2.`uid` = t.`id`
WHERE IFNULL(t2.`__any2__`, false) = true
```

## Dynamic Condition Multi-Table Join

By modifying the `tableIndex` or `tablesIndex` (the difference is whether the property corresponds to multiple properties) of `@EasyWhereCondition` to specify which joined table the current property corresponds to.

| Type          | Build Condition           |
| ------------- | ------------------ |
| String        | Not null and not empty |
| Integer       | Not null          |
| Short         | Not null          |
| Double        | Not null          |
| Float         | Not null          |
| BigDecimal    | Not null          |
| LocalDateTime | Not null          |
| List          | Not null and not empty |
| Array         | Not null and not empty |

## Replace whereObject Implementation

`easy-query` uses interface mode to implement `whereObject` by default. Users can replace framework behavior themselves, even `@EasyWhereCondition` can be implemented by themselves.

### How to Replace Framework Behavior

[《Replace Framework Behavior ❗️❗️❗️》](/easy-query-doc/framework/replace-configure)

### Interface

`WhereObjectQueryExecutor` Default implementation `DefaultWhereObjectQueryExecutor`

You can implement this yourself and use your own annotations to work together.


### Dynamic Column

Sometimes our search is not necessarily whether it's dynamically effective. It may need to implement dynamic column name processing. Here eq provides any column `anyColumn`, requires `eq2.6.2+`

`anyColumn(property)` supports implicit join: for example `o.anyColumn("user.age")` equals `o.user().age()`
```java

        List<DocBankCard> list = easyEntityQuery.queryable(DocBankCard.class)
                .where(bank_card -> {
                    bank_card.anyColumn("code").eq("456");
                    //The above and below syntax are the same
                    //bank_card.code().eq("321");
                }).toList();
```

## Related Searches

`Annotation Query` `Dynamic Query` `DTO Query` `JSON Query` `Object Query` `Form Query`

