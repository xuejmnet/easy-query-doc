---
title: 数据库函数列
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
selectColumnConvert | 仅作用到select投影上面 | 用于做数据库列到java对象字段的函数处理比如 [AES_DECRYPT(from_base64(`phone`),'秘钥')]
propertyColumnConvert | 当前列被当做片段时如何使用 | 非select查询时被作为片段如何使用默认就是使用当前列
valueConvert | 仅作用到insert,update set值,where条件值 | 用于做java对象字段到数据库列的函数处理比如 [AES_DECRYPT(from_base64('手机号列'),'秘钥')]

```java
xuejiaming
 */
public interface ColumnValueSQLConverter {


    /**
     * select查询
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
     * @param isCompareValue 当前值是用于比较还是存储
     */
    void valueConvert(@NotNull TableAvailable table, @NotNull ColumnMetadata columnMetadata, @NotNull SQLParameter sqlParameter, @NotNull SQLPropertyConverter sqlPropertyConverter, @NotNull QueryRuntimeContext runtimeContext, boolean isCompareValue);
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
    public void selectColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
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

## 计算属性
通常我们会对用户的年龄使用一个字段来进行存储,但是大部分时候这个年龄属性应该是动态计算的而不是实时计算的,如果我们存储firstName和lastName那么用户的name字段也可以通过这种方式来实现计算


::: code-tabs
@tab 对象模式

```java

@Data
@Table("t_user_extra")
@EntityProxy
public class UserExtra implements ProxyEntityAvailable<UserExtra , UserExtraProxy> {
    @Column(primaryKey = true)
    private String id;
    private String firstName;
    private String lastName;
    private LocalDateTime birthday;
    @InsertIgnore
    @UpdateIgnore
    @Column(sqlConversion = FullNameColumnValueSQLConverter.class,realColumn = false)
    private String fullName;

    @InsertIgnore
    @UpdateIgnore
    @Column(sqlConversion = UserAgeColumnValueSQLConverter.class,realColumn = false)
    private Integer age;

    @Override
    public Class<UserExtraProxy> proxyTableClass() {
        return UserExtraProxy.class;
    }
}
```

@tab sql脚本
```sql

create table t_user_extra
(
    id varchar(32) not null comment '主键ID'primary key,
    first_name varchar(32)  null comment '姓',
    last_name varchar(32)  null comment '名',
    birthday datetime  null comment '生日'
)comment '用户额外信息表';
```

::: 

###
```java

public class UserAgeColumnValueSQLConverter implements ColumnValueSQLConverter {
    /**
     * 当这个值被作为select的时候如何处理
     * @param table
     * @param columnMetadata
     * @param sqlPropertyConverter
     * @param runtimeContext
     */
    @Override
    public void selectColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        SQLFunction durationDay = fx.duration(x->x.sqlFunc(fx.now()).column(table,"birthday"), DateTimeDurationEnum.Days);
        SQLFunction sqlFunction = fx.numberCalc(x -> x.sqlFunc(durationDay).value(365), NumberCalcEnum.NUMBER_DEVIDE);
        SQLFunction ageSQLFunction = fx.math(x -> x.sqlFunc(sqlFunction), MathMethodEnum.Ceiling);
        String sqlSegment = ageSQLFunction.sqlSegment(table);

        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            ageSQLFunction.consume(context.getSQLNativeChainExpressionContext());
            context.setAlias(columnMetadata.getName());
        });
    }

    /**
     * 当这个值被用作非查询的值的时候如何处理不出现在select里面
     * @param table
     * @param columnMetadata
     * @param sqlPropertyConverter
     * @param runtimeContext
     */
    @Override
    public void propertyColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        SQLFunction durationDay = fx.duration(x->x.sqlFunc(fx.now()).column(table,"birthday"), DateTimeDurationEnum.Days);
        SQLFunction sqlFunction = fx.numberCalc(x -> x.sqlFunc(durationDay).value(365), NumberCalcEnum.NUMBER_DEVIDE);
        SQLFunction ageSQLFunction = fx.math(x -> x.sqlFunc(sqlFunction), MathMethodEnum.Ceiling);
        String sqlSegment = ageSQLFunction.sqlSegment(table);
        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            ageSQLFunction.consume(context.getSQLNativeChainExpressionContext());
        });
    }

    /**
     * 当前值作为比较值的时候比如where age=18 那么这个18应该怎么处理
     * 当前这个值作为存储值的时候比如insert table (age) values(18)那么这个值如何处理
     * @param table
     * @param columnMetadata
     * @param sqlParameter
     * @param sqlPropertyConverter
     * @param runtimeContext
     * @param isCompareValue 当前值是用于比较还是存储
     */
    @Override
    public void valueConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext,boolean isCompareValue) {
        sqlPropertyConverter.sqlNativeSegment("{0}",context->{
            context.value(sqlParameter);
        });
    }
}


public class FullNameColumnValueSQLConverter implements ColumnValueSQLConverter {
    @Override
    public void selectColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        SQLFunction concat = fx.concat("firstName", "lastName");
        String sqlSegment = concat.sqlSegment(table);
        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            concat.consume(context.getSQLNativeChainExpressionContext());
            context.setAlias(columnMetadata.getName());
        });
    }

    @Override
    public void propertyColumnConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext) {
        SQLFunc fx = runtimeContext.fx();
        SQLFunction concat = fx.concat("firstName", "lastName");
        String sqlSegment = concat.sqlSegment(table);
        sqlPropertyConverter.sqlNativeSegment(sqlSegment,context->{
            concat.consume(context.getSQLNativeChainExpressionContext());
        });
    }

    @Override
    public void valueConvert(TableAvailable table, ColumnMetadata columnMetadata, SQLParameter sqlParameter, SQLPropertyConverter sqlPropertyConverter, QueryRuntimeContext runtimeContext,boolean isCompareValue) {
        sqlPropertyConverter.sqlNativeSegment("{0}",context->{
            context.value(sqlParameter);
        });
    }
}

```

### 查询
```java

List<UserExtra> list = easyEntityQuery.queryable(UserExtra.class)
        .where(u -> {
            u.fullName().like("123");
            u.fullName().in(Arrays.asList("1", "2"));
            u.age().gt(12);
        })
        .toList();


SELECT
    `id`,
    `first_name`,
    `last_name`,
    `birthday`,
    CONCAT(`first_name`,`last_name`) AS `full_name`, -- 全名就是first+last
    CEILING((timestampdiff(DAY,`birthday`,NOW()) / 365)) AS `age` -- 计算出出生日期到现在的天数除以365就是年向上取整就是虚岁
FROM
    `t_user_extra` 
WHERE
    CONCAT(`first_name`,`last_name`) LIKE '%123%' 
    AND CONCAT(`first_name`,`last_name`) IN (
        '1','2'
    ) 
    AND CEILING((timestampdiff(DAY, `birthday`, NOW()) / 365)) > 12


List<UserExtra> list = easyEntityQuery.queryable(UserExtra.class)
        .where(u -> {
            u.id().eq("test2");
            u.fullName().like("悟");
        }).orderBy(x -> x.fullName().asc())
        .toList();

SELECT
    `id`,
    `first_name`,
    `last_name`,
    `birthday`,
    CONCAT(`first_name`,`last_name`) AS `full_name`,
    CEILING((timestampdiff(DAY,`birthday`, NOW()) / 365)) AS `age` 
FROM
    `t_user_extra` 
WHERE
    `id` = 'test2' 
    AND CONCAT(`first_name`,`last_name`) LIKE '%悟%' 
ORDER BY
    CONCAT(`first_name`,`last_name`) ASC




List<UserExtra> list = easyEntityQuery.queryable(UserExtra.class)
        .where(u -> {
            u.id().eq("test3");
            u.fullName().like("悟");
        }).orderBy(x -> {
            x.fullName().asc();
            x.age().asc();
            x.fullName().asc(OrderByModeEnum.NULLS_LAST);
        })
        .toList();


SELECT
    `id`,
    `first_name`,
    `last_name`,
    `birthday`,
    CONCAT(`first_name`, `last_name`) AS `full_name`,
    CEILING((timestampdiff(DAY, `birthday`, NOW()) / 365)) AS `age` 
FROM
    `t_user_extra` 
WHERE
    `id` = 'test3' 
    AND CONCAT(`first_name`,`last_name`) LIKE '%悟%' 
ORDER BY
    CONCAT(`first_name`, `last_name`) ASC,
    CEILING((timestampdiff(DAY, `birthday`, NOW()) / 365)) ASC,
    CASE 
        WHEN CONCAT(`first_name`,  `last_name`) IS NULL THEN 1 
        ELSE 0 
    END ASC,
    CONCAT(`first_name`, `last_name`) ASC



List<Draft3<Integer, String, String>> list = easyEntityQuery.queryable(UserExtra.class)
            .where(u -> {
                u.id().eq("test3");
                u.fullName().like("悟");
            }).groupBy(u -> GroupKeys.TABLE1.of(u.age(), u.fullName()))
            .select(group -> Select.DRAFT.of(
                    group.key1(),
                    group.key2(),
                    group.groupTable().fullName().max()
            )).toList();



SELECT
    CEILING((timestampdiff(DAY, t.`birthday`, NOW()) / 365)) AS `value1`,
    CONCAT(t.`first_name`, t.`last_name`) AS `value2`,
    MAX(CONCAT(t.`first_name`, t.`last_name`)) AS `value3` 
FROM
    `t_user_extra` t 
WHERE
    t.`id` = 'test3' 
    AND CONCAT(t.`first_name`,t.`last_name`) LIKE '%悟%' 
GROUP BY
    CEILING((timestampdiff(DAY, t.`birthday`, NOW()) / 365)),
    CONCAT(t.`first_name`, t.`last_name`)
```

### 插入
```java
UserExtra userExtra = new UserExtra();
userExtra.setId("test2");
userExtra.setFirstName("孙");
userExtra.setLastName("悟空");
userExtra.setBirthday(LocalDateTime.of(2020, 1, 1, 0, 0));
easyEntityQuery.insertable(userExtra).executeRows();

INSERT 
INTO
    `t_user_extra`
    (
        `id`,`first_name`,`last_name`,`birthday`
    ) 
VALUES
    ('test2','孙','悟空','2020-01-01 00:00')
```

## 复杂子查询
因为有时候我们需要统计我们的子表数量可能会有对应的主表数量的聚合查询和最大值查询也可以通过这个来实现


## 相关博客
- [《数据库列加密解密脱敏》](https://www.cnblogs.com/xuejiaming/p/17619102.html)