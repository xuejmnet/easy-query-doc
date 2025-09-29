---
title: 原生sql
---

# select
`easy-query`的不但支持表达式的强类型sql,也支持手写sql来实现crud

## 查询sqlQuery
强类型结果返回
### 无参数强类型返回
```java
List<BlogEntity> blogEntities = easyQuery.sqlQuery("SELECT * FROM t_blog t", BlogEntity.class);

==> Preparing: SELECT * FROM t_blog t
<== Total: 100

```
### 有参数强类型返回
```java
List<BlogEntity> blogEntities = easyQuery.sqlQuery("SELECT * FROM t_blog t where t.id=?", BlogEntity.class, Collections.singletonList("1"));

==> Preparing: SELECT * FROM t_blog t where t.id=?
==> Parameters: 1(String)
<== Total: 1
```

## 查询sqlQueryMap
`Map`返回默认`key`忽略大小写
### 无参数Map返回
```java
 List<Map<String, Object>> blogs = easyQuery.sqlQueryMap("SELECT * FROM t_blog t");
 
 ==> Preparing: SELECT * FROM t_blog t
<== Total: 100
```

### 有参数Map返回
```java
List<Map<String, Object>> blogs = easyQuery.sqlQueryMap("SELECT * FROM t_blog t  where t.id=?", Collections.singletonList("1"));

==> Preparing: SELECT * FROM t_blog t  where t.id=?
==> Parameters: 1(String)
<== Total: 1
```

## 执行

### 无参数
```java
String newContent= UUID.randomUUID().toString();
long l = easyQuery.sqlExecute("update t_blog set content='"+newContent +"' where id='1'")


==> Preparing: update t_blog set content='3af23d78-86f1-48b1-bc51-ce0e0f63113d' where id='1'
<== Total: 1
```

### 有参数
```java
String newContent= UUID.randomUUID().toString();
long l = easyQuery.sqlExecute("update t_blog set content=? where id=?", Arrays.asList(newContent,"1"));

==> Preparing: update t_blog set content=? where id=?
==> Parameters: 0d93119a-9e57-4d71-a67b-58d24823a88b(String),1(String)
<== Total: 1
```



# 自定义SQL片段
`easy-query`默认提供了数据库自定义`SQL`片段,其中 [《CaseWhen》](/easy-query-doc/query/case-when) 就是有数据库自定义片段来自行实现api

如何设计api完全可以看用户自行实现。



## entityQuery
因为entityQuery的特殊性原生sql片段有如下特殊规则

- `where`、`join on`、`order`、`having`的原生sql片段是具体表的`o.expression().rawSQLStatement(......).executeSQL()`方法
- `select`别名和`update set`为`setSQL`,`o.expression().rawSQLStatement(....)` 
- `o.expression()`来获取表达式其中`expression().rawSQLStatement()`来执行sql用于`join、where、orderBy`需调用`executeSQL`,其中`expression().rawSQLStatement()`用来返回片段类型用于`select、groupBy`等



::: tip 说明!!!
> `o.expression().rawSQLStatement(....)`表示返回一个sql片段如果您是在`join、where、orderBy`方法内部这个片段不会生效需要调用`executeSQL`也就是`o.expression().rawSQLStatement(....).executeSQL()`,如果您闲这个太麻烦可以使用`o.expression().rawSQLCommand(....)`内部自动调用`executeSQL`,如果您是在`select、groupBy`等方法中使用那么是返回当做一个片段使用无需调用执行sql方法
:::
## rawSQLStatement
自定义SQL类型片段，顾名思义是生成一个类型片段,需要用户使用才会生效

参数  | 功能  
---  | --- 
sqlTemplate  | 第一个参数sql模板，支持变量用{0}....{n}
parameters  | 第二个可变参数用于填充前面的参数占位

## rawSQLCommand
自定义SQL执行片段，顾名思义是生成一个执行片段,创建时即执行
参数  | 功能  
---  | --- 
sqlTemplate  | 第一个参数sql模板，支持变量用{0}....{n}
parameters  | 第二个可变参数用于填充前面的参数占位


## 随机排序

::: code-tabs
@tab 对象模式
```java

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(b -> {
            b.id().eq("123");
        }).orderBy(t -> {
            //直接生成ORDER BY RAND() ASC
            t.expression().rawSQLStatement("RAND()").asc();
        }).toList();

//上下一样
List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(b -> {
            b.id().eq("123");
        }).orderBy(t -> {
            //直接生成ORDER BY RAND()
            t.expression().rawSQLStatement("RAND()").executeSQL();
        }).toList();

//上下一样
List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(b -> {
            b.id().eq("123");
        }).orderBy(t -> {
            t.expression().rawSQLCommand("RAND()");
        }).toList();

SELECT
    `id`,
    `stars`,
    `title`,
    `create_time` 
FROM
    `t_topic` 
WHERE
    `id` = '123' 
ORDER BY
    RAND()

```

@tab 属性模式
```java

List<Topic> list = easyQueryClient.queryable(Topic.class)
        .where(b -> {
            b.eq("id","123");
        }).orderByAsc(t -> {
            t.sqlNativeSegment("RAND()");
        }).toList();


SELECT
    `id`,
    `stars`,
    `title`,
    `create_time` 
FROM
    `t_topic` 
WHERE
    `id` = '123' 
ORDER BY
    RAND()
```

:::

## 随机排序带参数

::: code-tabs
@tab 对象模式
```java

List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(b -> {
            b.id().eq("123");
        }).orderBy(t -> {
            t.expression().rawSQLCommand("IFNULL({0},{1}) DESC", t.stars(), 1);
            t.expression().rawSQLCommand("RAND()");
        }).toList();


SELECT
    `id`,
    `stars`,
    `title`,
    `create_time` 
FROM
    `t_topic` 
WHERE
    `id` = '123' 
ORDER BY
    IFNULL(`stars`,1) DESC,RAND()




List<Topic> list = easyEntityQuery.queryable(Topic.class)
        .where(b -> {
            b.id().eq("123");
            b.expression().rawSQLCommand("{0}!={1}",c->{
                c.expression(b.stars()).expression(b.createTime());
            });
        }).orderBy(t -> {
            t.expression().rawSQLCommand("IFNULL({0},{1}) DESC", t.stars(), 1);
            t.expression().rawSQLCommand("RAND()");
        }).toList();

SELECT
    `id`,
    `stars`,
    `title`,
    `create_time` 
FROM
    `t_topic` 
WHERE
    `id` = '123' 
    AND `stars`!=`create_time` 
ORDER BY
    IFNULL(`stars`,1) DESC,RAND()
```

@tab 属性模式
```java


List<Topic> list = easyQueryClient.queryable(Topic.class)
        .where(b -> {
            b.eq("id","123");
        }).orderByAsc(t -> {
            t.sqlNativeSegment("IFNULL({0},{1}) DESC",c->{
                c.expression("stars").value(1);
            });
            t.sqlNativeSegment("RAND()");
        }).toList();


SELECT
    `id`,
    `stars`,
    `title`,
    `create_time` 
FROM
    `t_topic` 
WHERE
    `id` = '123' 
ORDER BY
    IFNULL(`stars`,1) DESC,RAND()




List<Topic> list = easyQueryClient.queryable(Topic.class)
        .where(b -> {
            b.eq("id","123");
            b.sqlNativeSegment("{0}!={1}",c->{
                c.expression("stars").expression("createTime");
            });
        }).orderByAsc(t -> {
            t.sqlNativeSegment("IFNULL({0},{1}) DESC",c->{
                c.expression("stars").value(1);
            });
            t.sqlNativeSegment("RAND()");
        }).toList();




SELECT
    `id`,
    `stars`,
    `title`,
    `create_time` 
FROM
    `t_topic` 
WHERE
    `id` = '123' 
    AND `stars`!=`create_time` 
ORDER BY
    IFNULL(`stars`,1) DESC,RAND()
```

::: 

## 返回结果
`entityQuery`使用`expression().rawSQLStatement(....)`其余几个`api`任然是`sqlNativeSegment`
```java
//因为默认原生sql片段式Object类型所以无法精确指定类型可以通过asAnyType或者asXXX类型来快速编译时确定类型来指定返回接受的类型

List<Draft2<Double, Integer>> list = easyEntityQuery.queryable(Topic.class)
        .where(b -> {
            b.id().eq("123");
        }).select(t -> Select.DRAFT.of(
                t.expression().rawSQLStatement("RAND()").asAnyType(Double.class),
                t.expression().rawSQLStatement("IFNULL({0},{1})", t.stars(), 1).asInteger()
        )).toList();


SELECT
    RAND() AS `value1`,
    IFNULL(t.`stars`,1) AS `value2` 
FROM
    `t_topic` t 
WHERE
    t.`id` = '123'       
```
返回片段设置别名
```java


        List<Topic> listx = easyEntityQuery.queryable(Topic.class)
                .where(b -> {
                    b.id().eq("123");
                }).select(Topic.class,t -> Select.of(
                        t.expression().rawSQLStatement("RAND()").asAnyType(Double.class).as("stars"),
                        t.expression().rawSQLStatement("IFNULL({0},{1})", t.stars(), 1).asInteger().as("createTime")
                )).toList();


SELECT
    RAND() AS `stars`,
    IFNULL(t.`stars`,1) AS `createTime` 
FROM
    `t_topic` t 
WHERE
    t.`id` = '123'
```

## 静态函数sql片段封装
`NativeSQL`原生sql的封装我们可以通过静态函数来进行处理

比如mysql的findInSet函数可能是mysql特有的，那么我们可以通过如下方法实现

```java
    public static void findInSet(String value, PropTypeColumn<String> column) {
        Expression expression = EasyProxyParamExpressionUtil.parseContextExpressionByParameters(column);

        expression.rawSQLCommand("FIND_IN_SET({0},{1})", value, column);
    }


    List<BlogEntity> list2 = easyEntityQuery.queryable(BlogEntity.class)
            .where(t_blog -> {

                findInSet("123", t_blog.title().nullOrDefault("123"));

            }).toList();


SELECT `id`, `create_time`, `update_time`, `create_by`, `update_by`
	, `deleted`, `title`, `content`, `url`, `star`
	, `publish_time`, `score`, `status`, `order`, `is_top`
	, `top`
FROM `t_blog`
WHERE `deleted` = false
	AND FIND_IN_SET('123', IFNULL(`title`, '123'))
```

实现原理说明:通过请求参数来分析解析出当前表达式上下文然后通过表达式上下文调用`rawSQLCommand`函数，这边有一个缺点就是如果传入的参数都是基本类型比如String或者int那么是不可以的，因为无法通过这种类型来获取当前上下文，但是实际业务中不可能存在这种情况，所以基本上可以确定肯定能通过`parseContextExpressionByParameters`来解析当前sql上下文


静态函数类型片段封装
```java
 public static AnyTypeExpression<String> subStr(PropTypeColumn<String> column, int begin, int end) {
    Expression expression = EasyProxyParamExpressionUtil.parseContextExpressionByParameters(column);

    return expression.rawSQLStatement("SUBSTR({0},{1},{2})", column, begin, end).asAnyType(String.class);
}


List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
        .where(t_blog -> {

            findInSet("123", subStr(t_blog.title(), 1, 2));

        }).toList();
```
通过封装静态函数类型片段可以做到将数据库片段表达式进行类型化，当然这边返回的是`AnyTypeExpression<String>`实际我们可以通过`asStr()`函数而不是`asAnyType(String.class)`

```java
public static StringTypeExpression<String> subStr(PropTypeColumn<String> column, int begin, int end) {
    Expression expression = EasyProxyParamExpressionUtil.parseContextExpressionByParameters(column);

    return expression.rawSQLStatement("SUBSTR({0},{1},{2})", column, begin, end).asStr();
}
```

## 自定义原生sql查询

通用查询但是需要支持所有数据库?
```java
EasyPageResult<Topic> pageResult1 = easyEntityQuery.queryable("select * from t_topic where id != ? ", Topic.class, Arrays.asList("123"))
        .where(t -> t.id().ne("456"))
        .toPageResult(1, 2);

==> Preparing: SELECT COUNT(*) FROM (select * from t_topic where id != ? ) t WHERE t.`id` <> ?
==> Parameters: 123(String),456(String)
<== Time Elapsed: 6(ms)
<== Total: 1
==> Preparing: SELECT * FROM (select * from t_topic where id != ? ) t WHERE t.`id` <> ? LIMIT 2
==> Parameters: 123(String),456(String)
<== Time Elapsed: 3(ms)
<== Total: 2



```

join自定义sql表
```java
EntityQueryable<TopicProxy, Topic> joinTable = easyEntityQuery.queryable("select * from t_topic where id != ? ", Topic.class, Arrays.asList("123"));
List<Draft2<String, String>> list = easyEntityQuery.queryable(BlogEntity.class)
        .leftJoin(joinTable, (b, t2) -> b.id().eq(t2.id()))
        .where((b1, t2) -> {
            b1.createTime().gt(LocalDateTime.now());
            t2.createTime().format("yyyy").eq("2014");
        }).select((b1, t2) -> Select.DRAFT.of(
                b1.id(),
                t2.id()
        )).toList();

==> Preparing: SELECT t.`id` AS `value1`,t2.`id` AS `value2` FROM `t_blog` t LEFT JOIN (SELECT * FROM (select * from t_topic where id != ? ) t1) t2 ON t.`id` = t2.`id` WHERE t.`deleted` = ? AND t.`create_time` > ? AND DATE_FORMAT(t2.`create_time`,'%Y') = ?
==> Parameters: 123(String),false(Boolean),2024-07-16T12:12:35.343(LocalDateTime),2014(String)
 
-- 第1条sql数据
SELECT
    t.`id` AS `value1`,
    t2.`id` AS `value2` 
FROM
    `t_blog` t 
LEFT JOIN
    (
        SELECT
            * 
        FROM
            (select
                * 
            from
                t_topic 
            where
                id != '123' ) t1) t2 
                ON t.`id` = t2.`id` 
        WHERE
            t.`deleted` = false 
            AND t.`create_time` > '2024-07-16 12:12:35.343' 
            AND DATE_FORMAT(t2.`create_time`,'%Y') = '2014'       
```


## sqlNativeSegment
无需编写复杂封装代码，该函数主要是`EasyQueryClient`

说明

- `sqlNativeSegment`一次个参数为原生数据库片段
- 第二个参数为表达式,如果第一个原生sql片段存在变量比如表列或者参数值,那么可以通过第二个参数lambda选择`expression`或者`value`或`format`，`expreesion`传入当前表的属性表达式或者制定表的,value传递常量值会议参数形式体现在片段上,`format`会拼接到字符串上,拼接的规则底层为`MessageFormat`仅需满足此即可


方法  | 参数说明 | 描述  
--- | --- | --- 
expression | 对象属性,或者其他表的对象属性或者表达式query  | 如果是表对象属性那么无需管理表别名，哪怕是join下也可以自己适应,如果是query表达式那么可以实现子查询类似的功能
value | 参数值  | 将以参数形式"?"附加到sql片段上面
constValue(已作废) | 常量值  | 将以普通字符串拼接的形式拼接上去
format | 常量值  | 将以普通字符串拼接的形式拼接上去
setAlias | 别名  | 用于设置列别名一般用户查询较多



## 案例二
`OVER(Partition By ... Order By ...)` 采用pgsql语法来实现

- 获取书本价格在所有书籍中的名次
- 获取数据的价格在所属书店中的名次


::: warning 注意点及说明!!!
> 如果`sqlNativeSegment`内部存在参数,框架默认会将表达式的单引号改成双引号
:::

```java

@Table("t_book_test")
@Data
public class H2BookTest {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private String edition;
    private String price;
    private String storeId;
}

String sql = easyQuery.queryable(H2BookTest.class)
            .select(o -> o.columnAll()
                    .sqlNativeSegment("rank() over(order by {0} desc) as rank1", it -> it.expression(H2BookTest::getPrice))
                    .sqlNativeSegment("rank() over(partition by {0} order by {1} desc) as rank2", it -> it
                            .expression(H2BookTest::getStoreId)
                            .expression(H2BookTest::getPrice)
                    )
            ).toSQL();


SELECT 
    id,name,edition,price,store_id,
    rank() over(order by price desc) as rank1,
    rank() over(partition by store_id order by price desc) as rank2 
FROM t_book_test



//别名自动设置
String sql = easyQuery.queryable(H2BookTest.class)
        .asAlias("x")
        .select(o -> o.columnAll()
                .sqlNativeSegment("rank() over(order by {0} desc) as rank1", it -> it.expression(H2BookTest::getPrice))
                .sqlNativeSegment("rank() over(partition by {0} order by {1} desc) as rank2", it -> it
                        .expression(H2BookTest::getStoreId)
                        .expression(H2BookTest::getPrice)
                )
        ).toSQL();

SELECT 
    x.id,x.name,x.edition,x.price,x.store_id,
    rank() over(order by x.price desc) as rank1,
    rank() over(partition by x.store_id order by x.price desc) as rank2 
FROM t_book_test x


//合并两个sql native segment
String sql = easyQuery.queryable(H2BookTest.class)
        .asAlias("x")
        .select(o -> o.columnAll()
                .sqlNativeSegment("rank() over(order by {0} desc) as rank1,rank() over(partition by {1} order by {2} desc) as rank2",
                        it -> it.expression(H2BookTest::getPrice)
                                .expression(H2BookTest::getStoreId)
                                .expression(H2BookTest::getPrice)
                )
        ).toSQL();


SELECT x.id,x.name,x.edition,x.price,x.store_id,
    rank() over(order by x.price desc) as rank1,
    rank() over(partition by x.store_id order by x.price desc) as rank2 
    FROM t_book_test x



String sql = easyQuery.queryable(H2BookTest.class)
            .where(o -> o.sqlNativeSegment("regexp_like({0},{1})", it -> it.expression(H2BookTest::getPrice)
                            .value("^Ste(v|ph)en$")))
            .select(o -> o.columnAll()).toSQL();

SELECT id,name,edition,price,store_id FROM t_book_test WHERE regexp_like(price,?)


//join多表下的sql native segment
String sql = easyQuery.queryable(H2BookTest.class)
                .leftJoin(DefTable.class,(t,t1)->t.eq(t1,H2BookTest::getPrice,DefTable::getMobile))
                //1.4.31后版本支持 参数复用 {1} {1}可以加多个并且支持
                .where((o,o1) -> o.sqlNativeSegment("regexp_like({0},{1}) AND regexp_like({2},{1})", it -> it
                        .expression(H2BookTest::getPrice)//单参数使用默认表的也就是o.sqlNativeSegment的o表就是第一张表
                        .value("^Ste(v|ph)en$")
                        .expression(o1,DefTable::getAvatar))//使用第二张表的avatar
                        )
                .select(o -> o.columnAll()).toSQL();

SELECT t.id,t.name,t.edition,t.price,t.store_id 
FROM t_book_test t LEFT JOIN t_def_table t1 ON t.price = t1.mobile 
WHERE regexp_like(t.price,?) AND regexp_like(t1.avatar,?)
```

## 注意 

内部采用`MessageFormat`来格式化参数,所以如果有大数字需要传入`format`请先`toString()`后传入
```java
.sqlNativeSegment("DATE_FORMAT({0}, ''%Y-%m-%d'')", c -> { //因为存在变量参数所需需要使用双单引号代替,或者将格式化值变成参数
                    c.expression(User::getCreateTime);
                })


.sqlNativeSegment("DATE_FORMAT({0}, {1})", c -> { //因为存在变量参数所需需要使用双单引号代替,或者将格式化值变成参数
                    c.expression(User::getCreateTime).format("'%Y-%m-%d'");
                })

.sqlNativeSegment("DATE_FORMAT({0}, '%Y-%m-%d')", c -> { 
                    c.expression(User::getCreateTime);
                })


.sqlNativeSegment("DATE_FORMAT(`create_time`, '%Y-%m-%d')")//如果不存在变量则可以使用单引号
```



## 相关搜索
`原生sql` `自定义sql` `sql片段` `原生sql片段`