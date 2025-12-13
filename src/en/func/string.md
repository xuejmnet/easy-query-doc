---
title: String Functions
order: 20
---

`String functions` refer to special functions owned by string types


## concat | stringFormat
Functions used to describe string concatenation

- `concat` supports linking two parameters through a function to achieve string-level connection, such as `"a"+"b"`
- `stringFormat` supports connecting multiple parameters through string templates and supports parameter reuse

Database  | Dialect  
---  | --- 
MySQL  | `CONCAT`
MSSQL  | `+`
PGSQL  | `\|\|`
ORACLE  | `\|\|`


Usage


```java
List<String> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            Expression expression = bank_card.expression();
            //column + constant
            bank_card.code().concat("nextCode").eq("aaaa");
            //column + column
            bank_card.code().concat(bank_card.type()).eq("123");
            //constant + column
            expression.constant("This bank card number:").concat(bank_card.code()).eq("123");
            //custom format
            expression.stringFormat("This bank card number:{0}, type:{1}", bank_card.code(), bank_card.type()).eq("This bank card number:123, type:456");
        })
        .selectColumn(bank_card -> bank_card.expression().stringFormat("This bank card number:{0}, type:{1}", bank_card.code(), bank_card.type()))
        .toList();

```


## nullEmpty

Syntactic sugar for the default nullOrDefault, equivalent to `nullOrDefault("")`. For details, see the [nullOrDefault](/easy-query-doc/en/func/general) chapter


## toLower | toUpper
Used to convert strings to uppercase or lowercase
```java

List<Draft2<String, String>> list = easyEntityQuery.queryable(DocBankCard.class)
        .select(bank_card -> Select.DRAFT.of(
                bank_card.id().toLower(),
                bank_card.id().toUpper()
        )).toList();
```


## subString
String truncation function, supports passing two parameters `begin` and `length`

::: warning Notice!!!
> In various databases, the index position starts at 1, but at the Java level, we start at 0
:::

Parameter  | Description  
---  | --- 
begin  | Starting position of string truncation, 0 is the starting index
length  | Length of the string to be truncated

```java
List<Draft2<String, String>> list = easyEntityQuery.queryable(Topic.class)
        .select(topic -> Select.DRAFT.of(
                topic.id().subString(0,2),
                topic.id().subString(0,topic.stars())
        )).toList();
```


## trim | ltrim | rtrim
Used to remove spaces from the returned result

```java

List<Draft1<String>> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            bank_card.code().trim().eq("123");
            bank_card.code().ltrim().eq("123");
            bank_card.code().rtrim().eq("123");
        })
        .select(bank_card -> Select.DRAFT.of(
                bank_card.id().trim()
        )).toList();
```


## replace
String replacement function


Parameter  | Description  
---  | --- 
oldValue  | Old value
newValue  | New value to replace the old value

```java
List<Draft1<String>> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            bank_card.code().replace("oldValue","newValue").eq("123");
        })
        .select(bank_card -> Select.DRAFT.of(
                bank_card.id().replace("oldValue","newValue")
        )).toList();
```


## leftPad | rightPad


Parameter  | Description  
---  | --- 
totalWidth  | Total number of digits
paddingChar  | What character to pad with if insufficient

```java

List<DocBankCard> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            bank_card.code().leftPad(4).eq("123");
            bank_card.code().leftPad(4, ' ').eq("123");
            bank_card.code().rightPad(4).eq("123");
            bank_card.code().rightPad(4, ' ').eq("123");
        }).toList();
```

## joining

::: warning Notice!!!
> SQL Server requires a higher version to support this function
:::
A function used to combine multi-dimensional string data into one column, such as comma-combining names after grouping, how many roles a user has

Parameter  | Description  
---  | --- 
delimiter  | Separator such as `,` or `\|`
distinct  | Whether to deduplicate (not supported by some databases)
orderBy | Supports sorting the fields that need comma separation first (requires database support)

```java

List<Draft4<String, String, String, String>> list = easyEntityQuery.queryable(DocBankCard.class)
        .groupBy(bank_card -> GroupKeys.of(bank_card.code()))
        .select(group -> Select.DRAFT.of(
                group.key1(),
                //Bank cards grouped by code, and after grouping, separate user names whose type is debit card with commas
                group.where(o -> o.type().eq("储蓄卡")).distinct().joining(x -> x.user().name(), ","),
                //Simply separate bank IDs with commas
                group.groupTable().bankId().joining(",",true),
                group.groupTable().bankId().joining(",",true).filter(() -> group.groupTable().type().eq("储蓄卡"))
        )).toList();
```

Database  | Dialect  
---  | --- 
MySQL  | GROUP_CONCAT
MSSQL  | STRING_AGG
PGSQL  | STRING_AGG
ORACLE  | LISTAGG




## length
Used to get the length of a string

Database  | Dialect  
---  | --- 
MySQL  | CHAR_LENGTH
MSSQL  | LEN
PGSQL  | CHAR_LENGTH
ORACLE  | LENGTH


```java
List<Integer> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            bank_card.code().length().eq(2);
        }).selectColumn(bank_card -> bank_card.code().length())
        .toList();
```

## compareTo
Used to compare two strings and return -1, 0, 1 integers


Database  | Dialect  
---  | --- 
MySQL  | STRCMP
MSSQL  | CASE WHEN
PGSQL  | CASE WHEN
ORACLE  | CASE WHEN


```java

List<Integer> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            bank_card.code().compareTo("1").eq(1);
        }).selectColumn(bank_card -> bank_card.code().compareTo(bank_card.type()))
        .toList();
```

## indexOf

`2.8.17^` Used to compare the index position where a string exists in the current string (column), greater than or equal to 0 means it exists

Database  | Dialect  
---  | --- 
MySQL  | LOCATE
MSSQL  | CHARINDEX
PGSQL  | STRPOS
ORACLE  | INSTR
```java
List<BlogEntity> list = easyEntityQuery.queryable(BlogEntity.class)
                .where(t_blog -> {
                    t_blog.title().indexOf("30%").gt(-1);
                }).toList();
```

## Database Function Related Search

CONCAT LOWER UPPER SUBSTR TRIM LTRIM RTRIM REPLACE GROUP_CONCAT STRING_AGG LISTAGG CHAR_LENGTH LEN LENGTH STRCMP LOCATE CHARINDEX STRPOS INSTR

