---
title: 插入
order: 10
---

## 前言

本章节的环境配置请参考[环境准备](../../startup/quick-start.md#环境准备)章节

## 插入对象

Easy Query提供了`insertable`方法，支持插入单条数据和多条数据,支持批量插入。

```java
    @Test
    public void testInsert() {
        User newUser = new User();
        newUser.setName("新用户");
        newUser.setCreateTime(new Date());
        //插入单条数据
        long rows = easyEntityQuery.insertable(newUser).executeRows(true);
        Assertions.assertTrue(rows > 0);
        Assertions.assertNotNull(newUser.getId());
        User copyUser = new User();
        copyUser.setName("新用户");
        copyUser.setCreateTime(new Date());
        List<User> users = Arrays.asList(newUser, copyUser);
        //插入多条数据
        rows = easyEntityQuery.insertable(users).executeRows(true);
        Assertions.assertTrue(rows > 0);
        for (User user : users) {
            Assertions.assertNotNull(user.getId());
        }
        //批量插入多条数据
        easyEntityQuery.insertable(users).batch().executeRows(true);
        for (User user : users) {
            Assertions.assertNotNull(user.getId());
        }
    }
```
::: danger 注意
调用`insertable`方法只是获取操作对象，必须再调用`executeRows`方法再是最终完成插入操作。
::: 

批量插入多条数据时需要配置jdbc连接参数，即`rewriteBatchedStatements=true`，配置参数后性能将会大幅提升。
调用`batch`方法返回的受影响的行数未必是正确的，因此不建议使用此返回结果，id回填是没问题的。

调用完`insertable`方法后可以再链式调用`insert`方法继续插入数据。

## 插入策略

Easy Query默认采用`SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS`策略进行插入，也就是默认只插入有值的列，可以使用`setSQLStrategy`方法设置执行策略，设置`SQLExecuteStrategyEnum.ALL_COLUMNS`可以插入全部列。

```java
    @Test
    public void testInsertAllColumns() {
        User user = new User();
        user.setName("新用户");
        user.setCreateTime(new Date());
        long rows = easyEntityQuery.insertable(user).setSQLStrategy(SQLExecuteStrategyEnum.ALL_COLUMNS).executeRows(true);
        Assertions.assertTrue(rows > 0);
        Assertions.assertNotNull(user.getId());
    }
```

## 插入Map

Easy Query也支持插入`Map`对象，注意，key是列名，不是实体类的属性名，同时，不支持主键回填。

```java
    @Test
    public void testInsertMap() {
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("name", "小明");
        userMap.put("create_time", new Date());
        userMap.put("enabled", true);
        long rows = easyEntityQuery.mapInsertable(userMap) .asTable("user").executeRows(true);
        Assertions.assertTrue(rows > 0);
        Assertions.assertNull(userMap.get("id"));
    }
```

## 重复插入策略

Easy Query提供了只支持MySQL的`onDuplicateKeyIgnore`，`onDuplicateKeyUpdate`方法，只支持PostgreSQL的`onConflictDoNothing`，`onConflictDoUpdate`方法，
这些方法都是用于设置重复插入策略的，它们已经过时了，新的Easy Query版本中请参考[插入或更新](./insertOrUpdate.md)章节。

如果在使用旧版本的过时方法时遇到了问题，欢迎进群提问。
::: center
<img src="/qrcode.jpg" alt="群号: 170029046" class="no-zoom" style="width:200px;">

#### EasyQuery官方QQ群: 170029046
:::