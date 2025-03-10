---
title: 更新
order: 30
---

## 前言

本章节的环境配置请参考[环境准备](../../startup/quick-start.md#环境准备)章节


::: danger 说明!!!
> 默认`update(entity)`操作是更新对象全部列到数据库,不忽略`null`值,如果需要修改策略请进行[配置](/easy-query-doc/framework/config-optio)或手动设置策略
> 默认`update(entity)`操作是更新对象全部列到数据库,不忽略`null`值,如果需要修改策略请进行[配置](/easy-query-doc/framework/config-optio)或手动设置策略
> 默认`update(entity)`操作是更新对象全部列到数据库,不忽略`null`值,如果需要修改策略请进行[配置](/easy-query-doc/framework/config-optio)或手动设置策略
:::


## 更新对象

Easy Query提供了`updatable`方法，支持更新单条数据和多条数据,支持批量更新，
如果更新的是对象，则默认按照对象的主键进行更新。

```java
    @Test
    public void testUpdate() {
        User existUser = easyEntityQuery.queryable(User.class).findNotNull(1);
        DateTime updateTime = new DateTime();
        existUser.setUpdateTime(updateTime);
        //更新单条数据
        long rows = easyEntityQuery.updatable(existUser).executeRows();
        Assertions.assertTrue(rows > 0);
        List<User> users = easyEntityQuery.queryable(User.class).where(u -> u.id().in(Arrays.asList(1, 2))).toList();
        for (User user : users) {
            user.setUpdateTime(updateTime);
        }
        //更新多条数据
        rows = easyEntityQuery.updatable(users).executeRows();
        Assertions.assertTrue(rows > 0);
        //批量更新多条数据
        rows = easyEntityQuery.updatable(users).batch().executeRows();
        Assertions.assertEquals(users.size(), rows);
    }
```
批量更新多条数据时需要配置jdbc连接参数，即`rewriteBatchedStatements=true`，配置参数后性能将会大幅提升。

::: danger 注意
调用`updatable`方法只是获取操作对象，必须再调用`executeRows`方法再是最终完成更新操作。
::: 

## 更新策略

Easy Query默认采用`SQLExecuteStrategyEnum.ALL_COLUMNS`策略进行更新，也就是默认更新全列，可以使用`setSQLStrategy`方法设置执行策略，设置`SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS`可以更新非null列。
```java
    @Test
    public void testUpdateAll() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        DateTime updateTime = new DateTime();
        user.setUpdateTime(updateTime);
        long rows = easyEntityQuery.updatable(user).setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS).executeRows();
        Assertions.assertTrue(rows > 0);
        Assertions.assertNotNull(user.getId());
    }
```

## 更新指定列

调用`setColumns`方法可以更新指定列。
```java
    @Test
    public void testUpdateCustomColumn() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        DateTime updateTime = new DateTime();
        user.setUpdateTime(updateTime);
        updateTime.offset(DateField.SECOND, 1);
        long rows = easyEntityQuery.updatable(user)
                .setColumns(o -> o.updateTime())//多个字段使用FETCHER.setColumns(o->o.FETCHER.name().updateTime())
                .whereColumns(o -> o.id())//多个字段使用FETCHER.whereColumns(o->o.FETCHER.id().name())
                .executeRows();
        Assertions.assertTrue(rows > 0);

        updateTime.offset(DateField.SECOND, 1);
        rows = easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.updateTime().set(updateTime);
                })
                .where(o -> o.id().eq(user.getId()))
                .executeRows();
        Assertions.assertTrue(rows > 0);

        //更新指定列并断言
        updateTime.offset(DateField.SECOND, 1);
        easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.updateTime().set(updateTime);
                })
                .where(o -> o.id().eq(user.getId()))
                .executeRows(1, "更新失败");
    }
```
调用`set`方法后可以继续链式调用对其它列进行`set`

::: danger 注意
调用`executeRows`方法断言受影响行数时，如果不匹配则会抛异常,如果当前操作不在事务内执行那么会自动开启事务!!!会自动开启事务!!!会自动开启事务!!!来实现并发更新控制,因此当前的更新操作将失效
::: 

## 列值类型自动转换

将一个表的列值设为另一个列值时，支持列类型自动转换，比如将`name`设为`id`值。
```java
    @Test
    public void testUpdateColumnType() {
        long rows = easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.name().set(o.id().toStr());
                    //toStr和.setPropertyType(String.class)效果是一样的
                    o.name().set(o.id().setPropertyType(String.class));
                })
                .whereById("1")
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

## 列值自更新

Easy Query支持调用`increment`方法对字段值自增， 默认自增1，可以传入指定的参数值进行自增，另外可以使用`decrement`方法对字段值自减。

```java
    @Test
    public void testUpdateIncrement() {
        User user = easyEntityQuery.queryable(User.class).findNotNull(1);
        //自增，可传入指定参数自增
        long rows = easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.version().increment();
                })
                .where(o -> o.id().eq(user.getId()))
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

## 差异更新

Easy Query支持差异更新，差异更新可以自动监听被追踪的对象,并且生成差异更新语句,而不是无脑的对对象进行全字段更新,使用时需要开启当前追踪环境并且对查询出来的结果进行追踪后续即可监听到变更列实现差异化update语句

我们可以在调用`queryable`方法后调用`asTracking`方法直接追踪查询的对象，在更新对象时只更新其有变化的字段值。

```java
    @Test
    public void testAsTracking() {
        TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
        try {
            trackManager.begin();
            Integer id = 1;
            User existUser = easyEntityQuery.queryable(User.class).asTracking().findNotNull(id);
            existUser.setVersion(existUser.getVersion() + 1);
            easyEntityQuery.updatable(existUser).executeRows();
        } finally {
            trackManager.release();
        }
    }
```
在本例中，调用`asTracking`方法后，Easy Query将第一次记录查询出来的对象的状态，
在调用`updatable`方法更新后，Easy Query将比对本次对象与第一次记录的对象之间的差异，
在执行UPDATE语句时只会更新`version`字段值。

一般情况下都是追踪查询结果，如果每次查询之后都要调用`asTracking`方法是很麻烦的，调用`setDefaultTrack`方法设为`true`开启默认追踪。
```java
        EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
                .setDefaultDataSource(dataSource)
                .optionConfigure(op -> {
                    op.setDefaultTrack(true);
                })
```
开启默认追踪后，Easy Query将为每一次`queryable`方法调用后默认调用`asTracking`方法，
对于某些查询方法不希望Easy Query默认调用`asTracking`方法，那么可以调用`asNoTracking`方法去除默认调用。

::: danger 注意
调用`trackManager.begin`方法后将开启上下文追踪，只有在开启上下文追踪后，追踪对象才会生效，否则无论是否自动调用`asTracking`方法追踪对象都将无效
:::

除了追踪查询的对象，也可以调用`addTracking`方法追踪指定对象的差异变化，比如查询结果有多个对象，可以只追踪查询结果的其中一个对象。

```java
    @Test
    public void testAddTracking() {
        TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
        try {
            trackManager.begin();
            Integer id = 1;
            User existUser = easyEntityQuery.queryable(User.class).findNotNull(id);
            easyEntityQuery.addTracking(existUser);
            existUser.setVersion(existUser.getVersion() + 1);
            easyEntityQuery.updatable(existUser).executeRows();
        } finally {
            trackManager.release();
        }
    }
```
在本例中，调用`addTracking`方法后，Easy Query将第一次记录指定的对象的状态，
在调用`updatable`方法更新后，Easy Query将比对本次对象与第一次记录的对象之间的差异，
在执行UPDATE语句时只会更新`version`字段值。

每次都需要调用`trackManager.begin`方法开启上下文追踪，以及调用`trackManager.release`方法释放资源。
在Spring Boot环境下，类似Spring的`@Transactional`，只需使用Easy Query提供的`@EasyQueryTrack`即可简化操作。
```java
    @EasyQueryTrack
    public void testAddTracking() {
        trackManager.begin();
        Integer id = 1;
        User existUser = easyEntityQuery.queryable(User.class).findNotNull(id);
        easyEntityQuery.addTracking(existUser);
        existUser.setVersion(existUser.getVersion() + 1);
        easyEntityQuery.updatable(existUser).executeRows();
    }
```


## 更新Map

Easy Query也支持更新`Map`对象，注意，key是列名，不是实体类的属性名。
```java
    @Test
    public void testUpdateMap() {
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", 1);
        userMap.put("update_time", LocalDateTime.now());
        long rows = easyEntityQuery.mapUpdatable(userMap)
                .asTable("user")
                .setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS)
                .whereColumns("id")
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```

## 更新自定义sql

Easy Query支持更新时自定义sql。
```java
    @Test
    public void testUpdateCustomSQL() {
        long rows = easyEntityQuery.updatable(User.class)
                .setColumns(o -> {
                    o.version().setSQL("ifnull({0},0)+{1}", (context) -> {
                        context.expression(o.version())
                                .value(1);
                    });
                })
                .where(o -> o.id().eq(1))
                .executeRows();
        Assertions.assertTrue(rows > 0);
    }
```