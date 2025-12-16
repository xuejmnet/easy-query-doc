---
title: Java Object Database Value Conversion
order: 150
---

# Java Object Database Value Conversion
`easy-query` provides database value object conversion functionality by default, which can implement database object property enum conversion or object string to JSON object conversion

**Note:** If you need to support differential updates, you need to implement override `hashcode` and `equals`, except for `Enum`

Two solutions are provided here
- If you want the database object and database type to be consistent, but still want enum conversion or other property conversion
- The database object property itself is an enum or object

## API

Interface  | Function  
---  | --- 
ValueConverter  | Interface for converting database and object values to each other
ValueAutoConverter  | Supports enum types globally applying to properties without `ValueConverter` annotation (as long as the corresponding apply method returns true). Using this interface does not require adding `Column(conversion=xxxx.class)`
\<TProperty>  | Object property type
\<TProvider>  | Corresponding Java type for the database


Method  | Function  
---  | --- 
serialize  | Convert entity object to database value
deserialize  | Convert database value to object value
## Spring Boot
`@Component` inject the corresponding `ValueConverter`
## Console
```java
QueryRuntimeContext runtimeContext = easyQuery.getRuntimeContext();
QueryConfiguration configuration = runtimeContext.getQueryConfiguration();
configuration.applyValueConverter(new JsonConverter());
```
## Enum Value
Many times we may want to design database objects enum values as Java enum objects instead of integers, so let's use enums to do a test first

### Database Object Property Enum Value
```java
//Enum interface
public interface IEnum<TEnum extends IEnum<TEnum>> {
    Integer getCode();
    TEnum valueOf(Integer enumValue);
}
//Get enum value
public class EnumDeserializer {
    public static <T extends IEnum<T>> T deserialize(Class<T> enumClass, Integer integer) {
        T[] enumConstants = enumClass.getEnumConstants();
        if(enumConstants.length>0){
            return enumConstants[0].valueOf(integer);
        }
        throw new IllegalArgumentException("Invalid integer value for enum: " + integer);
    }
}
//Enum converter
public class EnumConverter implements ValueConverter<IEnum<?>,Number> {
    @Override
    public Number serialize(IEnum<?> iEnum, ColumnMetadata columnMetadata) {
        if(iEnum==null){
            return null;
        }
        return iEnum.getCode();
    }

    @Override
    public IEnum<?> deserialize(Number code, ColumnMetadata columnMetadata) {
        if(code==null){
            return null;
        }
        return EnumDeserializer.deserialize(EasyObjectUtil.typeCast(columnMetadata.getPropertyType()),code.intValue());
    }
}

//If you want to configure this enum conversion globally, you can use ValueAutoConverter
//ValueAutoConverter first generic parameter cannot be a specific enum type unless there is only one enum type in the entire system
public class EnumConverter implements ValueAutoConverter<IEnum<?>,Number> {
    @Override
    public Number serialize(IEnum<?> iEnum, ColumnMetadata columnMetadata) {
        if(iEnum == null){
            return null;
        }
        return iEnum.getCode();
    }

    @Override
    public IEnum<?> deserialize(Number code, ColumnMetadata columnMetadata) {
        if(code == null){
            return null;
        }
        return EnumDeserializer.deserialize(EasyObjectUtil.typeCast(columnMetadata.getPropertyType()),code.intValue());
    }
    @Override
    public boolean apply(Class<?> entityClass, Class<IEnum<?>> propertyType) {
        return IEnum.class.isAssignableFrom(propertyType); //true means if the corresponding property has not added annotation or has not specified ValueConverter, and is enum Enum<?>, then it will enter this method. If it returns true, this conversion will be applied to the property by default
        //return true; //true means if the corresponding property has not added annotation or has not specified ValueConverter, and is enum Enum<?>, then it will enter this method. If it returns true, this conversion will be applied to the property by default
    }
}


//Database enum
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

//Database insert object
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

### Database Object Property Integer Value
Some users like database objects to correspond one-to-one with database column types, so they can use `Integer` properties. The corresponding VO or BO objects can also use enums
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


//VO object
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
## Annotation Mode
```java
//Annotation
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface EnumValue {
}
//Static method

//Performance issues need to be handled by yourself, relatively not as performant as interface mode

public class EnumValueDeserializer {
    private static final Map<String, Field> ENUM_TYPES = new ConcurrentHashMap<>();

    public static <T extends Enum<T>> Object serialize(Enum<T> enumValue) {
        if (enumValue == null) {
            return null;
        }
        Optional<Field> codeOptional = getEnumValueField(enumValue.getClass());
        if (codeOptional.isPresent()) {
            Field filed = codeOptional.get();
            filed.setAccessible(true);
            try {
                return filed.get(enumValue);
            } catch (IllegalAccessException e) {
                throw new RuntimeException(e);
            }
        }
        throw new IllegalArgumentException("Invalid integer value for enum: " + enumValue + ",from :" + EasyClassUtil.getInstanceSimpleName(enumValue));

    }

    public static <T extends Enum<T>> T deserialize(Class<T> enumClass, Integer code) {
        if (code == null) {
            return null;
        }
        Optional<Field> codeOptional = getEnumValueField(enumClass);
        if (codeOptional.isPresent()) {
            Field filed = codeOptional.get();
            T[] enumConstants = enumClass.getEnumConstants();
            for (T enumConstant : enumConstants) {
                filed.setAccessible(true);
                try {
                    if (Objects.equals(code, filed.get(enumConstant))) {
                        return enumConstant;
                    }

                } catch (IllegalAccessException e) {
                    throw new RuntimeException(e);
                }
            }
        }
        throw new IllegalArgumentException("Invalid integer value for enum: " + code + ",from :" + EasyClassUtil.getSimpleName(enumClass));

    }

    public static <T extends Enum<T>> Optional<Field> getEnumValueField(Class<T> enumClass) {
        if (enumClass != null && enumClass.isEnum()) {
            String className = enumClass.getName();
            Field s = EasyMapUtil.computeIfAbsent(ENUM_TYPES, className, key -> {
                Collection<Field> allFields = EasyClassUtil.getAllFields(enumClass);
                Optional<Field> optional = allFields.stream()
                        // Filter fields containing annotation @EnumValue
                        .filter(field ->field.isAnnotationPresent(EnumValue.class))
                        .findFirst();
                return optional.orElse(null);
            });
            return Optional.ofNullable(s);
        }
        return Optional.empty();

    }
}

//Converter
public class EnumValueConverter implements ValueConverter<Enum<?>,Number> {
    @Override
    public Number serialize(Enum<?> enumValue, ColumnMetadata columnMetadata) {
        if(enumValue == null){
            return null;
        }
        return (Number) EnumValueDeserializer.serialize(enumValue);
    }

    @Override
    public Enum<?> deserialize(Number code, ColumnMetadata columnMetadata) {
        if(code == null){
            return null;
        }
        return EnumValueDeserializer.deserialize(EasyObjectUtil.typeCast(columnMetadata.getPropertyType()),code.intValue());
    }
}


public enum TopicTypeEnum {
    STUDENT(1),

    TEACHER(3),

    CLASSER(9);
    @EnumValue
    private final Integer code;

    TopicTypeEnum(Integer code){

        this.code = code;
    }
    @Override
    public Integer getCode() {
        return code;
    }
}


@Data
@Table("t_topic_type")
@ToString
public class TopicTypeTest2 {

    @Column(primaryKey = true)
    private String id;
    private Integer stars;
    private String title;
    @Column(value = "topic_type",conversion = EnumValueConverter.class)
    private TopicTypeEnum topicType;
    private LocalDateTime createTime;
}


TopicTypeTest2 topicType2 = new TopicTypeTest2();
topicType2.setId("123");
topicType2.setStars(123);
topicType2.setTitle("title123");
topicType2.setTopicType(TopicTypeEnum.CLASSER);
topicType2.setCreateTime(LocalDateTime.now());
long l = easyQuery.insertable(topicType2).executeRows();


==> Preparing: INSERT INTO `t_topic_type` (`id`,`stars`,`title`,`topic_type`,`create_time`) VALUES (?,?,?,?,?)
==> Parameters: 123(String),123(Integer),title123(String),9(Integer),2023-05-23T22:12:12.703(LocalDateTime)
<== Total: 1


TopicTypeTest2 topicTypeVO = easyQuery.queryable(TopicTypeTest2.class)
        .whereById("123")
        .firstOrNull();

System.out.println(topicTypeVO);

==> Preparing: SELECT t.`id`,t.`stars`,t.`title`,t.`topic_type`,t.`create_time` FROM `t_topic_type` t WHERE t.`id` = ? LIMIT 1
==> Parameters: 123(String)
<== Time Elapsed: 4(ms)
<== Total: 1


TopicTypeTest2(id=123, stars=123, title=title123, topicType=CLASSER, createTime=2023-05-23T22:13:32)
```

## JSON Object
::: warning Note
> Because update will use track tracking mode for updates, so JSON objects must override `equals` and `hashcode`
:::

First, let's introduce fastjson2
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
        //Use complex type to support object JSON and array collections
        ComplexPropType complexType = columnMetadata.getComplexPropType();
        return JSON.parseObject(s, complexType.complexType());
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

This way we have implemented corresponding value type conversion and enum conversion


## JSON Support for Collection Types
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

If you don't want to use `TopicTypeTitle2ComplexType` to define an additional class, you can define it directly on the JSON object

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

