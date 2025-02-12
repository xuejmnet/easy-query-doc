---
title: 条件比较
order: 200
---

# 条件比较
`easy-query`的查询、修改、删除核心过滤方法就是`WherePredicate`和`SqlPredicate`两种是同一种东西,条件比较永远是`column` `compare` `value`,column永远在左侧

## API

::: tip 说明!!!
> 代理模式下`where`的第一个参数是`filter`过滤器,第二个参数开始才是真正的表
:::


方法  | sql | 描述  
--- | --- | --- 
gt | >  | 列 大于 值
ge | >=  | 列 大于等于 值
eq | =  | 列 等于 值
ne | <>  | 列 不等于 值
le | <=  | 列 小于等于 值
lt | < | 列 小于 值
likeMatchLeft | like word%  | 列左匹配
likeMatchRight | like %word  | 列右匹配
like | like %word%  | 列包含值
notLikeMatchLeft | not like word%  | 列 不匹配左侧
notLikeMatchRight | not like %word  | 列 不匹配右侧
notLike | not like %word%  | 列不包含值
isNull | is null  | 列 为null
isNotNull | is not null  | 列 不为null
isEmpty | -  | 列 为空
isNotEmpty | -  | 列 不为空
isBlank | -  | 列 为空包括空字符串
isNotBlank| -  | 列 不为空包括空字符串
in | in  | 列 在集合内部,集合为空返回False
notIn | not in  | 列 不在集合内部,集合为空返回True
rangeOpenClosed | < x <=  | 区间 (left..right] = {x \| left < x <= right} 一般用于范围比如时间,小的时间在前大的时间在后
rangeOpen | < x <  | 区间 (left..right) = {x \| left < x < right} 一般用于范围比如时间,小的时间在前大的时间在后
rangeClosedOpen | <= x <  | [left..right) = {x \| left <= x < right} 一般用于范围比如时间,小的时间在前大的时间在后
rangeClosed | <= x <=  | \[left..right\] = {x \| left <= x <= right} 一般用于范围比如时间,小的时间在前大的时间在后
columnFunc | 自定义  | 自定义函数包裹column
exists | 存在  | 使用子查询queryable
notExists | 不存在  | 使用子查询queryable

## 动态条件
`eq`、`ge`、`isNull`、`isNotNull`...... 一些列方法都有对应的重载,其中第一个参数`boolean condition`表示是否追加对应的条件,并且`where`一样存在重载
```java
SysUser sysUser =  easyQuery.queryable(SysUser.class)
                .where(o -> o.eq(SysUser::getId, "123xxx")
                        .like(false,SysUser::getPhone,"133"))//表达式like第一个参数为false所以不会添加phone的like条件到sql中
                        .firstOrNull()

==> Preparing: SELECT `id`,`create_time`,`username`,`phone`,`id_card`,`address` FROM `easy-query-test`.`t_sys_user` WHERE `id` = ? LIMIT 1
==> Parameters: 123xxx(String)
<== Time Elapsed: 3(ms)
<== Total: 0
```

## null pointer
```java

Map<String,String> phone=null;
SysUser sysUser = easyQuery.queryable(SysUser.class)
        .where(o -> o.eq(SysUser::getId, "123xxx")
                .like(phone!=null&&phone.containsKey("phone"),SysUser::getPhone,phone.get("phone")))
                .firstOrNull();

//虽然我们对phone进行了判断非null并且包含对应的phone的key,但是因为第二个参数是直接获取值会导致phone.get("phone")的phone还是null所以会报错空指针异常
```

## 动态条件2
```java
Map<String,String> phone=null;
SysUser sysUser = easyQuery.queryable(SysUser.class)
                    .where(o -> o.eq(SysUser::getId, "123xxx"))
                    .where(phone!=null&&phone.containsKey("phone"),o -> o.like(SysUser::getPhone,phone.get("phone")))//where与where之间采用and链接
                    .firstOrNull();

==> Preparing: SELECT `id`,`create_time`,`username`,`phone`,`id_card`,`address` FROM `easy-query-test`.`t_sys_user` WHERE `id` = ? LIMIT 1
==> Parameters: 123xxx(String)
<== Time Elapsed: 2(ms)
<== Total: 0

```