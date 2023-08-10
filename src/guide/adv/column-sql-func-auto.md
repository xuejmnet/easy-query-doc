---
title: 数据库函数列值转换
---

`easy-query`提供了数据库函数列值转换,可以完美的实现java对象和数据库列的函数互相交换,比如数据库函数`加密、解密`、`base64 编码、解码`等数据库函数对

## mysql加密解密
[《数据库列加密》](/easy-query-doc/guide/adv/column-encryption) 上一篇文章我们讲解了如何使用java代码来实现数据库列的加密解密,接下来我将使用数据库函数来实现


AES_DECRYPT(from_base64(`receiver_mobile`)


方法  | 默认值 
--- | --- 
to_base64(AES_ENCRYPT('手机号值'),'秘钥') | 将数据进行aes加密,然后进行base64编码
AES_DECRYPT(from_base64('手机号列'),'秘钥') | 将数据进行base64解码,然后进行aes进行解密

## ColumnValueSQLConverter



::: tip 说明!!!
> 支持join和下多表的自动识别表别名而无需自行处理别名
:::


方法  | 作用域 | 说明
--- | ---  | ---
columnConverter | 仅作用到select投影上面 | 用于做数据库列到java对象字段的函数处理比如 [AES_DECRYPT(from_base64(`phone`),'秘钥')]
valueConverter | 仅作用到insert,update set值,where条件值 | 用于做java对象字段到数据库列的函数处理比如 [AES_DECRYPT(from_base64('手机号列'),'秘钥')]

```java

public interface ColumnValueSQLConverter {


    /**
     * select查询
     * @param table
     * @param columnMetadata
     * @param sqlPropertyConverter
     */
    void columnConverter(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext);

    /**
     * insert update entity
     * udpate set
     * where
     * @param table
     * @param columnMetadata
     * @param sqlParameter
     * @param sqlPropertyConverter
     */
    void valueConverter(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext);
}

```

### 案例
```java

//@Component 如果是springboot的话
public class MySQLAesEncryptColumnValueSQLConverter implements ColumnValueSQLConverter {
    /**
     * 数据加密秘钥
     */
    private static final String SECRET="1234567890123456";
    @Override
    public void columnConverter(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
//        Dialect dialect = runtimeContext.getQueryConfiguration().getDialect();
        sqlPropertyConverter.sqlNativeSegment("AES_DECRYPT(from_base64({0}),{1})",context->{
           context
                   .expression(columnMetadata.getPropertyName())//采用变量是因为可能出现join附带别名所以需要变量
                   .value(SECRET)
                   .setAlias(columnMetadata.getName());
                   //.constValue(dialect.getQuoteName(columnMetadata.getName()));//如果这边也是用变量就会导致join下不是别名而是带具体表的列比如:t.`phone`
        });
    }

    @Override
    public void valueConverter(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        sqlPropertyConverter.sqlNativeSegment("to_base64(AES_ENCRYPT({0},{1}))",context->{
            context.value(sqlParameter).value(SECRET);
        });
    }
}

//非springboot或者多数据源之类的可以通过获取对应的QueryConfiguration进行添加
//QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
//QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
//configuration.applyColumnValueSQLConverter(new MySQLAesEncryptColumnValueSQLConverter());



//java对象
@Data
@Table("t_sys_user_sql_encryption")
@ToString
public class SysUserSQLEncryption {
    @Column(primaryKey = true)
    private String id;
    private String username;
    @Column(sqlConversion = MySQLAesEncryptColumnValueSQLConverter.class)//添加这个列为加密列
    private String phone;
    private String idCard;
    private String address;
    private LocalDateTime createTime;
}

```

## 新增数据
```java
SysUserSQLEncryption user = new SysUserSQLEncryption();
user.setId("12345");
user.setUsername("username");
user.setPhone("13232456789");
user.setIdCard("12345678");
user.setAddress("xxxxxxx");
user.setCreateTime(LocalDateTime.now());
long l = easyQuery.insertable(user).executeRows();

//插入语句采用手机号加密

==> Preparing: INSERT INTO `t_sys_user_sql_encryption` (`id`,`username`,`phone`,`id_card`,`address`,`create_time`) VALUES (?,?,to_base64(AES_ENCRYPT(?,?)),?,?,?)
==> Parameters: 12345(String),username(String),13232456789(String),1234567890123456(String),12345678(String),xxxxxxx(String),2023-08-10T14:09:32.109(LocalDateTime)
<== Total: 1
```

## 查询数据
单表
```java
SysUserSQLEncryption sysUserSQLEncryption = easyQuery.queryable(SysUserSQLEncryption.class)
        .whereById("12345")
        .firstOrNull();

//查询语句采用手机号列解密

==> Preparing: SELECT `id`,`username`,AES_DECRYPT(from_base64(`phone`),?) AS `phone`,`id_card`,`address`,`create_time` FROM `t_sys_user_sql_encryption` WHERE `id` = ? LIMIT 1
==> Parameters: 1234567890123456(String),12345(String)
<== Time Elapsed: 4(ms)
<== Total: 1

SysUserSQLEncryption(id=12345, username=username, phone=13232456789, idCard=12345678, address=xxxxxxx, createTime=2023-08-10T14:10:33)


```

## 更新数据
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

## 按列更新
```java
 long l1 = easyQuery.updatable(SysUserSQLEncryption.class)
                .set(SysUserSQLEncryption::getPhone, "1111234")
                .whereById("12345").executeRows();


==> Preparing: UPDATE `t_sys_user_sql_encryption` SET `phone` = to_base64(AES_ENCRYPT(?,?)) WHERE `id` = ?
==> Parameters: 1111234(String),1234567890123456(String),12345(String)
<== Total: 1
```


多表join查询
```java
SysUserSQLEncryption sysUserSQLEncryption1 = easyQuery.queryable(SysUserSQLEncryption.class)
                .leftJoin(Topic.class, (t, t1) -> t.eq(t1, SysUserSQLEncryption::getId, Topic::getId))
                .where((t, t1) -> t.eq(SysUserSQLEncryption::getPhone, "1111234"))
                .select(SysUserSQLEncryption.class, (t, t1) -> t.columnAll())
                .firstOrNull();

//注意这边列会自动带上具体的表名而不是简单的拼接所以在join条件下也无需关心别名
==> Preparing: SELECT t.`id`,t.`username`,AES_DECRYPT(from_base64(t.`phone`),?) AS `phone`,t.`id_card`,t.`address`,t.`create_time` FROM `t_sys_user_sql_encryption` t LEFT JOIN `t_topic` t1 ON t.`id` = t1.`id` WHERE t.`phone` = to_base64(AES_ENCRYPT(?,?)) LIMIT 1
==> Parameters: 1234567890123456(String),1111234(String),1234567890123456(String)
<== Time Elapsed: 3(ms)
<== Total: 1
```


::: warning 说明!!!
> 如果采用加密对进行处理那么默认是不支持like函数的,因为为了高性能默认easy-query采用的是对表达式条件值进行加密匹配而不是数据库列解密匹配,如果需要支持解密可以采用上一篇文章的加密方式,可以实现高性能的加密列like
:::