---
title: api模式❗️❗️❗️
---

## 三种模式
`easy-query`提供了三种模式的api查询
- `属性`模式
- `代理`模式
- `lambda`模式


api  | 开发方便性 | 可维护性 | 性能
--- | --- | ---  | --- 
属性 | 一般主要没有智能提示  | 难维护 | 非常好
代理 | 好,配合插件非常好,拥有完善的智能提示,书写非常方便  | 易维护 | 非常好
lambda | 非常好无需插件配合就有完善的智能提示,书写一般Class::Method  | 易维护 | 较好


## 单表查询

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