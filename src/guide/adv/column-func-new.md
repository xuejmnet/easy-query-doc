---
title: 自定义数据库函数(新)
---

# 自定义数据库函数
目前框架未提供相应的数据库函数,仅提供了count,sum,min,max等
```sql
SELECT t.`id` FROM `t_topic` t WHERE t.`id` = ? AND FIND_IN_SET(?,t.`id`)
```
假如我们要实现这么一个数据库语句,那么我们应该如何实现,接下来我们将使用`easy-query`的`sqlNativeSegment`封装和`sqlFunc`和`sqlFuncAs`能力实现单列的数据库函数

## FIND_IN_SET编写


### sqlNativeSegment封装
```java
//创建一个mysql的方言提供者
public interface MySQLProvider<T> {
    //因为是在where处所以这边获取属性的`WherePredicate`如果是lambda则获取`SQLWherePredicate`
    WherePredicate<T> getWherePredicate();

    default MySQLProvider<T> findInSet(SQLExpression1<SQLNativePropertyExpressionContext> first, SQLExpression1<SQLNativePropertyExpressionContext> second){
        getWherePredicate().sqlNativeSegment("FIND_IN_SET({0},{1})",c->{
            first.apply(c);
            second.apply(c);
        });
        return this;
    }
}

//实现类
public class MySQLProviderImpl<T> implements MySQLProvider<T> {

    private final WherePredicate<T> wherePredicate;

    public MySQLProviderImpl(WherePredicate<T> wherePredicate){

        this.wherePredicate = wherePredicate;
    }

    @Override
    public WherePredicate<T> getWherePredicate() {
        return wherePredicate;
    }
}


 String sql1 = easyQueryClient.queryable(Topic.class)
                .where(o -> {
                    o.eq("id", "1");
                    MySQLProviderImpl<Topic> mySQLProvider = new MySQLProviderImpl<>(o);
                    mySQLProvider.findInSet(c->c.value("1"),c->c.expression("id"));
                })
                .select(String.class, o -> o.column("id")).toSQL();
Assert.assertEquals("SELECT t.`id` FROM `t_topic` t WHERE t.`id` = ? AND FIND_IN_SET(?,t.`id`)", sql1);


//强类型表达式可以选择这种模式
public interface MySQLLambdaProvider<T> {
    SQLWherePredicate<T> getSQLWherePredicate();
    default MySQLLambdaProvider<T> findInSet(SQLExpression1<SQLNativeLambdaExpressionContext<T>> first, SQLExpression1<SQLNativeLambdaExpressionContext<T>> second){
        getSQLWherePredicate().sqlNativeSegment("FIND_IN_SET({0},{1})",c->{
            first.apply(c);
            second.apply(c);
        });
        return this;
    }
}

//强类型实现类
public class MySQLLambdaProviderImpl<T> implements MySQLLambdaProvider<T>{
    private final SQLWherePredicate<T> sqlWherePredicate;

    public MySQLLambdaProviderImpl(SQLWherePredicate<T> sqlWherePredicate){
        this.sqlWherePredicate = sqlWherePredicate;
    }
    @Override
    public SQLWherePredicate<T> getSQLWherePredicate() {
        return sqlWherePredicate;
    }
}

String sql1 = easyQuery.queryable(Topic.class)
                .where(o -> {
                    o.eq(Topic::getId, "1");
                    MySQLLambdaProviderImpl<Topic> mySQLProvider = new MySQLLambdaProviderImpl<>(o);
                    mySQLProvider.findInSet(c->c.value("1"),c->c.expression(Topic::getId));
                })
                .select(String.class, o -> o.column(Topic::getId)).toSQL();
Assert.assertEquals("SELECT t.`id` FROM `t_topic` t WHERE t.`id` = ? AND FIND_IN_SET(?,t.`id`)", sql1);

```

如果你不想使用封装的方法可以使用原生的`sqlNativeSegment`
```java

String sql1 = easyQueryClient.queryable(Topic.class)
        .where(o -> {
            o.eq("id", "1");
            o.sqlNativeSegment("FIND_IN_SET({0},{1})",c->{
                c.value("1").expression("id");
            });
        })
        .select(String.class, o -> o.column("id")).toSQL();
Assert.assertEquals("SELECT t.`id` FROM `t_topic` t WHERE t.`id` = ? AND FIND_IN_SET(?,t.`id`)", sql1);
```