---
title: 计算属性目录
---

# 简介
什么叫做计算属性,计算属性就是非简单的包装类型或者基本类型，比如： 估顾名思义这个属性是通过转换函数或者计算得出的属性

- `json`属性`private UserExtra userExtra;`用来描述数据库存储的字符串或者json类型,映射到java的对象上,支持筛选,返回排序等
- `集合`属性`private List<UserLabels> userLabels;`用来描述数据库存储的字符串或者json类型,映射到java的集合上,支持筛选,返回排序等
- 枚举属性`private UserStatusEnum userStatus;`用来描述数据库存储的字符串或者数字类型,映射到java的枚举属性,支持筛选,返回排序等
- 增强属性`private String idCard;`写入数据库时会自动添加`base64`编码读取会自动进行解码,支持筛选,返回排序等
- 简单计算属性:复合属性`private String fullName;`他是有`firstName`和`lastName`组合，再比如年龄,他是由当前时间和生日的相减生成的动态值,支持筛选,返回排序等
- 复杂计算属性:由子表或者额外表数据构成,比如`private Integer StudentSize;`加入班级和用户是一对多,那么这个属性用来描述班级下有多少学生人数,支持筛选排序返回
- 函数自增属性:该属性可以做到数据由数据库生成比如数据库函数存在`mysqlNextId()`或者`gis`中由数据库生成的函数那么适用于改方法仅插入时生效