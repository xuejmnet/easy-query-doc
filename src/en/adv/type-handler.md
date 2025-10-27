---
title: Custom TypeHandler
order: 110
---

## JdbcTypeHandlerManager
Method  | Description  
--- | --- 
appendHandler |  Parameter 1: Specify the type to be processed, Parameter 2: Specific `typeHandler` processing, Parameter 3: Whether to replace the original one if it exists
getHandler |  Get the corresponding `typeHandler` processor according to type
getHandlerByHandlerClass |  Get the corresponding `typeHandler` processor according to `TypeHandler` type



## JdbcTypeHandler
Method  | Description  
--- | --- 
getValue |  Get the corresponding result
setParameter |  Set JDBC parameters


## JdbcTypeHandlerReplaceConfigurer
Method  | Description  
--- | --- 
replace |  Whether to replace if it already exists
allowTypes |  `Set<Class<?>>` What types can be replaced



## How to Add

### Manually Add
- First create your own JdbcTypeHandler
- Replace during startup
```java

JdbcTypeHandlerManager jdbcTypeHandlerManager = easyQuery.getRuntimeContext().getJdbcTypeHandlerManager();
jdbcTypeHandlerManager.appendHandler(CustomPropertyType.class,new CustomPropertyTypeHandler(),true);
```

### Automatically Add
Automatic addition is only effective under spring-boot. While implementing `JdbcTypeHandler`, we also implement an additional interface `JdbcTypeHandlerReplaceConfigurer`

```java
@Component //Add this type for spring-boot
public class CustomPropertyTypeHandler implements JdbcTypeHandler, JdbcTypeHandlerReplaceConfigurer{
    //Omitted
}
```



## Add to Specific Column
```java
public class User{
    @Column(typeHandler = CustomPropertyTypeHandler.class)
    private CustomPropertyType name;
}
```

