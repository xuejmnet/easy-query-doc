---
title: 设置正确的主键
order: 130
---

# 设置正确的主键
主键是一个极其重要的列，我们认为主键必须由后端来生成，而不是通过前端传递,一个场景，存在一个表单和多个记录项,如果我们要修改记录项往往需要前端传递记录项信息，如果存在id那么就会将id一同传递到后端，但是如果前端传递了错误的id那么普通的savable会导致后端误用当前id，就会出现索引碎片或者乱序等一系列问题，所以我们应该如何处理这种情况呢

# SaveEntitySetPrimaryKeyGenerator
在使用savable的时候可以对子项进行设置正确的主键来保证其准确性

对于案例一对多保存自定义集合进行savable的案例我们进行修改
```java

    @PostMapping("/update2")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object update2(@RequestBody BankUpdateRequest request) {

        SaveBank saveBank = easyEntityQuery.queryable(SaveBank.class)
                .includes(save_bank -> save_bank.saveBankCards())
                .whereById(request.getId()).singleNotNull();

        saveBank.setName(request.getName());
        saveBank.setAddress(request.getAddress());

        ArrayList<SaveBankCard> requestBankCards = new ArrayList<>();
        for (BankUpdateRequest.InternalSaveBankCards saveBankCard : request.getSaveBankCards()) {
            SaveBankCard bankCard = new SaveBankCard();
            bankCard.setId(saveBankCard.getId());
            bankCard.setType(saveBankCard.getType());
            bankCard.setCode(saveBankCard.getCode());
            requestBankCards.add(bankCard);
        }
        saveBank.setSaveBankCards(requestBankCards);
        easyEntityQuery.savable(saveBank).executeCommand();
        return "ok";
    }
```
当我们循环遍历`request.getSaveBankCards()`对象的时候因为该对象由前端传递，我们无法确保前端不会传递给我们乱七八糟的id，所以当id不存在数据库的时候那么该对象被视为插入，但是我们需要对该对象的id进行后端的赋值，而不是使用前端传递的id，那么我们有如下两个解决方案

- 使用[`PrimaryKeyGenerator`](/easy-query-doc/adv/auto-key)
- 使用`SaveEntitySetPrimaryKeyGenerator`

那么具体应该怎么使用呢

## MySaveEntitySetPrimaryKeyGenerator
第一步我们先实现我们接口`SaveEntitySetPrimaryKeyGenerator`然后替换框架行为
```java
public class MySaveEntitySetPrimaryKeyGenerator implements SaveEntitySetPrimaryKeyGenerator {
    @Override
    public void setPrimaryKey(Object entity, ColumnMetadata columnMetadata) {
        String id = UUID.randomUUID().toString().replaceAll("-", "");
        columnMetadata.getSetterCaller().call(entity, id);
    }
}
```

## 修改原本的接口
```java

    @PostMapping("/update3")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object update3(@RequestBody BankUpdateRequest request) {

        SaveBank saveBank = easyEntityQuery.queryable(SaveBank.class)
                .includes(save_bank -> save_bank.saveBankCards())
                .whereById(request.getId()).singleNotNull();

        saveBank.setName(request.getName());
        saveBank.setAddress(request.getAddress());

        ArrayList<SaveBankCard> requestBankCards = new ArrayList<>();
        for (BankUpdateRequest.InternalSaveBankCards saveBankCard : request.getSaveBankCards()) {
            SaveBankCard bankCard = new SaveBankCard();
            bankCard.setId(saveBankCard.getId());
            bankCard.setType(saveBankCard.getType());
            bankCard.setCode(saveBankCard.getCode());

            //会校验saveBankCard.getId()的id是否在当前追踪上下文如果不是则要做插入那么意味着这个id应该被替换
            easyEntityQuery.saveEntitySetPrimaryKey(bankCard);

            requestBankCards.add(bankCard);
        }
        saveBank.setSaveBankCards(requestBankCards);
        easyEntityQuery.savable(saveBank).executeCommand();
        return "ok";
    }
```