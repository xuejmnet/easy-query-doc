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

If you don't want to add `@Column(conversion=xxx.class)` to each property, you can check [Global Value Converter](/easy-query-doc/prop/global-value-converter)

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
## JsonConverter
Supports both json object and jsonArray types


### Jackson
`JsonUtil` see the end of the document
```java

public class JacksonConverter implements ValueConverter<Object, String> {
    private static final Map<ColumnMetadata, JavaType> cacheMap = new ConcurrentHashMap<>();

    @Override
    public String serialize(Object o, @NotNull ColumnMetadata columnMetadata) {
        if (o == null) {
            return null;
        }
        return JsonUtil.object2JsonStr(o);
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

This way we have implemented the corresponding database json storage and custom conversion of java types


## JsonUtil
```java

public class JsonUtil {
    /**
     * JSON object conversion class
     */
    public static ObjectMapper jsonMapper = null; //Converter

    private static final String DEFAULT_DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    private static final String DEFAULT_DATE_PATTERN = "yyyy-MM-dd";
    private static final String DEFAULT_TIME_PATTERN = "HH:mm:ss";

    static {
        jsonMapper = new ObjectMapper(); //Converter
        jsonMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);//Ignore unknown fields
        jsonMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);//If it is an empty object, ignore serialization errors
        jsonMapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);// Ignore field case
        jsonMapper.configure(JsonGenerator.Feature.WRITE_BIGDECIMAL_AS_PLAIN, true);
        //Serialize all properties of the serialized object
        jsonMapper.setSerializationInclusion(JsonInclude.Include.ALWAYS);
        //Cancel time conversion format, default is timestamp, can be cancelled, and need to set the time format to be displayed
        jsonMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));

        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_PATTERN)));
        javaTimeModule.addSerializer(LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_PATTERN)));
        javaTimeModule.addSerializer(LocalTime.class, new LocalTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_PATTERN)));
        javaTimeModule.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_PATTERN)));
        javaTimeModule.addDeserializer(LocalDate.class, new LocalDateDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_PATTERN)));
        javaTimeModule.addDeserializer(LocalTime.class, new LocalTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_PATTERN)));

        jsonMapper.registerModule(javaTimeModule);

        // Declare a simple Module object
        SimpleModule module = new SimpleModule();
//        // Add a serializer to Module
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
     * Convert object to JSON string
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
     * Convert JSON string to object
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
     * Convert JSON string to object
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
     * Convert JSON string to object
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