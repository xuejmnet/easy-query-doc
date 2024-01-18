---
title: 原生sql
order: 50
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
`easy-query`默认提供了数据库自定义`SQL`片段,其中 [《CaseWhen》](/easy-query-doc/guide/query/case-when) 就是有数据库自定义片段来自行实现api

如何设计api完全可以看用户自行实现。

## sqlSegmentAs
最好是封装自行实现,譬如case-when的实现就是扩展实现,如果没有这个封装的必要可以用sqlNativeSegment,支持属性和参数化

**建议参考 case when,如果临时使用建议使用 sqlNativeSegment**

## entityQuery
因为entityQuery的特殊性原生sql片段有如下特殊规则

- `where`、`join on`、`order`、`having`的sqlNativeSegment是具体表的`executeSQL`方法
- 如果需要返回expression则为表点sql比如`o.sql(....)` 
- `select`别名和`update set`为`setSQL`

```java
//where

            List<Topic> list2 = easyEntityQuery.queryable(Topic.class)
                    .where(o -> {

                        o.createTime().format("yyyy/MM/dd" ).eq("2023/01/01" );
                        o.or(() -> {
                            o.stars().ne(1);
                            o.createTime().le(LocalDateTime.of(2024, 1, 1, 1, 1));
                            o.title().notLike("abc" );
                        });
                        o.createTime().format("yyyy/MM/dd" ).eq("2023/01/01" );
                        o.id().nullOrDefault("yyyy/MM/dd" ).eq("xxx" );
                        o.executeSQL("{0} != {1}" , c -> {
                            c.expression(o.stars()).expression(o.createTime());
                        });
                        o.or(() -> {
                            o.createTime().format("yyyy/MM/dd" ).eq("2023/01/01" );
                            o.id().nullOrDefault("yyyy/MM/dd" ).eq("xxx" );
                            o.executeSQL("{0} != {1}" , c -> {
                                c.expression(o.stars()).expression(o.createTime());
                            });
                        });

                        o.createTime().format("yyyy/MM/dd" ).eq("2023/01/02" );
                        o.id().nullOrDefault("yyyy/MM/dd2" ).eq("xxx1" );
                    })
                    .fetcher(o -> o.FETCHER
                            .allFieldsExclude(o.id(), o.title())
                            .id().as(o.title())
                            .id())
                    .toList();


-- 第1条sql数据
SELECT
    t.`stars`,
    t.`create_time`,
    t.`id` AS `title`,
    t.`id` 
FROM
    `t_topic` t 
WHERE
    DATE_FORMAT(t.`create_time`,'%Y/%m/%d') = '2023/01/01' 
    AND (
        t.`stars` <> 1 
        OR t.`create_time` <= '2024-01-01 01:01' 
        OR t.`title` NOT LIKE '%abc%'
    ) 
    AND DATE_FORMAT(t.`create_time`,'%Y/%m/%d') = '2023/01/01' 
    AND IFNULL(t.`id`,'yyyy/MM/dd') = 'xxx' 
    AND t.`stars` != t.`create_time` 
    AND (
        DATE_FORMAT(t.`create_time`,'%Y/%m/%d') = '2023/01/01' 
        OR IFNULL(t.`id`,'yyyy/MM/dd') = 'xxx' 
        OR t.`stars` != t.`create_time`
    ) 
    AND DATE_FORMAT(t.`create_time`,'%Y/%m/%d') = '2023/01/02' 
    AND IFNULL(t.`id`,'yyyy/MM/dd2') = 'xxx1'

//order by
List<Topic> list3 = easyEntityQuery.queryable(Topic.class)
                    .where(o -> {
                        o.title().eq("title" );
                        o.id().eq("1" );
                    })
                    .orderBy(o -> {
                        o.createTime().format("yyyy-MM-dd HH:mm:ss" ).desc();
                        o.executeSQL("IFNULL({0},'') ASC" , c -> {
                            c.keepStyle().expression(o.stars());
                        });
                    })
                    .select(o -> new TopicProxy().selectExpression(o.FETCHER.title().id(), o.createTime().format("yyyy-MM-dd HH:mm:ss" )))
                    .toList();

SELECT t.`title`,t.`id`,DATE_FORMAT(t.`create_time`,'%Y-%m-%d %H:%i:%s') FROM `t_topic` t WHERE t.`title` = ? AND t.`id` = ? ORDER BY DATE_FORMAT(t.`create_time`,'%Y-%m-%d %H:%i:%s') DESC,IFNULL(t.`stars`,'') ASC


//select
List<Topic> list2 = easyEntityQuery.queryable(Topic.class)
                    .where(o -> o.createTime().format("yyyy/MM/dd" ).eq("2023/01/01" ))
                    .select(o -> new TopicProxy().adapter(r->{

                        r.title().set(o.stars().nullOrDefault(0).toStr());
                        r.alias().setSQL("IFNULL({0},'')" , c -> {
                            c.keepStyle();
                            c.expression(o.id());
                        });
                    }))
                    .toList();

SELECT CAST(IFNULL(t.`stars`,?) AS CHAR) AS `title`,IFNULL(t.`id`,'') AS `alias` FROM `t_topic` t WHERE DATE_FORMAT(t.`create_time`,'%Y/%m/%d') = ?


//update set
long rows = easyEntityQuery.updatable(Topic.class)
                    .setColumns(o->{
                        o.stars().setSQL("ifnull({0},0)+{1}", (context) -> {
                            context.expression(o.stars())
                                    .value(1);
                        });
                    })
                    .where(o -> o.id().eq("2"))
                    .executeRows();

UPDATE `t_topic` SET `stars` = ifnull(`stars`,0)+? WHERE `id` = ?
```

## sqlNativeSegment
无需编写复杂封装代码

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

案例来自 [jimmer](https://github.com/babyfish-ct/jimmer)

- 获取书本价格在所有书籍中的名次
- 获取数据的价格在所属书店中的名次


::: warning 注意点及说明!!!
> 如果`sqlNativeSegment`内部存在参数,那么整个表达式需要将单引号改成双引号,可以通过全局配置`keep-native-style:true`来全局将单引号默认替换为双引号,或者在使用的时候调用`.keepStyle()`
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
如果sqlNativeSegment中存在单引号,并且是模板模式存在变量,那么需要对其单引号变成双单引号,或者将单引号作为参数或者使用`keepStyle()`,也可以全局设置`keepStyle()`,

内部采用`MessageFormat`来格式化参数,所以如果有大数字需要传入`format`请先`toString()`后传入
```java
.sqlNativeSegment("DATE_FORMAT({0}, ''%Y-%m-%d'')", c -> { //因为存在变量参数所需需要使用双单引号代替,或者将格式化值变成参数
                    c.expression(User::getCreateTime);
                })


.sqlNativeSegment("DATE_FORMAT({0}, {1})", c -> { //因为存在变量参数所需需要使用双单引号代替,或者将格式化值变成参数
                    c.expression(User::getCreateTime).format("'%Y-%m-%d'");
                })

.sqlNativeSegment("DATE_FORMAT({0}, '%Y-%m-%d')", c -> { //因为存在变量参数所需需要使用双单引号代替,可以调用keepStyle方法或者全局配置keep-native-style为true
                    c.keepStyle().expression(User::getCreateTime);
                })


.sqlNativeSegment("DATE_FORMAT(`create_time`, '%Y-%m-%d')")//如果不存在变量则可以使用单引号
```



## 相关搜索
`原生sql` `自定义sql` `sql片段` `原生sql片段`