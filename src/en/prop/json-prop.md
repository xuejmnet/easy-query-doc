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



::: warning Note!!!
> If you are using PgSQL and want to store jsonb, use `object` as the Java field type and support both `jsonObject` and `jsonArray`, you can [check this issue](https://github.com/dromara/easy-query/issues/462)
:::



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

Then define the entity object

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
     * JSON Object Converter
     */
    public static ObjectMapper jsonMapper = null; //Converter

    private static final String DEFAULT_DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    private static final String DEFAULT_DATE_PATTERN = "yyyy-MM-dd";
    private static final String DEFAULT_TIME_PATTERN = "HH:mm:ss";

    static {
        jsonMapper = new ObjectMapper(); //Converter
        jsonMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);//Ignore unknown fields
        jsonMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);//Ignore serialization errors for empty objects
        jsonMapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);// Ignore case for field names
        jsonMapper.configure(JsonGenerator.Feature.WRITE_BIGDECIMAL_AS_PLAIN, true);
        //Serialize all properties of the object
        jsonMapper.setSerializationInclusion(JsonInclude.Include.ALWAYS);
        //Cancel time conversion format, default is timestamp, can be cancelled, also need to set the time format to display
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
       // Add a serializer to the Module
       module.addSerializer(IEnum.class, new JsonSerializer<IEnum>() {
           @Override
           public void serialize(IEnum value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
               gen.writeNumber(value.getCode());
           }
       });
       module.addDeserializer(Enum.class, new EnumeratorDeserializer());
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




@Slf4j
public class EnumeratorDeserializer extends JsonDeserializer<Enum> implements ContextualDeserializer {
    private Class clz;

    public void setClz(Class clz) {
        this.clz = clz;
    }

    @Override
    public Enum deserialize(JsonParser jsonParser, DeserializationContext ctx) throws IOException {
        String parserText = jsonParser.getText();
        if (StringUtils.isBlank(parserText)) {
            return null;
        }
        if (IEnum.class.isAssignableFrom(clz)) {
            boolean isInteger = MyStringUtil.isInteger(parserText);
            if (isInteger) {
                int parseInt = Integer.parseInt(parserText);
                return EnumDeserializerHelper.deserialize(EnumDeserializerHelper.typeCastNullable(clz), parseInt);
            }
            throw new JsonSerialException("Invalid enum value[" + EasyClassUtil.getSimpleName(clz) + "]: [" + parserText + "]");
        }

        return null;
    }

    /**
     * Get the appropriate parser, store the Class object of the currently parsed property for deserialization conversion type.
     * To avoid thread safety issues, create a new one each time (using threadLocal to store would be more reasonable)
     *
     * @param ctx
     * @param property
     * @return
     * @throws JsonMappingException
     */
    public JsonDeserializer createContextual(DeserializationContext ctx, BeanProperty property) throws JsonMappingException {
        Class rawCls = ctx.getContextualType().getRawClass();
        EnumeratorDeserializer clone = new EnumeratorDeserializer();
        clone.setClz(rawCls);
        return clone;
    }
}

```

## Using JSON with PgSQL

`eq3.2.1+` We want to use jsonb to store JSON data when using PgSQL, and be able to filter/query it. The entity field should be a Java object rather than a String type. How should we handle this? Use `ValueAutoConverter + TypeHandler`.

### Define JSON Interface
```java
public interface JsonObject {
}
```

### Define JSON Data
```java

@Data
public class TopicExtraJson implements JsonObject {
    private Boolean success;
    private Integer age;
    private String code;
    private String name;
}
```

### Add Entity
```java
@Table("t_test_json2")
@Data
@EntityProxy
public class PgTopicJson2 implements ProxyEntityAvailable<PgTopicJson2, PgTopicJson2Proxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    //If not using code-first, you can omit this annotation and database type
    @Column(dbType = "jsonb")
    private TopicExtraJson extraJson;
    //If not using code-first, you can omit this annotation and database type
    @Column(dbType = "jsonb")
    private List<TopicExtraJson> extraJsonArray;
}

```

### JSON Converter
Here we use Jackson, FastJson is similar to the example above.


::: warning Note!!!
> Why are the generics all Object? Because the PGSQL driver serializes to String when writing, but returns PGObject when reading. So using Object for both writing and reading will prevent issues.
:::
```java
//Don't forget to register this component to the eq instance
public class JsonObjectAutoConverter implements ValueAutoConverter<Object, Object> {
    private static final Map<ColumnMetadata, JavaType> cacheMap = new ConcurrentHashMap<>();

    @Override
    public boolean apply(@NotNull Class<?> entityClass, @NotNull Class<Object> propertyType, String property) {
        return FieldUtil.isJsonObjectOrArray(entityClass, propertyType, property);
    }

    @Override
    public Object serialize(Object o, @NotNull ColumnMetadata columnMetadata) {
        if (o == null) {
            return null;
        }
        return JsonUtil.object2JsonStr(o);
    }

    @Override
    public Object deserialize(Object s, @NotNull ColumnMetadata columnMetadata) {
        if (s instanceof PGobject) {
            String value = ((PGobject) s).getValue();
            if (EasyStringUtil.isBlank(value)) {
                return null;
            }

            JavaType filedType = getFiledType(columnMetadata);

            return JsonUtil.jsonStr2Object(value, filedType);
        }
        throw new UnsupportedOperationException("not support");
    }


    private JavaType getFiledType(ColumnMetadata columnMetadata) {
        return EasyMapUtil.computeIfAbsent(cacheMap, columnMetadata, key -> {
            return getFiledType0(key);
        });
    }

    private JavaType getFiledType0(ColumnMetadata columnMetadata) {
        Class<?> entityClass = columnMetadata.getEntityMetadata().getEntityClass();
        Field declaredField = EasyClassUtil.getFieldByName(entityClass, columnMetadata.getPropertyName());
        return JsonUtil.jsonMapper.getTypeFactory()
                .constructType(declaredField.getGenericType());
    }
}

```


### Utility Class
Used to determine whether the current field type is a JSON property.
```java

public class FieldUtil {

    private static final Map<FieldKey, Boolean> cacheMap = new ConcurrentHashMap<>();

    public static boolean isJsonObjectOrArray(Class<?> clazz, Class<?> propertyType, String property) {

        return EasyMapUtil.computeIfAbsent(cacheMap, new FieldKey(clazz, propertyType, property), FieldUtil::isJsonObjectOrArray);
    }

    private static boolean isJsonObjectOrArray(FieldKey fieldKey) {
        if (JsonObject.class.isAssignableFrom(fieldKey.propertyType)) {
            return true;
        }

        if (List.class.isAssignableFrom(fieldKey.propertyType)) {
            Field field = EasyClassUtil.getFieldByName(fieldKey.clazz, fieldKey.property);
            Type genericType = field.getGenericType();

            if (genericType instanceof ParameterizedType) {
                ParameterizedType parameterizedType = (ParameterizedType) genericType;
                Type[] typeArguments = parameterizedType.getActualTypeArguments();

                if (typeArguments.length > 0) {
                    Type elementType = typeArguments[0];
                    if (elementType instanceof Class) {
                        return JsonObject.class.isAssignableFrom((Class<?>) elementType);
                    }
                }
            }
        }
        return false;
    }


    static class FieldKey {
        private final Class<?> clazz;
        private final Class<?> propertyType;
        private final String property;

        FieldKey(Class<?> clazz, Class<?> propertyType, String property) {
            this.clazz = clazz;
            this.propertyType = propertyType;
            this.property = property;
        }

        @Override
        public boolean equals(Object o) {
            if (o == null || getClass() != o.getClass()) return false;
            FieldKey fieldKey = (FieldKey) o;
            return Objects.equals(clazz, fieldKey.clazz) && Objects.equals(property, fieldKey.property);
        }

        @Override
        public int hashCode() {
            return Objects.hash(clazz, property);
        }
    }
}

```

### Override StringTypeHandler
Because JSON is still in string format when the framework retrieves it, `StringTypeHandler` will be chosen when saving.
```java

public class PgSQLStringSupportJsonbTypeHandler implements JdbcTypeHandler {
    public static final PgSQLStringSupportJsonbTypeHandler INSTANCE = new PgSQLStringSupportJsonbTypeHandler();

    @Override
    public Object getValue(JdbcProperty jdbcProperty, StreamResultSet streamResultSet) throws SQLException {
        return streamResultSet.getString(jdbcProperty.getJdbcIndex());
    }

    private void setJsonParameter(EasyParameter parameter) throws SQLException {

        PGobject pGobject = new PGobject();
        pGobject.setType("jsonb");
        pGobject.setValue((String) parameter.getValue());
        parameter.getPs().setObject(parameter.getIndex(), pGobject);
    }

    @Override
    public void setParameter(EasyParameter parameter) throws SQLException {

        JDBCType jdbcType = parameter.getSQLParameter().getJdbcType();
//
        if (jdbcType == JDBCType.JAVA_OBJECT) {
            setJsonParameter(parameter);
        } else {
            boolean json = isJsonOrJsonArray(parameter);
            if (json) {
                setJsonParameter(parameter);
            } else {
                parameter.getPs().setString(parameter.getIndex(), (String) parameter.getValue());
            }
        }
    }

    private boolean isJsonOrJsonArray(EasyParameter parameter) {
        ColumnMetadata columnMetadata = parameter.getSQLParameter().getColumnMetadata();
        if (columnMetadata != null) {
            return FieldUtil.isJsonObjectOrArray(columnMetadata.getEntityMetadata().getEntityClass(), columnMetadata.getPropertyType(), columnMetadata.getPropertyName());
        }
        return false;
    }

}

```

The current `StringTypeHandler` needs to replace the framework's default one.
```java

        JdbcTypeHandlerManager jdbcTypeHandlerManager = runtimeContext.getJdbcTypeHandlerManager();
        jdbcTypeHandlerManager.appendHandler(String.class,PgSQLStringSupportJsonbTypeHandler.INSTANCE,true);
```

### Happy CRUD
Create table structure
```java
        DatabaseCodeFirst databaseCodeFirst = entityQuery.getDatabaseCodeFirst();
        databaseCodeFirst.createDatabaseIfNotExists();
        CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommand(Arrays.asList(PgTopicJson2.class));
        codeFirstCommand.executeWithTransaction(s -> s.commit());
```

Insert data
```java
            PgTopicJson2 topicJson = new PgTopicJson2();
            topicJson.setId("1");
            topicJson.setName("Name");
            {

                TopicExtraJson topicExtraJson = new TopicExtraJson();
                topicExtraJson.setSuccess(true);
                topicExtraJson.setCode("200");
                topicExtraJson.setAge(18);
                topicJson.setExtraJson(topicExtraJson);
            }
            ArrayList<TopicExtraJson> topicExtraJsons = new ArrayList<>();
            {

                TopicExtraJson topicExtraJson = new TopicExtraJson();
                topicExtraJson.setSuccess(true);
                topicExtraJson.setName("Jack");
                topicExtraJson.setCode("202");
                topicExtraJson.setAge(18);
                topicExtraJsons.add(topicExtraJson);
            }
            {

                TopicExtraJson topicExtraJson = new TopicExtraJson();
                topicExtraJson.setSuccess(false);
                topicExtraJson.setName("Tom");
                topicExtraJson.setCode("200");
                topicExtraJson.setAge(20);
                topicExtraJsons.add(topicExtraJson);
            }
            topicJson.setExtraJsonArray(topicExtraJsons);
            entityQuery.insertable(topicJson).executeRows();
```

Query and filter

`asJSONObject()` processes the field in JSONObject mode. Users can get a specific property. If the property is an object, you can use `.asJSONObject().getJSONObject("user").getString("name").eq("Xiao Ming")`. If the node is a `JSONArray`, use `getJSONArray`.
```java

List<Draft1<Boolean>> list1 = entityQuery.queryable(PgTopicJson2.class)
        .where(t -> {
            t.extraJson().asJSONObject().getBoolean("success").eq(true);
        }).select(t -> Select.DRAFT.of(
                t.extraJson().asJSONObject().getBoolean("success")
        )).toList();



List<PgTopicJson2> ages = entityQuery.queryable(PgTopicJson2.class)
        .where(t -> {
            t.extraJson().asJSONObject().getInteger("age").eq(18);
        }).toList();



List<PgTopicJson2> ages = entityQuery.queryable(PgTopicJson2.class)
        .where(t -> {
            t.extraJsonArray().asJSONArray().getJSONObject(0).getString("name").eq("Jack");
        }).toList();
```

Define VO for mapping query
```java

@Data
public class TopicJson2VO {
    private String id;
    private String name;
    private TopicExtraJson extraJson;
    private List<TopicExtraJson> extraJsonArray;
}

List<TopicJson2VO> ages = entityQuery.queryable(PgTopicJson2.class)
        .where(t -> {
            t.extraJsonArray().asJSONArray().getJSONObject(0).getString("name").eq("Jack");
        }).select(TopicJson2VO.class).toList();
```
