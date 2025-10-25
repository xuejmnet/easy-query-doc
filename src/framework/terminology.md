---
title: 相关术语
order: 5
---

# 相关术语



::: tip 重点中的重点!!!
> `隐式表达式`和`DTO查询`是`eq`的重点中的重点可以说掌握这两点那么`eq`你就会了80%
:::


## 隐式表达式

`隐式查询`通过对象关系描述来编写表达式的方式实现对数据库数据的筛选组装排序的操作在 eq 里面称之为隐式表达式

也有一种叫法`自动join`或`自动子查询`

::: tip 说明!!!

> `隐式表达式`是`eq`的重中之重,如果你使用 eq 不掌握隐式表达式那么使用`eq`和使用别的 orm 没有太多区别,`eq`的强大`70%`来源于隐式表达式
> :::

### 隐式 join

如下是一个`隐式join`的操作设置`user`和`company`为多对一关系,其中 join 操作并没有在表达式中体现出来，而是通过对象关系树来实现表达式的编写

```java
eq.queryable(User.class)
    .where(u->{
        u.company().name().eq("xx公司")
    })
    .toList();
```

### 隐式子查询

如下是一个`隐式子查询`的操作设置`user`和`bankCard`为一对多关系,其中`exits`语句并没有在表达式中体现出来，但是表达式依然通过类`stream`的方式查询出用户条件满足时存在至少一张储蓄卡的

```java
eq.queryable(User.class)
    .where(u->{
        u.bankCards().any(card->{
            card.type().eq("储蓄卡")
        })
    })
    .toList();
```

## 显式表达式

`显式查询`通过手动将两个或多个对象进行 join 或者进行子查询表达式生成使用

也有一种叫法`手动join`或`手动子查询`

### 显式 join

如下是一个`显式join`的操作设置`SysUser`和`SysBankCard`通过手动 join 将两者进行关联起来并且查询 user 全部和 bankCard 的 type 字段

```java
eq.queryable(SysUser.class)
    .leftJoin(SysBankCard.class, (user, bank_card) -> user.id().eq(bank_card.uid()))
    .where((user, bank_card) -> {
        user.username().contains("小明");
    })
    .select((user, bank_card) -> Select.PART.of(
            user,
            bank_card.type()
    )).toList();
```

### 显式子查询

如下是一个`显式子查询`的操作设置`user`和`bankCard`进行子查询筛选查询用户要求用户下面必须有一张储蓄卡的用户

```java
eq.queryable(SysUser.class)
    .where(user -> {
        user.id().in(
                eq.queryable(SysBankCard.class)
                        .where(bank_card -> {
                            bank_card.uid().eq(user.id());
                            bank_card.type().eq("储蓄卡");
                        }).select(bank_card -> bank_card.uid())
        );
    }).toList();
```

## include 查询

::: tip 说明!!!

> 该操作不会有 N+1 问题
> `OneToOne`或`ManyToOne`使用`include`，`OneToMany`或`ManyToMany`使用`includes`
> :::
> `include`查询是对象关系建模后的二次查询,支持无限级嵌套"拔出萝卜带出泥"

```java

        List<SysUser> list = eq.queryable(SysUser.class)
                .toList();
        List<SysUser> list1 = eq.queryable(SysUser.class)
                .includes(user -> user.bankCards())//返回的对象如果没有BankCards那么集合情况为空集合，对象为null
                .toList();
```

上下两个操作第二个操作会产生第二次查询查询，通过第一次查询`SysUser`的 id 进行二次查询`SysBankCard`的记录,如下是返回结构

```json
{
  "id": "1",
  "username": "1",
  "age": 12,
  "bankCards": [{ "id": "1", "uid": "1" }]
}
```

## 隐式Group、GroupJoin
`eq`扩展了几乎所有的子查询功能,将子查询可以和用户业务系统互相配合使用，而不是只有单纯的拉取查询这一项功能，支持`where子查询`，`order子查询`，`select子查询`，但是过多的子查询会让sql的性能变得很慢，所以`eq`在3.x版本完成了子查询最后一块拼图性能的提升将子查询自动转成`Group Join`这个功能我们称之为`隐式Group`或者`GroupJoin`实际业务中复杂sql查询嵌套多个子查询可以大大提升sql性能

## DTO查询🔥
`DTO查询`是`selectAutoInclude`、`whereObject`、`orderByObject`的统称,这几个功能一起构建了`DTO查询`，在我们实际业务中可以大大的提高用户的开发效率，可以视为强类型版本的`GraphQL`

```java
//假设这是我们请求的json数据
QueryRequest request=new QueryRequest();
eq.queryable(SysUser.class)
    .whereObject(request)//自动按配置条件查询
    .orderByObject(request)//自动按配置进行排序
    .selectAutoInclude(QueryResponse.class)//自动返回SysUser为对象树根向下的任意结构化对象
    .toList()
```

## 数据追踪
数据追踪我们常用于对象的update和对象的save操作，对象的update开启追踪后eq能够识别被追踪的对象的值的set是否有变化，从而生成差异的update set 列，对于对象的save，save可以让对象以聚合根的形式进行保存，最大范围为查询时追踪的对象路径和非值类型位置的数据范围边界作为保存边界自动感知插入还是新增还是删除还是删除设置为null

## 计算属性
`eq`对常用数据对象进行了扩展，分为两种计算属性
- 内存计算属性：比如枚举，比如json map或json array
- 数据库计算属性：比如年龄，比如状态等

内存计算属性只是在业务代码层面是对应的计算属性后的类型，实际映射到数据库依然是基本类型

数据库计算属性他区别于内存计算属性，数据库计算属性支持参与表达式的任意操作，等同于实际表属性除了无法修改和插入，甚至对象关联也可以使用该属性

## 自动保存
`eq`提供的一种orm对象关系保存功能，能够自动感知对象被删除还是插入还是修改操作，以聚合根作为保存根进行发起，实现复杂结构对象树的自动感知保存

## 聚合根、值对象
eq save功能下的一个保存根，任何被保存的对象我们都视为聚合根，向下延伸直到遇到查询追踪边界或者非值对象为止

## 脱钩
save功能下会发生的一种关系脱离，也就是我们人为的a，b两个有关系的对象现在没关系了的操作我们称之为脱钩，脱钩常见的有三种
- 不进行处理
- set null将关系键设置为null
- 删除将目标对象值对象进行删除
框架默认设置为auto自动处理，遇到多对多时需要对中间表进行脱钩级联设置

## 所属权
在对象关系中a和b两个对象关系可能会发送互相交换的情况
现在有a1，a2对象和b1，b2对象分别是a1对应b1,a2对应b2，如果我们在保存是将a1和b2，a2和b1进行交换或者只交换其中一方那么就会发生所属权变更问题，这种行为eq是默认禁止的，但是如果真的有这种情况，用户可以选择开启所属权变更的配置，允许该操作发生

## CteViewer
一种让用户可以自定义cte视图,可以定义复杂的sql让其在eq里面视为一张"表",只是该表无法删除，新增和修改，但是具有强类型和实际业务表无差别，适合用户封装部分对应逻辑

## code-first
`code-first`或者`auto-ddl`都是一种代码先行，通过先编写业务逻辑然后运行直接生成数据库和表的技术，是一种非db-first的技术选型，适合中小型应用类项目的多数据库适配下的代码分发，无需维护多份数据库脚本，只需要对当前实体对象进行强数据库约束配置即可