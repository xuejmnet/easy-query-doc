---
title: 简单数据库函数属性
---

# 背景
简单数据库函数属性是针对`ColumnValueSQLConverter`的一种简单实现,不需要注册主键等相关信息,当然仅适合哪种无需特殊定制且没有复杂动态需求的业务需求


::: warning 说明!!!
> 当前模式是一种简易的表达式,但是无法适配多个数据库,所以还是建议如果有条件那么还是使用`ColumnValueSQLConverter`来做数据库函数属性
:::

## 接口
`@Column(sqlExpression=@ColumnSQLExpression(....))`


属性  | 默认值| 关键字处理
--- | --- | --- 
sql | "" | sql模板,为空表示不生效
realColumn | false | 表示当前不是一个数据库的真实列
args | [] | 模板参数类型`ExpressionArg`


ExpressionArg



属性  | 默认值| 关键字处理
--- | --- | --- 
prop | "" | 属性名当val值和ignoreVal值一样则使用prop作为参数入参
val | "" | 变量的string形式的表示,当val值和ignoreVal值一样则使用prop作为参数入参,`0,1,true,false`均可表示`Boolean`类型
ignoreVal | "" | 因为`prop`和`val`在当前表达式内选其一,比如`ignoreVal="-1"`那么当`val="-1"`时`val`被认为用户需要忽略的所以表达式会使用`prop`
valType | String.class | val值的字符串形式转成对应的基本类型(仅支持基本类型)

## 案例
```java

@Data
@Table("t_user_extra")
@EntityProxy
public class UserExtra2 implements ProxyEntityAvailable<UserExtra2, UserExtra2Proxy> {
    @Column(primaryKey = true)
    private String id;
    private String firstName;
    private String lastName;
    private LocalDateTime birthday;
    @InsertIgnore
    @UpdateIgnore
    @Column(sqlExpression = @ColumnSQLExpression(sql="CONCAT({0},{1})",args = {
            @ExpressionArg(prop = "firstName"),
            @ExpressionArg(prop = "lastName"),
    }))
    private String fullName;

    @InsertIgnore
    @UpdateIgnore
    @Column(sqlConversion = UserAgeColumnValueSQLConverter.class)
    private Integer age;
}




List<UserExtra2> list = easyEntityQuery.queryable(UserExtra2.class)
        .where(u -> {
            u.fullName().like("123");
            u.fullName().in(Arrays.asList("1", "2"));
            u.age().gt(12);
        })
        .toList();



==> Preparing: SELECT `id`,`first_name`,`last_name`,`birthday`,CONCAT(`first_name`,`last_name`) AS `full_name`,CEILING((timestampdiff(DAY, `birthday`, NOW()) / ?)) AS `age` FROM `t_user_extra` WHERE CONCAT(`first_name`,`last_name`) LIKE ? AND CONCAT(`first_name`,`last_name`) IN (?,?) AND CEILING((timestampdiff(DAY, `birthday`, NOW()) / ?)) > ?
==> Parameters: 365(Integer),%123%(String),1(String),2(String),365(Integer),12(Integer)
<== Time Elapsed: 6(ms)
<== Total: 0
```