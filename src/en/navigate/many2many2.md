---
title: Many-to-Many (Without Mapping Table)
order: 6
---
Unlike many-to-many with entities, many-to-many without a mapping table is more about connecting two unrelated objects through the same party by combining two one-to-many relationships.

For example, a user table has many social accounts, and a user also has many books. In fact, each social account can be associated through the user, or social accounts can be directly associated with the user's books.

## User Account Books

::: tabs
@tab Relationship Diagram
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

Thus, we have completed the many-to-many without a mapping table, connecting two one-to-many relationships with the same root node to create a many-to-many relationship with each other.


## Example
Query accounts with the condition of filtering accounts that have the book "JAVA Development", and return the account name and the number of corresponding books
```java

List<Draft2<String, Long>> list = easyEntityQuery.queryable(UserAccount.class)
        .where(uc -> {
            uc.books().any(ub -> ub.name().eq("JAVA Development"));
        }).select(uc -> Select.DRAFT.of(
                uc.name(),
                uc.books().count()
        )).toList();

-- SQL statement 1
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
            AND t1.`name` = 'JAVA Development' LIMIT 1
    )
```

## Enhanced Example
Query accounts with the condition of filtering accounts that have the book "JAVA Development", and return the account name and the number of corresponding books

Same condition implemented using `implicit group`
```java
List<Draft2<String, Long>> list = easyEntityQuery.queryable(UserAccount.class)
        .subQueryToGroupJoin(uc->uc.books())
        .where(uc -> {
            uc.books().any(ub -> ub.name().eq("JAVA Development"));
        }).select(uc -> Select.DRAFT.of(
                uc.name(),
                uc.books().count()
        )).toList();


-- SQL statement 1
SELECT
    t.`name` AS `value1`,
    IFNULL(t2.`__count3__`,0) AS `value2` 
FROM
    `t_user_account` t 
LEFT JOIN
    (
        SELECT
            t1.`uid` AS `uid`,
            (CASE WHEN COUNT((CASE WHEN t1.`name` = 'JAVA Development' THEN 1 ELSE NULL END)) > 0 THEN true ELSE false END) AS `__any2__`,
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

