---
title: 对象数据库值转换
---

# 对象数据库值转换
`easy-query`默认提供了数据库值对象转换功能,可以实现数据库对象属性枚举转换的功能或者对象string转json对象的功能

这边提供两种解决方案
- 如果你希望数据库对象和数据库类型一致,但是还希望用枚举转换的或者其他属性转换的
- 数据库对象属性本身就是枚举或者对象的

## api

接口  | 功能  
---  | --- 
ValueConverter  | 将数据库和对象值进行互相转换的接口
## springboot
`@Component`将对应的`ValueConverter`注入即可
## 控制台
```java
QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
configuration.applyValueConverter(new JsonConverter());
```
## 枚举值
数据库对象很多时候我们可能希望将枚举值设计为java枚举对象而不是integer,所以这边先用枚举来做一个测试

### 数据库对象属性枚举值
```java
//枚举接口
public interface IEnum<TEnum extends IEnum<TEnum>> {
    Integer getCode();
    TEnum valueOf(Integer enumValue);
}
//获取枚举值
public class EnumDeserializer {
    public static <T extends IEnum<T>> T deserialize(Class<T> enumClass, Integer integer) {
        T[] enumConstants = enumClass.getEnumConstants();
        if(enumConstants.length>0){
            return enumConstants[0].valueOf(integer);
        }
        throw new IllegalArgumentException("Invalid integer value for enum: " + integer);
    }
}
//枚举转换器
public class EnumConverter implements ValueConverter<IEnum<?>,Integer> {
    @Override
    public Integer serialize(IEnum<?> anEnum) {
        return anEnum.getCode();
    }

    @Override
    public IEnum<?> deserialize(Class<IEnum<?>> propertyClass,Integer integer) {
        return EnumDeserializer.deserialize(EasyObjectUtil.typeCast(propertyClass),integer);
    }
}
//数据库枚举
public enum TopicTypeEnum implements IEnum<TopicTypeEnum> {
    STUDENT(1),

    TEACHER(3),

    CLASSER(9);
    private final Integer code;

    TopicTypeEnum(Integer code){

        this.code = code;
    }
    @Override
    public Integer getCode() {
        return code;
    }

    @Override
    public TopicTypeEnum valueOf(Integer enumValue) {
        switch (enumValue){
            case 1:return TopicTypeEnum.STUDENT;
            case 3:return TopicTypeEnum.TEACHER;
            case 9:return TopicTypeEnum.CLASSER;
        }
        throw new UnsupportedOperationException();
    }
}

//数据库插入对象
@Data
@Table("t_topic_type")
@ToString
public class TopicTypeTest1 {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    @Column(conversion = EnumConverter.class)
    private TopicTypeEnum topicType;
    private LocalDateTime createTime;
}
TopicTypeTest1 topicType1 = new TopicTypeTest1();
topicType1.setId("123");
topicType1.setStars(123);
topicType1.setTitle("title123");
topicType1.setTopicType(TopicTypeEnum.CLASSER);
topicType1.setCreateTime(LocalDateTime.now());
long l = easyQuery.insertable(topicType1).executeRows();


==> Preparing: INSERT INTO `t_topic_type` (`id`,`stars`,`title`,`topic_type`,`create_time`) VALUES (?,?,?,?,?)
==> Parameters: 123(String),123(Integer),title123(String),9(Integer),2023-05-23T22:12:12.703(LocalDateTime)
<== Total: 1


TopicTypeTest1 topicTypeVO = easyQuery.queryable(TopicTypeTest1.class)
        .whereById("123")
        .firstOrNull();

System.out.println(topicTypeVO);

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`topic_type`,t.`create_time` FROM `t_topic_type` t WHERE t.`id` = ? LIMIT 1
==> Parameters: 123(String)
<== Time Elapsed: 4(ms)
<== Total: 1


TopicTypeTest1(id=123, stars=123, title=title123, topicType=CLASSER, createTime=2023-05-23T22:13:32)
```

### 数据库对象属性integer值
有些用户喜欢数据库对象是和数据库列类型一一对应的,那么可以采用`Integer`属性，对应的VO或者BO等对象上采用枚举也是可以的
```java

@Data
@Table("t_topic_type")
@ToString
public class TopicType {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    private Integer topicType;
    private LocalDateTime createTime;
}


//VO对象
@Data
@ToString
public class TopicTypeVO {

    private String id;
    private Integer stars;
    private String title;
    @Column(value = "topic_type",conversion = EnumConverter.class)
    private TopicTypeEnum topicType1;
    private LocalDateTime createTime;
}


TopicTypeVO topicTypeVO = easyQuery.queryable(TopicType.class)
        .whereById("123")
        .select(TopicTypeVO.class)
        .firstOrNull();



==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`topic_type`,t.`create_time` FROM `t_topic_type` t WHERE t.`id` = ? LIMIT 1
==> Parameters: 123(String)
<== Time Elapsed: 3(ms)
<== Total: 1

TopicTypeVO(id=123, stars=123, title=title123, topicType1=TEACHER, createTime=2023-05-23T22:16:45)
```
## json对象

首先我们引入fastjson2
```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>2.0.26</version>
</dependency>
```
```java

@Data
@Table("t_topic_type")
@ToString
public class TopicTypeJson {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column(conversion = JsonConverter.class)
    private TopicTypeJsonValue title;
    private Integer topicType;
    private LocalDateTime createTime;
}
@Data
public class TopicTypeJsonValue {
    private String name;
    private Integer age;
}


TopicTypeJson topicType1 = new TopicTypeJson();
topicType1.setId("1231");
topicType1.setStars(123);
TopicTypeJsonValue topicTypeJsonValue = new TopicTypeJsonValue();
topicTypeJsonValue.setName("123");
topicTypeJsonValue.setAge(456);
topicType1.setTitle(topicTypeJsonValue);
topicType1.setTopicType(TopicTypeEnum.CLASSER.getCode());
topicType1.setCreateTime(LocalDateTime.now());
long l = easyQuery.insertable(topicType1).executeRows();


==> Preparing: INSERT INTO `t_topic_type` (`id`,`stars`,`title`,`topic_type`,`create_time`) VALUES (?,?,?,?,?)
==> Parameters: 1231(String),123(Integer),{"age":456,"name":"123"}(String),9(Integer),2023-05-23T22:40:18.698(LocalDateTime)
<== Total: 1



TopicTypeJson topicTypeVO = easyQuery.queryable(TopicTypeJson.class)
        .whereById("1231")
        .firstOrNull();


System.out.println(topicTypeVO);

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`topic_type`,t.`create_time` FROM `t_topic_type` t WHERE t.`id` = ? LIMIT 1
==> Parameters: 1231(String)
<== Time Elapsed: 2(ms)
<== Total: 1
TopicTypeJson(id=1231, stars=123, title=TopicTypeJsonValue(name=123, age=456), topicType=9, createTime=2023-05-23T22:40:19)
```

这样我们就实现了对应的值类型转换和枚举的转换


