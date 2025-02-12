---
title: 自定义DTO、VO返回结果
---

# 自定义DTO、VO返回结果
有时候我们希望将数据库查询的结果对象进行直接返回成我们所需要的对象,而不是先查询出数据库对象然后再内存中转成我们需要的对象,比如两张表进行join后我们希望返回`select a,id,b.name from a join b ...`那么我们会选择创建一个接收该结果的对象来进行接收数据库返回的结果

# 多表返回表达式

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


