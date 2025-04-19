---
title: 集合属性
order: 2
category:
  - memory
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
configuration.applyValueConverter(new JsonConverter());
```
## 集合类型的json支持
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

//实现接口ComplexPropType返回对应的复杂类型type
public class TopicTypeTitle2ComplexType extends TypeReference<List<TopicTypeJsonValue>> implements ComplexPropType {

    @Override
    public Type complexType() {
        return this.getType();
    }
}

如果不想使用`TopicTypeTitle2ComplexType`额外定义一个类可以在json对象上直接定义

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

然后实体对象定义为

@Data
@Table("t_topic_type_array")
@ToString
public class TopicTypeArrayJson {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    @Column(conversion = JsonConverter.class)
    private TopicTypeJsonValue title;
    @Column(conversion = JsonConverter.class, complexPropType = TopicTypeJsonValue.class)//修改为TopicTypeJsonValue.class
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