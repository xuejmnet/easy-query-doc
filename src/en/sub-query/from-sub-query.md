---
title: FROM Subquery
order: 5
---


Before understanding related subqueries, I hope you can first take a look at select-related subqueries [writing inline views](/easy-query-doc/en/ability/adv/expression)


If you've read the previous `select` chapter, then I believe you can easily write `FROM subqueries`. In `EasyEntityQuery`, users only need the return result of `select` to be a `proxy object`

## Using draft

```java

List<Draft3<String, String, String>> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.name().like("123");
        })
        .select(user -> Select.DRAFT.of(
                user.name(),
                user.id(),
                user.phone()
        )).where(user -> {
            user.value3().eq("1234567");
        }).orderBy(user -> user.value1().asc())
        .toList();

    

    SELECT
        t1.`value1` AS `value1`,
        t1.`value2` AS `value2`,
        t1.`value3` AS `value3` 
    FROM
        (SELECT
            t.`name` AS `value1`,
            t.`id` AS `value2`,
            t.`phone` AS `value3` 
        FROM
            `t_sys_user` t 
        WHERE
            t.`name` LIKE '%123%') t1 
    WHERE
        t1.`value3` = '1234567' 
    ORDER BY
        t1.`value1` ASC
```

## Custom inline view structure
Custom return result
```java

@Data
@EntityProxy
public class MyUserVO {
    private String vo1;
    private String vo2;
    private String vo3;
    /**
     * Bank card count
     */
    private Long bankCardCount;
}
```

```java

List<MyUserVO> list = easyEntityQuery.queryable(SysUser.class)
        .where(user -> {
            user.name().like("123");
        })
        .select(user -> new MyUserVOProxy()
                .vo1().set(user.name())
                .vo2().set(user.id())
                .vo3().set(user.phone())
                .bankCardCount().set(user.bankCards().count()) // Bank card count
        ).where(user -> {
            user.bankCardCount().gt(1L);
        }).orderBy(user -> user.bankCardCount().asc())
        .toList();



    SELECT
        t2.`vo1` AS `vo1`,
        t2.`vo2` AS `vo2`,
        t2.`vo3` AS `vo3`,
        t2.`bank_card_count` AS `bank_card_count` 
    FROM
        (SELECT
            t.`name` AS `vo1`,
            t.`id` AS `vo2`,
            t.`phone` AS `vo3`,
            (SELECT
                COUNT(*) 
            FROM
                `t_bank_card` t1 
            WHERE
                t1.`uid` = t.`id`) AS `bank_card_count` 
        FROM
            `t_sys_user` t 
        WHERE
            t.`name` LIKE '%123%') t2 
    WHERE
        t2.`bank_card_count` > 1 
    ORDER BY
        t2.`bank_card_count` ASC
```

