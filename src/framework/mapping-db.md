---
title: 对象映射数据库列规则
order: 6
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
接口支持默认java属性转数据库列名

默认java属性为小驼峰的情况下转换结果如下