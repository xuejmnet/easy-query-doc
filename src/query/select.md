---
title: 查询
order: 40
---

# select
`eq`的`select`是用来终结当前表达式生成新的表达式的方式,简单理解为表示告诉框架当前表达式需要返回的结果是`select`的结果,如果您了解`stream api`那么可以简单的理解为其`map`操作

::: tip 概念补充 说明!!!
> `eq`这个orm与之前您认识的java其他orm不相同,这个orm实现了近乎95%的sql功能,其中一个就是子查询嵌套,所谓的子查询嵌套就是将之前查询结果视作`派生表`或叫做`内嵌视图`,后续我们将其统一称其为`内嵌视图`,比如`select .... from (select id,name from table where name like ?) t where t.id = ?`这个sql的括号内的那一部分(`select id,name from table where name like ?`)我们称之为`内嵌视图`
:::

所以我们可以很轻易的实现其他orm无法实现的
```sql
select ... from
    (
        select
            key1,
            key2,
            count() as c,
            avg() as a,
            sum() as s
        from
            table
        where
            name like ?
        group by
            key1,
            key2
    ) t1
    left join table2 t2 on t.key1 = t2.key1
where.....
```

## select后置风格
和原生SQL不同，在`eq`提供的DSL中，使用的是`select`后置风格，这个风格多见于`c#`语言的`orm`中和`stream api`有一种异曲同工之处，那么为什么`eq`选择`select`后置?

- 强类型的java语言类型`select`后置有助于推导表达式后续可操作的类,比如`stream api`
- `select后置`其实本质和书写sql是一样的,虽然你在编写sql的时候是select先写但是你在不写`from group by`等操作后是无法编写select的内容只能用`*`来代替,所以其实sql的书写本质也是`select后置`

<img src="/sql-executor.png" width="500">



::: tip 说明!!!
> 这张图充分的说明了sql的执行过程和解析过程也是eq的书写过程,该执行流程中唯一能调换的就是`select`和`order by`的顺序
- 每次select会对之前的表达式进行汇总生成`内嵌视图`,对后续的select继续操作那么将对`内嵌视图`进行操作
:::


`select`语句出现在`where`，`orderBy`，`groupBy`，`having`等之后,如果表达式调用了`select`那么这个sql就是确定了的如果再次调用`where`那么前面的表达式将被视为`派生表`或`内嵌视图`，比如`select .... from (select id,name from table ) t where t.id = ?`每次`select`会对当前表达式进行一次结果集包装(`派生表`或`内嵌视图`)

## API

::: tabs

@tab entity

方法  | 支持后续链式| 描述
--- | --- | --- 
`select proxy` | ✅  | 用户可以自定义实现返回结果<br> (返回结果必须是Proxy类, 简单说就是DTO需要添加注解`@EntityProxy`)
`selectColumn` | ❌  | 用于用户返回单个字段, 当然也可以直接用`select(o->o.id())`需要`eq 2.0.0^`
`select(Class<TR>)` | ❌ | 自动映射表和DTO对应关系, (对应关系是DTO映射的columnName和实体的columnName一致则映射), 比如两个属性都是`name`, 但是实体添加了`@Column(value="my_name")`那么DTO的`name`属性如果没有添加对应的注解, 将无法自动映射需要手动`as`来进行查询
`select(Class<TR>,expression)`| ❌| 用户可以对任意`DTO`对象的class进行自动或者手动映射比如 <br> `select(DTO.class,o->Select.of(o.FETCHER.allFields(),o.name().as("myName")))`
`selectAutoInclude` | ❌  | 支持用户返回任意列的数据库对象关系关联的数据, 比如嵌套结构: <br> {name:.. , age:... ,list:[{...}, {...}]}
`selectAutoInclude expression` | ❌  | 支持用户返回任意列的数据库对象关系关联的数据,<br>并且还可以`额外自定义join`返回其他数据, 比如嵌套结构: <br> {name:.. , age:... ,list:[{...}, {...}]}

@tab lambda
编写中...
@tab client
编写中...

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

::: code-tabs
@tab 对象模式
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

:::

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