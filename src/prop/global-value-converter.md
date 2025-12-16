---
title: 全局值转换
order: 100
---

`eq 3.1.72+`版本支持`全局值转换`使用`ValueAutoConverterProvider`+`ValueAutoConverter`，和普通的`ValueConverter`区别为不需要每次在对应的属性上面添加`@Column(conversion=xxxxx.class)`,当然如果你在字段上添加了`@Column(conversion=xxxxx.class)`那么以添加的为主


## ValueAutoConverterProvider
用户可以自定义让框架感知哪些类型需要使用全局注册的`ValueAutoConverter`

接口  | 功能  
---  | --- 
isSupport  | 当前类型是否支持`ValueAutoConverter`

默认实现如下
```java

public class DefaultValueAutoConverterProvider implements ValueAutoConverterProvider{
    @Override
    public boolean isSupport(@NotNull Class<?> clazz, @NotNull Class<?> propertyType) {
        return Enum.class.isAssignableFrom(propertyType);
    }
}

```


## ValueAutoConverter
可以将值转换器注册为全局

## 实践
对于大部分类型比如`Json属性`对于每一个class都需要在`ValueAutoConverterProvider`处添加class的支持，所以我们可以添加一个接口来标识当前类型为需要被全局注册的值转换器使用的
```java
public interface IAutoRegister {
}
```
重写`ValueAutoConverterProvider`
```java

public class MyValueAutoConverterProvider implements ValueAutoConverterProvider {
    @Override
    public boolean isSupport(@NotNull Class<?> clazz, @NotNull Class<?> propertyType) {
        return Enum.class.isAssignableFrom(propertyType)
                || IAutoRegister.class.isAssignableFrom(propertyType);
    }
}
```
替换框架服务
```java
replaceService(ValueAutoConverterProvider.class,MyValueAutoConverterProvider.class)
```
自定义class
```java
public class EnumFlag<T extends Enum> implements IAutoRegister{
    //省略
}



public class Entity{

    private EnumFlag<SexEnum> sex;
}
```
这样我们就不需要额外添加`@Column(conversion=xxxxx.class)`