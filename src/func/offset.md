---
title: 偏移量函数
order: 60
---

# 偏移量函数
`eq3.1.28+`版本才支持

`LAG`和`LEAD`函数支持获取偏移值，对应`eq`的函数`offset`

sql语法如下
```sql
LAG(expression [, offset [, default_value]]) 
OVER (
  [PARTITION BY partition_expression]
  ORDER BY sort_expression
)
```

## 案例
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

语法
- 先确定需要偏移获取的值
- 确定是否要按区间分组偏移还是全表偏移
- 确定偏移按什么顺序偏移
- 确定往前偏移还是往后偏移`prev`对应`LAG`，`next`对应`LEAD`

## offset函数
参数为排序和分组分区

参数  | 功能  
---  | --- 
orderBy  | 正序
orderByDescending | 倒序
partitionBy | 分组分区键

## prev next函数

参数  | 功能  
---  | --- 
参数1:offset偏移量  | 偏移量只支持正整数
参数2:默认值 | 当没有偏移行的时候使用哪个值
