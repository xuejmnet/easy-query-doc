---
title: 结构化对象
order: 10
---

`easy-query` 1.2.1+ 支持关联查询,支持多级关联查询,并且只支持first和tolist两个返回方法,支持vo对象返回支持`include`追加追踪、禁止、逻辑删除、where过滤、order、limit等一系列处理，但是返回结果必须是数据库对象实例(include方法内部),如果需要额外字段返回可以使用`columnInclude`/`columnIncludeMany`自定义返回

::: warning 说明!!!
> `OneToOne`和`ManyToOne`有着天然的区别,比如每条记录都有一个创建人id,如果你添加创建人关系对象到记录对象里面,那么应该设置`ManyToOne`表示多条记录都会有这个创建人,而不是`OneToOne`，如果您设置`OneToOne`那么如果2条记录有相同的创建人则只会有一个创建人被关联上,具体可以反向推导比如一个人有多少条记录很明显是`OneToMany`那么反过来就是`ManyToOne`
:::

类型  | 描述 | 场景 
--- | --- | --- 
OneToOne | 一对一  | 学生和学生家庭信息
OneToMany | 一对多 | 班级和学生
ManyToOne | 多对一  | 学生和班级
ManyToMany | 多对多  | 班级和老师

```java

List<SchoolClass> classes = easyEntityQuery.queryable(SchoolClass.class)
                        //查询班级并且连带查询每个班级最先入学的前5位学生
                        .includes(o -> o.schoolStudents(),x->x.orderBy(u->u.createTime().asc()).limit(5))
                        .toList();

```


::: tip 感谢!!!
> 以下关系图有网友 [`糊搞`](https://gitee.com/gollyhu) 大佬提供十分感谢
:::

### 一对一说明
<img :src="$withBase('/images/include1.png')">

### 多对一说明
<img :src="$withBase('/images/include2.png')">

### 一对多说明

<img :src="$withBase('/images/include3.png')">

### 多对多说明

<img :src="$withBase('/images/include4.png')">

### 多次include

<img :src="$withBase('/images/include5.png')">

### 多关联查询

<img :src="$withBase('/images/include6.png')">


::: warning 说明!!!
> `include` 内部属于独立查询,如果您需要差异更新并且没有配置默认启动追踪查询那么需要独立进行`asTracking()`等,include的后one或者many的第二个参数表示以多少关联属性为一组进行获取
:::

对象模式`include/includes`参数说明 其中如果您的导航属性是`ToOne`那么请使用`include`如果是`ToMany`那么是`includes`

包含的两个参数第一个参数表示你要返回的导航属性,第二个参数表示对返回导航属性如何进行增强
```java
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                //表示查询学校班级的同时附带查询出班级的老师
                .includes(s -> s.schoolTeachers())
                //查询学校班级的同时附带查询出班级的学生(这个学生是每个班级年龄最大的三个)并且返回的学生也需要返回学生地址
                .includes(s -> s.schoolStudents(),x->{
                    x.include(y->y.schoolStudentAddress())
                    .orderBy(y->y.age().desc())
                    .limit(3);
                })
                .where(s -> {
                    s.name().eq("一班");
                }).toList();
```

::: code-tabs
@tab 对象模式
```java
List<SchoolStudent> list = easyEntityQuery.queryable(SchoolStudent.class)
        //一对一查询启用追踪并且对子查询逻辑删除禁用
        .include(o -> o.schoolClass(),q->q.asNoTracking().disableLogicDelete())
        .toList();


List<SchoolStudent> list2 = easyEntityQuery.queryable(SchoolStudent.class)
        //一对一查询启用追踪并且对子查询逻辑删除禁用
        //如果查询学生有20个以上假如21个那么会先用20个id进行in查询,再用1个id进行查询最后进行合并
        .include(o -> o.schoolClass(),20)
        .toList();
```

@tab 属性模式
```java
  List<SchoolStudent> list1 = easyQueryClient.queryable(SchoolStudent.class)
                        //一对一查询启用追踪并且对子查询逻辑删除禁用
                        .include(o -> o.with("schoolStudentAddress").asTracking().disableLogicDelete())
                        .toList();


  List<SchoolStudent> list1 = easyQueryClient.queryable(SchoolStudent.class)
                        //一对一查询启用追踪并且对子查询逻辑删除禁用
                        //如果查询学生有20个以上假如21个那么会先用20个id进行in查询,再用1个id进行查询最后进行合并
                        .include(o -> o.with("schoolStudentAddress",20))
                        .toList();
```


::: 

## 忽略关联查询的value
`eq`默认关联查询是使用`selfProperty`的值对目标属性的表进行二次关联查询,默认情况下`selfProperty`的值为`null`则不会对目标属性进行再次查询,那么有时候我们数据库可能存在其他值，在表现形式上等同于null，比如字符串`-`,`/`,或者空字符串,那么对于二次查询其实没有任何意义,那么我们应该如何去替换让框架支持呢。

这次的内容主要在[这个连接中](https://github.com/dromara/easy-query/issues/302)

首先我们需要替换`RelationNullValueValidator`这个接口

方法  | 作用
--- | --- 
isNullValue | 返回这个对象是否是空值需要被忽略

我们再来看其默认实现`DefaultRelationNullValueValidator`
```java
public class DefaultRelationNullValueValidator implements RelationNullValueValidator {
    @Override
    public boolean isNullValue(Object value) {
        if (Objects.isNull(value)) {
            return true;
        }
        if (value instanceof String) {
            if (EasyStringUtil.isBlank((String) value)) {
                return true;
            }
        }
        return false;
    }
}

```
### 替换
我们需要对`RelationNullValueValidator`的`isNullValue`方法进行替换成我们自己的
```java

public class MyRelationNullValueValidator implements RelationNullValueValidator {
    @Override
    public boolean isNullValue(Object value) {
        if (Objects.isNull(value)) {
            return true;
        }
        if (value instanceof String) {
            if (EasyStringUtil.isBlank((String) value)) {
                return true;
            }
            if (Objects.equals("-", value) || Objects.equals("/", value)) {
                return true;
            }
        }
        return false;
    }
}



```

### 最后替换服务即可
```java
replaceService(RelationNullValueValidator.class, MyRelationNullValueValidator.class)
```


## Navigate


属性  | 是否必填 | 默认值  | 描述
--- | --- | --- | --- 
value | `true`  | - | 表示当前对象和目标对象的关系`RelationTypeEnum`枚举
selfProperty | `false`  | - | 当前对象的哪个属性关联目标对象,空表示使用当前对象的主键
targetProperty | `false`  | - | 当前对象的`selfProperty`属性关联目标的哪个属性,空表示使用目标对象的主键
mappingClass | `false`  | Object.class | 中间表对象,必须是表对象实体字节
selfMappingProperty | `false`多对多必填  | - | 当前对象的`selfProperty`属性对应中间表的哪个属性,多对多不能为空
targetMappingProperty | `false`多对多必填  | - | 目标对象的`targetProperty`属性对应中间表的哪个属性,多对多不能为空
orderByProps | `false`  | - | 默认的子对象排序行为(建议ToMany设置)
offset | `false` | 0 | 子对象拉取偏移量(建议ToMany设置)
limit | `false`  | 0 | 子对象拉取量(建议ToMany设置)
extraFilter | `false`  | Def.class | 子对象条件额外条件比如班级和学生额外可以再多两个属性男学生和女学生，则可以通过该属性进行分类


## 更多案例
 [点击查看更多案例](/easy-query-doc/examples/include-example)