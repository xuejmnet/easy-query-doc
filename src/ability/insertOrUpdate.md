---
title: 插入或者更新
---

旧版本的Easy Query提供了只支持MySQL的`onDuplicateKeyIgnore`，`onDuplicateKeyUpdate`方法，只支持PostgreSQL的`onConflictDoNothing`，`onConflictDoUpdate`方法。
这些方法都是用于设置重复插入策略的，它们已经过时了，在此不再讲述。

`1.10.41+`版本的Easy Query提供了更加强大的`conflictThen`方法，它用于插入或更新操作，它并不是简单的查询判断是否存在,如果不存在就更新,存在就更新或者忽略,而是实现了数据库对应的方言实现数据库自身的功能。它支持的数据库如下：

数据库名称  | 包名  | 是否支持
--- | --- | ---  
MySQL | sql-mysql  | ✅
Oracle | sql-oracle  | ✅
PostgreSQL | sql-pgsql  | ✅
SqlServer | sql-mssql  | ✅
H2 | sql-h2  | ✅
SQLite | sql-sqlite  | ✅
达梦dameng | sql-dameng  | ✅
人大金仓KingbaseES | sql-kingbase-es  | ✅



::: warning 说明!!!
> H2数据库目前采用mysql模式可以设置模式为mysql`MODE=MySQL`
:::



`conflictThen`方法的第一个参数指定需要更新的字段，如果传入`null`则不进行更新，第二个参数指定用于判断对象是否存在所需要的字段，第二个参数如果不传则默认使用主键字段判断，支持多字段(MySQL不支持所以设置了也无效)，`conflictThen`方法执行的大概过程是根据第二个参数指定的字段判断对象是否已存在，如果存在，则更新第一个参数指定的字段，否则执行插入操作，插入的是全部字段。

## 存在则更新,不存在则插入

本例使用`conflictThen`方法，不传第二个参数，默认使用主键字段判断对象是否已存在，本例为存在则更新第一个参数指定的字段。

```java
    @Test
    public void testOnConflictThenUpdate() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        LocalDateTime updateTime = LocalDateTime.now();
        user.setUpdateTime(updateTime);
        long rows = easyEntityQuery.insertable(user)
                .onConflictThen(o -> o.FETCHER.allFields())
                .executeRows();
        Assertions.assertTrue(rows > 0);

        user = easyEntityQuery.queryable(User.class).findNotNull(1);
        updateTime = LocalDateTime.now();
        user.setUpdateTime(updateTime);
        rows = easyEntityQuery.insertable(user)
                .onConflictThen(o -> o.FETCHER.updateTime())
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

## 不存在则插入,存在则忽略

本例使用`conflictThen`方法，使用第二个参数传入主键字段来判断对象是否已存在，本例为不存在则插入全部字段。

```java
    @Test
    public void testOnConflictThenInsert() {
        User user = new User();
        LocalDateTime createTime = LocalDateTime.now();
        user.setName("新用户");
        user.setCreateTime(createTime);
        user.setVersion(1);
        user.setEnabled(true);
        long rows = easyEntityQuery.insertable(user)
                .onConflictThen(null, o -> o.FETCHER.id())
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

## mysql不支持第二个参数设置

可以参考如下文章

https://blog.csdn.net/qq_42402854/article/details/136749503