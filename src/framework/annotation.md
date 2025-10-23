---
title: 注解说明
order: 30
---

# 注解说明

## Table
描述对象对应数据库表名,vo对象不需要,非数据库对象不需要

属性  | 默认值 | 描述  
--- | --- | --- 
value | "" | 数据库表名为空表示 nameConversion.convert(class.getSimpleName) 可以再运行时修改
schema | "" | 数据库schema 可以在运行时修改,默认jdbc连接串的database
ignoreProperties | {} | 需要忽略的属性,一般用于继承父类需要忽略父类的属性
shardingInitializer | UnShardingInitializer.class | 分片初始化器,当且仅当对象是分片对象是用来初始化分片对象,也可以不添加后续手动添加
oldName | "" | 旧的表名用来code-first进行表名迁移
comment | "" | 自动生成表时的备注信息
keyword | true | 表名是否添加关键字处理比如mysql的``或者pgsql的""或者sqlserver的[],false场景:duckdb读取excel进行查询

```java

@Data
@Table("t_topic")
public class Topic {
    //.....
}
```

## Column
描述属性对应的列名

属性  | 默认值 | 描述  
--- | --- | --- 
value | "" | 对应数据库表的列名,默认空为nameConversion.convert(属性名)
primaryKey | false | 表示是否是主键,如果是那么在update对象delete对象将会以这个字段为id
generatedKey | false | 是否是自增列,如果是true,那么在`insertable().executeRows(true)`后获取自增id后将会填充到里面
conversion | DefaultValueConverter.class | 内存计算属性,值转换器,默认表示不转换,可以自定义枚举或者json等
sqlConversion | DefaultColumnValueSQLConverter.class | db计算属性，值转换器,默认表示不转换,可以自定义复合列比如`fullName=Concat(firstName,lastName)`,如果vo、dto也有当前属性那么不需要标注该属性
generatedSQLColumnGenerator | DefaultGeneratedKeySQLColumnGenerator.class | 数据库插入时使用的列生成器比如数据库函数`NEWID()`或其他自定义函数
complexPropType | DefaultComplexPropType.class | 复杂类型用于json反序列化时处理
autoSelect | true | 当前列是否需要自动查询,主要是用于直接toList时是否要返回当前列,false常用于数据库计算属性或者大字段列
typeHandler | UnKnownTypeHandler.class | 当前列使用什么TypeHandler,未知类型特殊处理
primaryKeyGenerator | UnsupportPrimaryKeyGenerator.class | 主键生成器用于插入时对象主键为null可以直接生成主键值
exist | true | 表示当前字段是否存在于数据库中,false表示默认不查询也不对象插入和对象更新
nullable | true | 表示当前字段映射的数据库列是否可为空,常用于code-first生成数据库ddl
dbType | "" | 表示当前字段映射的数据库列指定类型
dbDefault | "" | 表示当前字段映射的数据库列默认插入值
exist | true | 表示当前字段是否存在于数据库中,false表示默认不查询也不插入更新
comment | "" | 表示当前字段映射的数据库列的说明
length | -1 | 表示当前字段映射的数据库列的长度
scale | 0 | 表示当前字段映射的数据库列的精度
sqlExpression | ColumnSQLExpression | 表示简单的数据库计算属性
jdbcType | JDBCType.OTHER | 映射当前字段具体对应数据库实际jdbc类型 pgsql的uuid和mysql的uuid会用到当前字段类型


<!-- valueUpdateAtomicTrack | DefaultValueUpdateAtomicTrack.class | 原子更新,默认表示无原子更新 -->


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
添加这个注解的属性将会被直接忽略映射到数据库

## InsertIgnore
添加这个注解的属性将不会再插入时被赋值

## UpdateIgnore
添加这个注解的属性将不会再更新时被更新除非手动指定,比如`创建时间`、`创建人`、`逻辑删除字段`,`large column`,如果当前字段标记`update ignore`那么如果是非track更新那么将会直接忽略,如果属性`updateSetInTrackDiff = true`那么在track下更新那么还是有效的


属性  | 默认值 | 描述  
--- | --- | --- 
updateSetInTrackDiff |false | 是否需要在追踪查询中加入update set

::: warning 说明!!!
> `large column`添加`UpdateIgnore`是为了保证大字段被查询出来后如果进行entity全字段更新那么因为`title`没有被查询所以更新的时候就会把null更新掉(默认更新策略就是全字段),所以这边采用更新忽略,如果需要可以用表达式忽略 [当然您也可以选择更新策略为非null更新]
:::

```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column(large=true)
    @UpdateIgnore //大字段字段不需要update时更新 防止全字段更新把原字段改为null
    private String title;
    @UpdateIgnore //创建时间字段不需要update时更新
    private LocalDateTime createTime;
    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    @UpdateIgnore //逻辑删除字段不需要update时更新
    private Boolean deleted;
}
```

## LogicDelete
逻辑删除,表示当前字段对应到数据库是逻辑删除表示,select将会过滤,update也会过滤,delete数据将会被改写为update


属性  | 默认值 | 描述  
--- | --- | --- 
value | BOOLEAN | 逻辑删除策略,默认true表示删除,false表示不删除
strategyName | "" | 当逻辑删除为自定义逻辑删除时

- BOOLEAN false表示未被删除
- DELETE_LONG_TIMESTAMP 0表示未被删除
- LOCAL_DATE_TIME null表示未被删除
- LOCAL_DATE null表示未被删除
- CUSTOM 用户自定义


```java
@Data
@Table("t_topic")
public class Topic {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column(large=true)
    @UpdateIgnore //大字段字段不需要update时更新 防止全字段更新把原字段改为null
    private String title;
    @UpdateIgnore //创建时间字段不需要update时更新
    private LocalDateTime createTime;
    @LogicDelete(strategy = LogicDeleteStrategyEnum.BOOLEAN)
    @UpdateIgnore //逻辑删除字段不需要update时更新
    private Boolean deleted;
}
```
## Version
乐观锁也就是版本号


属性  | 默认值 | 描述  
--- | --- | --- 
value | - | 自行定义版本号策略

### 默认乐观锁版本号策略
- VersionIntStrategy
- VersionLongStrategy
- VersionTimestampStrategy (不推荐)
- VersionUUIDStrategy

#### VersionIntStrategy
//这边使用的是Version=2也可以使用version+1但是其实是一样的因为where后面限定了version=1
```sql
update table set version=2 where id=xxx and version=1
```
#### VersionLongStrategy
//这边使用的是Version=2也可以使用version+1但是其实是一样的因为where后面限定了version=1
```sql
update table set version=2 where id=xxx and version=1
```

#### VersionUUIDStrategy
```sql
update table set version=xxxxxxasd where id=xxx and version=xxxxasdasd
```


## Encryption
列加密,支持自定义数据加密存储,并且支持在数据库层面进行like搜索处理,拥有非常高的性能,并不是利用数据库加解密函数

### EncryptionStrategy
用来处理如何加密解密数据策略,可以自定义实现

默认实现有一个aes+base64的`AbstractAesBase64EncryptionStrategy`抽象类,用户需要返回16位的向量和秘钥

### supportQueryLike
用来表示是否需要支持like搜索,如果true那么就会在入参参数中对其进行分段加密

## Navigate
导航属性 用在数据库对象和返回结果上面用于处理一对一，一对多，多对一，多对多

## ShardingDataSourceKey
用来标识当前对象的数据库分库键是哪个

## ShardingExtraDataSourceKey
用来标识当前对象是数据库分库额外分库键是哪个

## ShardingTableKey
用来标识当前对象的数据库分表键是哪个

## ShardingExtraTableKey
用来标识当前对象的数据库分表额外键是哪个

## EasyWhereCondition
默认的动态条件对象查询条件,可以自行替换自定义注解来实现动态条件

## EasyQueryTrack
默认的追踪上下文注解也可以自定义,用于方法之上

## EntityProxy
生成代理对象,添加到实体和dto之上用来自动生成apt代理类,生成的文件存在于target目录下,clean后需要重新build

## EntityFileProxy
同`EntityProxy`但是生成的文件存在源码中

## ProxyProperty
用来防止生成的apt属性和系统自带的重复,可以再属性上定义别名