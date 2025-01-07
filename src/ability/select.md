---
title: 查询
---

# 说明

`easy-query`在 java 的静态语言特性下，参考众多 C# ORM(efcore,freesql,sqlsugar...),和 java ORM(mybatis-plus,beetlsql...)实现了支持单表多表，复杂，嵌套的 sql 表达式，并且拥有强类型语法提示，可以帮助不想写 sql 的用户，有洁癖的用户多一个选择.

## select

`eq`的`select`是用来终结当前表达式生成新的表达式的方式,简单理解为表示告诉框架当前表达式需要返回的结果是`select`的结果,如果您了解`stream api`那么可以简单的理解为其`map`操作

::: tip 概念补充 说明!!!

> `eq`这个 orm 与之前您认识的 java 其他 orm 不相同,这个 orm 实现了近乎 95%的 sql 功能,其中一个就是子查询嵌套,所谓的子查询嵌套就是将之前查询结果视作`派生表`或叫做`内嵌视图`,后续我们将其统一称其为`内嵌视图`,比如`select .... from (select id,name from table where name like ?) t where t.id = ?`这个 sql 的括号内的那一部分(`select id,name from table where name like ?`)我们称之为`内嵌视图`
:::

所以我们可以很轻易的实现其他 orm 无法实现的

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

## select 后置风格

和原生 SQL 不同，在`eq`提供的 DSL 中，使用的是`select`后置风格，这个风格多见于`c#`语言的`orm`中和`stream api`有一种异曲同工之处，那么为什么`eq`选择`select`后置?

- 强类型的 java 语言类型`select`后置有助于推导表达式后续可操作的类,比如`stream api`
- `select后置`其实本质和书写 sql 是一样的,虽然你在编写 sql 的时候是 select 先写但是你在不写`from group by`等操作后是无法编写 select 的内容只能用`*`来代替,所以其实 sql 的书写本质也是`select后置`

<img src="/sql-executor.png" width="500">

::: tip 说明!!!

> 这张图充分的说明了 sql 的执行过程和解析过程也是 eq 的书写过程,该执行流程中唯一能调换的就是`select`和`order by`的顺序

> 每次 select 会对之前的表达式进行汇总生成`内嵌视图`,对后续的 select 继续操作那么将对`内嵌视图`进行操作

> 其中6和7可以互相调换,如果先`select`后`order`那么将会对匿名表进行排序,如果先`order`后`select`那么会先排序后生成匿名表但是因为匿名表后续没有操作所以会展开
  :::

`select`语句出现在`where`，`orderBy`，`groupBy`，`having`等之后,如果表达式调用了`select`那么这个 sql 就是确定了的如果再次调用`where`那么前面的表达式将被视为`派生表`或`内嵌视图`，比如`select .... from (select id,name from table ) t where t.id = ?`每次`select`会对当前表达式进行一次结果集包装(`派生表`或`内嵌视图`)



<img src="/simple-query.jpg">

我们以这个简单的例子为例可以看到我们应该编写的顺序是select在最后
```java
easyEntityQuery.queryable(HelpProvince.class)
        .where(o -> o.id().eq("1"))
        .orderBy(o -> o.id().asc())
        .select(o -> new HelpProvinceProxy()
                .id().set(o.id())
                .name().set(o.name())
        )
        //本质就是如下写法 不建议使用双括号的初始化可能会造成内存泄露
        // .select(o->{
        //        HelpProvinceProxy province= new HelpProvinceProxy();
        //         province.id().set(o.id());
        //         province.name().set(o.name());
        //         return province;
        // })
        //.select(o->o.FETCHER.id().name().fetchProxy())//如果返回结果一样可以用fetcher
        .toList();
```

复杂的查询顺序
<img src="/simple-nest-query.jpg">

```java
easyEntityQuery.queryable(HelpProvince.class) //1
        .where(o->o.id().eq("1")) //2
        .orderBy(o->o.id().asc()) //3
        .select(o->new HelpProvinceProxy()//4 
                .id().set(o.id())
                .name().set(o.name())
        )
        //.select(o->o.FETCHER.id().name().fetchProxy())//如果返回结果一样可以用fetcher
        .where(o->o.id().eq("1")) // 5
        .select(o->new HelpProvinceProxy()
                .id().set(o.id())//6
        )
        .toList();
```

::: warning 注意点及说明!!!
> select一般都是最后写的,在你没有写表的时候只能用 * 来代替,先写表确定,然后写条件写排序写分组等确定了之后写选择的select的列不写就是主表的*如果在写where就对前面的表进行括号进行匿名表处理以此类推
:::

## 分解表达式

### 1
```java
表达式:easyEntityQuery.queryable(HelpProvince.class)

sql:select * from help_province
```
### 2
```java
表达式:easyEntityQuery.queryable(HelpProvince.class).where(o->o.id().eq("1")) 

sql:select * from help_province where id='1'
```

### 3
```java
表达式:easyEntityQuery.queryable(HelpProvince.class).where(o->o.id().eq("1")).orderBy(o->o.id().asc())

sql:select * from help_province where id='1' order by id asc
```
### 4
```java
表达式:          easyEntityQuery.queryable(HelpProvince.class)
                        .where(o -> o.id().eq("1"))
                        .orderBy(o -> o.id().asc())
                        .select(o -> new HelpProvinceProxy()
                                .id().set(o.id())
                                .name().set(o.name())
                        )

sql:select id,name from help_province where id='1' order by id asc
```
以`select`方法作为终结方法结束本次`sql`链式,后续的操作就是将`select`和之前的表达式转成`匿名sql`类似`select * from (select * from help_province) t`，其中`fetcher`是`select`的简化操作不支持返回VO，当且仅当返回结果为自身时用于快速选择列

### 5
```java
表达式:easyEntityQuery.queryable(HelpProvince.class)
                .where(o->o.id().eq("1"))
                .orderBy(o->o.id().asc())
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                        .name().set(o.name())
                )//转成匿名表sql
                .where(o->o.id().eq("1")) 

sql:select * from (select id,name from help_province where id='1' order by id asc) t where t.id='1'
```

### 6
```java
表达式:easyEntityQuery.queryable(HelpProvince.class)
                .where(o->o.id().eq("1"))
                .orderBy(o->o.id().asc())
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                        .name().set(o.name())
                )//转成匿名表sql
                .where(o->o.id().eq("1"))
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                ) 

sql:select id from (select id,name from help_province where id='1' order by id asc) t where t.id='1'
```

::: tip 链式说明!!!
> select之前的所有操作比如多个where,多个orderby都是对之前的追加,limit是替换前面的操作多次limit获取最后一次
> 在entityQuery下groupBy不支持连续调用两个groupBy之间必须存在一个select指定要查询的结果才可以,其他api下多次调用行为也是追加
:::


## 查询对象

`firstOrNull`、`firstNotNull`、`singleOrNull`、`singleNotNull`分别是对查询结果进行第一条数据的返回
方法  | 默认值 | 描述  
--- | --- | --- 
firstOrNull | null  | 查询返回第一条数据,如果没有结果返回null,默认会对sql添加limit 1或者top 1之类的的限制,部分场景可能会对索引有相关影响
firstNotNull | - | 查询返回第一条数据,如果没有结果将会抛错`EasyQueryFirstOrNotNullException`,默认会对sql添加limit 1或者top 1之类的的限制,部分场景可能会对索引有相关影响
singleOrNull |  null | 查询返回第一条数据,如果没有结果返回null,如果本次查询结果数据条数大于1条那么将会抛错`EasyQuerySingleMoreElementException`,和`first`的区别是`不会`添加`limit 1`或者`top 1`
singleNotNull| - | 查询返回第一条数据,如果没有结果将会抛错`EasyQuerySingleOrNotNullException`,如果本次查询结果数据条数大于1条那么将会抛错`EasyQuerySingleMoreElementException`,和`first`的区别是`不会`添加`limit 1`或者`top 1`



`toList`对查询结果进行多条数据返回
方法  | 默认值 | 描述  
--- | --- | --- 
toList |  `new ArrayList`  | 查询返回符合条件的所有数据,并且以`ArrayList`集合进行返回,如果没有符合条件的结果将返回空的`ArrayList`而不是`null`



`toPageResult`对查询结果进行分页查询
方法  | 默认值 | 描述  
--- | --- | --- 
toPageResult |  `new DefaultPageResult`  | 查询返回符合条件的分页结果,如果没有符合条件的结果将返回默认分页对象而不是`null`



`toStreamResult`对查询结果进行迭代器模式返回,符合超大数量级的数据获取
方法  | 默认值 | 描述  
--- | --- | --- 
toStreamResult |  `new DefaultJdbcStreamResultSet`  | 查询返回符合条件的可迭代结果集,支持获取`Iterable`接口也支持`foreach`,使用时需要配合`try finally`来关闭资源

### 测试数据
```java
@Data
@Table("t_topic")
@EntityFileProxy
public class Topic implements ProxyEntityAvailable<Topic , TopicProxy>{

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private LocalDateTime createTime;

}
```

### 查询第一条数据
查询第一条数据没有的情况下返回null

::: code-tabs
@tab 对象模式
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("123"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```

@tab lambda模式
```java
Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "123"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```
@tab 属性模式

```java
Topic topic = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "123"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```

::: 

查询第一条数据且仅存在至多一条数据,没有的情况下返回null

::: code-tabs
@tab 对象模式
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("123"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```

@tab lambda模式
```java
Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "123"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
@tab 属性模式

```java
Topic topic = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "123"))
                    .singleOrNull();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
::: 

### 查询第一条数据且不为null

::: code-tabs
@tab 对象模式
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.id().eq("123"))
        .firstNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```

@tab lambda模式
```java

Topic topic = easyQuery.queryable(Topic.class)
        .where(o -> o.eq(Topic::getId, "123"))
        .firstNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```
@tab 属性模式
```java

Topic topic = easyQueryClient.queryable(Topic.class)
        .where(o -> o.eq("id", "123"))
        .firstNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 123(String)
```
::: 

查询第一条数据且仅存在至多一条数据,没有的情况下返回null

::: code-tabs
@tab 对象模式
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
        .where(o -> o.id().eq("123"))
        .singleNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```

@tab lambda模式
```java

Topic topic = easyQuery.queryable(Topic.class)
        .where(o -> o.eq(Topic::getId, "123"))
        .singleNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
@tab 属性模式
```java

Topic topic = easyQueryClient.queryable(Topic.class)
        .where(o -> o.eq("id", "123"))
        .singleNotNull("未找到对应的数据");

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
::: 
默认异常替换成业务异常
::: warning notnull异常!!!
> 框架默认针对NotNull返回的错误类型可能并不是你所希望得我们可以通过重写接口实现自己的自定义异常，接口`AssertExceptionFactory.class`默认实现类`DefaultAssertExceptionFactory.class`  [查看替换框架行为](/easy-query-doc/config/replace-configure)
:::


### 查询多条数据
查询第一条数据没有的情况下返回`new ArrayList<>(0)`实例的接口`List<T>`

::: code-tabs
@tab 对象模式
```java
List<Topic> topics = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("123"))
                    .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```

@tab lambda模式
```java
List<Topic> topics = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "123"))
                    .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```
@tab 属性模式
```java
List<Topic> topics = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "123"))
                    .toList();

==> Preparing: SELECT `id`,`stars`,`title`,`create_time` FROM `t_topic` WHERE `id` = ?
==> Parameters: 123(String)
```


::: 

::: tip 说明!!!
> `single`和`first`获取单条数据 `toList`获取多条数据,大部分情况下终结方法就是这两个
:::
### 自定义列
返回当前对象自定义列

::: code-tabs
@tab 对象模式
```java
Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    .select(o->{
                        TopicProxy r = new TopicProxy();
                        r.id().set(o.id());
                        r.title().set(o.title());
                        return r;
                    })
                    .firstOrNull();

==> Preparing: SELECT `id` AS `id`,`title` AS `title` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)

如果返回的是当前类型可以直接使用fetcher函数，缺点仅支持主表切仅支持当前类型

Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    .select(o->o.FETCHER.id().title().name().content()........fetchProxy())
                    .firstOrNull();

==> Preparing: SELECT `id`,`title`  FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)

也可以采用表达式非强类型

Topic topic = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.id().eq("1"))
                    //如果列很多可以用fetcher
                    //r.selectExpression(o.FETCHER.id().title().name().content().......);
                    .select(o->new TopicProxy().selectExpression(o.id(),o.title()))
                    .firstOrNull();

==> Preparing: SELECT `id`,`title`  FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
```

@tab lambda模式
```java
Topic topic = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "1"))
                    .select(o->o.column(Topic::getId).column(Topic::getTitle))
                    .firstOrNull();

==> Preparing: SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
```
@tab 属性模式
```java
Topic topic = easyQueryClient.queryable(Topic.class)
                    .where(o -> o.eq("id", "1"))
                    .select(o->o.column("id").column("title"))
                    .firstOrNull();

==> Preparing: SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? LIMIT 1
==> Parameters: 1(String)
```
::: 

### 创建匿名表

::: code-tabs
@tab 对象模式
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

SELECT t1.`id`,t1.`title` 
FROM (SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`id` = ?) t1 
LEFT JOIN `t_topic` t2 ON t1.`id` = t2.`id` WHERE t2.`id` 

==> Preparing: SELECT t1.`id`,t1.`title` FROM (SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`id` = ?) t1 LEFT JOIN `t_topic` t2 ON t1.`id` = t2.`id` WHERE t2.`id` = ? AND t1.`id` = ?
==> Parameters: 1(String),123(String),456(String)
```

@tab lambda模式
```java
通过`select(class,expression)`表达式可以创建对应的匿名表,如果使用`select(expression)`那么不会创建匿名表
//  SELECT `id`,`title` FROM `t_topic` WHERE `id` = ? 
Queryable<Topic> query = easyQuery.queryable(Topic.class)
                    .where(o -> o.eq(Topic::getId, "1"))
                    .select(Topic.class, o -> o.column(Topic::getId).column(Topic::getTitle));

List<Topic> list = query.leftJoin(Topic.class, (t, t1) -> t.eq(t1, Topic::getId, Topic::getId))
                    .where((t, t1) -> {
                        t1.eq(Topic::getId, "123");
                        t.eq(Topic::getId, "456");
                    }).toList();

SELECT t1.`id`,t1.`title` 
FROM (SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`id` = ?) t1 
LEFT JOIN `t_topic` t2 ON t1.`id` = t2.`id` WHERE t2.`id` 

==> Preparing: SELECT t1.`id`,t1.`title` FROM (SELECT t.`id`,t.`title` FROM `t_topic` t WHERE t.`id` = ?) t1 LEFT JOIN `t_topic` t2 ON t1.`id` = t2.`id` WHERE t2.`id` = ? AND t1.`id` = ?
==> Parameters: 1(String),123(String),456(String)
<== Time Elapsed: 5(ms)
<== Total: 0
```

::: 



## 单表api使用

::: code-tabs
@tab 对象模式
```java

// 创建一个可查询SysUser的表达式
EntityQueryable<SysUserProxy, SysUser> queryable = entityQuery.queryable(SysUser.class);

//单个条件链式查询
//toList表示查询结果集
List<SysUser> sysUsers = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq( "123xxx"))
        .toList();



//条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers =entityQuery.queryable(SysUser.class)
        .where(o ->{
                o.id().eq("123xxx");
                o.idCard().like("123")
        }).toList();//toList表示查询结果集


//多个where之间也是用and链接和上述方法一个意思 条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like("123")).toList();


//返回单个对象没有查询到就返回null
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like( "123")).firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq"123xxx"))
        .where(o -> o.idCard().like("123"))
        .orderBy(o->o.createTime().desc())
        .orderBy(o->o.id().asc()).firstOrNull();

//仅查询id和createTime两列
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
@tab lambda模式
```java
// 创建一个可查询SysUser的表达式
Queryable<SysUser> queryable = easyQuery.queryable(SysUser.class);

//单个条件链式查询
//toList表示查询结果集 
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
                .where(o -> o.eq(SysUser::getId, "123xxx"))
                .toList();

//条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
        .where(o -> o
                .eq(SysUser::getId, "123xxx")
                .like(SysUser::getIdCard,"123")
        ).toList();//toList表示查询结果集 


//多个where之间也是用and链接和上述方法一个意思 条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard,"123")).toList();


//返回单个对象没有查询到就返回null
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard, "123")).firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard, "123"))
        .orderByDesc(o->o.column(SysUser::getCreateTime))
        .orderByAsc(o->o.column(SysUser::getId)).firstOrNull();


//仅查询id和createTime两列
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard, "123"))
        .orderByDesc(o->o.column(SysUser::getCreateTime))
        .orderByAsc(o->o.column(SysUser::getId))
        .select(o->o.column(SysUser::getId).column(SysUser::getCreateTime))
        //.select(o->o.columnAll().columnIgnore(SysUser::getCreateTime))//获取user表的所有字段除了createTime字段
        .firstOrNull();
```
:::

## 多表查询api


::: code-tabs
@tab 对象模式
```java

// 创建一个可查询SysUser的表达式
EntityQueryable<SysUserProxy, SysUser> queryable = entityQuery.queryable(SysUser.class);


List<Topic> list = entityQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.now());
        })
        //toList默认只查询主表数据
        .toList();
        
```
@tab lambda模式
```java

List<Topic> list = easyQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.eq(t2, Topic::getId, SysUser::getId))
        .where(o -> o.eq(Topic::getId, "123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
        .where((t, t1, t2) -> t.eq(Topic::getId, "123").then(t1).like(BlogEntity::getTitle, "456")
                .then(t2).eq(BaseEntity::getCreateTime, LocalDateTime.now()))
        //如果不想用链式的then来切换也可以通过lambda 大括号方式执行顺序就是代码顺序,默认采用and链接
        .where((t, t1, t2) -> {
            t.eq(Topic::getId, "123");
            t1.like(BlogEntity::getTitle, "456");
            t1.eq(BaseEntity::getCreateTime, LocalDateTime.now());
        })
        //toList默认只查询主表数据
        .toList();
```
:::


::: tip 链式说明!!!
> leftJoin第二个lambda入参参数个数和join使用的表个数一样,入参参数顺序就是from和join的表

> 在entityQuery下groupBy不支持连续调用两个groupBy之间必须存在一个select指定要查询的结果才可以,其他api下多次调用行为也是追加
:::

## 多表返回表达式

自定义返回dto和vo结果请看[点击跳转](/easy-query-doc/query/dto-vo)

::: code-tabs
@tab 对象模式
```java
//
easyEntityQuery
        .queryable(Topic.class)
        .leftJoin(BlogEntity.class, (t,t1) -> t.id().eq(t1.id()))
        .leftJoin(SysUser.class, (t,t1,t2) -> t.id().eq(t2.id()))
        .where((t,t1,t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.now());
        })
        //如果不想用链式大括号方式执行顺序就是代码顺序,默认采用and链接
        //动态表达式
        .where(o -> {
            o.id().eq("1234");
            if (true) {
                o.id().eq("1234");//false表示不使用这个条件
            }
            o.id().eq(true,"1234");//false表示不使用这个条件

        })
        .select((t,t1,t2) -> new TopicTypeVOProxy()
                .id().set(t2.id())
                .name().set(t1.name())
                .content().set(t2.title())
        );
        //上下两种表达式都是一样的,上面更加符合bean设置,并且具有强类型推荐使用上面这种
        // .select((t,t1,t2) -> {
        //    TopicTypeVOProxy r = new TopicTypeVOProxy();
        //    r.selectExpression(t2.id(),t1.name(),t2.title().as(r.content()));
        //    return rl
        // });

```
@tab lambda模式
```java
//返回Queryable3那么可以对这个查询表达式进行后续操作,操作都是可以操作三张表的
Queryable3<Topic, BlogEntity, SysUser> where = easyQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity,对应关系就是参数顺序
        .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))//t表示Topic表,t1表示BlogEntity表,对应关系就是参数顺序
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser,对应关系就是参数顺序
        .leftJoin(SysUser.class, (t, t1, t2) -> t.eq(t2, Topic::getId, SysUser::getId))
        .where(o -> o.eq(Topic::getId, "123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
        .where((t, t1, t2) -> t.eq(Topic::getId, "123").then(t1).like(BlogEntity::getTitle, "456")
                .then(t2).eq(BaseEntity::getCreateTime, LocalDateTime.now()))
        //如果不想用链式的then来切换也可以通过lambda 大括号方式执行顺序就是代码顺序,默认采用and链接
        .where((t, t1, t2) -> {
            t.eq(Topic::getId, "123");
            t1.like(BlogEntity::getTitle, "456");
            t1.eq(BaseEntity::getCreateTime, LocalDateTime.now());
        });



//也支持单表的Queryable返回,但是这样后续操作只可以操作单表没办法操作其他join表了
Queryable<Topic> where = easyQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.eq(t2, Topic::getId, SysUser::getId))
        .where(o -> o.eq(Topic::getId, "123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
        .where((t, t1, t2) -> t.eq(Topic::getId, "123").then(t1).like(BlogEntity::getTitle, "456")
                .then(t2).eq(BaseEntity::getCreateTime, LocalDateTime.now()))
        //如果不想用链式的then来切换也可以通过lambda 大括号方式执行顺序就是代码顺序,默认采用and链接
        .where((t, t1, t2) -> {
            t.eq(Topic::getId, "123");
            t1.like(BlogEntity::getTitle, "456");
            t1.eq(BaseEntity::getCreateTime, LocalDateTime.now());
        });
```
:::


## 多表自定义结果api


::: code-tabs
@tab 对象模式
```java


@Data
@EntityFileProxy
public class  QueryVO implements ProxyEntityAvailable<QueryVO , QueryVOProxy> {
    private String id;
    private String field1;
    private String field2;
}

List<QueryVO> list = easyEntityQuery.queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.of(2021, 1, 1, 1, 1));
        })
        .select((t, t1, t2)->new QueryVOProxy()
                .id().set(t.id())
                .field1().set(t1.title())//将第二张表的title字段映射到VO的field1字段上
                .field2().set(t2.id())//将第三张表的id字段映射到VO的field2字段上
        ).toList();

==> Preparing: SELECT t.`id`,t1.`title` AS `field1`,t2.`id` AS `field2` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` LEFT JOIN `easy-query-test`.`t_sys_user` t2 ON t.`id` = t2.`id` WHERE t.`id` = ? AND t.`id` = ? AND t1.`title` LIKE ? AND t2.`create_time` = ?
==> Parameters: false(Boolean),123(String),123(String),%456%(String),2021-01-01T01:01(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 0



List<QueryVO> list = easyEntityQuery.queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.of(2021, 1, 1, 1, 1));
        })
        .select((t, t1, t2)->{
                QueryVOProxy r = new QueryVOProxy();
                r.selectAll(t);//查询t.*查询t表Topic表全字段
                r.selectIgnores(t.title());//忽略掉Topic的title字段
                r.field1().set(t1.title());//将第二张表的title字段映射到VO的field1字段上
                r.field2().set(t2.id());//将第三张表的id字段映射到VO的field2字段上
                return r;
        }).toList();


==> Preparing: SELECT t.`id`,t1.`title` AS `field1`,t2.`id` AS `field2` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` LEFT JOIN `easy-query-test`.`t_sys_user` t2 ON t.`id` = t2.`id` WHERE t.`id` = ? AND t.`id` = ? AND t1.`title` LIKE ? AND t2.`create_time` = ?
==> Parameters: false(Boolean),123(String),123(String),%456%(String),2021-01-01T01:01(LocalDateTime)
<== Time Elapsed: 2(ms)
<== Total: 0
```
@tab lambda模式
```java


    @Data
    public class  QueryVO{
        private String id;
        private String field1;
        private String field2;
    }
        List<QueryVO> list = easyQuery
                .queryable(Topic.class)
                //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
                .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
                .leftJoin(SysUser.class, (t, t1, t2) -> t.eq(t2, Topic::getId, SysUser::getId))
                .where(o -> o.eq(Topic::getId, "123"))//单个条件where参数为主表Topic
                //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
                .where((t, t1, t2) -> t.eq(Topic::getId, "123").then(t1).like(BlogEntity::getTitle, "456")
                        .then(t2).eq(BaseEntity::getCreateTime, LocalDateTime.now()))
                //如果不想用链式的then来切换也可以通过lambda 大括号方式执行顺序就是代码顺序,默认采用and链接
                .where((t, t1, t2) -> {
                    t.eq(Topic::getId, "123");
                    t1.like(BlogEntity::getTitle, "456");
                    t1.eq(BaseEntity::getCreateTime, LocalDateTime.now());
                })
                .select(QueryVO.class, (t, t1, t2) ->
                        //将第一张表的所有属性的列映射到vo的列名上,第一张表也可以通过columnAll将全部字段映射上去
                        // ,如果后续可以通过ignore方法来取消掉之前的映射关系
                        t.column(Topic::getId)
                                .then(t1)
                                //将第二张表的title字段映射到VO的field1字段上
                                .columnAs(BlogEntity::getTitle, QueryVO::getField1)
                                .then(t2)
                                //将第三张表的id字段映射到VO的field2字段上
                                .columnAs(SysUser::getId, QueryVO::getField2)
                ).toList();




        List<QueryVO> list = easyQuery
                .queryable(Topic.class)
                //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
                .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
                .leftJoin(SysUser.class, (t, t1, t2) -> t.eq(t2, Topic::getId, SysUser::getId))
                .where(o -> o.eq(Topic::getId, "123"))//单个条件where参数为主表Topic
                //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
                .where((t, t1, t2) -> t.eq(Topic::getId, "123").then(t1).like(BlogEntity::getTitle, "456")
                        .then(t2).eq(BaseEntity::getCreateTime, LocalDateTime.now()))
                //如果不想用链式的then来切换也可以通过lambda 大括号方式执行顺序就是代码顺序,默认采用and链接
                .where((t, t1, t2) -> {
                    t.eq(Topic::getId, "123");
                    t1.like(BlogEntity::getTitle, "456");
                    t1.eq(BaseEntity::getCreateTime, LocalDateTime.now());
                })
                .select(QueryVO.class, (t, t1, t2) ->
                        //将第一张表的所有属性的列映射到vo的列名上,第一张表也可以通过columnAll将全部字段映射上去
                        // ,如果后续可以通过ignore方法来取消掉之前的映射关系
                        t.columnAll().columnIgnore(Topic::getTitle)//当前方法不生效因为其实压根也没有映射上去
                                .then(t1)
                                //将第二张表的title字段映射到VO的field1字段上
                                .columnAs(BlogEntity::getTitle, QueryVO::getField1)
                                .then(t2)
                                //将第三张表的id字段映射到VO的field2字段上
                                .columnAs(SysUser::getId, QueryVO::getField2)
                ).toList();
```
:::