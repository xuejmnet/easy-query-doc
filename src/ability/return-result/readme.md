---
title: API预览
---

`eq`不仅仅可以以数据库实体作为返回结果,也可以通过自定义返回结果`VO、DTO`无需用户内存映射转换
- 隐式赋值自定义结果`select(vo.class,o -> Select.of(...))`
- 显式赋值自定义结果`select(o -> new proxy()...)`
- 系统自带元组草稿类型`select(o -> Select.DRAFT.of(...))`或`select(o -> Select.TUPLE.of(...))`
- 系统自带部分元组类型`select(o -> Select.PART.of(...))`



# 查询映射

## 1.返回voproxy🔥
生成代理类select返回dto模式
```java

List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .leftJoin(DocUser.class, (bank_card, user) -> bank_card.uid().eq(user.id()))
        .leftJoin(DocBank.class, (bank_card, user, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, user, bank) -> {
            user.name().like("小明");
            bank_card.type().eq("储蓄卡");
        })

        .select((bank_card, user, bank) -> new BankCardVOProxy()//在BanCardVO上添加@EntityProxy注解build时会生成对应的Proxy对象
            .selectAll(bank_card)//相当于是查询所有的bankCard字段
            .userName().set(user.name())
            .bankName().set(bank.name())
        )
        //上下一样，下面的就是上面展开写法
        // .select((bank_card, user, bank) -> {
        //     BankCardVOProxy r = new BankCardVOProxy();
        //     r.selectAll(bank_card);//相当于是查询所有的bankCard字段
        //     r.userName().set(user.name());
        //     r.bankName().set(bank.name());
        //     return r;
        // })
        .toList();
```
如果您不想要通过代理类来实现那么可以通过`ClassProxy.of().columns()`需要`eq3.1.58+`
```java

List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .leftJoin(DocUser.class, (bank_card, user) -> bank_card.uid().eq(user.id()))
        .leftJoin(DocBank.class, (bank_card, user, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, user, bank) -> {
            user.name().like("小明");
            bank_card.type().eq("储蓄卡");
        })

        .select((bank_card, user, bank) -> ClassProxy.of(BankCardVO.class)//在BanCardVO上添加@EntityProxy注解build时会生成对应的Proxy对象
            .selectAll(bank_card)//相当于是查询所有的bankCard字段
            .columns(
                //bank_card.FETCHER.allFileds() 这个等同于selectAll(bank_card)
                user.name().as("userName"),//如果映射的别名和当前属性名一样则可以不需要as
                bank.name().as("bankName"),
                bank.myName()//这边as可以省略等同于bank.myName().as("myName")
            )
        )
        .toList();
```

## 2.返回部分列
```java
List<DocBankCard> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> bank_card.type().eq("储蓄卡"))
        .select(bank_card -> bank_card.FETCHER.id().code())
        .toList();
```

## 3.隐式映射1🔥
不希望生成代理类select返回dto模式
```java
List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .leftJoin(DocUser.class, (bank_card, user) -> bank_card.uid().eq(user.id()))
        .leftJoin(DocBank.class, (bank_card, user, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, user, bank) -> {
            user.name().like("小明");
            bank_card.type().eq("储蓄卡");
        })
        .select((bank_card, user, bank) -> ClassProxy.of(BankCardVO.class)//老版本可以用new ClassProxy<>(BankCardVO.class)
            //自动映射bank_card全属性等于select t.*但是以结果为主
            .selectAll(bank_card)
            //可以使用字符串:"userName"或者lombok的@FieldNameConstant注解
            //java用户可以用BankCardVO::getUserName 注意这种双引号用法属性命名要规范
            .field("userName").set(user.name())
            .field("bankName").set(bank.name())
        )
        //上下一样
        // .select((bank_card, user, bank) -> ClassProxy.of(BankCardVO.class)//老版本可以用new ClassProxy<>(BankCardVO.class)
        //     //自动映射bank_card全属性等于select t.*但是以结果为主
        //     .selectAll(bank_card)
        //     //可以使用字符串:"userName"或者lombok的@FieldNameConstant注解
        //     //java用户可以用BankCardVO::getUserName 注意这种双引号用法属性命名要规范
        //     .columns(
        //         user.name().as("userName"),
        //         bank.name().as("bankName")
        //     )
        // )
        .toList();
```

## 4.隐式映射2
与第三张不同不需要创建Proxy
```java
List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .leftJoin(DocUser.class, (bank_card, user) -> bank_card.uid().eq(user.id()))
        .leftJoin(DocBank.class, (bank_card, user, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, user, bank) -> {
            user.name().like("小明");
            bank_card.type().eq("储蓄卡");
        })
        .select(BankCardVO.class,(bank_card, user, bank) -> Select.of(
            bank_card.FETCHER.allFields(),//自动映射bank_card全属性等于select t.*但是以结果为主
            user.name().as("userName"),//可以使用字符串:"userName"或者lombok的@FieldNameConstant注解
            bank.name().as("bankName")
        ))
        //上下写法一样就是把lambda用大括号展开了
        // .select(BankCardVO.class,(bank_card, user, bank) -> {
        //     return Select.of(
        //         bank_card.FETCHER.allFields(),//自动映射bank_card全属性等于select t.*但是以结果为主
        //         user.name().as("userName"),//可以使用字符串:"userName"或者lombok的@FieldNameConstant注解
        //         bank.name().as("bankName")
        //     );
        // })
        .toList();
```

## 5.全自动映射
```java

List<SysBankDTO> list = easyEntityQuery.queryable(SysBank.class)
        .selectAutoInclude(SysBankDTO.class)
        .toList();
```
