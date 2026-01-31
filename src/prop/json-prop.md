---
title: json属性
order: 1
category:
  - memory
---

# Java对象数据库值转换
`easy-query`默认提供了数据库值对象转换功能,可以实现数据库对象属性枚举转换的功能或者对象string转json对象的功能

**注意:** 如果需要支持差异更新需要实现重写`hashcode`和`equals` `Enum`除外

这边提供两种解决方案
- 如果你希望数据库对象和数据库类型一致,但是还希望用枚举转换的或者其他属性转换的
- 数据库对象属性本身就是枚举或者对象的

如果您不想每个属性都添加`@Column(conversion=xxx.class)`那么可以查看[全局值转换器](/easy-query-doc/prop/global-value-converter)

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
## JsonConverter
支持json对象和jsonArray两种类型


### Jackson
`JsonUtil`看文末
```java

public class JacksonConverter implements ValueConverter<Object, String> {
    private static final Map<ColumnMetadata, JavaType> cacheMap = new ConcurrentHashMap<>();

    @Override
    public String serialize(Object o, @NotNull ColumnMetadata columnMetadata) {
        if (o == null) {
            return null;
        }
        return JSON.toJSONString(o, JSONWriter.Feature.WriteMapNullValue, JSONWriter.Feature.WriteNullListAsEmpty, JSONWriter.Feature.WriteNullStringAsEmpty);
    }

    @Override
    public Object deserialize(String s, @NotNull ColumnMetadata columnMetadata) {
        if (EasyStringUtil.isBlank(s)) {
            return null;
        }

        JavaType filedType = getFiledType(columnMetadata);

        return JsonUtil.jsonStr2Object(s, filedType);
    }


    private JavaType getFiledType(ColumnMetadata columnMetadata) {
        return EasyMapUtil.computeIfAbsent(cacheMap, columnMetadata, key -> {
            return getFiledType0(key);
        });
    }

    private JavaType getFiledType0(ColumnMetadata columnMetadata) {
        Class<?> entityClass = columnMetadata.getEntityMetadata().getEntityClass();
        Field declaredField =EasyClassUtil.getFieldByName(entityClass, columnMetadata.getPropertyName());
        return JsonUtil.jsonMapper.getTypeFactory()
                .constructType(declaredField.getGenericType());
    }
}

```
### FastJson2
```java

public class JsonConverter implements ValueConverter<Object, String> {
    private static final Map<ColumnMetadata, Type> cacheMap = new ConcurrentHashMap<>();

    @Override
    public String serialize(Object o, @NotNull ColumnMetadata columnMetadata) {
        if (o == null) {
            return null;
        }
        return JSON.toJSONString(o, JSONWriter.Feature.WriteMapNullValue, JSONWriter.Feature.WriteNullListAsEmpty, JSONWriter.Feature.WriteNullStringAsEmpty);
    }

    @Override
    public Object deserialize(String s, @NotNull ColumnMetadata columnMetadata) {
        if (EasyStringUtil.isBlank(s)) {
            return null;
        }

        Type filedType = getFiledType(columnMetadata);
        return JSON.parseObject(s, filedType);
    }


    private Type getFiledType(ColumnMetadata columnMetadata) {
        return EasyMapUtil.computeIfAbsent(cacheMap, columnMetadata, key -> {
            return getFiledType0(key);
        });
    }

    private Type getFiledType0(ColumnMetadata columnMetadata) {
        Class<?> entityClass = columnMetadata.getEntityMetadata().getEntityClass();
        Field declaredField = EasyClassUtil.getFieldByName(entityClass, columnMetadata.getPropertyName());
        return declaredField.getGenericType();
    }
}



```


## JsonObject
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


## JsonArray
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
    @Column(conversion = JsonConverter.class)
    private List<TopicTypeJsonValue> title2;
    private Integer topicType;
    private LocalDateTime createTime;
}


@Data
@EqualsAndHashCode
public class TopicTypeJsonValue{
    private String name;
    private Integer age;
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
    @Column(conversion = JsonConverter.class)
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

这样我们就实现了对应的数据库json存储和java类型的自定义转换


## JsonUtil
```java

public class JsonUtil {
    /**
     * JSON对象转换类
     */
    public static ObjectMapper jsonMapper = null; //转换器

    private static final String DEFAULT_DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    private static final String DEFAULT_DATE_PATTERN = "yyyy-MM-dd";
    private static final String DEFAULT_TIME_PATTERN = "HH:mm:ss";

    static {
        jsonMapper = new ObjectMapper(); //转换器
        jsonMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);//忽略未知字段
        jsonMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);//如果是空对象忽略序列化错误
        jsonMapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);// 忽略字段大小写
        jsonMapper.configure(JsonGenerator.Feature.WRITE_BIGDECIMAL_AS_PLAIN, true);
        //序列化的时候序列对象的所有属性
        jsonMapper.setSerializationInclusion(JsonInclude.Include.ALWAYS);
        //取消时间的转化格式,默认是时间戳,可以取消,同时需要设置要表现的时间格式
        jsonMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));

        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_PATTERN)));
        javaTimeModule.addSerializer(LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_PATTERN)));
        javaTimeModule.addSerializer(LocalTime.class, new LocalTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_PATTERN)));
        javaTimeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_PATTERN)));
        javaTimeModule.addDeserializer(LocalDate.class, new LocalDateDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_PATTERN)));
        javaTimeModule.addDeserializer(LocalTime.class, new LocalTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_PATTERN)));

        jsonMapper.registerModule(javaTimeModule);

        // 声明一个简单Module 对象
        SimpleModule module = new SimpleModule();
//        // 给Module 添加一个序列化器
//        module.addSerializer(Enumerator.class, new JsonSerializer<Enumerator>() {
//            @Override
//            public void serialize(Enumerator value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
//                gen.writeNumber(value.getCode());
//            }
//        });
//        module.addDeserializer(Enum.class, new EnumeratorDeserializer());
        jsonMapper.registerModule(module);
    }


    /**
     * 对象转JSON字符串
     * @param object
     * @return
     * @throws JsonSerialException
     */
    public static String object2JsonStr(Object object)
    {
        try {
            return jsonMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new JsonSerialException(e);
        }
    }

    /**
     * JSONl字符串转对象
     * @param <T>
     * @param json
     * @param valueType
     * @return
     * @throws JsonSerialException
     */
    public static <T> T jsonStr2Object(String json, Class<T> valueType){
        try {
            return jsonMapper.readValue(json, valueType);
        } catch (JsonProcessingException e) {
            throw new JsonSerialException(e);
        }
    }
    public static <T> T jsonStr2Object(String json, JavaType javaType){
        try {
            return jsonMapper.readValue(json, javaType);
        } catch (JsonProcessingException e) {
            throw new JsonSerialException(e);
        }
    }

    /**
     * JSON字符串转成对象
     * @param json
     * @param typeReference
     * @param <T>
     * @return
     * @throws JsonSerialException
     */
    public static <T> T jsonStr2Object(String json, TypeReference<T> typeReference){
        try {
            return jsonMapper.readValue(json, typeReference);
        } catch (JsonProcessingException e) {
            throw new JsonSerialException(e);
        }
    }

    /**
     * JSONl字符串转对象
     * @param <T>
     * @param json
     * @param typeReference
     * @return
     * @throws JsonSerialException
     */
    public static <T> T jsonStr2List(String json, TypeReference<T> typeReference){
        try {
            return jsonMapper.readValue(json, typeReference);
        } catch (JsonProcessingException e) {
            throw new JsonSerialException(e);
        }
    }
}



public class JsonSerialException extends RuntimeException{
    public JsonSerialException() {
    }

    public JsonSerialException(String message) {
        super(message);
    }

    public JsonSerialException(String message, Throwable cause) {
        super(message, cause);
    }

    public JsonSerialException(Throwable cause) {
        super(cause);
    }

    public JsonSerialException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}

```