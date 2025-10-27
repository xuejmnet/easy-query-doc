---
title: Simple Database Function Properties
order: 5
category:
  - sql
---

# Background
Simple database function properties are a simple implementation of `ColumnValueSQLConverter`, which does not require registering primary keys and other related information. Of course, it is only suitable for business requirements that do not require special customization and do not have complex dynamic requirements


::: warning Notice!!!
> The current mode is a simple expression, but cannot adapt to multiple databases, so it is still recommended that if you have the conditions, then still use `ColumnValueSQLConverter` for database function properties
:::

## Interface
`@Column(sqlExpression=@ColumnSQLExpression(....))`


Property  | Default Value| Keyword Handling
--- | --- | --- 
sql | "" | SQL template, if empty means not effective
realColumn | false | Indicates that the current is not a real column in the database
args | [] | Template parameter type `ExpressionArg`


ExpressionArg



Property  | Default Value| Keyword Handling
--- | --- | --- 
prop | "" | Property name, when val value and ignoreVal value are the same, use prop as parameter input
val | "" | String representation of the variable, when val value and ignoreVal value are the same, use prop as parameter input, `0,1,true,false` can all represent `Boolean` type
ignoreVal | "" | Because `prop` and `val` choose one within the current expression, such as `ignoreVal="-1"`, then when `val="-1"`, `val` is considered to be ignored by the user, so the expression will use `prop`
valType | String.class | Convert the string form of the val value to the corresponding basic type (only supports basic types)

## Example
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

