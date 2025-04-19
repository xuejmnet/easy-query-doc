---
title: 多对多(无中间表)
order: 6
---
与有实体的多对多不同,无中间表的多对多更多的是将两个一对多通过相同的那一方将另外两个不想干的对象关系连接起来

譬如用户表有很多社交账号,用户又有很多本书,那么事实上每个社交账号可以通过用户进行关联也可以让社交账号直接关联到用户的书本

## 人员账号书籍

::: tabs
@tab 关系图
<img :src="$withBase('/images/many2many2.svg')">

@tab UserAccount
```java
@Table("t_user_account")
@Data
@EntityProxy
@EasyAlias("uc")
public class UserAccount implements ProxyEntityAvailable<UserAccount , UserAccountProxy> {
    @Column(primaryKey = true)
    private String id;
    private String uid;
    private String name;
    private LocalDateTime createTime;

    @Navigate(value = RelationTypeEnum.ManyToMany,
            selfProperty = "uid",
            targetProperty = "uid")
    private List<UserBook> books;

}
```
@tab UserBook
```java
@Table("t_user_book")
@Data
@EntityProxy
@EasyAlias("ub")
public class UserBook implements ProxyEntityAvailable<UserBook , UserBookProxy> {
    @Column(primaryKey = true)
    private String id;
    private String uid;
    private String name;
    private BigDecimal price;
}
```


:::

至此我们就完成了无中间表多对多将原本的相同根节点的两个一对多互相创建多对多的关系


## 案例
查询账户,条件为筛选出账户下有《JAVA开发这本书的》,返回账户名称和对应的书本数量
```java

List<Draft2<String, Long>> list = easyEntityQuery.queryable(UserAccount.class)
        .where(uc -> {
            uc.books().any(ub -> ub.name().eq("JAVA开发"));
        }).select(uc -> Select.DRAFT.of(
                uc.name(),
                uc.books().count()
        )).toList();

-- 第1条sql数据
SELECT
    t.`name` AS `value1`,
    (SELECT
        COUNT(*) 
    FROM
        `t_user_book` t2 
    WHERE
        t2.`uid` = t.`uid`) AS `value2` 
FROM
    `t_user_account` t 
WHERE
    EXISTS (
        SELECT
            1 
        FROM
            `t_user_book` t1 
        WHERE
            t1.`uid` = t.`uid` 
            AND t1.`name` = 'JAVA开发' LIMIT 1
    )
```

## 案例增强
查询账户,条件为筛选出账户下有《JAVA开发这本书的》,返回账户名称和对应的书本数量

一样的条件使用`隐式group`来实现
```java
List<Draft2<String, Long>> list = easyEntityQuery.queryable(UserAccount.class)
        .subQueryToGroupJoin(uc->uc.books())
        .where(uc -> {
            uc.books().any(ub -> ub.name().eq("JAVA开发"));
        }).select(uc -> Select.DRAFT.of(
                uc.name(),
                uc.books().count()
        )).toList();


-- 第1条sql数据
SELECT
    t.`name` AS `value1`,
    IFNULL(t2.`__count3__`,0) AS `value2` 
FROM
    `t_user_account` t 
LEFT JOIN
    (
        SELECT
            t1.`uid` AS `uid`,
            (CASE WHEN COUNT((CASE WHEN t1.`name` = 'JAVA开发' THEN 1 ELSE null END)) > 0 THEN true ELSE false END) AS `__any2__`,
            COUNT(*) AS `__count3__` 
        FROM
            `t_user_book` t1 
        GROUP BY
            t1.`uid`
    ) t2 
        ON t2.`uid` = t.`uid` 
WHERE
    IFNULL(t2.`__any2__`,false) = true
```