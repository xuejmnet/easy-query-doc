---
title: 匿名类型1
order: 10
---

## Draft草稿类型
返回元组类又叫做匿名类型,在无需定义实体的情况下可以直接返回带有类型的结果对象,用于业务在方法内部的中间变量,比如`group`后获取`key`和`count`因为结果集比较简单所以我们可以采用草稿类型来实现
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
其中draft可以通过插件在select的时候可以直接利用插件创建


<img :src="$withBase('/images/select_draft.jpg')" >


::: tip 说明!!!
> `Draft1...10`默认只支持1-10用户可以自行扩展实现相关的草稿类型，常用于临时局部变量定义获取
:::



## Part部分列类型
我们经常会使用`select t.*,t1.name as t1Name from ...`这种写法返回一个表对象和其他部分列
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

## PartationBy

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

## 部分类表忽略部分属性

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



::: tip 说明!!!
> `Part1...10`默认只支持1-10用户可以自行扩展实现相关的草稿类型，常用于临时局部变量定义获取和row_number等partation函数
:::