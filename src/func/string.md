---
title: 字符串函数
order: 20
---

`字符串函数`指的是字符串类型下拥有的专用函数

## concat | stringFormat
用来描述当值没有时使用默认值的函数

- `concat`支持将两个参数通过一函数实现字符串层面的链接比如`"a"+"b"`
- `stringFormat`支持将多个参数通过字符串模板进行连接支持参数复用

数据库  | 方言  
---  | --- 
MySQL  | IFNULL
MSSQL  | ISNULL
PGSQL  | COALESCE
ORACLE  | NVL


用法


```java
List<String> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            Expression expression = bank_card.expression();
            //列+常量
            bank_card.code().concat("nextCode").eq("aaaa");
            //列+列
            bank_card.code().concat(bank_card.type()).eq("123");
            //常量+列
            expression.constant("这张银行卡编号:").concat(bank_card.code()).eq("123");
            //自定义格式化
            expression.stringFormat("这张银行卡编号:{0},类型为:{1}", bank_card.code(), bank_card.type()).eq("这张银行卡编号:123,类型为:456");
        })
        .selectColumn(bank_card -> bank_card.expression().stringFormat("这张银行卡编号:{0},类型为:{1}", bank_card.code(), bank_card.type()))
        .toList();

```


## nullEmpty

默认的nullOrDefault的语法糖,效果与`nullOrDefault("")`一致,具体可以跳转[nullOrDefault](/easy-query-doc/func/general)章节


## toLower | toUpper
用来对字符串进行转大写或者小写
```java

List<Draft2<String, String>> list = easyEntityQuery.queryable(DocBankCard.class)
        .select(bank_card -> Select.DRAFT.of(
                bank_card.id().toLower(),
                bank_card.id().toUpper()
        )).toList();
```


## subString
字符串截取函数 支持传递两个参数`begin`和`length`

::: warning 说明!!!
> 各个数据库下索引位置都是1开始但是java层面我们都是0开始
:::

参数  | 说明  
---  | --- 
begin  | 截取字符串的起始位置,0为起始索引
length  | 截取字符串的长度大小

```java
List<Draft2<String, String>> list = easyEntityQuery.queryable(Topic.class)
        .select(topic -> Select.DRAFT.of(
                topic.id().subString(0,2),
                topic.id().subString(0,topic.stars())
        )).toList();
```


## trim | ltrim | rtrim
用来对返回的结果进行空格移除

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
字符串替换函数


参数  | 说明  
---  | --- 
oldValue  | 旧值
newValue  | 新值用于替换旧值

```java
List<Draft1<String>> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            bank_card.code().replace("旧值","新值").eq("123");
        })
        .select(bank_card -> Select.DRAFT.of(
                bank_card.id().replace("oldValue","newValue")
        )).toList();
```


## leftPad | rightPad


参数  | 说明  
---  | --- 
totalWidth  | 总位数
paddingChar  | 不足补什么字符

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

::: warning 说明!!!
> sqlserver下需要高版本才支持该函数
:::
用于将多多维度的字符串数据组合成一列的函数比如group后的name逗号组合用户下有多少个角色

参数  | 说明  
---  | --- 
delimiter  | 分隔符比如`,`或者`\|`
distinct  | 是否去重(部分数据库不支持)

```java

List<Draft4<String, String, String, String>> list = easyEntityQuery.queryable(DocBankCard.class)
        .groupBy(bank_card -> GroupKeys.of(bank_card.code()))
        .select(group -> Select.DRAFT.of(
                group.key1(),
                //银行卡按编号分组，并且分组后将类型是是储蓄卡，用户姓名，用逗号分隔
                group.where(o -> o.type().eq("储蓄卡")).distinct().joining(x -> x.user().name(), ","),
                //简单暴力将银行id用逗号分隔
                group.groupTable().bankId().joining(",",true),
                group.groupTable().bankId().joining(",",true).filter(() -> group.groupTable().type().eq("储蓄卡"))
        )).toList();
```

数据库  | 方言  
---  | --- 
MySQL  | GROUP_CONCAT
MSSQL  | STRING_AGG
PGSQL  | STRING_AGG
ORACLE  | LISTAGG




## length
用来获取字符串长度

数据库  | 方言  
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
用来比较两个字符串返回-1,0,1整数


数据库  | 方言  
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

`2.8.17^`用来比较字符串在当前字符串(列)中存在的索引位置大于等于0表示存在

数据库  | 方言  
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