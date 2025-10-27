---
title: Annotation Description
order: 30
---

# Annotation Description

## Table
Describes the database table name corresponding to the object. Not needed for VO objects or non-database objects.

Attribute  | Default Value | Description  
--- | --- | --- 
value | "" | Database table name. Empty means nameConversion.convert(class.getSimpleName), can be modified at runtime
schema | "" | Database schema, can be modified at runtime. Defaults to the database in the JDBC connection string
ignoreProperties | {} | Properties to ignore. Generally used for ignoring parent class properties when inheriting
shardingInitializer | UnShardingInitializer.class | Sharding initializer. Used only when the object is a sharded object to initialize the sharded object. Can also be manually added later
oldName | "" | Old table name used for table name migration in code-first
comment | "" | Comment information when automatically generating tables
keyword | true | Whether to add keyword handling to table names, such as MySQL's ``, PostgreSQL's "", or SQL Server's []. false scenario: duckdb reading Excel for queries

```java

@Data
@Table("t_topic")
public class Topic {
    //.....
}
```

## Column
Describes the column name corresponding to the property

Attribute  | Default Value | Description  
--- | --- | --- 
value | "" | Column name in the database table. Default empty means nameConversion.convert(property name)
primaryKey | false | Indicates whether it's a primary key. If yes, will use this field as id in update object / delete object
generatedKey | false | Whether it's an auto-increment column. If true, after `insertable().executeRows(true)`, the retrieved auto-increment id will be populated
conversion | DefaultValueConverter.class | In-memory computed property, value converter. Default means no conversion. Can customize for enums or JSON
sqlConversion | DefaultColumnValueSQLConverter.class | DB computed property, value converter. Default means no conversion. Can customize composite columns like `fullName=Concat(firstName,lastName)`. If vo/dto also has this property, no need to annotate it
generatedSQLColumnGenerator | DefaultGeneratedKeySQLColumnGenerator.class | Column generator used when inserting into database, such as database function `NEWID()` or other custom functions
complexPropType | DefaultComplexPropType.class | Complex type used for JSON deserialization handling
autoSelect | true | Whether the current column needs automatic querying. Mainly for whether to return the current column when directly toList. false commonly used for database computed properties or large field columns
typeHandler | UnKnownTypeHandler.class | What TypeHandler the current column uses, special handling for unknown types
primaryKeyGenerator | UnsupportPrimaryKeyGenerator.class | Primary key generator used to directly generate primary key value when object primary key is null during insertion
exist | true | Indicates whether the current field exists in the database. false means not queried by default and not inserted/updated
nullable | true | Indicates whether the database column mapped to the current field can be null. Commonly used for code-first generation of database DDL
dbType | "" | Indicates the specified type of the database column mapped to the current field
dbDefault | "" | Indicates the default insert value for the database column mapped to the current field
comment | "" | Indicates the description of the database column mapped to the current field
length | -1 | Indicates the length of the database column mapped to the current field
scale | 0 | Indicates the precision of the database column mapped to the current field
sqlExpression | ColumnSQLExpression | Indicates simple database computed properties
jdbcType | JDBCType.OTHER | Maps the current field to the actual JDBC type in the database. PostgreSQL's uuid and MySQL's uuid will use this field type


<!-- valueUpdateAtomicTrack | DefaultValueUpdateAtomicTrack.class | Atomic update, default means no atomic update -->


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
Properties with this annotation will be directly ignored in database mapping

## InsertIgnore
Properties with this annotation will not be assigned during insertion

## UpdateIgnore
Properties with this annotation will not be updated during updates unless manually specified, such as `creation time`, `creator`, `logical deletion field`, `large column`. If the current field is marked `update ignore`, it will be directly ignored in non-track updates. If the property `updateSetInTrackDiff = true`, it's still effective in track updates


Attribute  | Default Value | Description  
--- | --- | --- 
updateSetInTrackDiff |false | Whether to include in update set in tracking queries

::: warning Note!!!
> Adding `UpdateIgnore` to `large column` is to ensure that when large fields are queried and then entity all-field update is performed, since `title` was not queried, the null will be updated during update (default update strategy is all fields). So update ignore is adopted here. If needed, you can use expression ignore [Of course you can also choose to update strategy as non-null update]
:::

```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column(large=true)
    @UpdateIgnore //Large field doesn't need update, prevents all-field update from changing original field to null
    private String title;
    @UpdateIgnore //Creation time field doesn't need update
    private LocalDateTime createTime;
    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    @UpdateIgnore //Logical deletion field doesn't need update
    private Boolean deleted;
}
```

## LogicDelete
Logical deletion. Indicates that the current field corresponds to logical deletion representation in the database. SELECT will filter, UPDATE will also filter, DELETE data will be rewritten as UPDATE


Attribute  | Default Value | Description  
--- | --- | --- 
value | BOOLEAN | Logical deletion strategy. Default true means deleted, false means not deleted
strategyName | "" | When logical deletion is custom logical deletion

- BOOLEAN false means not deleted
- DELETE_LONG_TIMESTAMP 0 means not deleted
- LOCAL_DATE_TIME null means not deleted
- LOCAL_DATE null means not deleted
- CUSTOM user-defined


```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column(large=true)
    @UpdateIgnore //Large field doesn't need update, prevents all-field update from changing original field to null
    private String title;
    @UpdateIgnore //Creation time field doesn't need update
    private LocalDateTime createTime;
    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    @UpdateIgnore //Logical deletion field doesn't need update
    private Boolean deleted;
}
```
## Version
Optimistic lock, also known as version number


Attribute  | Default Value | Description  
--- | --- | --- 
value | - | Define your own version number strategy

### Default Optimistic Lock Version Number Strategies
- VersionIntStrategy
- VersionLongStrategy
- VersionTimestampStrategy (not recommended)
- VersionUUIDStrategy

#### VersionIntStrategy
//Here uses Version=2, can also use version+1 but actually it's the same because where clause limits version=1
```sql
update table set version=2 where id=xxx and version=1
```
#### VersionLongStrategy
//Here uses Version=2, can also use version+1 but actually it's the same because where clause limits version=1
```sql
update table set version=2 where id=xxx and version=1
```

#### VersionUUIDStrategy
```sql
update table set version=xxxxxxasd where id=xxx and version=xxxxasdasd
```


## Encryption
Column encryption. Supports custom data encryption storage and supports like search handling at the database layer with very high performance. Does not use database encryption/decryption functions

### EncryptionStrategy
Used to handle how to encrypt and decrypt data strategies. Can be customized

Default implementation has an AES+Base64 `AbstractAesBase64EncryptionStrategy` abstract class. Users need to return a 16-bit vector and key

### supportQueryLike
Used to indicate whether like search is needed. If true, it will segment encrypt the input parameters

## Navigate
Navigation property. Used on database objects and return results for handling one-to-one, one-to-many, many-to-one, many-to-many

## ShardingDataSourceKey
Used to identify which is the database sharding key for the current object

## ShardingExtraDataSourceKey
Used to identify which is the additional database sharding key for the current object

## ShardingTableKey
Used to identify which is the table sharding key for the current object

## ShardingExtraTableKey
Used to identify which is the additional table sharding key for the current object

## EasyWhereCondition
Default dynamic condition object query condition. Can replace with custom annotation to implement dynamic conditions

## EasyQueryTrack
Default tracking context annotation, can also be customized. Used on methods

## EntityProxy
Generate proxy object. Added to entities and DTOs to automatically generate APT proxy classes. Generated files exist in the target directory. Need to rebuild after clean

## EntityFileProxy
Same as `EntityProxy` but generated files exist in source code

## ProxyProperty
Used to prevent generated APT properties from duplicating with system built-in ones. Can define aliases on properties
