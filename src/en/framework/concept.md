---
title: Expression Concept
order: 100
---

# Expression Concept
Before using `eq`, you must understand some concepts. These concepts help you use `eq` and write related code.

In `eq`, expressions are mainly divided into two categories:
- Execution Fragment Expression
- Type Fragment Expression

::: tip Note!!!
> `Execution Fragment Expression` can be directly appended to SQL when executed in code block
> `Type Fragment Expression` needs to be used with assertion methods like `eq`, `ge`, `not` etc. in code block, or returned/passed as parameter in `select`, `groupBy`
:::

## Execution Fragment Expression
Execution fragment expression, as the name suggests, is an executed fragment, meaning it's directly appended to SQL expression in method mode. Common execution fragment expressions often use `void` as method return, commonly found in `where`, `orderBy`, `join`, `on`, `having`, etc.

For example:
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> {
            s.username().contains("XiaoMing");
            s.expression().sql("{0} > {1}", c -> {
                c.expression(s.createTime()).value(LocalDateTime.now());
            });
        }).toList();

    SELECT
        `id`,
        `create_time`,
        `username`,
        `phone`,
        `id_card`,
        `address` 
    FROM
       `t_sys_user` 
    WHERE
        `username` LIKE CONCAT('%', 'XiaoMing', '%') 
        AND `create_time` > '2025-05-10 22:24:41.668'
```

We can see that both `contains` and `s.expression().sql()` are execution fragment expressions. As long as the method is called, the corresponding expression will appear in the SQL.

## Type Fragment Expression
Different from execution fragment expression, type fragment expression is commonly used in `select`, `groupBy`. This expression mainly returns a type fragment for subsequent chain execution. If you call type fragment alone in `where`, `orderBy`, `join`, `on`, `having`, the expression will NOT be appended to SQL.

```java

    List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
            .where(s -> {
                //Wrong usage
                s.username().nullOrDefault("XiaoHong1");
                s.expression().sqlSegment("RAND()");

                //Correct usage
                s.username().nullOrDefault("XiaoHong2").contains("XiaoMing");
                s.expression().sqlSegment("RAND()").eq(123);

            }).toList();


    SELECT
        `id`,
        `create_time`,
        `username`,
        `phone`,
        `id_card`,
        `address` 
    FROM
        `easy-query-test`.`t_sys_user` 
    WHERE
        IFNULL(`username`, 'XiaoHong2') LIKE CONCAT('%', 'XiaoMing', '%') 
        AND RAND() = 123
```

Using type fragment expression alone in execution fragment code block will NOT add the expression to context. Must call `execution fragment expression` after `type fragment expression`.

If we need to return the corresponding fragment in select instead of using it.

## valueOf

**If we want to return user id and whether user name is "XiaoMing", what should we do?**

Wrong expression usage ❌
```java


     easyEntityQuery.queryable(SysUser.class)
             .select(s -> Select.DRAFT.of(
                     s.id(),
                     s.username().eq("XiaoMing");//This is execution fragment, we can't get specific type
             )).toList()

```

Correct usage ✅
```java



    List<Draft2<String, Boolean>> list1 = easyEntityQuery.queryable(SysUser.class)
            .select(s -> Select.DRAFT.of(
                    s.id(),
                    s.expression().valueOf(() -> {
                        s.username().eq("XiaoMing");
                    })
            )).toList();


    SELECT
        t.`id` AS `value1`,
        (t.`username` = 'XiaoMing') AS `value2` 
    FROM
        `easy-query-test`.`t_sys_user` t
```
Using `valueOf` to wrap the corresponding execution expression can convert it to the corresponding `boolean` type expression for user use.

## valueOf Advanced Usage

`valueOf` is commonly used to convert some judgments to `boolean` type, but we can use subsequent assertions to negate or achieve other various effects.

```java

        List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.expression().not(() -> {
                        s.username().contains("XiaoMing");
                    });
                })
                .toList();

    SELECT
        `id`,
        `create_time`,
        `username`,
        `phone`,
        `id_card`,
        `address` 
    FROM
        `easy-query-test`.`t_sys_user` 
    WHERE
        (
            NOT (`username` LIKE CONCAT('%', 'XiaoMing', '%'))
        )
```

The original query condition is to query users with filter condition `name contains XiaoMing`, but by adding the `not` function, the condition can be directly changed to `name does not contain XiaoMing`.

Similarly, we can achieve this through `valueOf`:

```java

        List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.expression().valueOf(() -> {
                        s.username().contains("XiaoMing");
                    }).eq(false);
                })
                .toList();


    SELECT
        `id`,
        `create_time`,
        `username`,
        `phone`,
        `id_card`,
        `address` 
    FROM
        `easy-query-test`.`t_sys_user` 
    WHERE
        (
            `username` LIKE CONCAT('%', 'XiaoMing', '%')
        ) = false
```

## Execution Fragment Expression to Type Fragment (Multiple Conditions)
```java

        List<SysUser> list1 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.expression().not(() -> {

                        s.phone().startsWith("123");
                        s.username().startsWith("Jin");
                    });
                    s.expression().valueOf(() -> {
                        s.or(() -> {

                            s.phone().startsWith("123");
                            s.username().startsWith("Jin");
                        });
                    }).eq(true);
                }).toList();



    SELECT
        `id`,
        `create_time`,
        `username`,
        `phone`,
        `id_card`,
        `address` 
    FROM
        `easy-query-test`.`t_sys_user` 
    WHERE
        (
            NOT (
                `phone` LIKE CONCAT('123', '%') 
            AND `username` LIKE CONCAT('Jin', '%')
            )
        ) 
        AND (
            (
                `phone` LIKE CONCAT('123', '%') 
                OR `username` LIKE CONCAT('Jin', '%')
            )
        ) = true
```

