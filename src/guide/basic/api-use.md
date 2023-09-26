---
title: api使用 ❗️❗️❗️
---


::: tip 注意点及说明!!!
> 下面所有方法包括`where`、`select`、`groupBy`、`orderBy`、`having`都是相同原理,支持单参数时为主表,全参数时为一一对应的表,注意表达式应该以`select`作为整个表达式的终结方法,相当于`select`之后就是对之前的表达式进行匿名表处理,`select * from (select id,name from user) t` 如果提前`select`相当于是进行了一次匿名表,最后的终结方法收集器比如`toList`、`firstOrNull`、`count`等会自动判断是否需要`select`，如果需要会对当前表达式的主表进行`select(o->o.columnAll())`操作
:::

## 单表api使用

::: code-tabs
@tab 代理模式
```java

//以下大部分模式都是先定义局部变量来进行操作可以通过lambda入参o下的o.t(),o.t1(),o.t2()来操作

// 创建一个可查询SysUser的表达式
SysUserProxy sysUser = SysUserProxy.createTable();
ProxyQueryable<SysUserProxy, SysUser> queryable = easyProxyQuery.queryable(sysUser);

//单个条件链式查询
//toList表示查询结果集
SysUserProxy sysUser = SysUserProxy.createTable();
List<SysUser> sysUsers = easyProxyQuery.queryable(sysUser)
        .where(o -> o.eq(sysUser.id(), "123xxx"))
        .toList();


 
//如果不想定义局部变量 默认o.t()就是当前的SysUser表,join后会有t1、t2....t9
List<SysUser> sysUsers = easyProxyQuery.queryable(SysUserProxy.createTable())
        .where(o -> o.eq(o.t().id(), "123xxx"))
        .toList();


//条件= 和 like 组合 中间默认是and连接符
SysUserProxy sysUser = SysUserProxy.createTable();
List<SysUser> sysUsers = easyProxyQuery.queryable(sysUser)
        .where(o -> o
                .eq(sysUser.id(), "123xxx")
                .like(sysUser.idCard(),"123")
        ).toList();//toList表示查询结果集


//多个where之间也是用and链接和上述方法一个意思 条件= 和 like 组合 中间默认是and连接符
SysUserProxy sysUser = SysUserProxy.createTable();
List<SysUser> sysUsers = easyProxyQuery.queryable(sysUser)
        .where(o -> o.eq(sysUser.id(), "123xxx"))
        .where(o -> o.like(sysUser.idCard(),"123")).toList();


//返回单个对象没有查询到就返回null
SysUserProxy sysUser = SysUserProxy.createTable();
SysUser sysUser1 = easyProxyQuery.queryable(sysUser)
        .where(o -> o.eq(sysUser.id(), "123xxx"))
        .where(o -> o.like(sysUser.idCard(), "123")).firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUserProxy sysUser = SysUserProxy.createTable();
SysUser sysUser1 = easyProxyQuery.queryable(sysUser)
        .where(o -> o.eq(sysUser.id(), "123xxx"))
        .where(o -> o.like(sysUser.idCard(), "123"))
        .orderByDesc(o->o.column(sysUser.createTime()))
        .orderByAsc(o->o.column(sysUser.id())).firstOrNull();

//仅查询id和createTime两列
SysUserProxy sysUser = SysUserProxy.createTable();
SysUser sysUser1 = easyProxyQuery.queryable(sysUser)
        .where(o -> o.eq(sysUser.id(), "123xxx"))
        .where(o -> o.like(sysUser.idCard(), "123"))
        .orderByDesc(o->o.column(sysUser.createTime()))
        .orderByAsc(o->o.column(sysUser.id()))
        .select(o->o.column(sysUser.id()).column(sysUser.createTime()))//也可以用columns
        //.select(o->o.columns(sysUser.id(),sysUser.createTime()))
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
        .firstOrNull();
```
:::

## 多表查询api

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

## 多表返回表达式

::: code-tabs
@tab 代理模式
```java
//
TopicProxy topicTable = TopicProxy.createTable();
BlogEntityProxy blogTable = BlogEntityProxy.createTable();
SysUserProxy userTable = SysUserProxy.createTable();
TopicTypeVOProxy vo=TopicTypeVOProxy.createTable()；
easyProxyQuery
        .queryable(topicTable)
        //第一个join采用双参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity
        .leftJoin(blogTable, o -> o.eq(topicTable.id(), blogTable.id()))
        //第二个join采用三参数,参数1表示第一张表Topic 参数2表示第二张表 BlogEntity 第三个参数表示第三张表 SysUser
        .leftJoin(userTable, o -> o.eq(topicTable.id(), userTable.id()))
        .where(o -> o.eq(topicTable.id(), "123").like(blogTable.title(), "456")
                .eq(userTable.createTime(), LocalDateTime.now()))
        //如果不想用链式大括号方式执行顺序就是代码顺序,默认采用and链接
        //动态表达式
        .where(o -> {
            o.eq(topicTable.id(), "1234");
            if (true) {
                o.eq(userTable.id(), "1234");
            }
        })
        .select(o -> o.columns(userTable.id(), blogTable.id()))
        .select(vo, o -> {
            o.columns(userTable.id(), blogTable.id());
            if(true){
                o.columnAs(userTable.id(),vo.id());
            }
        });

```
@tab lambda模式
```java
//返回Queryable3那么可以对这个查询表达式进行后续操作,操作都是可以操作三张表的
Queryable3<Topic, BlogEntity, SysUser> where = easyQuery
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