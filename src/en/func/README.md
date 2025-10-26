---
title: Built-in Functions
---
`eq` has a large number of built-in function tools to facilitate users only needing to remember one complete API to adapt to all databases, including string-related, number-related, time-related, Math expression mathematical functions, etc.

`eq` follows the database and divides properties into the following major types:
- `String` corresponds to Java `String` type
- `Number` corresponds to Java `Long`, `Integer`, `BigDecimal`...
- `DateTime` corresponds to Java `LocalDateTime`, `LocalDate`, `Date`...
- `Boolean` corresponds to Java `Boolean`
- `Any` corresponds to Java `List` or other unknown types
- `JsonMap` (not implemented)
- `JsonArray` (not implemented)

Different systems have different functions and compile-time type acceptance. For example, `String` comparisons can only be `String`. Each system has its own functions. Of course, you can also use functions like `toStr`, `toNumber` to convert to corresponding functions, or use `asAny` to convert to any type and then use any function. The difference is that `toxxxx` is a database-level function, while `asAny()` or `asAnyType(Long.class)` is a compile-time behavior to trick the compiler.

Aggregate function filtering, such as `o.column().aggregateFunction().filter()`
- avg
- sum
- max
- min
- count
- joining

Functions support chaining between each other and support circular nesting

If there are unknown functions that eq has not implemented, users can implement them themselves through `NativeSQL` [native sql fragments or search the documentation for `static function sql fragment encapsulation`](/easy-query-doc/en/ability/native-sql.html#静态函数sql片段封装)
