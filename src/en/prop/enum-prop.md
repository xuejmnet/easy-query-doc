---
title: Enum Properties
order: 4
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
EnumValueAutoConverter  | Supports enum type global application to properties without `ValueConverter` annotation (as long as the corresponding apply method returns true), using this interface does not require adding `Column(conversion=xxxx.class)`
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
configuration.applyValueConverter(new EnumConverter());
```
## Enum Values
Many times we may want to design enum values in database objects as Java enum objects rather than integers, so let's first use enums for testing

### Database Object Property Enum Values

::: warning Notice!!!
> If your database has both numeric types and string types to store enums, it is recommended that you create `NumberEnumValueAutoConverter` converter + `INumberEnum` interface, `NumberEnumValueAutoConverter`'s `apply` checks if it implements `INumberEnum.class`,
> Then create `StringEnumValueAutoConverter` converter + `IStringEnum` interface, `StringEnumValueAutoConverter`'s `apply` checks if it implements `IStringEnum.class`
> If you don't want to create multiple converters, you can create an `Object` converter to handle it yourself `EnumConverter implements EnumValueAutoConverter<IEnum<?>,Object>`
:::

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

//If you want the current enum conversion configured globally, you can use EnumValueAutoConverter
//EnumValueAutoConverter's first generic parameter cannot be a specific enum type unless the entire system has only one enum type
public class EnumConverter implements EnumValueAutoConverter<IEnum<?>,Number> {//Generic second parameter is recommended to use Number to prevent cast type conversion Long to Integer
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
        return IEnum.class.isAssignableFrom(propertyType); //true means if the corresponding property has not added annotation or has not specified ValueConverter, and is Enum<?>, then it will enter this method, if it returns true, the current conversion will be applied to the property by default
        //return true; //true means if the corresponding property has not added annotation or has not specified ValueConverter, and is Enum<?>, then it will enter this method, if it returns true, the current conversion will be applied to the property by default
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

//Handle performance issues yourself, relatively not as performant as interface mode

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


//If you want the current enum conversion configured globally, you can use EnumValueAutoConverter
//EnumValueAutoConverter's first generic parameter cannot be a specific enum type unless the entire system has only one enum type
public class EnumConverter implements EnumValueAutoConverter<IEnum<?>,Number> {//Generic second parameter is recommended to use Number to prevent cast type conversion Long to Integer
    @Override
    public Number serialize(IEnum<?> enumValue, ColumnMetadata columnMetadata) {
        if(enumValue == null){
            return null;
        }
        return (Number) EnumValueDeserializer.serialize(enumValue);
    }

    @Override
    public IEnum<?> deserialize(Number code, ColumnMetadata columnMetadata) {
        if(code == null){
            return null;
        }
        return EnumValueDeserializer.deserialize(EasyObjectUtil.typeCast(columnMetadata.getPropertyType()),code.intValue());
    }
    @Override
    public boolean apply(Class<?> entityClass, Class<IEnum<?>> propertyType) {
        return IEnum.class.isAssignableFrom(propertyType); //true means if the corresponding property has not added annotation or has not specified ValueConverter, and is Enum<?>, then it will enter this method, if it returns true, the current conversion will be applied to the property by default
        //return true; //true means if the corresponding property has not added annotation or has not specified ValueConverter, and is Enum<?>, then it will enter this method, if it returns true, the current conversion will be applied to the property by default
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

