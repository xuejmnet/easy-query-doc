---
title: Enhanced Properties
order: 6
category:
  - sql
---

`easy-query` provides database function column value conversion, which can perfectly achieve mutual exchange of functions between java objects and database columns, such as database functions `encryption, decryption`, `base64 encoding, decoding` and other database function pairs

## MySQL Encryption and Decryption
[《Database Column Encryption》](/easy-query-doc/en/adv/column-encryption) In this article, we explained how to use java code to implement encryption and decryption of database columns. Next, I will use database functions to implement it


AES_DECRYPT(from_base64(`receiver_mobile`)


Method  | Default Value 
--- | --- 
to_base64(AES_ENCRYPT('phone number value'),'key') | AES encrypt the data, then base64 encode
AES_DECRYPT(from_base64('phone number column'),'key') | Base64 decode the data, then AES decrypt

## ColumnValueSQLConverter



::: tip Notice!!!
> Supports automatic recognition of table aliases for join and multi-table scenarios without needing to handle aliases yourself
:::


Method  | Scope | Description
--- | ---  | ---
isRealColumn | Initialize to determine if it is a column that exists in the database | If it is a real column, the current property can be used in the current expression, otherwise it cannot
isMergeSubQuery | Initialize to determine if there is interaction with other data tables | Affects whether the generated sql will have aliases
selectColumnConvert | Only applies to select projection | Used for function processing from database column to java object field, such as [AES_DECRYPT(from_base64(`phone`),'key')]
propertyColumnConvert | How to use the current column as a segment | How to use as a segment when not a select query, default is to use the current column
valueConvert | Only applies to insert, update set value, where condition value | Used for function processing from java object field to database column, such as [AES_DECRYPT(from_base64('phone number column'),'key')]

```java

public interface ColumnValueSQLConverter {
    boolean isRealColumn();

    /**
     * Whether it is a merge subquery
     * @return
     */
    boolean isMergeSubQuery();


    /**
     * select query
     *
     * @param table
     * @param columnMetadata
     * @param sqlPropertyConverter
     */
    void selectColumnConvert(@NotNull TableAvailable table, @NotNull ColumnMetadata columnMetadata, @NotNull SQLPropertyConverter sqlPropertyConverter, @NotNull QueryRuntimeContext runtimeContext);

    default void propertyColumnConvert(@NotNull TableAvailable table, @NotNull ColumnMetadata columnMetadata, @NotNull SQLPropertyConverter sqlPropertyConverter, @NotNull QueryRuntimeContext runtimeContext){
        sqlPropertyConverter.sqlNativeSegment("{0}",c->c.expression(new SimpleSQLTableOwner(table),columnMetadata.getPropertyName()));
    }

    /**
     * insert update entity
     * update set
     * where
     *
     * @param table
     * @param columnMetadata
     * @param sqlParameter
     * @param sqlPropertyConverter
     * @param isCompareValue Whether the current value is used for comparison or storage
     */
    void valueConvert(@NotNull TableAvailable table, @NotNull ColumnMetadata columnMetadata, @NotNull SQLParameter sqlParameter, @NotNull SQLPropertyConverter sqlPropertyConverter, @NotNull QueryRuntimeContext runtimeContext, boolean isCompareValue);
}

```

### Example
```java

//@Component if it's springboot

public class MySQLAesEncryptColumnValueSQLConverter implements ColumnValueSQLConverter {
    @Override
    public boolean isRealColumn() {
        return true;
    }

    @Override
    public boolean isMergeSubQuery() {
        return false;
    }
    /**
     * Data encryption key
     */
    private static final String SECRET="1234567890123456";
    @Override
    public void selectColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
//        Dialect dialect = runtimeContext.getQueryConfiguration().getDialect();
            sqlPropertyConverter.sqlNativeSegment("AES_DECRYPT(from_base64({0}),{1})",context->{
                context
                        .expression(columnMetadata.getPropertyName())//Use variable because it may have alias when join occurs, so variable is needed
                        .value(SECRET)
                        .setAlias(columnMetadata.getName());
                //.constValue(dialect.getQuoteName(columnMetadata.getName()));//If also use variable here, it will lead to not being an alias in join but a column with a specific table like: t.`phone`
            });
    }

    @Override
    public void propertyColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        sqlPropertyConverter.sqlNativeSegment("{0}",c->c.expression(new SimpleSQLTableOwner(table),columnMetadata.getPropertyName()));
    }

    @Override
    public void valueConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext,boolean isCompareValue) {
        sqlPropertyConverter.sqlNativeSegment("to_base64(AES_ENCRYPT({0},{1}))",context->{
            context.value(sqlParameter).value(SECRET);
        });
    }
}


//Non-springboot or multi-datasource can be added by getting the corresponding QueryConfiguration
//QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
//QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
//configuration.applyColumnValueSQLConverter(new MySQLAesEncryptColumnValueSQLConverter());



//java object
@Data
@Table("t_sys_user_sql_encryption")
@ToString
public class SysUserSQLEncryption {
    @Column(primaryKey = true)
    private String id;
    private String username;
    @Column(sqlConversion = MySQLAesEncryptColumnValueSQLConverter.class)//Add this column as encrypted column
    private String phone;
    private String idCard;
    private String address;
    private LocalDateTime createTime;
}

```

## Insert Data
```java
SysUserSQLEncryption user = new SysUserSQLEncryption();
user.setId("12345");
user.setUsername("username");
user.setPhone("13232456789");
user.setIdCard("12345678");
user.setAddress("xxxxxxx");
user.setCreateTime(LocalDateTime.now());
long l = easyQuery.insertable(user).executeRows();

//Insert statement uses phone number encryption

==> Preparing: INSERT INTO `t_sys_user_sql_encryption` (`id`,`username`,`phone`,`id_card`,`address`,`create_time`) VALUES (?,?,to_base64(AES_ENCRYPT(?,?)),?,?,?)
==> Parameters: 12345(String),username(String),13232456789(String),1234567890123456(String),12345678(String),xxxxxxx(String),2023-08-10T14:09:32.109(LocalDateTime)
<== Total: 1
```

## Query Data
Single table
```java
SysUserSQLEncryption sysUserSQLEncryption = easyQuery.queryable(SysUserSQLEncryption.class)
        .whereById("12345")
        .firstOrNull();

//Query statement uses phone number column decryption

==> Preparing: SELECT `id`,`username`,AES_DECRYPT(from_base64(`phone`),?) AS `phone`,`id_card`,`address`,`create_time` FROM `t_sys_user_sql_encryption` WHERE `id` = ? LIMIT 1
==> Parameters: 1234567890123456(String),12345(String)
<== Time Elapsed: 4(ms)
<== Total: 1

SysUserSQLEncryption(id=12345, username=username, phone=13232456789, idCard=12345678, address=xxxxxxx, createTime=2023-08-10T14:10:33)


```

## Update Data
```java
SysUserSQLEncryption sysUserSQLEncryption = easyQuery.queryable(SysUserSQLEncryption.class)
        .whereById("12345")
        .firstOrNull();

sysUserSQLEncryption.setPhone("111123456");
long l2 = easyQuery.updatable(sysUserSQLEncryption).executeRows();

==> Preparing: UPDATE `t_sys_user_sql_encryption` SET `username` = ?,`phone` = to_base64(AES_ENCRYPT(?,?)),`id_card` = ?,`address` = ?,`create_time` = ? WHERE `id` = ?
==> Parameters: username(String),111123456(String),1234567890123456(String),12345678(String),xxxxxxx(String),2023-08-10T14:17:12(LocalDateTime),12345(String)
<== Total: 1


```

## Update By Column
```java
 long l1 = easyQuery.updatable(SysUserSQLEncryption.class)
                .set(SysUserSQLEncryption::getPhone, "1111234")
                .whereById("12345").executeRows();


==> Preparing: UPDATE `t_sys_user_sql_encryption` SET `phone` = to_base64(AES_ENCRYPT(?,?)) WHERE `id` = ?
==> Parameters: 1111234(String),1234567890123456(String),12345(String)
<== Total: 1
```


Multi-table join query
```java
SysUserSQLEncryption sysUserSQLEncryption1 = easyQuery.queryable(SysUserSQLEncryption.class)
                .leftJoin(Topic.class, (t, t1) -> t.eq(t1, SysUserSQLEncryption::getId, Topic::getId))
                .where((t, t1) -> t.eq(SysUserSQLEncryption::getPhone, "1111234"))
                .select(SysUserSQLEncryption.class, (t, t1) -> t.columnAll())
                .firstOrNull();

//Note that the column will automatically have the specific table name, not a simple concatenation, so there is no need to worry about aliases in join conditions
==> Preparing: SELECT t.`id`,t.`username`,AES_DECRYPT(from_base64(t.`phone`),?) AS `phone`,t.`id_card`,t.`address`,t.`create_time` FROM `t_sys_user_sql_encryption` t LEFT JOIN `t_topic` t1 ON t.`id` = t1.`id` WHERE t.`phone` = to_base64(AES_ENCRYPT(?,?)) LIMIT 1
==> Parameters: 1234567890123456(String),1111234(String),1234567890123456(String)
<== Time Elapsed: 3(ms)
<== Total: 1
```


::: warning Notice!!!
> If encryption is used for processing, the like function is not supported by default. Because for high performance, easy-query by default encrypts the expression condition value for matching rather than database column decryption matching. If decryption is needed, you can use the encryption method from the previous article, which can implement high-performance encrypted column like
:::




## Related Blog
- [《Database Column Encryption, Decryption and Desensitization》](https://www.cnblogs.com/xuejiaming/p/17619102.html)

