---
title: 枚举属性
order: 4
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
EnumValueAutoConverter  | 支持枚举类型全局作用到没有添加`ValueConverter`注解的属性上(只要对应的apply方法返回true),使用这个接口无需添加`Column(conversion=xxxx.class)`
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
configuration.applyValueConverter(new EnumConverter());
```
## 枚举值
数据库对象很多时候我们可能希望将枚举值设计为java枚举对象而不是integer,所以这边先用枚举来做一个测试

### 数据库对象属性枚举值

::: warning 说明!!!
> 如果您的数据库既有数字类型又有字符串类型来存储枚举,那么这边是建议你创建`NumberEnumValueAutoConverter`转换器 + `INumberEnum`接口,`NumberEnumValueAutoConverter`的`apply`校验是否实现`INumberEnum.class`，
> 然后再创建`StringEnumValueAutoConverter`转换器 + `IStringEnum`接口,`StringEnumValueAutoConverter`的`apply`校验是否实现`IStringEnum.class`
> 如果你不想创建多个转换器那么可以创建一个`Object`的转换器自己去处理`EnumConverter implements EnumValueAutoConverter<IEnum<?>,Object>`
:::

```java
//枚举接口
public interface IEnum<TEnum extends IEnum<TEnum>> {
    Integer getCode();
    TEnum enumOf(Integer enumValue);
}
//获取枚举值
public class EnumDeserializer {
    public static <T extends IEnum<T>> T deserialize(Class<T> enumClass, Integer integer) {
        T[] enumConstants = enumClass.getEnumConstants();
        if(enumConstants.length>0){
            return enumConstants[0].enumOf(integer);
        }
        throw new IllegalArgumentException("Invalid integer value for enum: " + integer);
    }
}

//如果你希望当前枚举转换配置到全局可以使用 EnumValueAutoConverter
//EnumValueAutoConverter第一个泛型参数 不可以是具体枚举类型除非整个系统就一个枚举类型
public class EnumConverter implements EnumValueAutoConverter<IEnum<?>,Number> {//泛型第二个参数建议使用Number,防止出现cast类型转换Long转Integer
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
        return IEnum.class.isAssignableFrom(propertyType); //true表示如果对应的属性没有添加注解或者没有指定ValueConverter,并且是枚举Enum<?>,那么会进入当前方法如果返回true那么会默认将当前转换作用到属性上
        //return true; //true表示如果对应的属性没有添加注解或者没有指定ValueConverter,并且是枚举Enum<?>,那么会进入当前方法如果返回true那么会默认将当前转换作用到属性上
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
    public TopicTypeEnum enumOf(Integer enumValue) {
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
    @Column(value = "topic_type")
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
## 注解模式
```java
//注解
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.ANNOTATION_TYPE})
public @interface EnumValue {
}
//静态方法

//性能问题自行处理 相对没有接口模式性能高

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
                        // 过滤包含注解@EnumValue的字段
                        .filter(field ->field.isAnnotationPresent(EnumValue.class))
                        .findFirst();
                return optional.orElse(null);
            });
            return Optional.ofNullable(s);
        }
        return Optional.empty();

    }
}


//如果你希望当前枚举转换配置到全局可以使用 EnumValueAutoConverter
//EnumValueAutoConverter第一个泛型参数 不可以是具体枚举类型除非整个系统就一个枚举类型
public class EnumConverter implements EnumValueAutoConverter<IEnum<?>,Number> {//泛型第二个参数建议使用Number,防止出现cast类型转换Long转Integer
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
        return IEnum.class.isAssignableFrom(propertyType); //true表示如果对应的属性没有添加注解或者没有指定ValueConverter,并且是枚举Enum<?>,那么会进入当前方法如果返回true那么会默认将当前转换作用到属性上
        //return true; //true表示如果对应的属性没有添加注解或者没有指定ValueConverter,并且是枚举Enum<?>,那么会进入当前方法如果返回true那么会默认将当前转换作用到属性上
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
    @Column(value = "topic_type")
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