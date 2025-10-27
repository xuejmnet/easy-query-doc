---
title: Offset Functions
order: 60
---

# Offset Functions
Only supported in `eq3.1.30+` version

`LAG`, `LEAD`, `FIRST_VALUE`, `LAST_VALUE`, `NTH_VALUE` functions support getting offset values, corresponding to `eq`'s `offset` function

## Example Without Parameters for offset

::: danger Incorrect Usage❌!!!
> If the entire expression does not have a corresponding `orderBy` and `offset` also does not have an `orderBy`, the program will throw an error
> `In a PARTITION BY clause, the ORDER BY expression must be explicitly specified; otherwise, referencing the expression is not supported. plz confirm expression has ORDER BY clause`
:::
```java
easyEntityQuery.queryable(SysBankCard.class)
                    .select(bank_card -> Select.DRAFT.of(
                            bank_card.type(),
                            bank_card.type().offset().prev(1)
                    )).toList();
                    
```
::: tip Correct Usage✅!!!
> If the entire expression has a corresponding `orderBy`, `offset` can be set without `orderBy`
:::
```java

        easyEntityQuery.queryable(SysBankCard.class)
                .orderBy(bank_card -> {
                    bank_card.openTime().asc();
                })
                .select(bank_card -> Select.DRAFT.of(
                        bank_card.type(),
                        bank_card.type().offset().prev(1)
                )).toList();
```
```sql

SELECT t.`type` AS `value1`, LAG(t.`type`, 1) OVER (ORDER BY t.`open_time` ASC) AS `value2`
FROM `t_bank_card` t
ORDER BY t.`open_time` ASC
```

## Example
```java
        LocalDateTime time = LocalDateTime.of(2025, 1, 1, 0, 0););

        List<Draft7<String, String, LocalDateTime, LocalDateTime, LocalDateTime, LocalDateTime, LocalDateTime>> list = easyEntityQuery.queryable(SysBankCard.class)
                .select(bank_card -> Select.DRAFT.of(
                        bank_card.type(),
                        bank_card.type().offset(o -> {
                            o.orderBy(bank_card.type()).orderByDescending(bank_card.code());
                        }).prev(1),
                        bank_card.openTime().offset(o -> {
                            o.orderBy(bank_card.type()).orderByDescending(bank_card.code());
                        }).next(1),
                        bank_card.openTime().offset(o -> {
                            o.partitionBy(bank_card.bankId());
                            o.orderBy(bank_card.type()).orderByDescending(bank_card.code());
                        }).next(1),
                        bank_card.openTime().offset(o -> {
                            o.partitionBy(bank_card.bankId());
                            o.orderBy(bank_card.type()).orderByDescending(bank_card.code());
                        }).next(1, time),
                        bank_card.openTime().offset(o -> {
                            o.partitionBy(bank_card.bankId());
                            o.orderBy(bank_card.type()).orderByDescending(bank_card.code());
                        }).next(1).nullOrDefault(time),
                        bank_card.openTime().offset(o -> {
                            o.partitionBy(bank_card.bankId());
                            o.orderBy(bank_card.type()).orderByDescending(bank_card.code());
                        }).next(1, bank_card.openTime()).nullOrDefault(time)
                )).toList();
```

```sql
SELECT t.`type` AS `value1`, LAG(t.`type`, 1) OVER (ORDER BY t.`type` ASC, t.`code` DESC) AS `value2`
	, LEAD(t.`open_time`, 1) OVER (ORDER BY t.`type` ASC, t.`code` DESC) AS `value3`
	, LEAD(t.`open_time`, 1) OVER (PARTITION BY t.`bank_id` ORDER BY t.`type` ASC, t.`code` DESC) AS `value4`
	, LEAD(t.`open_time`, 1, '2025-01-01 00:00') OVER (PARTITION BY t.`bank_id` ORDER BY t.`type` ASC, t.`code` DESC) AS `value5`
	, IFNULL(LEAD(t.`open_time`, 1) OVER (PARTITION BY t.`bank_id` ORDER BY t.`type` ASC, t.`code` DESC), '2025-01-01 00:00') AS `value6`
	, IFNULL(LEAD(t.`open_time`, 1, t.`open_time`) OVER (PARTITION BY t.`bank_id` ORDER BY t.`type` ASC, t.`code` DESC), '2025-01-01 00:00') AS `value7`
FROM `t_bank_card` t
```

Syntax
- First determine the value to be obtained by offset
- Determine whether to partition by intervals or offset over the entire table
- Determine the order of offset
- Determine whether to offset forward or backward, `prev` corresponds to `LAG`, `next` corresponds to `LEAD`

## offset Function
Parameters are for sorting and grouping partitions

Parameter  | Function  
---  | --- 
orderBy  | Ascending order
orderByDescending | Descending order
partitionBy | Grouping partition key

## prev next Functions

Parameter  | Function  
---  | --- 
Parameter 1: offset amount  | Offset only supports positive integers
Parameter 2: default value | Which value to use when there is no offset row

## first_value last_value nth_value

```java
easyEntityQuery.queryable(SysBankCard.class)
                .select(bank_card -> Select.DRAFT.of(
                        bank_card.type(),
                        bank_card.type().offset(o -> {
                            o.orderBy(bank_card.type()).orderByDescending(bank_card.code());
                        }).prev(1),
                        bank_card.openTime().offset(o -> {
                            o.orderBy(bank_card.type()).orderByDescending(bank_card.code());
                        }).firstValue(),
                        bank_card.openTime().offset(o -> {
                            o.partitionBy(bank_card.bankId());
                            o.orderBy(bank_card.type()).orderByDescending(bank_card.code());
                        }).lastValue(),
                        bank_card.openTime().offset(o -> {
                            o.partitionBy(bank_card.bankId());
                            o.orderBy(bank_card.type()).orderByDescending(bank_card.code());
                        }).nthValue(2)
                )).toList();
```

```sql
SELECT t.`type` AS `value1`, LAG(t.`type`, 1) OVER (ORDER BY t.`type` ASC, t.`code` DESC) AS `value2`
	, FIRST_VALUE(t.`open_time`) OVER (ORDER BY t.`type` ASC, t.`code` DESC) AS `value3`
	, LAST_VALUE(t.`open_time`) OVER (PARTITION BY t.`bank_id` ORDER BY t.`type` ASC, t.`code` DESC) AS `value4`
	, NTH_VALUE(t.`open_time`, 2) OVER (PARTITION BY t.`bank_id` ORDER BY t.`type` ASC, t.`code` DESC) AS `value5`
FROM `t_bank_card` t
```


