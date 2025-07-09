---
title: Include查询忽略特殊值
order: 70
---
`eq`的`include`和`selectAutoInclude`目前均以关联关系键二次查询,但是系统可能会存在`""、“_”、“-”、"/"`这种系统默认不需要关联关系的值


## 忽略关联查询的value
`eq`默认关联查询是使用`selfProperty`的值对目标属性的表进行二次关联查询,默认情况下`selfProperty`的值为`null`则不会对目标属性进行再次查询,那么有时候我们数据库可能存在其他值，在表现形式上等同于null，比如字符串`-`,`/`,或者空字符串,那么对于二次查询其实没有任何意义,那么我们应该如何去替换让框架支持呢。

这次的内容主要在[这个连接中](https://github.com/dromara/easy-query/issues/302)

首先我们需要替换`RelationNullValueValidator`这个接口

方法  | 作用
--- | --- 
isNullValue | 返回这个对象是否是空值需要被忽略

我们再来看其默认实现`DefaultRelationNullValueValidator`
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
### 替换
我们需要对`RelationNullValueValidator`的`isNullValue`方法进行替换成我们自己的
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

### 最后替换服务即可
```java
replaceService(RelationNullValueValidator.class, MyRelationNullValueValidator.class)
```

更多细节请查看[关联查询](/easy-query-doc/include/fetcher)