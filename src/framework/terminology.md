---
title: 相关术语
order: 5
---


# 相关术语


## 隐式表达式
`隐式查询`通过对象关系描述来编写表达式的方式实现对数据库数据的筛选组装排序的操作在eq里面称之为隐式表达式

::: tip 说明!!!
> `隐式表达式`是`eq`的重中之重,如果你使用eq不掌握隐式表达式那么使用`eq`和使用别的orm没有太多区别,`eq`的强大`70%`来源于隐式表达式
:::


### 隐式join
如下是一个`隐式join`的操作设置`user`和`company`为多对一关系,其中join操作并没有在表达式中体现出来，而是通过对象关系树来实现表达式的编写
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