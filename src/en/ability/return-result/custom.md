---
title: Custom Flat Object
order: 30
---

# Assignment Types
`eq` has two main types of common assignments:
- 1. Implicit assignment `.select(DTO.class)`: Fields are mapped based on conventions between field names and DTO field names. See [Object Mapping DTO Rules](/en/easy-query-doc/framework/mapping-rule) for details.
- 2. Explicit assignment: As the name suggests, assigning values to receiving results through explicit programming methods.

## Explicit Assignment
`eq`'s implicit assignment is relatively simple and won't be discussed in detail here. This chapter mainly describes explicit assignment.

### Proxy Assignment
Requires adding `@EntityProxy` annotation to DTO, then return the corresponding proxy object when selecting, for example `return new DTOProxy()`, and set properties in the select method.

Return DTO:
```java
@Data
@EntityProxy
public class GenericDTO {
    private String value1;
    private String value2;
}

```
```java

        List<GenericDTO> list1 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.phone().startsWith("186");
                })
                .select(s -> new GenericDTOProxy()
                        .value1().set(s.phone())
                        .value2().set(s.address().subString(1, 10))
                ).toList();


    SELECT
        t.`phone` AS `value1`,
        SUBSTR(t.`address`, 2, 10) AS `value2` 
    FROM
        `easy-query-test`.`t_sys_user` t 
    WHERE
        t.`phone` LIKE CONCAT('186', '%')
```

### Generic Proxy Assignment
No need to add extra processing to DTO, no need to add `@EntityProxy`, directly use `new ClassProxy(DTO.class)` to return results.

`ClassProxy` is a generic class object mapping builder. Users who don't want to add `@EntityProxy` but want chain style can choose this method.

Return DTO:
```java
@Data
public class GenericDTO {
    private String value1;
    private String value2;
}

```

```java


        List<GenericDTO> list1 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.phone().startsWith("186");
                })
                .select(s -> new ClassProxy<>(GenericDTO.class)
                    //.selectAll(s)//If need full field mapping
                    .field("value1").set(s.phone())
                    .field("value2").set(s.address().subString(1, 10))
                ).toList();


    SELECT
        t.`phone` AS `value1`,
        SUBSTR(t.`address`, 2, 10) AS `value2` 
    FROM
        `easy-query-test`.`t_sys_user` t 
    WHERE
        t.`phone` LIKE CONCAT('186', '%')
```

If you don't want to use strings value1 and value2 as as parameters, you can also use lombok's another annotation `@FieldNameConstants` or method reference `GenericDTO::getValue1` (method reference requires property name to be standard Java bean property name).

Return DTO:
```java
@Data
@FieldNameConstants
public class GenericDTO {
    private String value1;
    private String value2;
}

```

Use `GenericDTO.Fields.value1` to achieve static compile-time constant usage and ensure strong-typed as:

```java


        List<GenericDTO> list1 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.phone().startsWith("186");
                })
                .select(s -> new ClassProxy<>(GenericDTO.class)
                    //.selectAll(s)//If need full field mapping
                    .field(GenericDTO.Fields.value1).set(s.phone())
                    .field(GenericDTO.Fields.value2).set(s.address().subString(1, 10))
                ).toList();


    SELECT
        t.`phone` AS `value1`,
        SUBSTR(t.`address`, 2, 10) AS `value2` 
    FROM
        `easy-query-test`.`t_sys_user` t 
    WHERE
        t.`phone` LIKE CONCAT('186', '%')
```

## Custom DTO, VO Return Results
Sometimes we want to directly return database query result objects as objects we need, instead of first querying database objects and then converting them in memory to objects we need. For example, after joining two tables, we want to return `select a.id,b.name from a join b ...`, then we will choose to create an object to receive the database return results.

## Multi-Table Return Expression

::: code-tabs
@tab Explicit Assignment 1
```java
//
easyEntityQuery
        .queryable(Topic.class)
        .leftJoin(BlogEntity.class, (t,t1) -> t.id().eq(t1.id()))
        .leftJoin(SysUser.class, (t,t1,t2) -> t.id().eq(t2.id()))
        .where((t,t1,t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.now());
        })
        //If don't want to use chain style brace method, execution order is code order, default use and to link
        //Dynamic expression
        .where(o -> {
            o.id().eq("1234");
            if (true) {
                o.id().eq("1234");//false means don't use this condition
            }
            o.id().eq(true,"1234");//false means don't use this condition

        })
        .select((t,t1,t2) -> new TopicTypeVOProxy()
                .id().set(t2.id())
                .title().set(t1.title())
                .createTime().set(t2.createTime())
        );

```
@tab Explicit Assignment 2
```java
//
        easyEntityQuery
                .queryable(Topic.class)
                .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
                .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
                .where((t, t1, t2) -> {
                    t.id().eq("123");
                    t1.title().like("456");
                    t2.createTime().eq(LocalDateTime.now());
                })
                //If don't want to use chain style brace method, execution order is code order, default use and to link
                //Dynamic expression
                .where(o -> {
                    o.id().eq("1234");
                    if (true) {
                        o.id().eq("1234");//false means don't use this condition
                    }
                    o.id().eq(true, "1234");//false means don't use this condition

                })
                .select(s -> new ClassProxy<>(TopicTypeVO.class)
                    .field(GenerTopicTypeVOProxy.Fields.id).set(t2.id())
                    .field(TopicTypeVOProxy.Fields.title).set(t1.title())
                    .field(TopicTypeVOProxy.Fields.createTime).set(t.createTime())
                );

```
:::

## Multi-Table Custom Result API

::: code-tabs
@tab Object Mode
```java


@Data
@EntityProxy
public class  QueryVO implements ProxyEntityAvailable<QueryVO , QueryVOProxy> {
    private String id;
    private String field1;
    private String field2;
}

List<QueryVO> list = easyEntityQuery.queryable(Topic.class)
        //First join uses two parameters, parameter 1 is first table Topic, parameter 2 is second table BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //Second join uses three parameters, parameter 1 is first table Topic, parameter 2 is second table BlogEntity, third parameter is third table SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//Single condition where parameter is main table Topic
        //Supports single parameter or full parameters, full parameter count is main table + join table count 
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.of(2021, 1, 1, 1, 1));
        })
        .select((t, t1, t2)->new QueryVOProxy()
                .id().set(t.id())
                .field1().set(t1.title())//Map second table's title field to VO's field1 field
                .field2().set(t2.id())//Map third table's id field to VO's field2 field
        ).toList();

==> Preparing: SELECT t.`id`,t1.`title` AS `field1`,t2.`id` AS `field2` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` LEFT JOIN `easy-query-test`.`t_sys_user` t2 ON t.`id` = t2.`id` WHERE t.`id` = ? AND t.`id` = ? AND t1.`title` LIKE ? AND t2.`create_time` = ?
==> Parameters: false(Boolean),123(String),123(String),%456%(String),2021-01-01T01:01(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 0



List<QueryVO> list = easyEntityQuery.queryable(Topic.class)
        //First join uses two parameters, parameter 1 is first table Topic, parameter 2 is second table BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //Second join uses three parameters, parameter 1 is first table Topic, parameter 2 is second table BlogEntity, third parameter is third table SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//Single condition where parameter is main table Topic
        //Supports single parameter or full parameters, full parameter count is main table + join table count. Chain style can switch operation table through then
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.of(2021, 1, 1, 1, 1));
        })
        .select((t, t1, t2)->{
                QueryVOProxy r = new QueryVOProxy();
                r.selectAll(t);//Query t.* query all fields from table t Topic
                r.selectIgnores(t.title());//Ignore Topic's title field
                r.field1().set(t1.title());//Map second table's title field to VO's field1 field
                r.field2().set(t2.id());//Map third table's id field to VO's field2 field
                return r;
        }).toList();


==> Preparing: SELECT t.`id`,t1.`title` AS `field1`,t2.`id` AS `field2` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` LEFT JOIN `easy-query-test`.`t_sys_user` t2 ON t.`id` = t2.`id` WHERE t.`id` = ? AND t.`id` = ? AND t1.`title` LIKE ? AND t2.`create_time` = ?
==> Parameters: false(Boolean),123(String),123(String),%456%(String),2021-01-01T01:01(LocalDateTime)
<== Time Elapsed: 2(ms)
<== Total: 0
```
:::

