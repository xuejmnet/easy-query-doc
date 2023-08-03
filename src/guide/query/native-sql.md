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

## sqlNativeSegment
无需编写复杂封装代码

说明

- `sqlNativeSegment`一次个参数为原生数据库片段
- 第二个参数为表达式,如果第一个原生sql片段存在变量比如表列或者参数值,那么可以通过第二个参数lambda选择`expression`或者`value`，`expreesion`传入当前表的属性表达式或者制定表的,value传递常量值


## 案例二
`OVER(Partition By ... Order By ...)` 采用pgsql语法来实现

案例来自 [jimmer](https://github.com/babyfish-ct/jimmer)

- 获取书本价格在所有书籍中的名次
- 获取数据的价格在所属书店中的名次

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