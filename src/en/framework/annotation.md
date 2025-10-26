---
title: Annotation Description
order: 30
---

# Annotation Description

## Table
Describes database table name corresponding to object. VO objects don't need it, non-database objects don't need it.

Property  | Default | Description  
--- | --- | --- 
value | "" | Database table name. Empty means nameConversion.convert(class.getSimpleName). Can be modified at runtime.
schema | "" | Database schema. Can be modified at runtime. Default is jdbc connection string's database.
ignoreProperties | {} | Properties to ignore. Generally used when inheriting parent class and need to ignore parent class properties.
shardingInitializer | UnShardingInitializer.class | Sharding initializer. Only when object is sharding object, used to initialize sharding object. Can also not add and manually add later.
oldName | "" | Old table name for code-first table name migration.
comment | "" | Comment information when auto-generating table.
keyword | true | Whether to add keyword handling to table name like mysql's `` or pgsql's "" or sqlserver's []. False scenario: duckdb reading excel for query.

```java

@Data
@Table("t_topic")
public class Topic {
    //.....
}
```

## Column
Describes column name corresponding to property.

Property  | Default | Description  
--- | --- | --- 
value | "" | Column name in database table. Default empty is nameConversion.convert(propertyName).
primaryKey | false | Whether it's primary key. If true, update object and delete object will use this field as id.
generatedKey | false | Whether it's auto-increment column. If true, after `insertable().executeRows(true)`, auto-increment id will be filled in.
conversion | DefaultValueConverter.class | In-memory computed property, value converter. Default means no conversion. Can customize enum or json, etc.
sqlConversion | DefaultColumnValueSQLConverter.class | DB computed property, value converter. Default means no conversion. Can customize composite column like `fullName=Concat(firstName,lastName)`. If VO/DTO also has this property, no need to mark this property.
generatedSQLColumnGenerator | DefaultGeneratedKeySQLColumnGenerator.class | Column generator used when inserting into database, like database function `NEWID()` or other custom functions.
complexPropType | DefaultComplexPropType.class | Complex type for JSON deserialization handling.
autoSelect | true | Whether current column needs auto query. Mainly for whether to return current column when directly toList. False commonly used for database computed properties or large field columns.
typeHandler | UnKnownTypeHandler.class | What TypeHandler to use for current column. Unknown type special handling.
primaryKeyGenerator | UnsupportPrimaryKeyGenerator.class | Primary key generator for generating primary key value when object primary key is null during insert.
exist | true | Whether current field exists in database. False means not queried by default, also not inserted or updated.
nullable | true | Whether database column mapped by current field is nullable. Commonly used in code-first to generate database DDL.
dbType | "" | Specifies database column type mapped by current field.
dbDefault | "" | Default insert value for database column mapped by current field.
exist | true | Whether current field exists in database. False means not queried, inserted, or updated by default.
comment | "" | Description of database column mapped by current field.
length | -1 | Length of database column mapped by current field.
scale | 0 | Precision of database column mapped by current field.
sqlExpression | ColumnSQLExpression | Simple database computed property.
jdbcType | JDBCType.OTHER | Maps current field to actual jdbc type in database. Used for pgsql uuid and mysql uuid with current field type.

```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column("title1")
    private String title;
    private LocalDateTime createTime;
}
```

## ColumnIgnore
Properties with this annotation will be directly ignored from mapping to database.

## InsertIgnore
Properties with this annotation will not be assigned during insert.

## UpdateIgnore
Properties with this annotation will not be updated during update unless manually specified, like `create time`, `creator`, `logical delete field`, `large column`. If current field is marked `update ignore`, then if it's non-track update, it will be directly ignored. If property `updateSetInTrackDiff = true`, then in track update it's still valid.

Property  | Default | Description  
--- | --- | --- 
updateSetInTrackDiff |false | Whether to include in update set in tracking query.

::: warning Note!!!
> `large column` adds `UpdateIgnore` to ensure large field is not updated to null after being queried if entity full field update is performed (default update strategy is full field). So update ignore is used here. If needed, can use expression ignore [Of course you can also choose update strategy as non-null update].
:::

```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column(large=true)
    @UpdateIgnore //Large field doesn't need update to prevent full field update from changing original field to null
    private String title;
    @UpdateIgnore //Create time field doesn't need update
    private LocalDateTime createTime;
    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    @UpdateIgnore //Logical delete field doesn't need update
    private Boolean deleted;
}
```

## LogicDelete
Logical deletion. Indicates current field corresponds to database as logical deletion representation. Select will filter, update will also filter, delete data will be rewritten as update.

Property  | Default | Description  
--- | --- | --- 
value | BOOLEAN | Logical deletion strategy. Default true means deleted, false means not deleted.
strategyName | "" | When logical deletion is custom logical deletion.

- BOOLEAN: false means not deleted
- DELETE_LONG_TIMESTAMP: 0 means not deleted
- LOCAL_DATE_TIME: null means not deleted
- LOCAL_DATE: null means not deleted
- CUSTOM: User-defined

```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column(large=true)
    @UpdateIgnore //Large field doesn't need update to prevent full field update from changing original field to null
    private String title;
    @UpdateIgnore //Create time field doesn't need update
    private LocalDateTime createTime;
    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    @UpdateIgnore //Logical delete field doesn't need update
    private Boolean deleted;
}
```

## Version
Optimistic lock, also known as version number.

Property  | Default | Description  
--- | --- | --- 
value | - | Define your own version number strategy.

### Default Optimistic Lock Version Number Strategies
- VersionIntStrategy
- VersionLongStrategy
- VersionTimestampStrategy (not recommended)
- VersionUUIDStrategy

#### VersionIntStrategy
//Here uses Version=2, can also use version+1 but actually the same because where clause restricts version=1
```sql
update table set version=2 where id=xxx and version=1
```
#### VersionLongStrategy
//Here uses Version=2, can also use version+1 but actually the same because where clause restricts version=1
```sql
update table set version=2 where id=xxx and version=1
```

#### VersionUUIDStrategy
```sql
update table set version=xxxxxxasd where id=xxx and version=xxxxasdasd
```

## Encryption
Column encryption. Supports custom data encryption storage, and supports like search at database level with very high performance. Not using database encryption/decryption functions.

### EncryptionStrategy
Used to handle how to encrypt and decrypt data strategy. Can customize implementation.

Default implementation has an aes+base64 `AbstractAesBase64EncryptionStrategy` abstract class. Users need to return 16-bit vector and key.

### supportQueryLike
Used to indicate whether like search is needed. If true, input parameters will be segmented for encryption.

## Navigate
Navigation property. Used on database objects and return results to handle one-to-one, one-to-many, many-to-one, many-to-many.

## ShardingDataSourceKey
Used to identify which is current object's database sharding key.

## ShardingExtraDataSourceKey
Used to identify which is current object's database sharding extra key.

## ShardingTableKey
Used to identify which is current object's database table sharding key.

## ShardingExtraTableKey
Used to identify which is current object's database table sharding extra key.

## EasyWhereCondition
Default dynamic condition object query condition. Can replace with custom annotation for dynamic conditions.

## EasyQueryTrack
Default tracking context annotation. Can also customize. Used above methods.

## EntityProxy
Generate proxy object. Added to entity and DTO to auto-generate apt proxy class. Generated files are in target directory. Need to rebuild after clean.

## EntityFileProxy
Same as `EntityProxy` but generated files are in source code.

## ProxyProperty
Used to prevent generated apt properties from duplicating with system built-in. Can define alias on property.

