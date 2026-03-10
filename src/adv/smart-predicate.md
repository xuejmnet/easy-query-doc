---
title: 派生表条件穿透
order: 180
---

# 派生表条件穿透
当我们使用上游返回的`queryable`对象是可能是一个已经被组装好的派生表表达式(也就是`queryable().where().select()`)后的表达式，那么你对该表达式进行后续的`where、orderBy`操作就是对当前派生表进行操作,那么大概率会导致本应该高效的性能变得低下，所以[派生表条件穿透]配置可以让条件更加智能

`configure(s -> s.getBehavior().add(EasyBehaviorEnum.SMART_PREDICATE))`只需要对表达式添加该配置即可

正常我们添加`name=xxx`条件到派生表
```sql
select * from (select * from sys_user where age>10) t where t.name=xxx
```
增加派生表条件穿透后
```sql
select * from sys_user where age>10 and name=xxx
```
`eq`会尽可能的将条件往派生表进行穿透(别名字段亦可以)，如果出现了`join`并且对派生表的字段是原表达式的`join`表，那么条件会自动穿透到`on`处


## 不添加SMART_PREDICATE
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

-- 生成的sql
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
## 添加SMART_PREDICATE
```java

        easyEntityQuery.queryable(SysUser.class)
                //添加这句
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


-- 生成的sql
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
我们发现条件会尽可能的往派生表内部穿透过去,直至实际表