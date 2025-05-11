---
title: 自定义平铺对象
order: 30
---


# 赋值类型
`eq`常见的赋值有两大类
- 1.隐式赋值`.select(DTO.class)` 约定字段名和DTO字段名以某种关系约定来进行映射具体参考[对象映射DTO规则](/easy-query-doc/framework/mapping-rule)
- 2.显式赋值顾名思义是通过显式的编程式方式set到接受结果上

## 显式赋值
`eq`的隐式赋值是相对简单的我们这边不在这边过多讲述,本章节主要讲述显式赋值，显式赋值也可以分为两大类
- 1.支持链式的proxy赋值
- 2.不支持链式的手动as赋值


### 支持链式的proxy赋值
需要对DTO进行`@EntityProxy`注解的添加然后在select的时候返回对应的代理对象也就是比如`return new DTOProxy()`在select方法中对其进行set属性

返回的DTO
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

### 不支持链式的手动as赋值
不需要对DTO进行额外处理可以不添加`@EntityProxy`,直接使用Select.of()进行结果的返回


返回的DTO
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
                .select(GenericDTO.class, s -> Select.of(
                        //s.FETCHER.allFields(),//如果需要全字段映射
                        s.phone().as("value1"),
                        s.address().subString(1, 10).as("value2")
                )).toList();


    SELECT
        t.`phone` AS `value1`,
        SUBSTR(t.`address`, 2, 10) AS `value2` 
    FROM
        `easy-query-test`.`t_sys_user` t 
    WHERE
        t.`phone` LIKE CONCAT('186', '%')
```

如果你不想用字符串value1和value2来作为as的参数也可以使用lombok的另一个注解`@FieldNameConstants`



返回的DTO
```java
@Data
@FieldNameConstants
public class GenericDTO {
    private String value1;
    private String value2;
}

```

使用 `GenericDTO.Fields.value1`可以做到静态编译时使用常量且保证强类型as

```java


        List<GenericDTO> list1 = easyEntityQuery.queryable(SysUser.class)
                .where(s -> {
                    s.phone().startsWith("186");
                })
                .select(GenericDTO.class, s -> Select.of(
//                        s.FETCHER.allFields(),//如果需要全字段映射
                        s.phone().as(GenericDTO.Fields.value1),
                        s.address().subString(1, 10).as(GenericDTO.Fields.value2)
                )).toList();


    SELECT
        t.`phone` AS `value1`,
        SUBSTR(t.`address`, 2, 10) AS `value2` 
    FROM
        `easy-query-test`.`t_sys_user` t 
    WHERE
        t.`phone` LIKE CONCAT('186', '%')
```

## 自定义DTO、VO返回结果
有时候我们希望将数据库查询的结果对象进行直接返回成我们所需要的对象,而不是先查询出数据库对象然后再内存中转成我们需要的对象,比如两张表进行join后我们希望返回`select a,id,b.name from a join b ...`那么我们会选择创建一个接收该结果的对象来进行接收数据库返回的结果

## 多表返回表达式

::: code-tabs
@tab 显式赋值1
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
        //如果不想用链式大括号方式执行顺序就是代码顺序,默认采用and链接
        //动态表达式
        .where(o -> {
            o.id().eq("1234");
            if (true) {
                o.id().eq("1234");//false表示不使用这个条件
            }
            o.id().eq(true,"1234");//false表示不使用这个条件

        })
        .select((t,t1,t2) -> new TopicTypeVOProxy()
                .id().set(t2.id())
                .title().set(t1.title())
                .createTime().set(t2.createTime())
        );

```
@tab 显式赋值2
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
                //如果不想用链式大括号方式执行顺序就是代码顺序,默认采用and链接
                //动态表达式
                .where(o -> {
                    o.id().eq("1234");
                    if (true) {
                        o.id().eq("1234");//false表示不使用这个条件
                    }
                    o.id().eq(true, "1234");//false表示不使用这个条件

                })
                .select(TopicTypeVO.class, (t, t1, t2) -> Select.of(
                        t2.id().as(TopicTypeVOProxy.Fields.id),
                        t1.title().as(TopicTypeVOProxy.Fields.title),
                        t.createTime().as(TopicTypeVOProxy.Fields.createTime)
                ));
        //上下两种表达式都是一样的,上面更加符合bean设置,并且具有强类型推荐使用上面这种
        // .select((t,t1,t2) -> {
        //    TopicTypeVOProxy r = new TopicTypeVOProxy();
        //    r.selectExpression(t2.id(),t1.name(),t2.title().as(r.content()));
        //    return rl
        // });

```
:::


## 多表自定义结果api


::: code-tabs
@tab 对象模式
```java


@Data
@EntityProxy
public class  QueryVO implements ProxyEntityAvailable<QueryVO , QueryVOProxy> {
    private String id;
    private String field1;
    private String field2;
}

List<QueryVO> list = easyEntityQuery.queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.of(2021, 1, 1, 1, 1));
        })
        .select((t, t1, t2)->new QueryVOProxy()
                .id().set(t.id())
                .field1().set(t1.title())//将第二张表的title字段映射到VO的field1字段上
                .field2().set(t2.id())//将第三张表的id字段映射到VO的field2字段上
        ).toList();

==> Preparing: SELECT t.`id`,t1.`title` AS `field1`,t2.`id` AS `field2` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` LEFT JOIN `easy-query-test`.`t_sys_user` t2 ON t.`id` = t2.`id` WHERE t.`id` = ? AND t.`id` = ? AND t1.`title` LIKE ? AND t2.`create_time` = ?
==> Parameters: false(Boolean),123(String),123(String),%456%(String),2021-01-01T01:01(LocalDateTime)
<== Time Elapsed: 3(ms)
<== Total: 0



List<QueryVO> list = easyEntityQuery.queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.of(2021, 1, 1, 1, 1));
        })
        .select((t, t1, t2)->{
                QueryVOProxy r = new QueryVOProxy();
                r.selectAll(t);//查询t.*查询t表Topic表全字段
                r.selectIgnores(t.title());//忽略掉Topic的title字段
                r.field1().set(t1.title());//将第二张表的title字段映射到VO的field1字段上
                r.field2().set(t2.id());//将第三张表的id字段映射到VO的field2字段上
                return r;
        }).toList();


==> Preparing: SELECT t.`id`,t1.`title` AS `field1`,t2.`id` AS `field2` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` LEFT JOIN `easy-query-test`.`t_sys_user` t2 ON t.`id` = t2.`id` WHERE t.`id` = ? AND t.`id` = ? AND t1.`title` LIKE ? AND t2.`create_time` = ?
==> Parameters: false(Boolean),123(String),123(String),%456%(String),2021-01-01T01:01(LocalDateTime)
<== Time Elapsed: 2(ms)
<== Total: 0
```
:::


