---
title: Collection Properties
order: 2
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
configuration.applyValueConverter(new JsonConverter());
```
## Collection Type JSON Support
```java
@Data
@Table("t_topic_type_array")
@ToString
public class TopicTypeArrayJson {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column(conversion = JsonConverter.class)
    private TopicTypeJsonValue title;
    @Column(conversion = JsonConverter.class, complexPropType = TopicTypeTitle2ComplexType.class)
    private List<TopicTypeJsonValue> title2;
    private Integer topicType;
    private LocalDateTime createTime;
}

//Implement interface ComplexPropType to return the corresponding complex type
public class TopicTypeTitle2ComplexType extends TypeReference<List<TopicTypeJsonValue>> implements ComplexPropType {

    @Override
    public Type complexType() {
        return this.getType();
    }
}

If you don't want to use `TopicTypeTitle2ComplexType` to define an extra class, you can define it directly on the json object

@Data
@EqualsAndHashCode
public class TopicTypeJsonValue implements ComplexPropType {
    private String name;
    private Integer age;

    @Override
    public Type complexType() {
        return myType(new TypeReference<List<TopicTypeJsonValue>>() {
        });
    }

    private <T> Type myType(TypeReference<T> typeReference) {
        return typeReference.getType();
    }
}

Then the entity object is defined as

@Data
@Table("t_topic_type_array")
@ToString
public class TopicTypeArrayJson {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column(conversion = JsonConverter.class)
    private TopicTypeJsonValue title;
    @Column(conversion = JsonConverter.class, complexPropType = TopicTypeJsonValue.class)//Change to TopicTypeJsonValue.class
    private List<TopicTypeJsonValue> title2;
    private Integer topicType;
    private LocalDateTime createTime;
}



TopicTypeArrayJson topicType1 = new TopicTypeArrayJson();
topicType1.setId(id);
topicType1.setStars(123);
TopicTypeJsonValue topicTypeJsonValue = new TopicTypeJsonValue();
topicTypeJsonValue.setName("123");
topicTypeJsonValue.setAge(456);
topicType1.setTitle(topicTypeJsonValue);
ArrayList<TopicTypeJsonValue> topicTypeJsonValues = new ArrayList<>();
{

    TopicTypeJsonValue topicTypeJsonValue1 = new TopicTypeJsonValue();
    topicTypeJsonValue1.setName("1234");
    topicTypeJsonValue1.setAge(4565);
    topicTypeJsonValues.add(topicTypeJsonValue1);
}
{

    TopicTypeJsonValue topicTypeJsonValue1 = new TopicTypeJsonValue();
    topicTypeJsonValue1.setName("12345");
    topicTypeJsonValue1.setAge(45655);
    topicTypeJsonValues.add(topicTypeJsonValue1);
}
topicType1.setTitle2(topicTypeJsonValues);

topicType1.setTopicType(TopicTypeEnum.CLASSER.getCode());
topicType1.setCreateTime(LocalDateTime.now());
long l = easyQuery.insertable(topicType1).executeRows();

==> Preparing: INSERT INTO `t_topic_type_array` (`id`,`stars`,`title`,`title2`,`topic_type`,`create_time`) VALUES (?,?,?,?,?,?)
==> Parameters: 1231(String),123(Integer),{"age":456,"name":"123"}(String),[{"age":4565,"name":"1234"},{"age":45655,"name":"12345"}](String),9(Integer),2023-10-04T22:37:32.049(LocalDateTime)
<== Total: 1
```

