---
title: 自定义SQL片段
---


# 自定义SQL片段
`easy-query`默认提供了数据库自定义`SQL`片段,其中 [《CaseWhen》](/easy-query-doc/guide/query/case-when) 就是有数据库自定义片段来自行实现api

如何设计api完全可以看用户自行实现。

## sqlSegmentAs
最好是封装自行实现

## sqlNativeSegment
无需编写复杂封装代码

## 分组求第一条
`OVER(Partition By ... Order By ...)` 采用pgsql语法来实现

案例来自 jimmer

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

```