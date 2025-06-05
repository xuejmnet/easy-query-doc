---
title: 查询
---
# 查询映射

## 1.返回voproxy
```java

List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .leftJoin(DocUser.class, (bank_card, user) -> bank_card.uid().eq(user.id()))
        .leftJoin(DocBank.class, (bank_card, user, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, user, bank) -> {
            user.name().like("小明");
            bank_card.type().eq("储蓄卡");
        })
        .select((bank_card, user, bank) -> {
            BankCardVOProxy r = new BankCardVOProxy();//在BanCardVO上添加@EntityProxy注解build时会生成对应的Proxy对象
            r.selectAll(bank_card);//相当于是查询所有的bankCard字段
            r.userName().set(user.name());
            r.bankName().set(bank.name());
            return r;
        }).toList();
```

## 2.返回部分列
```java
List<DocBankCard> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> bank_card.type().eq("储蓄卡"))
        .select(bank_card -> bank_card.FETCHER.id().code())
        .toList();
```

## 3.隐式映射
```java
List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .leftJoin(DocUser.class, (bank_card, user) -> bank_card.uid().eq(user.id()))
        .leftJoin(DocBank.class, (bank_card, user, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, user, bank) -> {
            user.name().like("小明");
            bank_card.type().eq("储蓄卡");
        })
        .select(BankCardVO.class,(bank_card, user, bank) -> Select.of(
                //自动映射bank_card全属性等于select t.*但是以结果为主
                bank_card.FETCHER.allFields(),
                ////可以使用字符串:"userName"或者lombok的@FieldNameConstant注解
                user.name().as(BankCardVO.Fields.userName),
                bank.name().as(BankCardVO.Fields.bankName)
        )).toList();
```

## 4.全自动映射
```java

List<SysBankDTO> list = easyEntityQuery.queryable(SysBank.class)
        .selectAutoInclude(SysBankDTO.class)
        .toList();
```
