---
title: 自定义数据库函数(旧)
---

# 自定义数据库函数
目前框架未提供相应的数据库函数,仅提供了count,sum,min,max等

::: warning 说明!!!
> 目前不是很建议看这一章节,因为当前的函数设计只适合单个属性的处理,并且过于繁琐,所以建议使用`sqlNativeSegment`或者`SqlFunction`来实现数据库方言自定义
:::
[`sqlNativeSegment`](/easy-query-doc/guide/query/native-sql)

[`自定义数据库函数(新)`](/easy-query-doc/guide/adv/column-func-new)
<!-- [`SqlFunction`]() -->

```sql
SELECT IFNULL(t.`url`,'') AS `url` FROM `t_blog` t WHERE t.`deleted` = ?
```
假如我们要实现这么一个数据库语句,那么我们应该如何实现,接下来我们将使用`easy-query`的`column-func`能力实现单列的数据库函数

## IFNULL编写

### ColumnPropertyFunction
easy-qeury 的column func接口

方法  | 参数/返回结果 | 说明  
--- | --- | --- 
getColumnFunction | 参数无,返回结果为`ColumnFunction`接口  | 用来获取具体的列方法
getPropertyName | 参数无,返回结果为属性名也就是列所对应的属性  | 用来获取针对那个属性进行方法处理

### ColumnFunction

方法  | 参数/返回结果 | 说明  
--- | --- | --- 
getFuncColumn | 参数:列名(添加方言了的),返回结果为数据库片段  | 用来包装数据库片段
getAggregationType | 参数无,返回结果为当前方法的聚合类型 | 针对分表分库时有效


```java

public class IFNULLColumnFunction implements ColumnFunction {
    private final Object value;

    public IFNULLColumnFunction(Object value){
        if(value==null){
            throw new IllegalArgumentException("IFNULLColumnFunction value is null");
        }
        this.value = value;
    }
    @Override
    public String getFuncColumn(String column) {
        if(value instanceof  String){
            String valueString = value.toString();
            if(EasyStringUtil.isBlank(valueString)){
                return String.format("IFNULL(%s,'')", column);
            }
            return String.format("IFNULL(%s,'%s')", column, valueString);
        }
        return String.format("IFNULL(%s,%s)", column, value.toString());
    }

    @Override
    public AggregationType getAggregationType() {
        return AggregationType.UNKNOWN;
    }
}

//创建一个mysql的属性方法包装
public final class MyColumnPropertyFunction implements ColumnPropertyFunction {
    private final String propertyName;
    private final ColumnFunction columnFunction;

    public MyColumnPropertyFunction(String propertyName, ColumnFunction columnFunction){

        this.propertyName = propertyName;
        this.columnFunction = columnFunction;
    }
    @Override
    public ColumnFunction getColumnFunction() {
        return columnFunction;
    }

    @Override
    public String getPropertyName() {
        return propertyName;
    }
}

public class SQLFunc{
    public static <T, R> ColumnPropertyFunction ifNULL(Property<T, R> column) {
        String propertyName = EasyLambdaUtil.getPropertyName(column);
        return new MyColumnPropertyFunction(propertyName, new IFNULLColumnFunction(""));
    }
}


Queryable<BlogEntityTest> queryable = easyQuery.queryable(BlogEntity.class)
                    .select(BlogEntityTest.class, o -> o.columnFuncAs(SQLFunc.ifNULL(BlogEntity::getUrl), BlogEntityTest::getUrl));
String sql = queryable.toSQL();

// SELECT IFNULL(t.`url`,'') AS `url` FROM `t_blog` t WHERE t.`deleted` = ?
```

当然您还可以随意扩展
```java
//ifnull额外参数等
public static <T, R> ColumnPropertyFunction ifNULLOrDefault(Property<T, R> column,Object value) {
        String propertyName = EasyLambdaUtil.getPropertyName(column);
        return new MyColumnPropertyFunction(propertyName, new IFNULLColumnFunction(value));
}
```



::: warning 说明!!!
> `ColumnPropertyFunction`、`ColumnFunction`的组合仅支持单个数据库列字段的处理,如果需要支持多个数据库字段,请看[《自定义数据库片段》](/easy-query-doc/guide/adv/sql-segment)
:::