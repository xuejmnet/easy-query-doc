---
title: Anonymous Type 1
order: 10
---

## Draft Type
Returning tuple types, also called anonymous types, can directly return typed result objects without defining entities. Used for intermediate variables within business methods. For example, after `group`, getting `key` and `count` - because the result set is relatively simple, we can use draft types.

Currently supports `Select.DRAFT` and `Select.TUPLE`:
```java

        List<Draft2<String, String>> list1 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.phone().startsWith("186");
                }).select(s -> Select.DRAFT.of(
                        s.phone(),//value1
                        s.username()//value2
                )).toList();
        for (Draft2<String, String> draft2 : list1) {

            String phone = draft2.getValue1();
            String username = draft2.getValue2();
        }
```
Draft can be created directly using the plugin during select:

<img :src="$withBase('/images/select_draft.jpg')" >

::: tip Note!!!
> `Draft1...10` only supports 1-10 by default. Users can extend and implement related draft types. Commonly used for temporary local variable definition and retrieval.
:::

## Part Partial Column Type
We often use `select t.*,t1.name as t1Name from ...` to return a table object and other partial columns:
```java

        List<Part1<SysUser, Long>> parts = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.phone().startsWith("186");
                }).select(s -> Select.PART.of(
                        s,
                        s.blogs().count()
                )).toList();
        for (Part1<SysUser, Long> part : parts) {
            SysUser sysUser = part.getEntity();
            Long partColumn1 = part.getPartColumn1();
        }


    SELECT
        t.`id`,
        t.`create_time`,
        t.`username`,
        t.`phone`,
        t.`id_card`,
        t.`address`,
        (SELECT
            COUNT(*) 
        FROM
            `t_blog` t1 
        WHERE
            t1.`deleted` = false 
            AND t1.`title` = t.`id`) AS `__part__column1` 
    FROM
        `easy-query-test`.`t_sys_user` t 
    WHERE
        t.`phone` LIKE CONCAT('186', '%')
```

## PartitionBy

```java

        List<Part1<SysUser, Long>> parts = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.phone().startsWith("186");
                }).select(s -> Select.PART.of(
                        s.selectIgnores(s.address()),
                        s.expression().rowNumberOver().partitionBy(s.phone()).orderBy(s.idCard())
                )).toList();
        for (Part1<SysUser, Long> part : parts) {
            SysUser sysUser = part.getEntity();
            Long partColumn1 = part.getPartColumn1();
        }


    SELECT
        t.`id`,
        t.`create_time`,
        t.`username`,
        t.`phone`,
        t.`id_card`,
        (ROW_NUMBER() OVER (PARTITION BY t.`phone` ORDER BY t.`id_card` ASC)) AS `__part__column1` 
    FROM
        `easy-query-test`.`t_sys_user` t 
    WHERE
        t.`phone` LIKE CONCAT('186', '%')
```

## Part List Ignore Some Properties

```java

        List<Part1<SysUser, Long>> parts = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.phone().startsWith("186");
                }).select(s -> Select.PART.of(
                        s.selectIgnores(s.address()),
                        s.blogs().count()
                )).toList();
        for (Part1<SysUser, Long> part : parts) {
            SysUser sysUser = part.getEntity();
            Long partColumn1 = part.getPartColumn1();
        }




    SELECT
        t.`id`,
        t.`create_time`,
        t.`username`,
        t.`phone`,
        t.`id_card`,
        (SELECT
            COUNT(*) 
        FROM
            `t_blog` t1 
        WHERE
            t1.`deleted` = false 
            AND t1.`title` = t.`id`) AS `__part__column1` 
    FROM
        `easy-query-test`.`t_sys_user` t 
    WHERE
        t.`phone` LIKE CONCAT('186', '%')
```

::: tip Note!!!
> `Part1...10` only supports 1-10 by default. Users can extend and implement related draft types. Commonly used for temporary local variable definition and retrieval, and partition functions like row_number.
:::

