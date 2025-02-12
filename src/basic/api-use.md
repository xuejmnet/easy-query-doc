---
title: api使用 ❗️❗️❗️
---


::: tip 注意点及说明!!!
> 下面所有方法包括`where`、`select`、`groupBy`、`orderBy`、`having`都是相同原理,支持单参数时为主表,全参数时为一一对应的表,注意表达式应该以`select`作为整个表达式的终结方法,相当于`select`之后就是对之前的表达式进行匿名表处理,`select * from (select id,name from user) t` 如果提前`select`相当于是进行了一次匿名表,最后的终结方法收集器比如`toList`、`firstOrNull`、`count`等会自动判断是否需要`select`，如果需要会对当前表达式的主表进行`select(o->o.columnAll())`操作
> 不建议select返回双括号初始化譬如`new HelpProvinceProxy(){{......}}`可能会造成内存泄露
:::

## api说明

简单的查询编写顺序

<img src="/sql-executor.png" width="500">


::: tip 注意点及说明!!!
> 其中6和7可以互相调换,如果先`select`后`order`那么将会对匿名表进行排序,如果先`order`后`select`那么会先排序后生成匿名表但是因为匿名表后续没有操作所以会展开
:::


<img src="/simple-query.jpg">

我们以这个简单的例子为例可以看到我们应该编写的顺序是select在最后
```java
easyEntityQuery.queryable(HelpProvince.class)
        .where(o -> o.id().eq("1"))
        .orderBy(o -> o.id().asc())
        .select(o -> new HelpProvinceProxy()
                .id().set(o.id())
                .name().set(o.name())
        )
        //本质就是如下写法 不建议使用双括号的初始化可能会造成内存泄露
        // .select(o->{
        //        HelpProvinceProxy province= new HelpProvinceProxy();
        //         province.id().set(o.id());
        //         province.name().set(o.name());
        //         return province;
        // })
        //.select(o->o.FETCHER.id().name().fetchProxy())//如果返回结果一样可以用fetcher
        .toList();
```

复杂的查询顺序
<img src="/simple-nest-query.jpg">

```java
easyEntityQuery.queryable(HelpProvince.class) //1
        .where(o->o.id().eq("1")) //2
        .orderBy(o->o.id().asc()) //3
        .select(o->new HelpProvinceProxy()//4 
                .id().set(o.id())
                .name().set(o.name())
        )
        //.select(o->o.FETCHER.id().name().fetchProxy())//如果返回结果一样可以用fetcher
        .where(o->o.id().eq("1")) // 5
        .select(o->new HelpProvinceProxy()
                .id().set(o.id())//6
        )
        .toList();
```

::: warning 注意点及说明!!!
> select一般都是最后写的,在你没有写表的时候只能用 * 来代替,先写表确定,然后写条件写排序写分组等确定了之后写选择的select的列不写就是主表的*如果在写where就对前面的表进行括号进行匿名表处理以此类推
:::

## 分解表达式

### 1
```java
表达式:easyEntityQuery.queryable(HelpProvince.class)

sql:select * from help_province
```
### 2
```java
表达式:easyEntityQuery.queryable(HelpProvince.class).where(o->o.id().eq("1")) 

sql:select * from help_province where id='1'
```

### 3
```java
表达式:easyEntityQuery.queryable(HelpProvince.class).where(o->o.id().eq("1")).orderBy(o->o.id().asc())

sql:select * from help_province where id='1' order by id asc
```
### 4
```java
表达式:          easyEntityQuery.queryable(HelpProvince.class)
                        .where(o -> o.id().eq("1"))
                        .orderBy(o -> o.id().asc())
                        .select(o -> new HelpProvinceProxy()
                                .id().set(o.id())
                                .name().set(o.name())
                        )

sql:select id,name from help_province where id='1' order by id asc
```
以`select`方法作为终结方法结束本次`sql`链式,后续的操作就是将`select`和之前的表达式转成`匿名sql`类似`select * from (select * from help_province) t`，其中`fetcher`是`select`的简化操作不支持返回VO，当且仅当返回结果为自身时用于快速选择列

### 5
```java
表达式:easyEntityQuery.queryable(HelpProvince.class)
                .where(o->o.id().eq("1"))
                .orderBy(o->o.id().asc())
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                        .name().set(o.name())
                )//转成匿名表sql
                .where(o->o.id().eq("1")) 

sql:select * from (select id,name from help_province where id='1' order by id asc) t where t.id='1'
```

### 6
```java
表达式:easyEntityQuery.queryable(HelpProvince.class)
                .where(o->o.id().eq("1"))
                .orderBy(o->o.id().asc())
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                        .name().set(o.name())
                )//转成匿名表sql
                .where(o->o.id().eq("1"))
                .select(o->new HelpProvinceProxy()
                        .id().set(o.id())
                ) 

sql:select id from (select id,name from help_province where id='1' order by id asc) t where t.id='1'
```

::: tip 链式说明!!!
> select之前的所有操作比如多个where,多个orderby都是对之前的追加,limit是替换前面的操作多次limit获取最后一次
> 在entityQuery下groupBy不支持连续调用两个groupBy之间必须存在一个select指定要查询的结果才可以,其他api下多次调用行为也是追加
:::

## 单表api使用

::: code-tabs
@tab 对象模式
```java

// 创建一个可查询SysUser的表达式
EntityQueryable<SysUserProxy, SysUser> queryable = entityQuery.queryable(SysUser.class);

//单个条件链式查询
//toList表示查询结果集
List<SysUser> sysUsers = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq( "123xxx"))
        .toList();



//条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers =entityQuery.queryable(SysUser.class)
        .where(o ->{
                o.id().eq("123xxx");
                o.idCard().like("123")
        }).toList();//toList表示查询结果集


//多个where之间也是用and链接和上述方法一个意思 条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like("123")).toList();


//返回单个对象没有查询到就返回null
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like( "123")).firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq"123xxx"))
        .where(o -> o.idCard().like("123"))
        .orderBy(o->o.createTime().desc())
        .orderBy(o->o.id().asc()).firstOrNull();

//仅查询id和createTime两列
SysUser sysUser1 = entityQuery.queryable(SysUser.class)
        .where(o -> o.id().eq("123xxx"))
        .where(o -> o.idCard().like("123"))
        .orderBy(o->o.createTime().desc())
        .orderBy(o->o.id().asc())
        .select(o->new SysUserProxy()
                .id().set(o.id())
                .createTime().set(o.createTime())
        )
        .firstOrNull();
        
```
@tab lambda模式
```java
// 创建一个可查询SysUser的表达式
Queryable<SysUser> queryable = easyQuery.queryable(SysUser.class);

//单个条件链式查询
//toList表示查询结果集 
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
                .where(o -> o.eq(SysUser::getId, "123xxx"))
                .toList();

//条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
        .where(o -> o
                .eq(SysUser::getId, "123xxx")
                .like(SysUser::getIdCard,"123")
        ).toList();//toList表示查询结果集 


//多个where之间也是用and链接和上述方法一个意思 条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard,"123")).toList();


//返回单个对象没有查询到就返回null
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard, "123")).firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard, "123"))
        .orderByDesc(o->o.column(SysUser::getCreateTime))
        .orderByAsc(o->o.column(SysUser::getId)).firstOrNull();


//仅查询id和createTime两列
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx"))
        .where(o -> o.like(SysUser::getIdCard, "123"))
        .orderByDesc(o->o.column(SysUser::getCreateTime))
        .orderByAsc(o->o.column(SysUser::getId))
        .select(o->o.column(SysUser::getId).column(SysUser::getCreateTime))
        //.select(o->o.columnAll().columnIgnore(SysUser::getCreateTime))//获取user表的所有字段除了createTime字段
        .firstOrNull();
```
:::

## 多表查询api


::: code-tabs
@tab 对象模式
```java

// 创建一个可查询SysUser的表达式
EntityQueryable<SysUserProxy, SysUser> queryable = entityQuery.queryable(SysUser.class);


List<Topic> list = entityQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.id().eq(t1.id()))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.id().eq(t2.id()))
        .where(o -> o.id().eq("123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 
        .where((t, t1, t2) -> {
                t.id().eq("123");
                t1.title().like("456");
                t2.createTime().eq(LocalDateTime.now());
        })
        //toList默认只查询主表数据
        .toList();
        
```
@tab lambda模式
```java

List<Topic> list = easyQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.eq(t2, Topic::getId, SysUser::getId))
        .where(o -> o.eq(Topic::getId, "123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
        .where((t, t1, t2) -> t.eq(Topic::getId, "123").then(t1).like(BlogEntity::getTitle, "456")
                .then(t2).eq(BaseEntity::getCreateTime, LocalDateTime.now()))
        //如果不想用链式的then来切换也可以通过lambda 大括号方式执行顺序就是代码顺序,默认采用and链接
        .where((t, t1, t2) -> {
            t.eq(Topic::getId, "123");
            t1.like(BlogEntity::getTitle, "456");
            t1.eq(BaseEntity::getCreateTime, LocalDateTime.now());
        })
        //toList默认只查询主表数据
        .toList();
```
:::


::: tip 链式说明!!!
> leftJoin第二个lambda入参参数个数和join使用的表个数一样,入参参数顺序就是from和join的表

> 在entityQuery下groupBy不支持连续调用两个groupBy之间必须存在一个select指定要查询的结果才可以,其他api下多次调用行为也是追加
:::

## 多表返回表达式

::: code-tabs
@tab 对象模式
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
        .select((t,t1,t2) -> new TopicTypeVOProxy().adapter(r->{
                r.id().set(t2.id());
                r.name().set(t1.name());
                r.content().set(t2.title());
        }));
        //上下两种表达式都是一样的,上面更加符合bean设置,并且具有强类型推荐使用上面这种
        // .select((t,t1,t2) -> new TopicTypeVOProxy().adapter(r->{
        //         r.selectExpression(t2.id(),t1.name(),t2.title().as(r.content()));
        // }));

```
@tab lambda模式
```java
//返回Queryable3那么可以对这个查询表达式进行后续操作,操作都是可以操作三张表的
Queryable3<Topic, BlogEntity, SysUser> where = easyQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity,对应关系就是参数顺序
        .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))//t表示Topic表,t1表示BlogEntity表,对应关系就是参数顺序
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser,对应关系就是参数顺序
        .leftJoin(SysUser.class, (t, t1, t2) -> t.eq(t2, Topic::getId, SysUser::getId))
        .where(o -> o.eq(Topic::getId, "123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
        .where((t, t1, t2) -> t.eq(Topic::getId, "123").then(t1).like(BlogEntity::getTitle, "456")
                .then(t2).eq(BaseEntity::getCreateTime, LocalDateTime.now()))
        //如果不想用链式的then来切换也可以通过lambda 大括号方式执行顺序就是代码顺序,默认采用and链接
        .where((t, t1, t2) -> {
            t.eq(Topic::getId, "123");
            t1.like(BlogEntity::getTitle, "456");
            t1.eq(BaseEntity::getCreateTime, LocalDateTime.now());
        });



//也支持单表的Queryable返回,但是这样后续操作只可以操作单表没办法操作其他join表了
Queryable<Topic> where = easyQuery
        .queryable(Topic.class)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(SysUser.class, (t, t1, t2) -> t.eq(t2, Topic::getId, SysUser::getId))
        .where(o -> o.eq(Topic::getId, "123"))//单个条件where参数为主表Topic
        //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
        .where((t, t1, t2) -> t.eq(Topic::getId, "123").then(t1).like(BlogEntity::getTitle, "456")
                .then(t2).eq(BaseEntity::getCreateTime, LocalDateTime.now()))
        //如果不想用链式的then来切换也可以通过lambda 大括号方式执行顺序就是代码顺序,默认采用and链接
        .where((t, t1, t2) -> {
            t.eq(Topic::getId, "123");
            t1.like(BlogEntity::getTitle, "456");
            t1.eq(BaseEntity::getCreateTime, LocalDateTime.now());
        });
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
        .select((t, t1, t2)->new QueryVOProxy().adapter(r->{
                r.selectAll(t);//查询t.*查询t表Topic表全字段
                r.selectIgnores(t.title());//忽略掉Topic的title字段
                r.field1().set(t1.title());//将第二张表的title字段映射到VO的field1字段上
                r.field2().set(t2.id());//将第三张表的id字段映射到VO的field2字段上
        })).toList();


==> Preparing: SELECT t.`id`,t1.`title` AS `field1`,t2.`id` AS `field2` FROM `t_topic` t LEFT JOIN `t_blog` t1 ON t1.`deleted` = ? AND t.`id` = t1.`id` LEFT JOIN `easy-query-test`.`t_sys_user` t2 ON t.`id` = t2.`id` WHERE t.`id` = ? AND t.`id` = ? AND t1.`title` LIKE ? AND t2.`create_time` = ?
==> Parameters: false(Boolean),123(String),123(String),%456%(String),2021-01-01T01:01(LocalDateTime)
<== Time Elapsed: 2(ms)
<== Total: 0
```
@tab lambda模式
```java


    @Data
    public class  QueryVO{
        private String id;
        private String field1;
        private String field2;
    }
        List<QueryVO> list = easyQuery
                .queryable(Topic.class)
                //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
                .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
                .leftJoin(SysUser.class, (t, t1, t2) -> t.eq(t2, Topic::getId, SysUser::getId))
                .where(o -> o.eq(Topic::getId, "123"))//单个条件where参数为主表Topic
                //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
                .where((t, t1, t2) -> t.eq(Topic::getId, "123").then(t1).like(BlogEntity::getTitle, "456")
                        .then(t2).eq(BaseEntity::getCreateTime, LocalDateTime.now()))
                //如果不想用链式的then来切换也可以通过lambda 大括号方式执行顺序就是代码顺序,默认采用and链接
                .where((t, t1, t2) -> {
                    t.eq(Topic::getId, "123");
                    t1.like(BlogEntity::getTitle, "456");
                    t1.eq(BaseEntity::getCreateTime, LocalDateTime.now());
                })
                .select(QueryVO.class, (t, t1, t2) ->
                        //将第一张表的所有属性的列映射到vo的列名上,第一张表也可以通过columnAll将全部字段映射上去
                        // ,如果后续可以通过ignore方法来取消掉之前的映射关系
                        t.column(Topic::getId)
                                .then(t1)
                                //将第二张表的title字段映射到VO的field1字段上
                                .columnAs(BlogEntity::getTitle, QueryVO::getField1)
                                .then(t2)
                                //将第三张表的id字段映射到VO的field2字段上
                                .columnAs(SysUser::getId, QueryVO::getField2)
                ).toList();




        List<QueryVO> list = easyQuery
                .queryable(Topic.class)
                //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
                .leftJoin(BlogEntity.class, (t, t1) -> t.eq(t1, Topic::getId, BlogEntity::getId))
                //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
                .leftJoin(SysUser.class, (t, t1, t2) -> t.eq(t2, Topic::getId, SysUser::getId))
                .where(o -> o.eq(Topic::getId, "123"))//单个条件where参数为主表Topic
                //支持单个参数或者全参数,全参数个数为主表+join表个数 链式写法期间可以通过then来切换操作表
                .where((t, t1, t2) -> t.eq(Topic::getId, "123").then(t1).like(BlogEntity::getTitle, "456")
                        .then(t2).eq(BaseEntity::getCreateTime, LocalDateTime.now()))
                //如果不想用链式的then来切换也可以通过lambda 大括号方式执行顺序就是代码顺序,默认采用and链接
                .where((t, t1, t2) -> {
                    t.eq(Topic::getId, "123");
                    t1.like(BlogEntity::getTitle, "456");
                    t1.eq(BaseEntity::getCreateTime, LocalDateTime.now());
                })
                .select(QueryVO.class, (t, t1, t2) ->
                        //将第一张表的所有属性的列映射到vo的列名上,第一张表也可以通过columnAll将全部字段映射上去
                        // ,如果后续可以通过ignore方法来取消掉之前的映射关系
                        t.columnAll().columnIgnore(Topic::getTitle)//当前方法不生效因为其实压根也没有映射上去
                                .then(t1)
                                //将第二张表的title字段映射到VO的field1字段上
                                .columnAs(BlogEntity::getTitle, QueryVO::getField1)
                                .then(t2)
                                //将第三张表的id字段映射到VO的field2字段上
                                .columnAs(SysUser::getId, QueryVO::getField2)
                ).toList();
```
:::