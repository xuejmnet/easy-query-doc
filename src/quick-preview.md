---
title: 快速了解 🔥
---

# QQ群
EasyQuery官方QQ群: 170029046

::: warning 说明!!!
> `1.8.0+`版本`easy-query`推出了实验性api,`entity-query`在之后的一周时间里面,作者对框架的api进行了大刀阔斧,现在做到了非常强大，如果你们是`c#`使用过`efcore`，`freesql`，`sqlsugar`那么使用这个框架对你们来说肯定是最完美的,`1.9.0`之后的版本和之前的easyEntityQuery有着很大的不一样,实在抱歉这次`changebreak`因为这次更新实在是让人太着迷了

- group by 感知,一款没有group 感知的orm称不上一个好orm
- 匿名类型平替,因为java没有匿名类型所以在多次select后需要创建VO对象来作为临时存储是非常复杂的事情,所以提供了draft草稿类型来平替匿名类型
- 强类型纠错,提供了强类型纠错防止number类型赋值给string或者datetime等类型
:::

## 预览

::: code-tabs
@tab 对象模式

```java
 List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
                            .where(user -> {
                                user.id().eq("1");
                                user.id().eq(false, "1");//true/false表示是否使用该条件默认true
                                user.id().like("123");
                                user.id().like(false, "123");
                            })
                            .groupBy(user->GroupKeys.TABLE1.of(user.id()))//创建group by
                            .select(group -> new SysUserProxy().adapter(r->{//创建user代理
                                r.id().set(group.key1());//对当前id进行赋值
                                r.phone().set(group.count().toStr());//对当前phone进行赋值因为phone是string类型所以goup后的count需要强转成string也就是cast
                            }))
                            //下面是平替写法其实是一样的
                            // .select(o -> {
                            //     SysUserProxy sysUserProxy = new SysUserProxy();
                            //     sysUserProxy.id().set(o.key1());
                            //     sysUserProxy.phone().set(o.count().toStr());
                            //     return sysUserProxy;
                            // })
                            //如果映射属性对应的column name是一样的【！！！不是属性名是属性对应的列名是一样的】
                            //也可以用以下写法
                            // .select(o -> new SysUserProxy().selectExpression(o.id(),o.name(),o.title()))
                            .toList();

==> Preparing: SELECT t.`id` AS `id`,CAST(COUNT(*) AS CHAR) AS `phone` FROM `sys_user` t WHERE t.`id` = ? AND t.`id` LIKE ? GROUP BY t.`id`
==> Parameters: 1(String),%123%(String)

//左右结构转换,大部分orm只支持左列右值但是easy-query还支持右值左列或者右值左值

LocalDateTime begin=LocalDateTime.of(2020,1,1,1,1);
LocalDateTime end=LocalDateTime.of(2022,1,1,1,1);

List<TopicTypeTest1> list = easyEntityQuery.queryable(TopicTypeTest1.class)
.where(o -> {
    o.SQLParameter().valueOf(begin).le(o.createTime());//'2020-01-01 01:01:00' <= `create_time`
    o.createTime().le(end);//`create_time` <= '2022-01-01 01:01:00'
    o.createTime().le(o.SQLParameter().valueOf(end).plusMonths(-3));//plusMMonths(-3)表示end时间往前推3个月,并且适配所有数据库 `create_time` <= date_add('2022-01-01 01:01:00', interval (-3) month)
}).toList();

==> Preparing: SELECT `id`,`stars`,`title`,`topic_type`,`create_time` FROM `t_topic_type` WHERE ? <= `create_time` AND `create_time` <= ? AND  `create_time` <= date_add(?, interval (?) month)
==> Parameters: 2020-01-01T01:01(LocalDateTime),2022-01-01T01:01(LocalDateTime),2022-01-01T01:01(LocalDateTime),-3(Integer)
<== Time Elapsed: 4(ms)
<== Total: 0



List<SysUser> users = easyEntityQuery.queryable(SysUser.class)
                            .where(o->{
                                o.id().eq("1");// t.`id` = 1
                                o.id().eq(o.createTime().format("yyyy-MM-dd"));// t.`id` = DATE_FORMAT(t.`create_time`,'%Y-%m-%d')
                                o.createTime().format("yyyy-MM-dd").eq("2023-01-02");//DATE_FORMAT(t.`create_time`,'%Y-%m-%d') = '2023-01-02'
                                o.name().nullOrDefault("unknown").like("123");
                                o.phone().isNotBank();
                            })
                            //可以使用select也可以使用fetcher来实现 fetcher适合返回单个对象的数据获取
                            .fetcher(o->o.FETCHER.id().name().phone().departName())
                            .toList();

==> Preparing: SELECT t.`id`,t.`name`,t.`phone`,t.`depart_name` FROM `a222` t WHERE t.`id` = ? AND  t.`id` = DATE_FORMAT(t.`create_time`,'%Y-%m-%d') AND DATE_FORMAT(t.`create_time`,'%Y-%m-%d') = ? AND IFNULL(t.`name`,?) LIKE ? AND (t.`phone` IS NOT NULL AND t.`phone` <> '' AND LTRIM(t.`phone`) <> '')
==> Parameters: 1(String),2023-01-02(String),unknown(String),%123%(String)
```
@tab lambda模式

```java
 List<SysUser> list = easyQuery.queryable(SysUser.class)
                .where(o -> {
                    o.eq(SysUser::getId, "1")
                            .eq(false, SysUser::getId, "1")
                            .like(SysUser::getId, "123")
                            .like(false, SysUser::getId, "123");
                })
                .groupBy(o -> o.column(SysUser::getId))
                .select(SysUser.class, o -> {
                    o.columnAs(SysUser::getId, SysUser::getId)
                            .columnCountAs(SysUser::getId, SysUser::getPhone);
                }).toList();

==> Preparing: SELECT t.`id` AS `id`,COUNT(t.`id`) AS `phone` FROM `t_sys_user` t WHERE t.`id` = ? AND t.`id` LIKE ? GROUP BY t.`id`
==> Parameters: 1(String),%123%(String)

List<SysUser> list = easyQuery.queryable(SysUser.class)
                .where(o -> {
                    LambdaSQLFunc<SysUser> fx = o.fx();
                    o.eq(SysUser::getId, "1");
                    o.eq(fx.dateTimeFormat(SysUser::getCreateTime, "yyyy-MM-dd"), "2023-01-01");
                    o.isNotBank(SysUser::getPhone);
                })
                .select(o -> o.column(SysUser::getId).column(SysUser::getName).column(SysUser::getPhone).column(SysUser::getDepartName))
                .toList();

==> Preparing: SELECT `id`,`name`,`phone`,`depart_name` FROM `t_sys_user` WHERE `id` = ? AND DATE_FORMAT(`create_time`,'%Y-%m-%d') = ? AND (`phone` IS NOT NULL AND `phone` <> '' AND LTRIM(`phone`) <> '')
==> Parameters: 1(String),2023-01-01(String)
```
@tab proxy模式
```java

SysUserProxy utable = SysUserProxy.createTable();
List<SysUser> list = easyProxyQuery.queryable(utable)
        .where(o -> {
            o.eq(utable.id(), "1")
                    .eq(false, utable.id(), "1")
                    .like(utable.id(), "123")
                    .like(false, utable.id(), "123");
        })
        .groupBy(o -> o.column(utable.id()))
        .select(SysUserProxy.createTable(), o -> {
            o.columnAs(utable.id(), o.tr().id())
                    .columnCountAs(utable.id(), o.tr().phone());
        })
        .toList();

==> Preparing: SELECT t.`id` AS `id`,COUNT(t.`id`) AS `phone` FROM `t_sys_user` t WHERE t.`id` = ? AND t.`id` LIKE ? GROUP BY t.`id`
==> Parameters: 1(String),%123%(String)


 SysUserProxy utable = SysUserProxy.createTable();
        List<SysUser> list = easyProxyQuery.queryable(utable)
                .where(o -> {
                    o.eq(utable.id(), "1")
                            .eq(utable.id(), utable.createTime().format("yyyy-MM-dd"))
                            .eq(utable.createTime().format("yyyy-MM-dd"),"2023-01-01")
                            .like(utable.name().nullOrDefault("unknown"),"123")
                            .isNotBank(utable.phone());
                })
                .groupBy(o -> o.column(utable.id()))
                .select(SysUserProxy.createTable(), o -> o.columns(utable.id(),utable.name(),utable.phone(),utable.departName()))
                .toList();

==> Preparing: SELECT t.`id`,t.`name`,t.`phone`,t.`depart_name` FROM `t_sys_user` t WHERE t.`id` = ? AND  t.`id` = DATE_FORMAT(t.`create_time`,'%Y-%m-%d') AND DATE_FORMAT(t.`create_time`,'%Y-%m-%d') = ? AND IFNULL(t.`name`,?) LIKE ? AND (t.`phone` IS NOT NULL AND t.`phone` <> '' AND LTRIM(t.`phone`) <> '') GROUP BY t.`id`
==> Parameters: 1(String),2023-01-01(String),unknown(String),%123%(String)
```
@tab 属性模式
```java

List<SysUser> list = easyQueryClient.queryable(SysUser.class)
        .where(o -> {
            SQLFunc fx = o.fx();
            o.eq("id", "1");
            o.eq(fx.dateTimeFormat("createTime", "yyyy-MM-dd"), "2023-01-01");
            o.isNotBank("phone");
        })
        .select(o -> o.column("id").column("name").column("phone").column("departName"))
        .toList();

==> Preparing: SELECT `id`,`name`,`phone`,`depart_name` FROM `t_sys_user` WHERE `id` = ? AND DATE_FORMAT(`create_time`,'%Y-%m-%d') = ? AND (`phone` IS NOT NULL AND `phone` <> '' AND LTRIM(`phone`) <> '')
==> Parameters: 1(String),2023-01-01(String)
```


::: 
## 快速实现表单查询
业务场景
<img src="/admin-form-query.png" >

### 数据库对象
```java
@Table("t_sys_user")
@EntityProxy
@Data
public class SysUser implements ProxyEntityAvailable<SysUser , SysUserProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private String account;
    private String departName;
    private String phone;
    private LocalDateTime createTime;

    @Override
    public Class<SysUserProxy> proxyTableClass() {
        return SysUserProxy.class;
    }
}
```
其中`ProxyEntityAvailable<SysUser , SysUserProxy>`接口和`SysUserProxy`全部由插件自动生成,如果你不想用插件那么可以将注解`@EntityFileProxy`换成`@EntityProxy`
### 查询对象
```java

@Data
public class SysUserQueryRequest {
    @EasyWhereCondition
    private String name;
    @EasyWhereCondition
    private String account;
    @EasyWhereCondition
    private String departName;
    @EasyWhereCondition
    private String phone;
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_LEFT_CLOSED,propName = "createTime" )
    private LocalDateTime createTimeBegin;
    @EasyWhereCondition(type = EasyWhereCondition.Condition.RANGE_RIGHT_CLOSED,propName = "createTime" )
    private LocalDateTime createTimeEnd;
}
```
### 表单查询1
```java
//由前端上传json
SysUserQueryRequest sysUserQueryRequest = new SysUserQueryRequest();
sysUserQueryRequest.setName("小明");
sysUserQueryRequest.setCreateTimeBegin(LocalDateTime.now().plusDays(-10));
sysUserQueryRequest.setCreateTimeEnd(LocalDateTime.now());
sysUserQueryRequest.setPhone("180");


//快速实现分页查询 条件过滤默认非null不加入条件如果是字符串还需满足非空
List<SysUser> pageResult = easyEntityQuery.queryable(SysUser.class)
                .filterConfigure(NotNullOrEmptyValueFilter.DEFAULT)//非null并且字符串非空即加入条件
                .where(o -> {
                        o.name().like(sysUserQueryRequest.getName());
                        o.account().like(sysUserQueryRequest.getAccount());
                        o.phone().like(sysUserQueryRequest.getPhone());
                        o.departName().like(sysUserQueryRequest.getDepartName());
                        o.createTime().rangeClosed(sysUserQueryRequest.getCreateTimeBegin(), sysUserQueryRequest.getCreateTimeEnd());
                })
                .toList();
```
```log
==> Preparing: SELECT COUNT(*) FROM `t_sys_user` WHERE `name` LIKE ? AND `phone` LIKE ? AND `create_time` >= ? AND `create_time` <= ?
==> Parameters: %小明%(String),%180%(String),2023-11-11T21:50:19.835(LocalDateTime),2023-11-21T21:50:19.836(LocalDateTime)

==> Preparing: SELECT `id`,`name`,`account`,`depart_name`,`phone`,`create_time` FROM `t_sys_user` WHERE `name` LIKE ? AND `phone` LIKE ? AND `create_time` >= ? AND `create_time` <= ? LIMIT 10
==> Parameters: %小明%(String),%180%(String),2023-11-11T21:51:34.740(LocalDateTime),2023-11-21T21:51:34.740(LocalDateTime)
```

### 表单查询2
```java
//由前端上传json
SysUserQueryRequest sysUserQueryRequest = new SysUserQueryRequest();
sysUserQueryRequest.setName("小明");
sysUserQueryRequest.setCreateTimeBegin(LocalDateTime.now().plusDays(-10));
sysUserQueryRequest.setCreateTimeEnd(LocalDateTime.now());
sysUserQueryRequest.setPhone("180");


//快速实现分页查询 动态对象条件
EasyPageResult<SysUser> pageResult = easyEntityQuery.queryable(SysUser.class)
                        .whereObject(sysUserQueryRequest)
                        .toPageResult(1, 10);
```

### 表单查询3
```java
//由前端上传json
SysUserQueryRequest sysUserQueryRequest = new SysUserQueryRequest();
sysUserQueryRequest.setName("小明");
sysUserQueryRequest.setCreateTimeBegin(LocalDateTime.now().plusDays(-10));
sysUserQueryRequest.setCreateTimeEnd(LocalDateTime.now());
sysUserQueryRequest.setPhone("180");


//快速实现分页查询 手动处理是否需要添加到查询条件中
List<SysUser> pageResult = easyEntityQuery.queryable(SysUser.class)
        .where(o -> {//条件里面判断是否要继续
                o.name().like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getName()),sysUserQueryRequest.getName());
                o.account().like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getAccount()),sysUserQueryRequest.getAccount());
                o.phone().like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getPhone()),sysUserQueryRequest.getPhone());
                o.departName().like(EasyStringUtil.isNotBlank(sysUserQueryRequest.getDepartName()),sysUserQueryRequest.getDepartName());
                o.createTime().rangeClosed(sysUserQueryRequest.getCreateTimeBegin() != null,sysUserQueryRequest.getCreateTimeBegin(),sysUserQueryRequest.getCreateTimeEnd() != null, sysUserQueryRequest.getCreateTimeEnd());
        })
        .toList();


List<SysUser> pageResult = easyEntityQuery .queryable(SysUser.class)//where第一个参数表示后面的条件是否需要追加上去
        .where(EasyStringUtil.isNotBlank(sysUserQueryRequest.getName()),o->o.name().like(sysUserQueryRequest.getName()))
        .where(EasyStringUtil.isNotBlank(sysUserQueryRequest.getAccount()),o->o.account().like(sysUserQueryRequest.getAccount()))
        .where(EasyStringUtil.isNotBlank(sysUserQueryRequest.getPhone()),o->o.phone().like(sysUserQueryRequest.getPhone()))
        .where(sysUserQueryRequest.getCreateTimeBegin() != null,o->o.createTime().gt(sysUserQueryRequest.getCreateTimeBegin()))
        .where(sysUserQueryRequest.getCreateTimeEnd() != null,o->o.createTime().lt(sysUserQueryRequest.getCreateTimeEnd()))
        .toList();
```