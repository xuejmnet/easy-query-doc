---
title: 自定义TypeHandler
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


## 如何添加

- 首先创建自己的JdbcTypeHandler
- 启动时进行替换
```java

JdbcTypeHandlerManager jdbcTypeHandlerManager = easyQuery.getRuntimeContext().getJdbcTypeHandlerManager();
jdbcTypeHandlerManager.appendHandler(CustomPropertyType.class,new CustomPropertyTypeHandler(),true);
```

## 指定列添加
```java
public class User{
    @Column(typeHandler = CustomPropertyTypeHandler.class)
    private CustomPropertyType name;
}
```