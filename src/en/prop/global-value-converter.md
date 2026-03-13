---
title: Global Value Converter
order: 100
---

`eq 3.1.72+` supports `Global Value Conversion` using `ValueAutoConverterProvider` + `ValueAutoConverter`. The difference from regular `ValueConverter` is that you don't need to add `@Column(conversion=xxxxx.class)` to each property. Of course, if you add `@Column(conversion=xxxxx.class)` to a field, the field-level configuration takes precedence.


## ValueAutoConverterProvider
Users can customize which types the framework should recognize as needing globally registered `ValueAutoConverter`.

Interface  | Function  
---  | --- 
isSupport  | Whether the current type supports `ValueAutoConverter`

Default implementation:
```java

public class DefaultValueAutoConverterProvider implements ValueAutoConverterProvider{
    @Override
    public boolean isSupport(@NotNull Class<?> clazz, @NotNull Class<?> propertyType) {
        return Enum.class.isAssignableFrom(propertyType) || !EasyClassUtil.isBasicType(propertyType);
    }
}

```

The default Provider behavior already excludes all non-basic types, and enum types are fully supported. If you think the default method scope is too broad and you want to control which types are registered yourself, you can use the following approach by using interface markers to register only specific types as global.

::: warning Note!!!
> If not needed, you don't need to implement the `ValueAutoConverterProvider` interface
:::


## ValueAutoConverter
Can register value converters as global converters.

## Practice
For most types like `Json properties`, you would need to add class support in `ValueAutoConverterProvider` for each class. So we can add an interface to mark types that need to be used by the globally registered value converter.
```java
public interface IAutoRegister {
}
```
Override `ValueAutoConverterProvider` - but actually we don't need to override this interface, because basic types and enum types are already excluded, so other properties will enter the default `ValueAutoConverterProvider`.
```java

// public class MyValueAutoConverterProvider implements ValueAutoConverterProvider {
//     @Override
//     public boolean isSupport(@NotNull Class<?> clazz, @NotNull Class<?> propertyType) {
//         return Enum.class.isAssignableFrom(propertyType)
//                 || IAutoRegister.class.isAssignableFrom(propertyType);
//     }
// }
```
Replace framework service:
```java
replaceService(ValueAutoConverterProvider.class,MyValueAutoConverterProvider.class)
```

::: tip Note!!!
> Actually, we don't need to override this service, this is just for demonstration
:::

Custom class:
```java
public class EnumFlag<T extends Enum> implements IAutoRegister{
    //省略
}



public class Entity{

    private EnumFlag<SexEnum> sex;
}
```
This way we don't need to add `@Column(conversion=xxxxx.class)` additionally.
