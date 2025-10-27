---
title: Object to Database Column Mapping Rules
order: 60
---

# Object to Database Column Mapping Rules
`eq` provides ways to map Java properties to database columns: `nameConversion` (recommended🔥) and the annotation `@Column`

Why provide this functionality? Because by default, we consider Java properties to be in lower camel case, meaning the `userAge` pattern where the first letter is lowercase and the first letter of each subsequent word is uppercase

## Column
The annotation's value attribute can map entity properties to corresponding database names, but this method is fixed and cannot dynamically map according to the default conventions of各databases
```java
@Column(value="user_age")
private Integer userAge;
```

## NameConversion

Method  | Purpose
---  | --- 
convert | Used to convert property names or class names to database table names or column names
annotationCovert | Since annotation @Table("t_user") hardcodes the table name in lowercase, to adapt one set of code to multiple databases where some places may have uppercase, you can implement this method yourself and replace the framework's default implementation


The process is as follows

Read field name or column name -> Check if there's `@Column` or `@Table` -> Convert the internal `value` or field name/class name to column name or table name through the `convert` method -> Finally convert once more through `annotationCovert` to get what's needed, default is no processing

Interface supports default Java property to database column name conversion

Conversion results when default Java properties are in lower camel case:


property  | nameConversion | column  
---  | --- | --- 
userAge  | DefaultNameConversion | userAge
userAge  | UnderlinedNameConversion | user_age
userAge  | UpperUnderlinedNameConversion | USER_AGE
userAge  | LowerCamelCaseNameConversion | userAge
userAge  | UpperCamelCaseNameConversion | UserAge

```log
property:userAge-->conversion:DefaultNameConversion-->column:userAge
property:userAge-->conversion:UnderlinedNameConversion-->column:user_age
property:userAge-->conversion:UpperUnderlinedNameConversion-->column:USER_AGE
property:userAge-->conversion:LowerCamelCaseNameConversion-->column:userAge
property:userAge-->conversion:UpperCamelCaseNameConversion-->column:UserAge
```


::: tip Note!!!
> If the default conversions cannot meet your needs, you can customize `NameConversion` to [replace the framework's default interface](/easy-query-doc/en/framework/replace-configure)
:::

