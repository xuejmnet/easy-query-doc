---
title: Derived Table Predicate Pushdown
order: 180
---

# Derived Table Predicate Pushdown
When we use a `queryable` object returned from upstream, it may be an already assembled derived table expression (i.e., after `queryable().where().select()`). Subsequent `where` or `orderBy` operations on this expression will operate on the current derived table, which will likely degrade performance that should have been efficient. Therefore, the [Derived Table Predicate Pushdown] configuration makes conditions smarter.

Simply add `configure(s -> s.getBehavior().add(EasyBehaviorEnum.SMART_PREDICATE))` to the expression.

Normally, adding a `name=xxx` condition to the derived table:
```sql
select * from (select * from sys_user where age>10) t where t.name=xxx
```
After enabling derived table predicate pushdown:
```sql
select * from sys_user where age>10 and name=xxx
```
`eq` will push down conditions into the derived table as much as possible (alias fields are also supported). If there is a `join` and the derived table field is from the `join` table of the original expression, the condition will automatically be pushed down to the `on` clause.


## Without SMART_PREDICATE
```java
        easyEntityQuery.queryable(SysUser.class)
                .innerJoin(SysBankCard.class, (user, bank_card) -> user.id().eq(bank_card.uid()))
                .where((user, bank_card) -> {
                    user.age().eq(18);
                })
                .select((user, bank_card) -> new UserBankDTO2Proxy()
                        .name().set(user.name())
                        .phone().set(user.phone())
                        .code2().set(bank_card.code())
                ).where(u -> {
                    u.code2().eq("123");

                    u.or(() -> {
                        u.name().eq("name");
                        u.phone().eq("phone");
                    });
                })
                .toList();

-- Generated SQL
SELECT t2.`name` AS `name`, t2.`phone` AS `phone`, t2.`code2` AS `code2`
FROM (
	SELECT t.`name` AS `name`, t.`phone` AS `phone`, t1.`code` AS `code2`
	FROM `t_sys_user` t
		INNER JOIN `t_bank_card` t1 ON t.`id` = t1.`uid`
	WHERE t.`age` = 18
) t2
WHERE t2.`code2` = '123'
	AND (t2.`name` = 'name'
		OR t2.`phone` = 'phone')
```
## With SMART_PREDICATE
```java

        easyEntityQuery.queryable(SysUser.class)
                //Add this line
                .configure(s -> s.getBehavior().add(EasyBehaviorEnum.SMART_PREDICATE))
                .innerJoin(SysBankCard.class, (user, bank_card) -> user.id().eq(bank_card.uid()))
                .where((user, bank_card) -> {
                    user.age().eq(18);
                })
                .select((user, bank_card) -> new UserBankDTO2Proxy()
                        .name().set(user.name())
                        .phone().set(user.phone())
                        .code2().set(bank_card.code())
                ).where(u -> {
                    u.code2().eq("123");

                    u.or(() -> {
                        u.name().eq("name");
                        u.phone().eq("phone");
                    });
                })
                .toList();


-- Generated SQL
SELECT t2.`name` AS `name`, t2.`phone` AS `phone`, t2.`code2` AS `code2`
FROM (
	SELECT t.`name` AS `name`, t.`phone` AS `phone`, t1.`code` AS `code2`
	FROM `t_sys_user` t
		INNER JOIN `t_bank_card` t1
		ON t.`id` = t1.`uid`
			AND t1.`code` = '123'
	WHERE t.`age` = 18
		AND (t.`name` = 'name'
			OR t.`phone` = 'phone')
) t2
```
We can see that conditions are pushed down into the derived table as much as possible, until they reach the actual tables.
