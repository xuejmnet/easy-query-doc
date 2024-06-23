---
title: 自定义主键
---

`easy-query`提供了`PrimaryKeyGenerator`接口该接口可以由用户自行实现,具体功能就是可以自动对当前对象的主键进行赋值,比如你可以实现一个uuid的或者雪花id的

## PrimaryKeyGenerator



方法  | 参数 | 描述  
--- | --- | --- 
getPrimaryKey | 无 | 用来返回一个主键
setPrimaryKey | 对象,key的columnMetadata | 用来对对象进行设置主键(默认已经实现一个通用方法)

执行顺序在`insert`的方法调用`executeRows`后将先执行对象的`PrimaryKeyGenerator.setPrimaryKey`然后执行拦截器,所以如果您不需要可以在拦截器里面对其进行从新设置或者清空

## 如何使用
- 当前对象必须是数据库对象`@Table`
- 当前属性必须是主键`@Column(primaryKet=true)`
- 当前属性不可以是生成列`@Column(generateKey=true)`不可以`generateKey=true`
- 当前属性添加`@Column(primaryKet=true,primaryKeyGenerator=UUIDPrimaryKeyGenerator.class)`
- 如果有多主键那么也是一样的用法

## UUIDPrimaryKeyGenerator
如何实现一个UUID的主键生成器
```java
@Component //如果您是springboot
public class UUIDPrimaryKeyGenerator implements PrimaryKeyGenerator {
    @Override
    public Serializable getPrimaryKey() {
        return UUID.randomUUID().toString().replaceAll("-","");
    }
//    /**
//     * 如果需要判断之前是否有值
//     * @param entity
//     * @param columnMetadata
//     */
//    @Override
//    public void setPrimaryKey(Object entity, ColumnMetadata columnMetadata) {
//        Serializable primaryKey = getPrimaryKey();
//        Object oldValue = columnMetadata.getGetterCaller().apply(entity);
//        if(oldValue!=null)
//        {
//            columnMetadata.getSetterCaller().call(entity, primaryKey);
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

## 雪花id

```java
//初始化
Snowflake snowflake = IdUtil.createSnowflake(workerId,dataCenterId)

@Component //如果您是springboot
public class SnowflakePrimaryKeyGenerator implements PrimaryKeyGenerator {
    @Override
    public Serializable getPrimaryKey() {
        return String.valueOf(snowflake.nextId());//因为long类型在js中会出现精度丢失
    }
//    /**
//     * 如果需要判断之前是否有值
//     * @param entity
//     * @param columnMetadata
//     */
//    @Override
//    public void setPrimaryKey(Object entity, ColumnMetadata columnMetadata) {
//        Serializable primaryKey = getPrimaryKey();
//        Object oldValue = columnMetadata.getGetterCaller().apply(entity);
//        if(oldValue!=null)
//        {
//            columnMetadata.getSetterCaller().call(entity, primaryKey);
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

## 相关搜索
`自定义主键` `雪花id` `自定义id`