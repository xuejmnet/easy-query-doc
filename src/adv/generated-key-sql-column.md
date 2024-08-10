---
title: 数据库函数生成列
---

`easy-query`支持以数据库函数生成列值,比如通过自定义`nextId()`函数来实现插入时生成对应的id列,而不是普通的对象属性列.


## 自定义函数创建数据库自动生成列
数据库对象,必须设置generatedKey为true,表示为自动生成的,如果不添加`generatedSQLColumnGenerator`那么将会视为自增列一样,不加入insert语句由数据库生成
```java
@Data
@Table("custom_increment")
public class CustomIncrement {
    @Column(primaryKey = true,generatedKey = true, generatedSQLColumnGenerator = MyDatabaseIncrementSQLColumnGenerator.class)
    private String id;
    private String name;
    private String address;
}
```

自定义插入列函数
```java
public class MyDatabaseIncrementSQLColumnGenerator implements GeneratedKeySQLColumnGenerator {
    @Override
    public void configure(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        sqlPropertyConverter.sqlNativeSegment("mysqlNextId()");
    }
}
```
假设我定义了mysql的函数`mysqlNextId`自动生成主键id由mysql数据库函数来实现

```java
CustomIncrement customIncrement=new CustomIncrement();
//customIncrement.setId();//无论是否设置都会用 mysqlNextId 作为插入函数
customIncrement.setName("name");
customIncrement.setAddress("address");
easyQuery.insertable(customIncrement)
        .executeRows();

INSERT INTO `custom_increment` (`id`,`name`,`address`) VALUES (mysqlNextId(),?,?)
```

## 案例场景
pgsql的geo数据新增或者自定义数据库函数生成列时,仅新增时调用