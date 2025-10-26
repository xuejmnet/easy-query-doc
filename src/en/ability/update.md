---
title: Update
order: 30
---

# Update Operations

This chapter covers update operations in easy-query.

::: danger Important
By default, `update(entity)` updates ALL columns of the object to the database without ignoring `null` values. If you need to change this strategy, please configure it in [Configuration](../../framework/config-option.md) or manually set the strategy.
:::

## Update Entity

Easy-query provides the `updatable` method that supports updating single and multiple records with batch update support. When updating an entity, it uses the primary key by default.

```java
@Test
public void testUpdate() {
    User existUser = easyEntityQuery.queryable(User.class).findNotNull(1);
    LocalDateTime updateTime = LocalDateTime.now();
    existUser.setUpdateTime(updateTime);
    
    // Update single record
    long rows = easyEntityQuery.updatable(existUser).executeRows();
    Assertions.assertTrue(rows > 0);
    
    // Update multiple records
    List<User> users = easyEntityQuery.queryable(User.class)
        .where(u -> u.id().in(Arrays.asList(1, 2)))
        .toList();
    
    for (User user : users) {
        user.setUpdateTime(updateTime);
    }
    
    rows = easyEntityQuery.updatable(users).executeRows();
    Assertions.assertTrue(rows > 0);
    
    // Batch update multiple records
    rows = easyEntityQuery.updatable(users).batch().executeRows();
    Assertions.assertEquals(users.size(), rows);
}
```

For batch updates, configure the JDBC connection parameter `rewriteBatchedStatements=true` for significantly improved performance.

::: danger Note
Calling `updatable` only creates the update operation object. You must call `executeRows` to execute the update.
:::

## Update Strategy

Easy-query defaults to `SQLExecuteStrategyEnum.ALL_COLUMNS` strategy (update all columns). Use `setSQLStrategy` to set a different execution strategy. Use `SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS` to update only non-null columns.

```java
@Test
public void testUpdateAll() {
    User user = easyEntityQuery.queryable(User.class).findNotNull(1);
    LocalDateTime updateTime = LocalDateTime.now();
    user.setUpdateTime(updateTime);
    
    long rows = easyEntityQuery.updatable(user)
        .setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS)
        .executeRows();
    
    Assertions.assertTrue(rows > 0);
}
```

## Update Specific Columns

Use `setColumns` to update specific columns:

```java
@Test
public void testUpdateCustomColumn() {
    User user = easyEntityQuery.queryable(User.class).findNotNull(1);
    LocalDateTime updateTime = LocalDateTime.now();
    user.setUpdateTime(updateTime);
    
    // Update using entity values
    long rows = easyEntityQuery.updatable(user)
        .setColumns(o -> o.updateTime()) // Multiple: o.FETCHER.name().updateTime()
        .whereColumns(o -> o.id())       // Multiple: o.FETCHER.id().name()
        .executeRows();
    
    Assertions.assertTrue(rows > 0);
    
    // Update with custom values
    updateTime = updateTime.plusSeconds(1);
    rows = easyEntityQuery.updatable(User.class)
        .setColumns(o -> {
            o.updateTime().set(updateTime);
        })
        .where(o -> o.id().eq(user.getId()))
        .executeRows();
    
    Assertions.assertTrue(rows > 0);
    
    // Update with assertion
    updateTime = updateTime.plusSeconds(1);
    easyEntityQuery.updatable(User.class)
        .setColumns(o -> {
            o.updateTime().set(updateTime);
        })
        .where(o -> o.id().eq(user.getId()))
        .executeRows(1, "Update failed");
}
```

After calling `set`, you can continue chaining to set other columns.

::: danger Note
When calling `executeRows` with row count assertion, if the count doesn't match, an exception will be thrown. If the operation is not within a transaction, it will automatically start a transaction to implement concurrency control, causing the update to fail.
:::

## Column Type Auto-Conversion

When setting one column to another column's value, type conversion is supported:

```java
@Test
public void testUpdateColumnType() {
    long rows = easyEntityQuery.updatable(User.class)
        .setColumns(o -> {
            o.name().set(o.id().toStr());
            // toStr() is equivalent to .setPropertyType(String.class)
            o.name().set(o.id().setPropertyType(String.class));
        })
        .whereById("1")
        .executeRows();
    
    Assertions.assertTrue(rows > 0);
}
```

## Column Value Self-Update

Easy-query supports calling `increment` to increment field values (default +1, or specify a value), and `decrement` to decrement field values.

```java
@Test
public void testUpdateIncrement() {
    User user = easyEntityQuery.queryable(User.class).findNotNull(1);
    
    // Increment (can pass custom value)
    long rows = easyEntityQuery.updatable(User.class)
        .setColumns(o -> {
            o.version().increment();    // +1
            o.score().increment(10);     // +10
            o.points().decrement(5);     // -5
        })
        .where(o -> o.id().eq(user.getId()))
        .executeRows();
    
    Assertions.assertTrue(rows > 0);
}
```

## Differential Update

Easy-query supports differential updates that automatically track changes to tracked objects and generate update statements for only changed columns.

Call `asTracking` after `queryable` to track the query result. When updating, only changed fields will be updated:

```java
@Test
public void testAsTracking() {
    TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
    try {
        trackManager.begin();
        Integer id = 1;
        User existUser = easyEntityQuery.queryable(User.class)
            .asTracking()
            .findNotNull(id);
        
        existUser.setVersion(existUser.getVersion() + 1);
        
        easyEntityQuery.updatable(existUser).executeRows();
        // Only updates the version column!
    } finally {
        trackManager.release();
    }
}
```

In this example, calling `asTracking` records the object's initial state. When `updatable` is called, easy-query compares the current state with the initial state and only updates changed columns (in this case, only `version`).

### Enable Default Tracking

To avoid calling `asTracking` every time, enable default tracking:

```java
EasyQueryClient easyQueryClient = EasyQueryBootstrapper.defaultBuilderConfiguration()
    .setDefaultDataSource(dataSource)
    .optionConfigure(op -> {
        op.setDefaultTrack(true);
    })
```

With default tracking enabled, every `queryable` call automatically tracks results. Use `asNoTracking` to disable tracking for specific queries.

::: danger Note
Call `trackManager.begin()` to enable context tracking. Tracking only works when context tracking is active.
:::

### Track Specific Objects

Use `addTracking` to track specific objects instead of all query results:

```java
@Test
public void testAddTracking() {
    TrackManager trackManager = easyEntityQuery.getRuntimeContext().getTrackManager();
    try {
        trackManager.begin();
        Integer id = 1;
        User existUser = easyEntityQuery.queryable(User.class).findNotNull(id);
        
        easyEntityQuery.addTracking(existUser); // Manually track
        
        existUser.setVersion(existUser.getVersion() + 1);
        easyEntityQuery.updatable(existUser).executeRows();
    } finally {
        trackManager.release();
    }
}
```

### Spring Boot Integration

In Spring Boot, use `@EasyQueryTrack` annotation similar to `@Transactional`:

```java
@EasyQueryTrack
public void testAddTracking() {
    Integer id = 1;
    User existUser = easyEntityQuery.queryable(User.class).findNotNull(id);
    easyEntityQuery.addTracking(existUser);
    existUser.setVersion(existUser.getVersion() + 1);
    easyEntityQuery.updatable(existUser).executeRows();
}
```

::: danger Note
With differential updates, queries for the same track-key (default: primary key) will use the tracked context object instead of database values. However, after an update operation on the tracked object, the tracking context is cleared, and subsequent queries will fetch from the database.
:::

## Update Map

Easy-query also supports updating Map objects (keys are column names, not property names):

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

## Update with Custom SQL

Easy-query supports custom SQL in updates:

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

## Best Practices

### Use Selective Updates

```java
// ✅ Good - update only non-null fields
user.setName("New Name");
easyEntityQuery.updatable(user)
    .setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS)
    .executeRows();

// ❌ Avoid - updates all fields including nulls
easyEntityQuery.updatable(user).executeRows();
```

### Use Tracking for Complex Updates

```java
// ✅ Good - use tracking for minimal updates
@EasyQueryTrack
public void updateUser(String id) {
    User user = easyEntityQuery.queryable(User.class)
        .whereById(id)
        .firstOrNull();
    
    // Complex business logic that may change various fields
    if (user.getAge() < 18) {
        user.setStatus(UserStatus.MINOR);
    }
    
    // Only changed fields are updated
    easyEntityQuery.updatable(user).executeRows();
}
```

### Use Batch Updates

```java
// ✅ Good - batch update
List<User> users = getUsers();
easyEntityQuery.updatable(users)
    .batch()
    .executeRows();

// ❌ Avoid - individual updates
for (User user : users) {
    easyEntityQuery.updatable(user).executeRows();
}
```

## Common Issues

### Issue: All Columns Updated

**Problem**: Want to update only changed columns but all columns are being updated

**Solution**: Use one of these approaches:
1. Set update strategy: `.setSQLStrategy(SQLExecuteStrategyEnum.ONLY_NOT_NULL_COLUMNS)`
2. Use tracking: `.asTracking()`
3. Specify columns: `.setColumns(o -> o.name())`

### Issue: Tracking Not Working

**Problem**: Using `asTracking()` but still updating all columns

**Solution**: Ensure tracking context is started with `trackManager.begin()` or use `@EasyQueryTrack` annotation

## See Also

- [Insert Operations](./insert.md)
- [Delete Operations](./delete.md)
- [Data Tracking](../../adv/data-tracking.md)
- [Optimistic Locking](../../adv/version.md)

---

If you encounter problems, feel free to join our QQ group: **170029046**

