---
title: Native SQL
order: 70
---

# Native SQL

Easy-query supports both strongly-typed expression-based SQL and hand-written native SQL for CRUD operations.

## Query Methods

### sqlQuery - Strongly-Typed Result

#### No Parameters

```java
List<BlogEntity> blogEntities = easyQuery.sqlQuery(
    "SELECT * FROM t_blog t", 
    BlogEntity.class
);

// SQL:
// SELECT * FROM t_blog t
// Total: 100
```

#### With Parameters

```java
List<BlogEntity> blogEntities = easyQuery.sqlQuery(
    "SELECT * FROM t_blog t WHERE t.id=?", 
    BlogEntity.class, 
    Collections.singletonList("1")
);

// SQL:
// SELECT * FROM t_blog t WHERE t.id=?
// Parameters: 1(String)
// Total: 1
```

### sqlQueryMap - Map Result

The Map keys are case-insensitive by default.

#### No Parameters

```java
List<Map<String, Object>> blogs = easyQuery.sqlQueryMap("SELECT * FROM t_blog t");

// SQL:
// SELECT * FROM t_blog t
// Total: 100
```

#### With Parameters

```java
List<Map<String, Object>> blogs = easyQuery.sqlQueryMap(
    "SELECT * FROM t_blog t WHERE t.id=?", 
    Collections.singletonList("1")
);

// SQL:
// SELECT * FROM t_blog t WHERE t.id=?
// Parameters: 1(String)
// Total: 1
```

## Execute Methods

### No Parameters

```java
String newContent = UUID.randomUUID().toString();
long rows = easyQuery.sqlExecute(
    "UPDATE t_blog SET content='" + newContent + "' WHERE id='1'"
);

// SQL:
// UPDATE t_blog SET content='3af23d78-86f1-48b1-bc51-ce0e0f63113d' WHERE id='1'
// Total: 1
```

### With Parameters

```java
String newContent = UUID.randomUUID().toString();
long rows = easyQuery.sqlExecute(
    "UPDATE t_blog SET content=? WHERE id=?", 
    Arrays.asList(newContent, "1")
);

// SQL:
// UPDATE t_blog SET content=? WHERE id=?
// Parameters: 0d93119a-9e57-4d71-a67b-58d24823a88b(String), 1(String)
// Total: 1
```

## Custom SQL Fragments

Easy-query provides custom SQL fragments. For example, [Case When](../ability/select/case-when.md) is implemented using custom SQL fragments.

You can design your own API using SQL fragments.

## Entity Query Mode

Entity Query Mode has special rules for native SQL fragments:

- **For `where`, `join on`, `order`, `having`**: Use `o.expression().rawSQLStatement(......).executeSQL()`
- **For `select` aliases and `update set`**: Use `o.expression().rawSQLStatement(....).setSQL()`
- Access expressions via `o.expression()`, then `expression().rawSQLStatement()` for execution in `join`/`where`/`orderBy` (requires calling `executeSQL()`), or return a fragment for `select`/`groupBy`

::: tip Important
`o.expression().rawSQLStatement(....)` returns a SQL fragment. If used in `join`, `where`, or `orderBy`, you must call `executeSQL()` to make it effective: `o.expression().rawSQLStatement(....).executeSQL()`. 

For convenience, you can use `o.expression().rawSQLCommand(....)` which calls `executeSQL()` automatically.

For `select`, `groupBy`, etc., fragments are returned directly without needing `executeSQL()`.
:::

## rawSQLStatement

Creates a typed SQL fragment that users must actively execute.

| Parameter | Function |
|-----------|----------|
| sqlTemplate | SQL template supporting variables like `{0}`...`{n}` |
| parameters | Variable parameters to fill placeholders |

## rawSQLCommand

Creates an execution SQL fragment that executes when created.

| Parameter | Function |
|-----------|----------|
| sqlTemplate | SQL template supporting variables like `{0}`...`{n}` |
| parameters | Variable parameters to fill placeholders |

## Random Ordering Example

::: code-tabs

@tab Object Mode

```java
// All three methods generate the same result

// Method 1: Using asc()
List<Topic> list = easyEntityQuery.queryable(Topic.class)
    .where(b -> {
        b.id().eq("123");
    })
    .orderBy(t -> {
        // Generates: ORDER BY RAND() ASC
        t.expression().rawSQLStatement("RAND()").asc();
    })
    .toList();

// Method 2: Using executeSQL()
List<Topic> list = easyEntityQuery.queryable(Topic.class)
    .where(b -> {
        b.id().eq("123");
    })
    .orderBy(t -> {
        // Generates: ORDER BY RAND()
        t.expression().rawSQLStatement("RAND()").executeSQL();
    })
    .toList();

// Method 3: Using rawSQLCommand
List<Topic> list = easyEntityQuery.queryable(Topic.class)
    .where(b -> {
        b.id().eq("123");
    })
    .orderBy(t -> {
        t.expression().rawSQLCommand("RAND()");
    })
    .toList();

// SQL generated:
// SELECT `id`, `stars`, `title`, `create_time` 
// FROM `t_topic` 
// WHERE `id` = '123' 
// ORDER BY RAND()
```

@tab Property Mode

```java
List<Topic> list = easyQueryClient.queryable(Topic.class)
    .where(b -> {
        b.eq("id", "123");
    })
    .orderByAsc(t -> {
        t.sqlNativeSegment("RAND()");
    })
    .toList();

// SQL generated:
// SELECT `id`, `stars`, `title`, `create_time` 
// FROM `t_topic` 
// WHERE `id` = '123' 
// ORDER BY RAND()
```

:::

## Random Ordering with Parameters

::: code-tabs

@tab Object Mode

```java
// Using parameters in native SQL
List<Topic> list = easyEntityQuery.queryable(Topic.class)
    .where(b -> {
        b.id().eq("123");
    })
    .orderBy(t -> {
        t.expression().rawSQLCommand("IFNULL({0},{1}) DESC", t.stars(), 1);
        t.expression().rawSQLCommand("RAND()");
    })
    .toList();

// SQL generated:
// SELECT `id`, `stars`, `title`, `create_time` 
// FROM `t_topic` 
// WHERE `id` = '123' 
// ORDER BY IFNULL(`stars`,1) DESC, RAND()

// Using in WHERE clause
List<Topic> list = easyEntityQuery.queryable(Topic.class)
    .where(b -> {
        b.id().eq("123");
        b.expression().rawSQLCommand("{0}!={1}", c -> {
            c.expression(b.stars()).expression(b.createTime());
        });
    })
    .orderBy(t -> {
        t.expression().rawSQLCommand("IFNULL({0},{1}) DESC", t.stars(), 1);
        t.expression().rawSQLCommand("RAND()");
    })
    .toList();

// SQL generated:
// SELECT `id`, `stars`, `title`, `create_time` 
// FROM `t_topic` 
// WHERE `id` = '123' 
//   AND `stars` != `create_time` 
// ORDER BY IFNULL(`stars`,1) DESC, RAND()
```

@tab Property Mode

```java
List<Topic> list = easyQueryClient.queryable(Topic.class)
    .where(b -> {
        b.eq("id", "123");
    })
    .orderByAsc(t -> {
        t.sqlNativeSegment("IFNULL({0},{1}) DESC", c -> {
            c.expression("stars").value(1);
        });
        t.sqlNativeSegment("RAND()");
    })
    .toList();

// SQL generated:
// SELECT `id`, `stars`, `title`, `create_time` 
// FROM `t_topic` 
// WHERE `id` = '123' 
// ORDER BY IFNULL(`stars`,1) DESC, RAND()

// Using in WHERE clause
List<Topic> list = easyQueryClient.queryable(Topic.class)
    .where(b -> {
        b.eq("id", "123");
        b.sqlNativeSegment("{0}!={1}", c -> {
            c.expression("stars").expression("createTime");
        });
    })
    .orderByAsc(t -> {
        t.sqlNativeSegment("IFNULL({0},{1}) DESC", c -> {
            c.expression("stars").value(1);
        });
        t.sqlNativeSegment("RAND()");
    })
    .toList();

// SQL generated:
// SELECT `id`, `stars`, `title`, `create_time` 
// FROM `t_topic` 
// WHERE `id` = '123' 
//   AND `stars` != `create_time` 
// ORDER BY IFNULL(`stars`,1) DESC, RAND()
```

:::

## Return Results with Type Conversion

```java
// Native SQL fragments return Object type by default
// Use asAnyType() or asXXX() to specify the type at compile time

List<Draft2<Double, Integer>> list = easyEntityQuery.queryable(Topic.class)
    .where(b -> {
        b.id().eq("123");
    })
    .select(t -> Select.DRAFT.of(
        t.expression().rawSQLStatement("RAND()").asAnyType(Double.class),
        t.expression().rawSQLStatement("IFNULL({0},{1})", t.stars(), 1).asInteger()
    ))
    .toList();

// SQL generated:
// SELECT 
//     RAND() AS `value1`,
//     IFNULL(t.`stars`,1) AS `value2` 
// FROM `t_topic` t 
// WHERE t.`id` = '123'
```

## Setting Aliases for Fragments

```java
List<Topic> listx = easyEntityQuery.queryable(Topic.class)
    .where(b -> {
        b.id().eq("123");
    })
    .select(Topic.class, t -> Select.of(
        t.expression().rawSQLStatement("RAND()").asAnyType(Double.class).as("stars"),
        t.expression().rawSQLStatement("IFNULL({0},{1})", t.stars(), 1).asInteger().as("createTime")
    ))
    .toList();

// SQL generated:
// SELECT 
//     RAND() AS `stars`,
//     IFNULL(t.`stars`,1) AS `createTime` 
// FROM `t_topic` t 
// WHERE t.`id` = '123'
```

## Static Function Encapsulation

You can encapsulate database-specific functions using static methods.

### Example: FIND_IN_SET (MySQL)

```java
public static void findInSet(String value, PropTypeColumn<String> column) {
    Expression expression = EasyProxyParamExpressionUtil.parseContextExpressionByParameters(column);
    expression.rawSQLCommand("FIND_IN_SET({0},{1})", value, column);
}

// Usage
List<BlogEntity> list2 = easyEntityQuery.queryable(BlogEntity.class)
    .where(t_blog -> {
        findInSet("123", t_blog.title().nullOrDefault("123"));
    })
    .toList();

// SQL generated:
// SELECT `id`, `create_time`, `update_time`, ...
// FROM `t_blog`
// WHERE `deleted` = false
//   AND FIND_IN_SET('123', IFNULL(`title`, '123'))
```

### Example: SUBSTR Function

```java
public static StringTypeExpression<String> subStr(
    PropTypeColumn<String> column, 
    int begin, 
    int end
) {
    Expression expression = EasyProxyParamExpressionUtil.parseContextExpressionByParameters(column);
    return expression.rawSQLStatement("SUBSTR({0},{1},{2})", column, begin, end).asStr();
}

// Usage
List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
    .where(t_blog -> {
        findInSet("123", subStr(t_blog.title(), 1, 2));
    })
    .toList();
```

The encapsulation principle: Parse the current expression context from the parameters, then call `rawSQLCommand` on the context. This requires at least one parameter to be a complex type (not just String or int) to extract the context.

## Custom Native SQL Queries

### Query with Native SQL as Subquery

```java
// Use native SQL as a subquery, supports all databases
EasyPageResult<Topic> pageResult1 = easyEntityQuery.queryable(
    "SELECT * FROM t_topic WHERE id != ? ", 
    Topic.class, 
    Arrays.asList("123")
)
.where(t -> t.id().ne("456"))
.toPageResult(1, 2);

// SQL generated:
// SELECT COUNT(*) FROM (SELECT * FROM t_topic WHERE id != ? ) t WHERE t.`id` <> ?
// Parameters: 123(String), 456(String)

// SELECT * FROM (SELECT * FROM t_topic WHERE id != ? ) t WHERE t.`id` <> ? LIMIT 2
// Parameters: 123(String), 456(String)
```

### Join Native SQL Table

```java
EntityQueryable<TopicProxy, Topic> joinTable = easyEntityQuery.queryable(
    "SELECT * FROM t_topic WHERE id != ? ", 
    Topic.class, 
    Arrays.asList("123")
);

List<Draft2<String, String>> list = easyEntityQuery.queryable(BlogEntity.class)
    .leftJoin(joinTable, (b, t2) -> b.id().eq(t2.id()))
    .where((b1, t2) -> {
        b1.createTime().gt(LocalDateTime.now());
        t2.createTime().format("yyyy").eq("2014");
    })
    .select((b1, t2) -> Select.DRAFT.of(
        b1.id(),
        t2.id()
    ))
    .toList();

// SQL generated:
// SELECT t.`id` AS `value1`, t2.`id` AS `value2` 
// FROM `t_blog` t 
// LEFT JOIN (SELECT * FROM (SELECT * FROM t_topic WHERE id != ? ) t1) t2 
//   ON t.`id` = t2.`id` 
// WHERE t.`deleted` = ? 
//   AND t.`create_time` > ? 
//   AND DATE_FORMAT(t2.`create_time`,'%Y') = ?
// Parameters: 123(String), false(Boolean), 2024-07-16T12:12:35.343(LocalDateTime), 2014(String)
```

## sqlNativeSegment (Property Mode)

For `EasyQueryClient`, no complex encapsulation needed.

### Parameter Methods

| Method | Parameter Description | Description |
|--------|----------------------|-------------|
| expression | Object property, or property from other tables, or query expression | Automatically handles table aliases even in joins. If it's a query expression, supports subquery-like functionality |
| value | Parameter value | Added as a parameter "?" to the SQL fragment |
| ~~constValue~~ (deprecated) | Constant value | Concatenated as a string |
| format | Constant value | Concatenated as a string |
| setAlias | Alias | Sets column alias, mainly used for queries |

### Example: Window Functions (PostgreSQL Syntax)

Get book price rankings:
- Rank among all books
- Rank within the book's store

::: warning Note
If `sqlNativeSegment` contains parameters, the framework will replace single quotes with double quotes by default.
:::

```java
@Table("t_book_test")
@Data
public class H2BookTest {
    @Column(primaryKey = true)
    private String id;
    private String name;
    private String edition;
    private String price;
    private String storeId;
}

// Query with window functions
String sql = easyQuery.queryable(H2BookTest.class)
    .select(o -> o.columnAll()
        .sqlNativeSegment(
            "rank() over(order by {0} desc) as rank1", 
            it -> it.expression(H2BookTest::getPrice)
        )
        .sqlNativeSegment(
            "rank() over(partition by {0} order by {1} desc) as rank2", 
            it -> it
                .expression(H2BookTest::getStoreId)
                .expression(H2BookTest::getPrice)
        )
    )
    .toSQL();

// SQL generated:
// SELECT id, name, edition, price, store_id,
//     rank() over(order by price desc) as rank1,
//     rank() over(partition by store_id order by price desc) as rank2 
// FROM t_book_test

// With custom alias
String sql = easyQuery.queryable(H2BookTest.class)
    .asAlias("x")
    .select(o -> o.columnAll()
        .sqlNativeSegment(
            "rank() over(order by {0} desc) as rank1", 
            it -> it.expression(H2BookTest::getPrice)
        )
        .sqlNativeSegment(
            "rank() over(partition by {0} order by {1} desc) as rank2", 
            it -> it
                .expression(H2BookTest::getStoreId)
                .expression(H2BookTest::getPrice)
        )
    )
    .toSQL();

// SQL generated:
// SELECT x.id, x.name, x.edition, x.price, x.store_id,
//     rank() over(order by x.price desc) as rank1,
//     rank() over(partition by x.store_id order by x.price desc) as rank2 
// FROM t_book_test x
```

### Combining Multiple SQL Segments

```java
String sql = easyQuery.queryable(H2BookTest.class)
    .asAlias("x")
    .select(o -> o.columnAll()
        .sqlNativeSegment(
            "rank() over(order by {0} desc) as rank1,rank() over(partition by {1} order by {2} desc) as rank2",
            it -> it
                .expression(H2BookTest::getPrice)
                .expression(H2BookTest::getStoreId)
                .expression(H2BookTest::getPrice)
        )
    )
    .toSQL();

// SQL generated:
// SELECT x.id, x.name, x.edition, x.price, x.store_id,
//     rank() over(order by x.price desc) as rank1,
//     rank() over(partition by x.store_id order by x.price desc) as rank2 
// FROM t_book_test x
```

### Using in WHERE Clause

```java
String sql = easyQuery.queryable(H2BookTest.class)
    .where(o -> o.sqlNativeSegment(
        "regexp_like({0},{1})", 
        it -> it
            .expression(H2BookTest::getPrice)
            .value("^Ste(v|ph)en$")
    ))
    .select(o -> o.columnAll())
    .toSQL();

// SQL generated:
// SELECT id, name, edition, price, store_id 
// FROM t_book_test 
// WHERE regexp_like(price, ?)
```

### Multi-Table JOIN with Native SQL

```java
// Version 1.4.31+ supports parameter reuse: {1} can appear multiple times
String sql = easyQuery.queryable(H2BookTest.class)
    .leftJoin(DefTable.class, (t, t1) -> t.eq(t1, H2BookTest::getPrice, DefTable::getMobile))
    .where((o, o1) -> o.sqlNativeSegment(
        "regexp_like({0},{1}) AND regexp_like({2},{1})", 
        it -> it
            .expression(H2BookTest::getPrice)  // Single param uses default table (o)
            .value("^Ste(v|ph)en$")
            .expression(o1, DefTable::getAvatar)  // Use second table's avatar
    ))
    .select(o -> o.columnAll())
    .toSQL();

// SQL generated:
// SELECT t.id, t.name, t.edition, t.price, t.store_id 
// FROM t_book_test t 
// LEFT JOIN t_def_table t1 ON t.price = t1.mobile 
// WHERE regexp_like(t.price,?) AND regexp_like(t1.avatar,?)
```

## Important Notes

### MessageFormat Usage

The framework uses `MessageFormat` for parameter formatting. Large numbers passed to `format` should be converted to string first:

```java
// ✅ Method 1: Use double single quotes
.sqlNativeSegment("DATE_FORMAT({0}, ''%Y-%m-%d'')", c -> {
    c.expression(User::getCreateTime);
})

// ✅ Method 2: Use format parameter
.sqlNativeSegment("DATE_FORMAT({0}, {1})", c -> {
    c.expression(User::getCreateTime).format("'%Y-%m-%d'");
})

// ✅ Method 3: No variables, single quotes OK
.sqlNativeSegment("DATE_FORMAT({0}, '%Y-%m-%d')", c -> {
    c.expression(User::getCreateTime);
})

// ✅ Method 4: No variables at all
.sqlNativeSegment("DATE_FORMAT(`create_time`, '%Y-%m-%d')")
```

## Related Keywords

`native sql` `custom sql` `sql fragment` `native sql fragment` `raw sql` `database function` `window function`

## See Also

- [Query Operations](./select/README.md)
- [Case When](./select/case-when.md)
- [Subqueries](../sub-query/README.md)

---

If you encounter problems, feel free to join our QQ group: **170029046**

