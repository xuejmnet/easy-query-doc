---
title: JSON Properties
order: 1
category:
  - memory
---

# Java Object Database Value Conversion
`easy-query` provides database value object conversion functionality by default, which can implement database object property enum conversion or object string to json object conversion

**Note:** If you need to support differential updates, you need to override `hashcode` and `equals`, except for `Enum`

Two solutions are provided here
- If you want the database object to be consistent with the database type, but still want to use enum conversion or other property conversions
- The database object property itself is an enum or object

## API

Interface  | Function  
---  | --- 
ValueConverter  | Interface to convert database and object values mutually
\<TProperty>  | Object property type
\<TProvider>  | Java type corresponding to the database


Method  | Function  
---  | --- 
serialize  | Convert entity object to database value
deserialize  | Convert database value to object value
## Spring Boot
Inject the corresponding `ValueConverter` with `@Component`
## Console
```java
QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
configuration.applyValueConverter(new JsonConverter());//Your implemented converter
```

## JSON Object
::: warning Notice
> Because update will use track mode for updating, the json object must override `equals` and `hashcode`
:::

First we introduce fastjson2
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
        //Use complex type to support object json and array collection
        ComplexPropType complexType = columnMetadata.getComplexPropType();
        return JSON.parseObject(s, complexType.complexType());
    }
}

//Specifically for collections, null becomes empty array
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
        

        //Below is Jackson usage if you use Jackson
        Type complexType = columnMetadata.getComplexPropType().complexType();
        return ObjectMapper.readValue(s, new TypeReference<Object>() {//Handle exceptions yourself
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
topicType1.setTitle(topicTypeJsonValue);//Directly insert object entity
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

This way we have implemented the corresponding value type conversion and enum conversion


