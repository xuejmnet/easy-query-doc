---
title: Common API Introduction
order: 30
---

::: tip Recommendation!!!
> In business scenarios, if developers can confirm that the current condition query can return a single record, then eq recommends using the `single` method instead of `first`, because `single` means single, i.e., at most one record. If two or more records appear, the framework will throw an error. Use `first` related query results only when your business doesn't care which record is returned.
:::

## Terminal Methods

Terminal methods refer to methods that stop chaining expressions, send the corresponding SQL of the expression to the database for execution, and convert the result set into specific Java objects. Common terminal methods are as follows:

`singleOrNull`, `singleNotNull`, `firstOrNull`, `firstNotNull` are for returning the first data from query results:

Method  | Default Value | Description  
--- | --- | --- 
singleOrNull |  null | Query returns the first record, returns null if no result, throws `EasyQuerySingleMoreElementException` if query result has more than 1 record. The difference with `first` is that `single does not` add `limit 1` or `top 1`
singleNotNull| - | Query returns the first record, throws `EasyQuerySingleOrNotNullException` if no result, throws `EasyQuerySingleMoreElementException` if query result has more than 1 record. The difference with `first` is that `single does not` add `limit 1` or `top 1`
firstOrNull | null  | Query returns the first record, returns null if no result. By default adds limit 1 or top 1 restriction to SQL, may affect indexes in some scenarios
firstNotNull | - | Query returns the first record, throws `EasyQueryFirstOrNotNullException` if no result. By default adds limit 1 or top 1 restriction to SQL, may affect indexes in some scenarios

::: warning Global Exception Replacement!!!
> The default error messages for `firstNotNull, singleNotNull, singleOrNull` can be customized by replacing eq's `AssertExceptionFactory`
:::

`toList` returns multiple data records from query results:

Method  | Default Value | Description  
--- | --- | --- 
toList |  `new ArrayList`  | Query returns all data matching conditions, returned as `ArrayList` collection. Returns empty `ArrayList` instead of `null` if no matching results

`toTreeList` returns multiple data records from query results (`toList`), then returns tree-structured results in memory based on one-to-many relationships (self-referential one-to-many):

Method  | Default Value | Description  
--- | --- | --- 
toTreeList |  `new ArrayList` or throws error  | Query returns all data matching conditions, returned as `ArrayList` collection, then returns tree-structured results in memory based on one-to-many relationships (self-referential one-to-many). Returns empty `ArrayList` instead of `null` if no matching results

`toPageResult` performs paginated queries on query results:

Method  | Default Value | Description  
--- | --- | --- 
toPageResult |  `new DefaultPageResult`  | Query returns paginated results matching conditions. Returns default pagination object instead of `null` if no matching results

`toPageSelectResult` differs from `toPageResult` by supporting delayed execution of select results to the `toList` stage, keeping count conditions very clean:

Method  | Default Value | Description  
--- | --- | --- 
toPageSelectResult |  `new DefaultPageResult`  | Query returns paginated results matching conditions. Returns default pagination object instead of `null` if no matching results

`toStreamResult` returns query results in iterator mode, suitable for handling very large amounts of data:

Method  | Default Value | Description  
--- | --- | --- 
toStreamResult |  `new DefaultJdbcStreamResultSet`  | Query returns iterable result set matching conditions, supports `Iterable` interface and `foreach`. Use with `try finally` to close resources

`streamBy` converts database results to Java's `stream-api` with minimum iteration count

### Test Data
```java
@Data
@Table("t_topic")
@EntityProxy
public class Topic implements ProxyEntityAvailable<Topic , TopicProxy>{

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;

}
```

### Query First Record

Query first record with at most one record, returns null if none exists:

::: code-tabs
@tab Object Mode
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("123"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
@tab Property Mode

```java
Topic topic = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "123"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
::: 

Query first record, returns null if none exists:

::: code-tabs
@tab Object Mode
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("123"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```
@tab Property Mode

```java
Topic topic = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "123"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```

::: 

### Query At Most One Record And Not Null

::: code-tabs
@tab Object Mode
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.id().eq("123"))
        .singleNotNull("Data not found");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```

@tab Property Mode
```java

Topic topic = easyQueryClient.queryable(Topic.class)
        .where(o -> o.eq("id", "123"))
        .singleNotNull("Data not found");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
::: 

### Query First Record And Not Null

::: code-tabs
@tab Object Mode
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.id().eq("123"))
        .firstNotNull("Data not found");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```

@tab Property Mode
```java

Topic topic = easyQueryClient.queryable(Topic.class)
        .where(o -> o.eq("id", "123"))
        .firstNotNull("Data not found");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```
::: 

Replace default exception with business exception:
::: warning NotNull Exception!!!
> The framework's default error type for NotNull returns may not be what you want. We can implement custom exceptions by overriding the interface `AssertExceptionFactory.class`. Default implementation class is `DefaultAssertExceptionFactory.class` [View Replace Framework Behavior](/en/easy-query-doc/framework/replace-configure)
:::

### Query Multiple Records
Query first record, returns `new ArrayList<>(0)` instance of `List<T>` interface if none exists:

::: code-tabs
@tab Object Mode
```java
List<Topic> topics = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("123"))
                    .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
@tab Property Mode
```java
List<Topic> topics = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "123"))
                    .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```

::: 

::: tip Note!!!
> `single` and `first` get single record, `toList` gets multiple records. In most cases, terminal methods are these two
:::

### Custom Columns
Return custom columns of current object:

::: code-tabs
@tab Object Mode
```java

Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    .select(o->o.FETCHER.id().title().name().content())
                    .singleOrNull();

==> Preparing: SELECT `id`,`title`  FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)

//Explicit assignment
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    .select(o->{
                        TopicProxy r = new TopicProxy();
                        r.id().set(o.id());
                        r.title().set(o.title());
                        return r;
                    })
                    .singleOrNull();

==> Preparing: SELECT `id` AS `id`,`title` AS `title` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)

If returning current type, can directly use fetcher function. Disadvantage: only supports main table and only current type


Can also use expression non-strongly typed
//Implicit assignment
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    //If many columns, can use fetcher
                    //r.selectExpression(o.FETCHER.id().title().name().content().......);
                    .select(o->new TopicProxy().selectExpression(o.id(),o.title()))
                    .singleOrNull();

==> Preparing: SELECT `id`,`title`  FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
```

@tab Property Mode
```java
Topic topic = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "1"))
                    .select(o->o.column("id").column("title"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`title` FROM `t_topic` WHERE `id` = ?
==> Parameters: 1(String)
```
::: 

### Embedded View

Embedded view, also called `from subQuery` or `subQuery join`, uses subquery as temporary table for querying or join operations to achieve view-like functionality, so we call it embedded view:

::: code-tabs
@tab Object Mode
```java
//  SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? 

EntityQueryable<TopicProxy, Topic> query = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.id().eq("1"))
        .select(o -> new TopicProxy()
                .selectExpression(o.id(), o.title())
        );

List<Topic> list = query.leftJoin(Topic.class, (t, t1) -> t.id().eq(t1.id()))
        .where((t, t1) -> {
            t1.id().eq("123");
            t.id().eq( "456");
        }).toList();


==> Preparing: SELECT t1.`id`,t1.`title` FROM (SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`id` = ?) t1 LEFT JOIN `t_topic` t2 ON t1.`id` = t2.`id` WHERE t2.`id` = ? AND t1.`id` = ?
==> Parameters: 1(String),123(String),456(String)
```

::: 

### Common Table Expression

`WITH CTE AS()` uses this API to reuse temporary tables in current expression:
```java
EntityQueryable<TopicProxy, Topic> cteAs = easyEntityQuery.queryable(Topic.class)
        .where(t_topic -> {
            t_topic.id().eq("456");
        }).toCteAs();//Supports passing table name for custom table name

List<Topic> list1 = easyEntityQuery.queryable(Topic.class)
        .leftJoin(cteAs, (t_topic, t2) -> t_topic.id().eq(t2.id()))
        .leftJoin(cteAs, (t_topic, t_topic2, t3) -> t_topic.id().eq(t3.id()))
        .where((t_topic, t_topic2, t_topic3) -> {
            t_topic.id().eq("123");
            t_topic3.id().eq("t2123");
        }).toList();



-- SQL 1
WITH `with_Topic` AS (SELECT
    t1.`id`,
    t1.`stars`,
    t1.`title`,
    t1.`create_time` 
FROM
    `t_topic` t1 
WHERE
    t1.`id` = '456')  

SELECT
    t.`id`,
    t.`stars`,
    t.`title`,
    t.`create_time` 
FROM
    `t_topic` t 
LEFT JOIN
    `with_Topic` t2 
        ON t.`id` = t2.`id` 
LEFT JOIN
    `with_Topic` t3 
        ON t.`id` = t3.`id` 
WHERE
    t.`id` = '123' 
    AND t3.`id` = 't2123'
```

## Single Table API Usage

::: code-tabs
@tab Object Mode
```java

// Create a queryable expression for SysUser
EntityQueryable<SysUserProxy, SysUser> queryable = entityQuery.queryable(SysUser.class);

//Single condition chain query
//toList means query result set
List<SysUser> sysUsers = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq( "123xxx"))
        .toList();



//Condition = and like combination, default connected by and
List<SysUser> sysUsers =entityQuery.queryable(SysUser.class)
        .where(o ->{
                o.id().eq("123xxx");
                o.idCard().like("123")
        }).toList();//toList means query result set


//Multiple wheres are also connected by and, same meaning as above, condition = and like combination, default connected by and
List<SysUser> sysUsers = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like("123")).toList();


//Return single object, returns null if not found
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like( "123")).firstOrNull();


//Query using create time descending and id ascending, return first
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like("123"))
        .orderBy(o->o.createTime().desc())
        .orderBy(o->o.id().asc()).firstOrNull();

//Query only id and createTime columns
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like("123"))
        .orderBy(o->o.createTime().desc())
        .orderBy(o->o.id().asc())
        .select(o->new SysUserProxy()
                .id().set(o.id())
                .createTime().set(o.createTime())
        )
        .firstOrNull();
        
```
:::

## Multi-Table Query API

::: code-tabs
@tab Object Mode
```java

// Create a queryable expression for SysUser
EntityQueryable<SysUserProxy, SysUser> queryable = entityQuery.queryable(SysUser.class);


List<Topic> list = entityQuery
        .queryable(Topic.class)
        //First join uses two parameters: parameter 1 represents first table Topic, parameter 2 represents second table BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //Second join uses three parameters: parameter 1 represents first table Topic, parameter 2 represents second table BlogEntity, third parameter represents third table SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//Single condition where parameter is main table Topic
        //Supports single parameter or full parameters, full parameter count is main table + join table count 
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.now());
        })
        //toList defaults to query main table data only
        .toList();


List<Draft3<String,String,LocalDateTime>> list = entityQuery
        .queryable(Topic.class)
        //First join uses two parameters: parameter 1 represents first table Topic, parameter 2 represents second table BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //Second join uses three parameters: parameter 1 represents first table Topic, parameter 2 represents second table BlogEntity, third parameter represents third table SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//Single condition where parameter is main table Topic
        //Supports single parameter or full parameters, full parameter count is main table + join table count 
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.now());
        })
        //select returns strongly-typed anonymous tuple object, no need to define dto/vo type for intermediate result storage in methods
        .select((t, t1, t2) -> Select.DRAFT.of(
            t.id(),
            t1.title(),
            t2.createTime()
        ))
        .toList();
        
```
:::

::: tip Chain Explanation!!!
> The second lambda input parameter count of leftJoin is the same as the number of tables used in join, and the input parameter order is the from and join tables

> In entityQuery, groupBy does not support consecutive calls. There must be a select specifying the query result between two groupBys. Other APIs also append when called multiple times
:::

