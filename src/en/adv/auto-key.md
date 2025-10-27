---
title: Custom Primary Key
order: 20
---

`easy-query` provides the `PrimaryKeyGenerator` interface that users can implement themselves. The specific function is to automatically assign values to the primary key of the current object. For example, you can implement a UUID or snowflake ID `2.0.43^`


## PrimaryKeyGenerator

Custom primary keys currently support using PrimaryKeyGenerator or [Interceptor](/easy-query-doc/practice/configuration/entity)

Method  | Parameters | Description  
--- | --- | --- 
getPrimaryKey | None | Used to return a primary key
setPrimaryKey | Object, key's columnMetadata | Used to set the primary key for the object (a general method is already implemented by default)

The execution order is after calling `executeRows` in the `insert` method, the object's `PrimaryKeyGenerator.setPrimaryKey` will be executed first, then the interceptor will be executed. So if you don't need it, you can reset or clear it in the interceptor




## How to Use
- The current object must be a database object `@Table`
- The current property must be a primary key `@Column(primaryKey=true)`
- The current property cannot be a generated column `@Column(generateKey=true)`, cannot have `generateKey=true`
- Add `@Column(primaryKey=true,primaryKeyGenerator=UUIDPrimaryKeyGenerator.class)` to the current property
- If there are multiple primary keys, the usage is the same


## spring-boot
```java
Use `@Component` to inject the corresponding `PrimaryKeyGenerator`
```

## Console
```java
        QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
        QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
        configuration.applyPrimaryKeyGenerator(new MyTestPrimaryKeyGenerator());
```

## UUIDPrimaryKeyGenerator
How to implement a UUID primary key generator
```java
@Component //If you are using spring-boot
public class UUIDPrimaryKeyGenerator implements PrimaryKeyGenerator {
    @Override
    public Serializable getPrimaryKey() {
        return UUID.randomUUID().toString().replaceAll("-","");
    }
//    /**
//     * If you need to check if there is a previous value
//     * @param entity
//     * @param columnMetadata
//     */
//    @Override
//    public void setPrimaryKey(Object entity, ColumnMetadata columnMetadata) {
//        Object oldValue = columnMetadata.getGetterCaller().apply(entity);
//        if(oldValue == null)
//        {
//           PrimaryKeyGenerator.super.setPrimaryKey(entity,columnMetadata);
//        }
//    }
}

@Data
@Table("t_test")
public class UUIDPrimaryKey {
    @Column(primaryKey = true,primaryKeyGenerator = UUIDPrimaryKeyGenerator.class)
    private String id;
}

```

## Snowflake ID

```java
//Initialize
Snowflake snowflake = IdUtil.createSnowflake(workerId,dataCenterId)

@Component //If you are using spring-boot
public class SnowflakePrimaryKeyGenerator implements PrimaryKeyGenerator {
    @Override
    public Serializable getPrimaryKey() {
        return String.valueOf(snowflake.nextId());//Because long type will lose precision in js
    }
//    /**
//     * If you need to check if there is a previous value
//     * @param entity
//     * @param columnMetadata
//     */
//    @Override
//    public void setPrimaryKey(Object entity, ColumnMetadata columnMetadata) {
//        Object oldValue = columnMetadata.getGetterCaller().apply(entity);
//        if(oldValue == null)
//        {
//           PrimaryKeyGenerator.super.setPrimaryKey(entity,columnMetadata);
//        }
//    }
}

@Data
@Table("t_test")
public class SnowflakePrimaryKey {
    @Column(primaryKey = true,primaryKeyGenerator = SnowflakePrimaryKeyGenerator.class)
    private String id;
}

```

## Related Search
`Custom Primary Key` `Snowflake ID` `Custom ID`

