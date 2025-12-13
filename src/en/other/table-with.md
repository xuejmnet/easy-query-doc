---
title: Table Segment Extra Processing
order: 40
---

# Table Segment Extra Processing
In business, we often encounter special SQL segments, such as SQL Server's `with(nolock)`, ClickHouse's `final`, or forcing the use of a specific index `with(index(index_name))`

How should we implement such operations?
## asTableSegment
Support custom implementation of the above functions by adding extra processing to SQL table segments. `asTableSegment` has three generics: `table name`, `alias`, and returned `table name + alias`

Generally, we will choose to create a class to encapsulate it, or you can use it independently
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

Add to explicit SQL, only takes effect on values after each table
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

Add to implicit SQL, applies to the corresponding table

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

## Force Index
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


