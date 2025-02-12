---
title: 自定义内容
---

# 自定义内容
`eq`默认框架注解提供了如何在运行时读取比如表或者列的备注信息,是否可为null或者自定义数据库类型等,但是有时候大家希望通过自己已有的注解或者在生成式进行预先干预解析元信息

## MigrationEntityParser
`eq 2.5.7^`版本暴露该接口
```java

        easyEntityQuery.setMigrationParser(xxxx);
```
通过上述方法可以让框架在解析时使用自定义的解析方法


## 未完待续。。。。。