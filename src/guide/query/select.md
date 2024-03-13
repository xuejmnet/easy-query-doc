---
title: select
order: 40
---

# select
`easy-query`的`select`是用来终结当前表达式生成新的表达式的方式

## select后置风格
和原生SQL不同，在`easy-query`提供的DSL中，`select`语句出现在`where`，`orderBy`，`groupBy`，`having`等之后,如果表达式调用了`select`那么这个sql就是确定了的如果再次调用`where`那么前面的表达式将被视为别名表

## API
方法  | 参数 | 返回  | 描述
--- | --- | --- | --- 
`select(SqlExpression selectExpression)` | 列选择器  | this | <font color="red">**不会生成匿名表**</font>,返回当前`Queryable`对象指定的列,用于按需查询
`select(Class<TR> resultClass)` | 列选择器返回对象  | this | <font color="red">**生成匿名表**</font>,返回当前`Queryable`对象属性映射所对应的列名和返回结果属性列名一样的列,即两者属性名可以不一致但是只要两者属性名都是映射为相同`columnName`即可互相映射，如果返回结果属性类型不包容原属性类型，比如`String->Integer` 那么可能会出现转换失败,
`select(Class<TR> resultClass, SqlExpression selectExpression)` | 列选择器返回对象,列选择器  | this | <font color="red">**生成匿名表**</font>,返回当前`Queryable`对象属性映射所对应的列名和返回结果属性列名一样的列,即两者属性名可以不一致但是只要两者属性名都是映射为相同`columnName`即可互相映射，如果返回结果属性类型不包容原属性类型，比如`String->Integer` 那么可能会出现转换失败,区别就是可以自己手动指定列,<font color="red">**！！！该方法默认不查询任何列需要手动在第二个参数表达式指定！！！**</font>

::: tip 说明!!!
> 代理模式下`select`的第一个参数是`selector`选择器,第二个参数开始才是真正的表,生成匿名表表示`select * from table`如果后续有新的`where | order | group ....`会把这个条件当成匿名表来处理 `select * from (select * from table) t`每个`select`都是带`class`的都是将起变成匿名表
:::


## selector说明
### 按需返回VO对象
定义返回的VO
```java

@Data
@ToString
public class BlogEntityVO1 {

    /**
     * 评分
     */
    private BigDecimal score;
    /**
     * 状态
     */
    @Column(value = "status")
    private Integer abc;
    /**
     * 排序
     */
    private BigDecimal order;
    /**
     * 是否置顶
     */
    private Boolean isTop;
    /**
     * 是否置顶
     */
    private Boolean top;
}
```

::: warning 注意点及说明!!!
> `EasyEntityQuery`的直接`select(vo.class)`和直接返回`select(new vo)`的区别在于您是否要对后续操作进行处理,简单理解为就是操作匿名表,如果不需要只需要返回结果那么可以直接使用`VO.class`不需要生成`proxy`,但是如果您需要在后续继续操作比如`join`其他表那么select需要返回对应的`Proxy`或者使用`MapTypeProxy`
:::


::: code-tabs
@tab 对象模式
```java
//直接映射到BlogEntityVO1.class
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class).firstOrNull();


//只查询id和name和title映射到logEntityVO1.class
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class,s->s.FETCHER.id().name().title()).firstOrNull();

//查询所有字段到logEntityVO1.class等同于select(BlogEntityVO1.class),会自动select vo有的字段
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class,s->s.FETCHER.allFields()).firstOrNull();

//查询所有字段除了id和title映射到logEntityVO1.class
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class,s->s.FETCHER.allFieldsExclude(s.id(),s.title())).firstOrNull();

//也可以对BlogEntityVO1添加@EntityProxy生成代理对象来处理

easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(s->{
             BlogEntityVO1Proxy result =new BlogEntityVO1Proxy();
             result.selectAll(s);
             result.selectIgnores(s.id());
             reuslt.abc().set(s.title());//title as status(因为abc的属性映射为status别名)
             return result;
        }).firstOrNull();

```

@tab lambda模式
```java

//直接映射到BlogEntityVO1.class
BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class).firstOrNull();

//只查询id和name和title映射到logEntityVO1.class
BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class,o->o.column(BlogEntity::getId).column(BlogEntity::getName).column(BlogEntity::getTitle)).firstOrNull();

//查询所有字段到logEntityVO1.class等同于select(BlogEntityVO1.class),会自动select vo有的字段
BlogEntityVO1 blogEntityVO1 = easyQuery.queryable(BlogEntity.class)
        .where(o -> o.eq(BlogEntity::getId, "2"))
        .select(BlogEntityVO1.class,o->o.columnAll()).firstOrNull();


//查询所有字段除了id和title映射到logEntityVO1.class
easyEntityQuery.queryable(BlogEntity.class)
        .where(o->o.id().eq("2"))
        .select(BlogEntityVO1.class,s->s.columnAll().columnIgnore(BlogEntity::getId).columnIgnore(BlogEntity::getTitle)).firstOrNull();
```

::: 


如果出现多表属性映射,可以将相识度高的先进行全列查询,然后将不需要的进行忽略

### 按需快速join返回列
这边限制VO对象返回Topic的id其他都是Blog的属性
```java

@Data
@ToString
public class BlogEntityVO2 {

    /**
     * 希望返回Topic的id其他都是Blog的属性
     */
    private String id;
    /**
     * 标题
     */
    private String title;
    /**
     * 内容
     */
    @Column(large = true)
    private String content;
    /**
     * 博客链接
     */
    private String url;
    /**
     * 点赞数
     */
    private Integer star;
    /**
     * 发布时间
     */
    private LocalDateTime publishTime;
    /**
     * 评分
     */
    private BigDecimal score;
    /**
     * 状态
     */
    private Integer status;
    /**
     * 排序
     */
    private BigDecimal order;
    /**
     * 是否置顶
     */
    private Boolean isTop;
    /**
     * 是否置顶
     */
    private Boolean top;

    private LocalDateTime createMyTime;
}



```

::: code-tabs
@tab 对象模式
```java
List<TopicTypeVO> vo = easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (b, s2) -> b.id().eq(s2.id()))
        .select(BlogEntityVO2.class, (b1, s2) -> Select.of(
                //查询表1全部列忽略id将createTime别名改成createMyTime
                b1.FETCHER.allFieldsExclude(s.id()).createTime().as("createMyTime"),
                //表2获取id
                s2.FETCHER.id()
        )).toList();


//entity query 模式
List<TopicTypeVO> vo = easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (b, s2) -> b.id().eq(s2.id()))
        .select(BlogEntityVO2.class, (b1, s2) -> Select.of(
                b1.FETCHER.id().content().createTime().as("createMyTime"),
                s2.FETCHER.address().idCard()
        )).toList();


List<TopicTypeVO> vo = easyEntityQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (b, s2) -> b.id().eq(s2.id()))
        .select((b1, s2) -> {
                BlogEntityVO2Proxy result=new BlogEntityVO2Proxy();
                result.selectAll(b1);
                result.selectIgnores(s.id());
                result.createMyTime().set(b1.createTime());
                return result;
        })
        .select(BlogEntityVO2.class, (b1, s2) -> Select.of(
                //查询表1全部列忽略id将createTime别名改成createMyTime
                b1.FETCHER.allFieldsExclude(s.id()).createTime().as("createMyTime"),
                //表2获取id
                s2.FETCHER.id()
        )).toList();
```

@tab lambda模式
```java

BlogEntityVO2 blogEntityVO1 = easyQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class,(t,t1)->t.eq(t1,Topic::getId,BlogEntity::getId))
        .where(o -> o.eq(Topic::getId, "2"))
        //直接先对第二张表进行全字段获取然后忽略掉id在对第二张表进行id获取
        .select(BlogEntityVO2.class,(t,t1)->t1.columnAll().columnIgnore(BlogEntity::getId).then(t).column(Topic::getId)
                //.columnAs(Topic::getId,BlogEntityVO2::getId)//如果属性对应的columnName不一致需要as处理
        ).firstOrNull();
```


::: 

### 匿名表
表达式每次`select`将会生成一个匿名表如果需要后续操作那么可以对其进行再次操作

生成的sql语句为
```sql

SELECT
    t2.`id`,
    t2.`stars`,
    t2.`title`,
    t2.`create_time` 
FROM
    (SELECT
        t.`id` AS `blogId`,
        COUNT(*) AS `blogCount` 
    FROM
        `t_blog` t 
    WHERE
        t.`deleted` = false 
        AND t.`star` > 1 
    GROUP BY
        t.`id`) t1 
LEFT JOIN
    `t_topic` t2 
        ON t1.`blogId` = t2.`id` 
WHERE
    t1.`blogCount` <= 123
```
具体表达式代码为如下
```java
//首先我们定义两个key用来后续操作
MapKey<String> blogId = MapKeys.stringKey("blogId");
MapKey<Integer> blogCount = MapKeys.integerKey("blogCount");

 List<Topic> list = easyEntityQuery.queryable(BlogEntity.class)
                .where(b -> {
                    b.star().gt(1);
                })
                //对其group by
                .groupBy(b -> GroupKeys.TABLE1.of(b.id()))
                //生成中间对象并且变成匿名表(每次select都是生成匿名表,后续如果没有别的操作那么匿名表会被展开)
                // select * from (select blogId,blogCount from xxx group by id) t
                //如果select后续没有非终结操作那么会被展开为 select blogId,blogCount from xxx group by id
                .select(group -> new MapTypeProxy().put(blogId, group.key1()).put(blogCount, group.intCount()))
                //对匿名表进行join
                .leftJoin(Topic.class, (g, topic) -> {
                    g.get(blogId).eq(topic.id());
                })
                .where((g, topic) -> {
                    g.get(blogCount).le(123);
                })
                //再次生成匿名表
                .select((g, topic) -> topic)
                //后续无操作了所以会被展开
                .toList();

定义MapKey是为了后续可以继续操作如果不需要可以不定义key

//展开后代码为


MapKey<String> blogId = MapKeys.stringKey("blogId");
        MapKey<Integer> blogCount = MapKeys.integerKey("blogCount");
//匿名表
// SELECT * FROM (SELECT
//         t.`id` AS `blogId`,
//         COUNT(*) AS `blogCount` 
//     FROM
//         `t_blog` t 
//     WHERE
//         t.`deleted` = false 
//         AND t.`star` > 1 
//     GROUP BY
//         t.`id`) t1

        EntityQueryable<MapTypeProxy, Map<String, Object>> groupAndCount = easyEntityQuery.queryable(BlogEntity.class)
                .where(b -> {
                    b.star().gt(1);
                })
                .groupBy(b -> GroupKeys.TABLE1.of(b.id()))
                .select(group -> new MapTypeProxy().put(blogId, group.key1()).put(blogCount, group.intCount()));

//        easyEntityQuery.getRuntimeContext().getEntityMetadataManager().getEntityMetadata()
        List<Topic> list = groupAndCount
                .leftJoin(Topic.class, (g, topic) -> {
                    g.get(blogId).eq(topic.id());
                })
                .where((g, topic) -> {
                    g.get(blogCount).le(123);
                }).select((g, topic) -> topic).toList();


```

### 匿名表案例2
对一张表进行开窗函数处理并且进行筛选
```sql
SELECT
    t1.`id`,
    t1.`create_time`,
    t1.`update_time`,
    t1.`create_by`,
    t1.`update_by`,
    t1.`deleted`,
    t1.`title`,
    t1.`content`,
    t1.`url`,
    t1.`star`,
    t1.`publish_time`,
    t1.`score`,
    t1.`status`,
    t1.`order`,
    t1.`is_top`,
    t1.`top`,
    t1.`num` AS `num` 
FROM
    (SELECT
        t.`id`,
        t.`create_time`,
        t.`update_time`,
        t.`create_by`,
        t.`update_by`,
        t.`deleted`,
        t.`title`,
        t.`content`,
        t.`url`,
        t.`star`,
        t.`publish_time`,
        t.`score`,
        t.`status`,
        t.`order`,
        t.`is_top`,
        t.`top`,
        ROW_NUMBER() OVER(PARTITION  BY t.`title` ORDER BY t.`score` DESC) AS `num` 
    FROM
        `t_blog` t 
    WHERE
        t.`deleted` = false 
        AND t.`star` < 12) t1 --生成匿名表
WHERE
    t1.`num` < 1
```
```java
//创建dto额外多一个num字段
@Data
@EntityProxy
public class BlogPartitionEntityVO extends BlogEntity{
    private Integer num;
}

List<BlogPartitionEntityVO> list = easyEntityQuery.queryable(BlogEntity.class)
                .where(b -> b.star().lt(12))
                .select(b -> {
                    Expression expression = b.expression();
                    BlogPartitionEntityVOProxy r = new BlogPartitionEntityVOProxy();
                    r.selectAll(b);
                    r.num().set(
                            expression.sqlType("ROW_NUMBER() OVER(PARTITION BY {0} ORDER BY {1} DESC)", c -> c.expression(b.title()).expression(b.score()))
                                    .setPropertyType(Integer.class)
                    );
                    return r;
                })
                .where(b -> b.num().lt(1))
                .toList();

```

### toMap
```java
//查询所有并且将其他表字段查询出来
List<Map<String, Object>> list = easyEntityQuery.queryable(SysUser.class)
                .leftJoin(Topic.class, (s, t2) -> s.id().eq(t2.id()))
                .where((s1, t2) -> s1.id().eq("1"))
                .select((s1, t2) -> new MapTypeProxy().selectAll(s1).selectExpression(t2.title().as("abc")))
                .toList();

Map<String, Object> map = easyQuery.queryable(Topic.class)
        .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
        .where(o -> o.eq(Topic::getId, "2"))
        .select(BlogEntityVO2.class, (t, t1) -> t1.columnAll().then(t).column(Topic::getId)//如果不进行忽略两个id都查询,但是默认会把后面的覆盖掉前面的
        ).toMap();

//相同的代码如果使用toMap将会抛出 IllegalStateException 异常:Duplicate key found: id
```