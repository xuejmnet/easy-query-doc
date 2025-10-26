---
title: API Overview
---

`easy-query` not only returns database entities as results but also supports custom return results `VO, DTO` without manual memory mapping conversion:
- Implicit assignment for custom results `select(vo.class, o -> Select.of(...))`
- Explicit assignment for custom results `select(o -> new proxy()...)`
- Built-in draft tuple types `select(o -> Select.DRAFT.of(...))` or `select(o -> Select.TUPLE.of(...))`
- Built-in partial tuple types `select(o -> Select.PART.of(...))`

# Query Mapping

## 1. Return VOProxy
```java

List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .leftJoin(DocUser.class, (bank_card, user) -> bank_card.uid().eq(user.id()))
        .leftJoin(DocBank.class, (bank_card, user, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, user, bank) -> {
            user.name().like("XiaoMing");
            bank_card.type().eq("Savings Card");
        })
        .select((bank_card, user, bank) -> {
            BankCardVOProxy r = new BankCardVOProxy();//Add @EntityProxy annotation on BankCardVO, the corresponding Proxy object will be generated during build
            r.selectAll(bank_card);//Equivalent to querying all bankCard fields
            r.userName().set(user.name());
            r.bankName().set(bank.name());
            return r;
        }).toList();
```

## 2. Return Partial Columns
```java
List<DocBankCard> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> bank_card.type().eq("Savings Card"))
        .select(bank_card -> bank_card.FETCHER.id().code())
        .toList();
```

## 3. Implicit Mapping 1
```java
List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .leftJoin(DocUser.class, (bank_card, user) -> bank_card.uid().eq(user.id()))
        .leftJoin(DocBank.class, (bank_card, user, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, user, bank) -> {
            user.name().like("XiaoMing");
            bank_card.type().eq("Savings Card");
        })
        .select((bank_card, user, bank) -> new ClassProxy<>(BankCardVO.class)
            //Auto-map all bank_card properties, equivalent to select t.* but result-based
            .selectAll(bank_card)
            //Can use string: "userName" or lombok's @FieldNameConstant annotation
            .field("userName").set(user.name())
            .field("bankName").set(bank.name())
        ).toList();
```

## 4. Implicit Mapping 2
Different from method 3, no need to create Proxy
```java
List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .leftJoin(DocUser.class, (bank_card, user) -> bank_card.uid().eq(user.id()))
        .leftJoin(DocBank.class, (bank_card, user, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, user, bank) -> {
            user.name().like("XiaoMing");
            bank_card.type().eq("Savings Card");
        })
        .select(BankCardVO.class,(bank_card, user, bank) -> Select.of(
            bank_card.FETCHER.allFields(),//Auto-map all bank_card properties, equivalent to select t.* but result-based
            user.name().as("userName"),//Can use string: "userName" or lombok's @FieldNameConstant annotation
            bank.name().as("bankName")
        )).toList();
```

## 5. Fully Automatic Mapping
```java

List<SysBankDTO> list = easyEntityQuery.queryable(SysBank.class)
        .selectAutoInclude(SysBankDTO.class)
        .toList();
```

