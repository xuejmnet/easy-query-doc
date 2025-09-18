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