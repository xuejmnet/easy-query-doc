---
title: Expression Concepts
order: 100
---

# Expression Concepts
Before using `eq`, you must understand some concepts that will help you use `eq` and write related code

In `eq`, expressions are mainly divided into two major categories:
- Execution Fragment Expressions
- Type Fragment Expressions



::: tip Note!!!
> `Execution Fragment Expressions` will be concatenated into SQL when the code block is run
> `Type Fragment Expressions` need to be used with assertion methods like `eq ge not` etc. in code blocks, and need to be returned as type expressions or passed as parameters in `select groupBy`
:::


## Execution Fragment Expressions
As the name suggests, execution fragment expressions are executed fragments, meaning they are directly concatenated into SQL expressions in method mode. Common execution fragment expressions often return `void` as the method return type, commonly seen in `where orderBy join on having` etc.
For example
```java

List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
        .where(s -> {
            s.username().contains("小明");
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
        `username` LIKE CONCAT('%', '小明', '%') 
        AND `create_time` > '2025-05-10 22:24:41.668'
```

We can see that both `contains` and `s.expression().sql()` are what we now call execution fragment expressions. As long as the method is called, the corresponding expression will appear in the SQL.


## Type Fragment Expressions
Different from execution fragment expressions, type fragment expressions are commonly used in `select groupBy`. This expression mainly returns a type fragment for subsequent chained execution. If a type fragment is called alone in `where orderBy join on having`, the expression will not be concatenated into SQL

```java

    List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
            .where(s -> {
                //Wrong usage
                s.username().nullOrDefault("小红1");
                s.expression().sqlSegment("RAND()");

                //Correct usage
                s.username().nullOrDefault("小红2").contains("小明");
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
        IFNULL(`username`, '小红2') LIKE CONCAT('%', '小明', '%') 
        AND RAND() = 123
```

Using type fragment expressions alone in execution fragment code blocks will not add the expression to the context. You must call an `execution fragment expression` after the `type fragment expression`.

If in select we need to return the corresponding fragment instead of using


## valueOf

**If we want to return the user ID and whether the user is named 小明, what should we do**

Wrong expression usage❌
```java


     easyEntityQuery.queryable(SysUser.class)
             .select(s -> Select.DRAFT.of(
                     s.id(),
                     s.username().eq("小明");//This is an execution fragment, we cannot get the specific type
             )).toList()

```

Correct usage✅
```java



    List<Draft2<String, Boolean>> list1 = easyEntityQuery.queryable(SysUser.class)
            .select(s -> Select.DRAFT.of(
                    s.id(),
                    s.expression().valueOf(() -> {
                        s.username().eq("小明");
                    })
            )).toList();


    SELECT
        t.`id` AS `value1`,
        (t.`username` = '小明') AS `value2` 
    FROM
        `easy-query-test`.`t_sys_user` t
```
After wrapping the corresponding execution expression with `valueOf`, it can be converted into a corresponding `boolean` type expression for user use


## Advanced valueOf Usage

`valueOf` is commonly used to convert some judgments into `boolean` types, but we can use subsequent assertions to implement negation or achieve various other effects

```java

        List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.expression().not(() -> {
                        s.username().contains("小明");
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
            NOT (`username` LIKE CONCAT('%', '小明', '%'))
        )
```

The original query condition was to query users with the filter condition `name contains 小明`, but after adding the `not` function, the condition directly becomes `name does not contain 小明`

Similarly, we can implement this through `valueOf`

```java

        List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.expression().valueOf(() -> {
                        s.username().contains("小明");
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
            `username` LIKE CONCAT('%', '小明', '%')
        ) = false
```

## Execution Fragment Expression to Type Fragment (Multiple Conditions)
```java

        List<SysUser> list1 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.expression().not(() -> {

                        s.phone().startsWith("123");
                        s.username().startsWith("金");
                    });
                    s.expression().valueOf(() -> {
                        s.or(() -> {

                            s.phone().startsWith("123");
                            s.username().startsWith("金");
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
            AND `username` LIKE CONCAT('金', '%')
            )
        ) 
        AND (
            (
                `phone` LIKE CONCAT('123', '%') 
                OR `username` LIKE CONCAT('金', '%')
            )
        ) = true
```
