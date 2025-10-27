---
title: Insert Or Update (Upsert)
order: 15
---

# Insert Or Update (Upsert)

Old versions of Easy-query provided database-specific methods like `onDuplicateKeyIgnore`, `onDuplicateKeyUpdate` (MySQL only) and `onConflictDoNothing`, `onConflictDoUpdate` (PostgreSQL only). These methods are now deprecated.

Version `1.10.41+` provides the more powerful `conflictThen` method for insert-or-update operations. Unlike simple check-then-insert/update logic, it implements native database upsert functionality using database-specific dialects.

## Database Support

| Database | Package | Supported |
|----------|---------|-----------|
| MySQL | sql-mysql | ✅ |
| Oracle | sql-oracle | ✅ |
| PostgreSQL | sql-pgsql | ✅ |
| SQL Server | sql-mssql | ✅ |
| H2 | sql-h2 | ✅ |
| SQLite | sql-sqlite | ✅ |
| DaMeng | sql-dameng | ✅ |
| KingbaseES | sql-kingbase-es | ✅ |

::: warning Note
H2 database currently uses MySQL mode. Set mode with `MODE=MySQL`.
:::

## How It Works

The `conflictThen` method takes two parameters:

1. **First parameter**: Fields to update on conflict. Pass `null` to skip updates.
2. **Second parameter** (optional): Fields to check for conflicts. Defaults to primary key. Supports multiple fields (except MySQL).

Process:
1. Check if record exists using second parameter fields
2. If exists: Update fields specified in first parameter
3. If not exists: Insert all fields

## Update If Exists, Insert If Not

Use `conflictThen` without second parameter to check by primary key:

```java
@Test
public void testOnConflictThenUpdate() {
    User user = easyEntityQuery.queryable(User.class).findNotNull(1);
    LocalDateTime updateTime = LocalDateTime.now();
    user.setUpdateTime(updateTime);
    
    // Update all fields on conflict
    long rows = easyEntityQuery.insertable(user)
        .onConflictThen(o -> o.FETCHER.allFields())
        .executeRows();
    
    Assertions.assertTrue(rows > 0);
    
    // Update only updateTime field on conflict
    user = easyEntityQuery.queryable(User.class).findNotNull(1);
    updateTime = LocalDateTime.now();
    user.setUpdateTime(updateTime);
    
    rows = easyEntityQuery.insertable(user)
        .onConflictThen(o -> o.FETCHER.updateTime())
        .executeRows();
    
    Assertions.assertTrue(rows > 0);
}
```

### Update Multiple Fields

Use chaining to update multiple fields:

```java
easyEntityQuery.insertable(user)
    .onConflictThen(o -> o.FETCHER.updateTime().email().status())
    .executeRows();
```

## Insert If Not Exists, Ignore If Exists

Pass `null` as first parameter to skip updates on conflict:

```java
@Test
public void testOnConflictThenInsert() {
    User user = new User();
    LocalDateTime createTime = LocalDateTime.now();
    user.setName("New User");
    user.setCreateTime(createTime);
    user.setVersion(1);
    user.setEnabled(true);
    
    // Insert if not exists, do nothing if exists
    long rows = easyEntityQuery.insertable(user)
        .onConflictThen(null, o -> o.FETCHER.id())
        .executeRows();
    
    Assertions.assertTrue(rows > 0);
}
```

## Custom Conflict Columns

Specify custom columns to check for conflicts (not supported by MySQL):

```java
// Check by email instead of primary key
easyEntityQuery.insertable(user)
    .onConflictThen(
        o -> o.FETCHER.name().updateTime(), // Update these on conflict
        o -> o.FETCHER.email()  // Check conflict by email
    )
    .executeRows();

// Check by multiple columns
easyEntityQuery.insertable(user)
    .onConflictThen(
        o -> o.FETCHER.name().status(),
        o -> o.FETCHER.email().phone() // Check both email and phone
    )
    .executeRows();
```

## Database-Specific Behavior

### MySQL

```sql
-- Generated SQL for MySQL
INSERT INTO t_user (id, name, email, update_time) 
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  email = VALUES(email),
  update_time = VALUES(update_time)
```

**Note**: MySQL only supports conflict detection on PRIMARY KEY or UNIQUE indexes. The second parameter is ignored.

### PostgreSQL

```sql
-- Generated SQL for PostgreSQL
INSERT INTO t_user (id, name, email, update_time) 
VALUES (?, ?, ?, ?)
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  update_time = EXCLUDED.update_time
```

PostgreSQL supports custom conflict columns.

### SQL Server

```sql
-- Generated SQL for SQL Server (MERGE statement)
MERGE INTO t_user AS target
USING (VALUES (?, ?, ?, ?)) AS source (id, name, email, update_time)
ON target.id = source.id
WHEN MATCHED THEN
  UPDATE SET 
    name = source.name,
    email = source.email,
    update_time = source.update_time
WHEN NOT MATCHED THEN
  INSERT (id, name, email, update_time)
  VALUES (source.id, source.name, source.email, source.update_time);
```

## Practical Examples

### User Registration

Insert if new email, update if email exists:

```java
public void registerOrUpdateUser(User user) {
    easyEntityQuery.insertable(user)
        .onConflictThen(
            o -> o.FETCHER.name().phone().updateTime(), // Update these
            o -> o.FETCHER.email()  // Check by email
        )
        .executeRows();
}
```

### Idempotent Insert

Insert only if not exists (ignore duplicates):

```java
public void insertOnce(User user) {
    easyEntityQuery.insertable(user)
        .onConflictThen(null) // Do nothing on conflict
        .executeRows();
}
```

### Batch Upsert

```java
public void batchUpsert(List<User> users) {
    for (User user : users) {
        easyEntityQuery.insertable(user)
            .onConflictThen(o -> o.FETCHER.name().updateTime())
            .executeRows();
    }
}
```

## Best Practices

### Choose Appropriate Conflict Columns

```java
// ✅ Good - use unique business key
easyEntityQuery.insertable(user)
    .onConflictThen(
        o -> o.FETCHER.name().status(),
        o -> o.FETCHER.email()  // Email is unique
    )
    .executeRows();

// ❌ Avoid - non-unique column
easyEntityQuery.insertable(user)
    .onConflictThen(
        o -> o.FETCHER.name(),
        o -> o.FETCHER.status()  // Status is not unique!
    )
    .executeRows();
```

### Update Only Necessary Fields

```java
// ✅ Good - update only what changed
easyEntityQuery.insertable(user)
    .onConflictThen(o -> o.FETCHER.updateTime().status())
    .executeRows();

// ❌ Avoid - updating all fields unnecessarily
easyEntityQuery.insertable(user)
    .onConflictThen(o -> o.FETCHER.allFields())
    .executeRows();
```

### Handle Return Values Carefully

```java
// Return value may vary by database
long rows = easyEntityQuery.insertable(user)
    .onConflictThen(o -> o.FETCHER.name())
    .executeRows();

// rows might be:
// - 1: Insert occurred
// - 2: Update occurred (MySQL)
// - 1: Update occurred (PostgreSQL)
```

## Common Issues

### Issue: MySQL Ignores Second Parameter

**Problem**: Specifying custom conflict columns doesn't work in MySQL

**Solution**: MySQL only checks PRIMARY KEY or UNIQUE indexes. Ensure your conflict columns have a unique constraint.

### Issue: Insert Or Update Not Working

**Problem**: Records always inserted, never updated

**Solution**: 
1. Verify the conflict detection columns have unique constraints
2. Check that values match exactly (case-sensitive in some databases)
3. Ensure primary key or unique index exists

### Issue: Unexpected Return Values

**Problem**: Return value doesn't match expectations

**Solution**: Return value interpretation varies by database. Check for exceptions instead of relying on return value.

## MySQL Limitations

MySQL's `ON DUPLICATE KEY UPDATE` has limitations compared to PostgreSQL's `ON CONFLICT`. See this article for details:

[MySQL ON DUPLICATE KEY Explained](https://blog.csdn.net/qq_42402854/article/details/136749503)

## See Also

- [Insert Operations](./insert.md)
- [Update Operations](./update.md)
- [Batch Operations](./batch.md)

---

If you encounter problems, feel free to join our QQ group: **170029046**

