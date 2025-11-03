---
title: 表片段额外处理
order: 40
---

# 表片段额外处理
在业务中我们经常可能会遇到诸如一些比较特殊的sql片段，比如sqlserver的`with(nolock)`、clickhouse的`final`又或者是强制使用某个索引`with(index(index_name))`

这类操作我们应该如何实现呢
## asTableSegment
通过对sql表的片段添加额外处理来支持自定义实现上述功能`asTableSegment`有三个泛型，分别是`表名`、`别名`和返回的`表名+别名`

一般我们会选择创建一个类来封装，您也可以独立使用
```java

    public static class WITHNOLOCK implements BiFunction<String, String, String> {
        public static final WITHNOLOCK DEFAULT = new WITHNOLOCK();

        @Override
        public String apply(String table, String alias) {
            if (alias == null) {
                return table + " WITH(NOLOCK)";
            }
            return table + " " + alias + " WITH(NOLOCK)";
        }
    }
```

显式sql添加,作用于每个表后面的值才会生效
```java

        List<SysUser> list = entityQuery.queryable(SysUser.class)
                .asTableSegment(WITHNOLOCK.DEFAULT)
                .leftJoin(SysBankCard.class,(user, bank_card) -> user.id().eq(bank_card.uid()))
                .asTableSegment(WITHNOLOCK.DEFAULT)
                .toList();
```
```sql

    SELECT
        t.[Id],
        t.[Name],
        t.[Phone],
        t.[Age],
        t.[CreateTime] 
    FROM
        [t_sys_user] t WITH(NOLOCK) 
    LEFT JOIN
        [t_bank_card] t1 WITH(NOLOCK) 
            ON t.[Id] = t1.[Uid]
```

隐式sql添加作用于对应的表

```java
        List<SysBankCard> list1 = entityQuery.queryable(SysBankCard.class)
                .where(bank_card -> {
                    bank_card.configure(s -> s.asTableSegment(WITHNOLOCK.DEFAULT));
                    bank_card.user().configure(s -> s.asTableSegment(WITHNOLOCK.DEFAULT));
                    bank_card.user().name().like("123");
                }).toList();
```
```sql
    SELECT
        t.[Id],
        t.[Uid],
        t.[Code],
        t.[Type],
        t.[BankId],
        t.[OpenTime] 
    FROM
        [t_bank_card] t WITH(NOLOCK) 
    LEFT JOIN
        [t_sys_user] t1 WITH(NOLOCK) 
            ON t1.[Id] = t.[Uid] 
    WHERE
        t1.[Name] LIKE '%123%'
```

## 强制索引
```java


    public static class TABLEINDEX implements BiFunction<String, String, String> {
        private final String indexName;

        private TABLEINDEX(String indexName){
            if(indexName == null){
                throw new IllegalArgumentException("indexName can not be null");
            }
            this.indexName = indexName;
        }
        public static TABLEINDEX of(String indexName){
            return new TABLEINDEX(indexName);
        }
        @Override
        public String apply(String table, String alias) {
            if (alias == null) {
                return table + " WITH(INDEX("+indexName+"))";
            }
            return table + " " + alias + " WITH(INDEX("+indexName+"))";
        }
    }



        List<SysUser> list = entityQuery.queryable(SysUser.class)
                .asTableSegment(TABLEINDEX.of("myIndex"))
                .leftJoin(SysBankCard.class,(user, bank_card) -> user.id().eq(bank_card.uid()))
                .toList();



    SELECT
        t.[Id],
        t.[Name],
        t.[Phone],
        t.[Age],
        t.[CreateTime] 
    FROM
        [t_sys_user] t WITH(INDEX(myIndex)) 
    LEFT JOIN
        [t_bank_card] t1 
            ON t.[Id] = t1.[Uid]
```