---
title: from子查询
order: 5
---


在了解相关子查询前我希望您可以线观看一下select相关的子查询[内嵌视图的编写](/easy-query-doc/ability/select/select)


如果你看了之前的`select`章节那么我相信你能很简单的写出`from子查询`,在`EasyEntityQuery`下用户只需要`select`的返回结果是一个`proxy对象`即可

## 使用draft

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

## 自定义内嵌视图结构
自定义返回结果
```java

@Data
@EntityProxy
public class MyUserVO {
    private String vo1;
    private String vo2;
    private String vo3;
    /**
     * 银行卡数量
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
                .bankCardCount().set(user.bankCards().count()) // 银行卡数量
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