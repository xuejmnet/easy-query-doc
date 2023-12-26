---
title: api模式❗️❗️❗️
---

## 三种模式
`easy-query`提供了四种模式的api查询
- `对象`模式
- `属性`模式
- `代理`模式
- `lambda`模式


api  | 开发方便性 | 可维护性 | 性能| 缺点
--- | --- | ---  | --- | --- 
对象 | 非常好配合插件几乎无敌流畅 | 易维护 | 非常好 | 配合插件能非常流畅,使用apt来生成除了build也很流畅
属性 | 一般主要没有智能提示  | 难维护 | 非常好 | 难维护,重构无法找到属性对应的引用
代理 | 好,配合插件非常好,拥有完善的智能提示,书写非常方便  | 易维护 | 非常好 | 重构无法通过对象的属性对应的引用,需要额外通过代理对象找引用(插件可以解决)
lambda | 非常好无需插件配合就有完善的智能提示,书写一般Class::Method  | 易维护 | 较好 | 解析表达式性能会稍稍低于`属性模式`和`代理模式`,需要将`lambda转成属性`


## 单表查询

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
        .select(o->o.FETCHER.id().createTime())//也可以用Select.of(o.id(),o.createTime())如果只有一个参数不需要Select.of()
        //.select(o->Select.of(o.id(),o.createTime()))
        //.select(o->o.allFieldsExclude(o.createTime()))//获取user表的所有字段除了createTime字段
        //   .select(o -> {//甚至可以创建一个Fetcher来实现拉取
        //       Fetcher fetcher = Select.createFetcher();
        //       fetcher.fetch(o.id(), o.title());
        //       fetcher.fetch(o.stars().as(o.stars()));
        //       return fetcher;
        //   })
        .firstOrNull();
        
```
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
        //.select(o->o.columnAll(sysUser).columnIgnore(sysUser.createTime()))//获取user表的所有字段除了createTime字段
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
@tab 属性模式
```java
// 创建一个可查询SysUser的表达式
Queryable<SysUser> queryable = easyQuery.queryable(SysUser.class);

//单个条件链式查询
//toList表示查询结果集 
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
                .where(o -> o.eq("id", "123xxx"))
                .toList();

//条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
        .where(o -> o
                .eq("id", "123xxx")
                .like("idCard","123")
        ).toList();//toList表示查询结果集 


//多个where之间也是用and链接和上述方法一个意思 条件= 和 like 组合 中间默认是and连接符
List<SysUser> sysUsers = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq("id", "123xxx"))
        .where(o -> o.like("idCard","123")).toList();


//返回单个对象没有查询到就返回null
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq("id", "123xxx"))
        .where(o -> o.like("idCard", "123")).firstOrNull();


//采用创建时间倒序和id正序查询返回第一个
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq("id", "123xxx"))
        .where(o -> o.like("idCard", "123"))
        .orderByDesc(o->o.column("createTime"))
        .orderByAsc(o->o.column("id")).firstOrNull();


//仅查询id和createTime两列
SysUser sysUser1 = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq("id", "123xxx"))
        .where(o -> o.like("idCard", "123"))
        .orderByDesc(o->o.column("createTime"))
        .orderByAsc(o->o.column("id"))
        .select(o->o.column("id").column("createTime"))
        //.select(o->o.columnAll().columnIgnore("createTime"))//获取user表的所有字段除了createTime字段
        .firstOrNull();
```
:::

## proxy模式
因为proxy涉及到apt代理对象的自动生成和插件的整合,所以这边单独进行文档编写说来演示如何使用proxy编写易于表达维护的orm语法

### 依赖安装
如果你只需要使用代理模式那么在可以自行安装依赖或者使用整合包比如`springboot`下的`starter`或者`solon`下的`plugin`,下面仅展示控制台程序下使用的依赖
```xml
<properties>
    <easy-query.version>latest-version</easy-query.version>
</properties>
<!--  提供了代理模式支持apt模式以非lambda形式的强类型sql语法 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-api-proxy</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  提供了apt自动生成代理对象 如果您使用entityQuery查询并且采用@EntityFileProxy那么这个依赖可以省略-->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-processor</artifactId>
    <version>${easy-query.version}</version>
</dependency>
<!--  这边以mysql为例 其实不需要添加下面的包也可以运行,指示默认的个别数据库行为语句没办法生成 -->
<dependency>
    <groupId>com.easy-query</groupId>
    <artifactId>sql-mysql</artifactId>
    <version>${easy-query.version}</version>
</dependency>
```

::: warning 说明!!!
> 如果您的项目是多模块,请在对应模块需要生成代理对象的类处都添加`sql-processor`,对应的模块是指当前模块有`@EntityProxy`注解
:::
