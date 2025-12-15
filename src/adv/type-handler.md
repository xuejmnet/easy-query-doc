---
title: 自定义TypeHandler
order: 110
---

## JdbcTypeHandlerManager
方法  | 描述  
--- | --- 
appendHandler |  参数1:指定需要处理的类型,参数2:具体的处理`typeHandler`,参数3:是否需要替换掉原先的如果原先的存在的话
getHandler |  根据类型获取对应的`typeHandler`处理器
getHandlerByHandlerClass |  根据`TypeHandler`类型获取对应的`typeHandler`处理器



## JdbcTypeHandler
方法  | 描述  
--- | --- 
getValue |  获取对应的结果
setParameter |  设置jdbc参数


## JdbcTypeHandlerReplaceConfigurer
方法  | 描述  
--- | --- 
replace |  是否替换如果已经存在
allowTypes |  `Set<Class<?>>`能够被替换的类型有哪些



## 如何添加

### 手动添加
- 首先创建自己的JdbcTypeHandler
- 启动时进行替换
```java

JdbcTypeHandlerManager jdbcTypeHandlerManager = easyQuery.getRuntimeContext().getJdbcTypeHandlerManager();
jdbcTypeHandlerManager.appendHandler(CustomPropertyType.class,new CustomPropertyTypeHandler(),true);
```

### 自动添加
自动添加仅springboot下有效,我们在实现`JdbcTypeHandler`的同时也额外实现一个接口`JdbcTypeHandlerReplaceConfigurer`

```java
@Component //springboot添加该类型即可
public class CustomPropertyTypeHandler implements JdbcTypeHandler, JdbcTypeHandlerReplaceConfigurer{
    //省略
}
```



## 指定列添加
```java
public class User{
    @Column(typeHandler = CustomPropertyTypeHandler.class)
    private CustomPropertyType name;
}
```


## 高级设置TypeHandler
如果你希望java的bean使用String类型但是存储到数据库使用jsonb类型，那么在pgsql下我们可能对parameter的set要进行特殊处理，可以通过替换StringTypeHandler来实现对应的功能

### 定义java bean
```java

@Table("t_test_json")
@Data
@EntityProxy
public class PgTopicJson implements ProxyEntityAvailable<PgTopicJson, PgTopicJsonProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    @Column(dbType = "jsonb",jdbcType = JDBCType.JAVA_OBJECT)//标记为JAVA_OBJECT
    private String extraJson;
    @Column(dbType = "jsonb",jdbcType = JDBCType.JAVA_OBJECT)
    private String extraJsonArray;
}

```

### 改写TypeHandler
```java

public class PgSQLStringSupportJsonbTypeHandler implements JdbcTypeHandler {
    public static final PgSQLStringSupportJsonbTypeHandler INSTANCE = new PgSQLStringSupportJsonbTypeHandler();

    @Override
    public Object getValue(JdbcProperty jdbcProperty, StreamResultSet streamResultSet) throws SQLException {
        return streamResultSet.getString(jdbcProperty.getJdbcIndex());
    }

    @Override
    public void setParameter(EasyParameter parameter) throws SQLException {

        JDBCType jdbcType = parameter.getSQLParameter().getJdbcType();
        if (jdbcType == JDBCType.JAVA_OBJECT) {
            PGobject pGobject = new PGobject();
            pGobject.setType("jsonb");
            pGobject.setValue((String) parameter.getValue());
            parameter.getPs().setObject(parameter.getIndex(), pGobject);
        }else{
            parameter.getPs().setString(parameter.getIndex(), (String)parameter.getValue());
        }
    }
}
```
当然用户也可以通过第二种方式，先定义注解,然后添加标记
```java

@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD})
public @interface Jsonb {

}


@Table("t_test_json")
@Data
@EntityProxy
public class PgTopicJson implements ProxyEntityAvailable<PgTopicJson, PgTopicJsonProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    @Jsonb
    private String extraJson;
    @Jsonb
    private String extraJsonArray;
}
```
然后重写`StringTypeHandler`
```java

public class PgSQLStringSupportJsonbTypeHandler implements JdbcTypeHandler {
    public static final PgSQLStringSupportJsonbTypeHandler INSTANCE = new PgSQLStringSupportJsonbTypeHandler();

    @Override
    public Object getValue(JdbcProperty jdbcProperty, StreamResultSet streamResultSet) throws SQLException {
        return streamResultSet.getString(jdbcProperty.getJdbcIndex());
    }

    @SneakyThrows
    @Override
    public void setParameter(EasyParameter parameter) throws SQLException {
        ColumnMetadata columnMetadata = parameter.getSQLParameter().getColumnMetadata();
        //可能有性能问题自行缓存解决
        Field field = columnMetadata.getEntityMetadata().getEntityClass().getField(columnMetadata.getPropertyName());
        Jsonb jsonb = field.getAnnotation(Jsonb.class);

        if (jsonb!=null) {
            PGobject pGobject = new PGobject();
            pGobject.setType("jsonb");
            pGobject.setValue((String) parameter.getValue());
            parameter.getPs().setObject(parameter.getIndex(), pGobject);
        }else{
            parameter.getPs().setString(parameter.getIndex(), (String)parameter.getValue());
        }
    }
}
```