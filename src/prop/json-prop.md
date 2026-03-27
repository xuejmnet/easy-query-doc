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



::: warning 说明!!!
> 如果你是PgSQL并且希望存储jsonb,java字段使用`object`并且同时支持`jsonObject`和`jsonArray`可以[查看该issue](https://github.com/dromara/easy-query/issues/462)
:::



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

### snack4

以下示例由网友提供,可以参考或参考fastJson2的`JsonConverter`
```java

/**
 * @author airhead
 */
public class JsonConverter implements ValueConverter<Object, Object> {
  private static final Map<ColumnMetadata, Type> CACHE_MAP = new ConcurrentHashMap<>();

  @Override
  public Object serialize(Object o, ColumnMetadata columnMetadata) {
    if (o == null) {
      return null;
    }

    return ONode.serialize(o);
  }

  @Override
  public Object deserialize(Object s, ColumnMetadata columnMetadata) {
    if (s == null) {
      return null;
    }

    if (s instanceof String str) {
      return getObject(columnMetadata, str);
    }

    if (s instanceof byte[]) {
      String str = new String((byte[]) s, StandardCharsets.UTF_8);
      return getObject(columnMetadata, str);
    }

    return null;
  }

  private @Nullable Object getObject(ColumnMetadata columnMetadata, String str) {
    if (EasyStringUtil.isBlank(str)) {
      return null;
    }

    // 如果是带引号的 JSON 字符串，先解析成普通字符串
    if (str.startsWith("\"") && str.endsWith("\"")) {
      str = ONode.deserialize(str, String.class);
    }

    return ONode.deserialize(str, getFiledType(columnMetadata));
  }

  private Type getFiledType(ColumnMetadata columnMetadata) {
    return EasyMapUtil.computeIfAbsent(CACHE_MAP, columnMetadata, this::getFiledType0);
  }

  private Type getFiledType0(ColumnMetadata columnMetadata) {
    Class<?> entityClass = columnMetadata.getEntityMetadata().getEntityClass();
    Field declaredField =
        EasyClassUtil.getFieldByName(entityClass, columnMetadata.getPropertyName());
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
       // 给Module 添加一个序列化器
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
            throw new JsonSerialException("非法枚举值[" + EasyClassUtil.getSimpleName(clz) + "]:[" + parserText + "]");
        }

        return null;
    }

    /**
     * 获取合适的解析器，把当前解析的属性Class对象存起来，以便反序列化的转换类型，为了避免线程安全问题，每次都new一个（通过threadLocal来存储更合理）
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

## pgsql使用json

`eq3.2.1+`我们希望在使用pgsql的时候使用jsonb存储json数据，并且可以进行筛选，并且实体对应的字段是java对象而不是String类型，那么我们应该如何处理呢`ValueAutoConverter + TypeHandler`
### 定义json接口
```java
public interface JsonObject {
}
```

### 定义json数据
```java

@Data
public class TopicExtraJson implements JsonObject {
    private Boolean success;
    private Integer age;
    private String code;
    private String name;
}
```

### 新增实体
```java
@Table("t_test_json2")
@Data
@EntityProxy
public class PgTopicJson2 implements ProxyEntityAvailable<PgTopicJson2, PgTopicJson2Proxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    //如果不使用code-first那么可以不添加该注解和数据库类型
    @Column(dbType = "jsonb")
    private TopicExtraJson extraJson;
    //如果不使用code-first那么可以不添加该注解和数据库类型
    @Column(dbType = "jsonb")
    private List<TopicExtraJson> extraJsonArray;
}

```

### json转换器
这边是jackson，fastjson就用上面的其实是一样的


::: warning 说明!!!
> 泛型为什么都是Object是因为PGSQL的驱动写入时序列化成String,但是读取的时候是PGObject,所以写入和读取都是用Object就不会有问题
:::
```java
//别忘了当前组件需要注册到eq实例里面
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


### 工具类
用来判断当前类型的字段是否是json属性
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

### 重写StringTypeHandler
因为json到最后框架获取到的还是字符串格式，所以保存的时候会选择`StringTypeHandler`
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

当前`StringTypeHandler`需要替换掉框架默认的
```java

        JdbcTypeHandlerManager jdbcTypeHandlerManager = runtimeContext.getJdbcTypeHandlerManager();
        jdbcTypeHandlerManager.appendHandler(String.class,PgSQLStringSupportJsonbTypeHandler.INSTANCE,true);
```

### 愉快地CRUD
创建表结构
```java
        DatabaseCodeFirst databaseCodeFirst = entityQuery.getDatabaseCodeFirst();
        databaseCodeFirst.createDatabaseIfNotExists();
        CodeFirstCommand codeFirstCommand = databaseCodeFirst.syncTableCommand(Arrays.asList(PgTopicJson2.class));
        codeFirstCommand.executeWithTransaction(s -> s.commit());
```

插入数据
```java
            PgTopicJson2 topicJson = new PgTopicJson2();
            topicJson.setId("1");
            topicJson.setName("名称");
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

查询筛选

`asJSONObject()`将字段以JSONObject模式进行处理，用户可以获取某个属性，如果该属性是对象则可以使用`.asJSONObject().getJSONObject("user").getString("name").eq("小明")`，如果该节点是`JSONArray`就通过`getJSONArray`
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

定义VO进行映射查询
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