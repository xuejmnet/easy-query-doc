---
title: Include Query Ignore Special Values
order: 70
---
`eq`'s `include` and `selectAutoInclude` currently both perform secondary queries based on relationship keys, but the system may have values like `""`, `"_"`, `"-"`, `"/"` which the system does not need to associate by default.


## Ignore Associated Query Values
`eq` default associated query uses the value of `selfProperty` to perform secondary associated query on the target property's table. By default, if the value of `selfProperty` is `null`, the target property will not be queried again. Sometimes our database may have other values that are equivalent to null in terms of representation, such as the string `-`, `/`, or empty string. For secondary queries, this is actually meaningless. So how should we replace to let the framework support it?

The content of this time is mainly in [this link](https://github.com/dromara/easy-query/issues/302)

First we need to replace the `RelationNullValueValidator` interface

Method  | Function
--- | --- 
isNullValue | Returns whether this object is a null value that needs to be ignored

Let's look at its default implementation `DefaultRelationNullValueValidator`
```java
public class DefaultRelationNullValueValidator implements RelationNullValueValidator {
    @Override
    public boolean isNullValue(Object value) {
        if (Objects.isNull(value)) {
            return true;
        }
        if (value instanceof String) {
            if (EasyStringUtil.isBlank((String) value)) {
                return true;
            }
        }
        return false;
    }
}

```
### Replacement
We need to replace the `isNullValue` method of `RelationNullValueValidator` with our own
```java

public class MyRelationNullValueValidator implements RelationNullValueValidator {
    @Override
    public boolean isNullValue(Object value) {
        if (Objects.isNull(value)) {
            return true;
        }
        if (value instanceof String) {
            if (EasyStringUtil.isBlank((String) value)) {
                return true;
            }
            if (Objects.equals("-", value) || Objects.equals("/", value)) {
                return true;
            }
        }
        return false;
    }
}



```

### Finally Replace the Service
```java
replaceService(RelationNullValueValidator.class, MyRelationNullValueValidator.class)
```

For more details, please check [Associated Query](/easy-query-doc/en/include/fetcher)

