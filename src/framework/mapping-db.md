---
title: 对象映射数据库列规则
order: 60
---

# 对象映射数据库列规则
`eq`提供了java属性映射到数据库列的方式,`nameConversion`(推荐🔥)和注解`@Column`

为什么要提供这个功能，因为默认java属性我们认为是小驼峰也就是`userAge`这种模式首字母小写遇到第二个单词改为大写模式

## Column
注解value属性可以将实体属性映射到对应的数据库名称,但是这种方式是固定写死了无法根据各个数据库的默认约定来动态映射
```java
@Column(value="user_age")
private Integer userAge;
```

## NameConversion

方法  | 作用
---  | --- 
convert | 用于处理属性名或者类名转成数据库的表名或者列名
annotationCovert | 由于注解@Table("t_user")写死了表名小写，为了适应一套代码多db可能有些地方有大写可以通过该方法自行实现后替换框架默认实现


流程如下

读取到字段名或者列名->判断是否有`@Column`或者`@Table`->将内部的`value`或者字段名类名通过`convert`方法转成列名或表名->最后再通过`annotationCovert`最后一次转成需要的默认不进行任何处理

接口支持默认java属性转数据库列名

默认java属性为小驼峰的情况下转换结果如下


property  | nameConversion | column  
---  | --- | --- 
userAge  | DefaultNameConversion | userAge
userAge  | UnderlinedNameConversion | user_age
userAge  | UpperUnderlinedNameConversion | USER_AGE
userAge  | LowerCamelCaseNameConversion | userAge
userAge  | UpperCamelCaseNameConversion | UserAge

```log
property:userAge-->conversion:DefaultNameConversion-->column:userAge
property:userAge-->conversion:UnderlinedNameConversion-->column:user_age
property:userAge-->conversion:UpperUnderlinedNameConversion-->column:USER_AGE
property:userAge-->conversion:LowerCamelCaseNameConversion-->column:userAge
property:userAge-->conversion:UpperCamelCaseNameConversion-->column:UserAge
```


::: tip 说明!!!
> 如果默认的转换都无法满足你的使用那么您可以自定义`NameConversion`来替[换默认框架的接口](/easy-query-doc/framework/replace-configure)
:::




