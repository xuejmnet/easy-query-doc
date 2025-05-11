---
title: 表达式概念
order: 5
---

# 表达式概念
在使用`eq`前你必须要只晓得一些概念,这些概念有助于你对使用`eq`和编写相关的代码有帮助

在`eq`里面表达式主要分为两大类
- 执行片段表达式
- 类型片段表达式



::: tip 说明!!!
> `执行片段表达式`代码块中运行即可拼接到sql中
> `类型片段表达式`代码块中运行需要配合断言方法比如`eq ge not`等函数在`select groupBy`需要以类型表达式返回或者作为参数传递
:::


## 执行片段表达式
执行片段表达式顾名思义是执行的片段也就是他是直接以方法模式拼接到sql表达式里面,常见的执行片段表达式常常以`void`作为方法返回,常见于`where orderBy join on having`等地方
譬如
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

我们可以看到`contains`和`s.expression().sq()`都是我们现在说的执行片段表达式,他只需要方法被调用那么对应的表达式就会出现在sql中


## 类型片段表达式
和执行片段表达式不同的是类型片段表达式,类型片段表达式常用于`select groupBy`中这个表达式主要是返回一个类型片段方便后续链式执行,如果单独在`where orderBy join on having`中调用类型片段那么并不会将表达式拼接到sql中

```java

    List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
            .where(s -> {
                //错误的用法
                s.username().nullOrDefault("小红1");
                s.expression().sqlSegment("RAND()");

                //正确的用法
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

在执行片段代码块中单独使用类型片段表达式并不会将表达式添加到上下文中,必须要在`类型片段表达式`后调用`执行片段表达式`才可以

如果在select中我们需要返回对应的片段而不是使用


## valueOf

**如果我们希望返回用户id和用户是否叫做小明两个字段我们应该怎么做**

错误的表达式用法❌
```java


     easyEntityQuery.queryable(SysUser.class)
             .select(s -> Select.DRAFT.of(
                     s.id(),
                     s.username().eq("小明");//此处是执行片段我们无法获取具体类型
             )).toList()

```

正确的用法✅
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
使用`valueOf`包裹对应的执行表达式后可以将其转换成对应的`boolean`类型的表达式给用户使用


## valueOf高级用法

`valueOf`常用于将一些判断转成`boolean`类型,但是我们可以通过后续的断言来实现取反或者实现其他各种效果

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

原本的查询条件是查询用户筛选条件为`姓名包含小明`但是通过添加`not`函数后就可以直接将条件变为`姓名不包含小明`

同理我们可以通过`valueOf`来实现

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

## 执行片段表达式转类型片段(多条件)
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