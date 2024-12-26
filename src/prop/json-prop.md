---
title: json属性
---

# Java对象数据库值转换
`easy-query`默认提供了数据库值对象转换功能,可以实现数据库对象属性枚举转换的功能或者对象string转json对象的功能

**注意:** 如果需要支持差异更新需要实现重写`hashcode`和`equals` `Enum`除外

这边提供两种解决方案
- 如果你希望数据库对象和数据库类型一致,但是还希望用枚举转换的或者其他属性转换的
- 数据库对象属性本身就是枚举或者对象的

## api

接口  | 功能  
---  | --- 
ValueConverter  | 将数据库和对象值进行互相转换的接口
\<TProperty>  | 对象属性类型
\<TProvider>  | 数据库对应的java类型


方法  | 功能  
---  | --- 
serialize  | 将实体对象转成数据库值
deserialize  | 将数据库的值转成对象值
## springboot
`@Component`将对应的`ValueConverter`注入即可
## 控制台
```java
QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
configuration.applyValueConverter(new JsonConverter());//为自己实现的转换器
```

## json对象
::: warning 注意
> 因为update会使用track追踪模式更新所以这边json对象必须要重写`equals`和`hashcode`
:::

首先我们引入fastjson2
```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>2.0.26</version>
</dependency>
```

```java

public class JsonConverter implements ValueConverter<Object, String> {
    @Override
    public String serialize(Object o, ColumnMetadata columnMetadata) {
        if(o==null){
            return null;
        }
        return JSON.toJSONString(o, JSONWriter.Feature.WriteMapNullValue, JSONWriter.Feature.WriteNullListAsEmpty, JSONWriter.Feature.WriteNullStringAsEmpty);
    }

    @Override
    public Object deserialize(String s, ColumnMetadata columnMetadata) {
        if(EasyStringUtil.isBlank(s)){
            return null;
        }
        //采用复杂类型支持对象json和array集合
        ComplexPropType complexType = columnMetadata.getComplexPropType();
        return JSON.parseObject(s, complexType.complexType());
    }
}

//专门给集合用null为空数组
@Component
public class JsonListConverter implements ValueConverter<Object, String> {
    @Override
    public String serialize(Object o, ColumnMetadata columnMetadata) {
        if(o==null){
            return "[]";
        }
        return JsonUtil.object2JsonStr(o);
    }

    @Override
    public Object deserialize(String s, ColumnMetadata columnMetadata) {
        if(StringUtils.isBlank(s)){
            return new ArrayList<>();
        }
        

        //下面是jackson的用法 如果你是jackson
        Type complexType = columnMetadata.getComplexPropType().complexType();
        return JsonUtil.jsonStr2Object(s, new TypeReference<Object>() {
            @Override
            public Type getType() {
                return complexType;
            }
        });
    }
}

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
@EqualsAndHashCode
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
topicType1.setTitle(topicTypeJsonValue);//直接插入对象实体
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

