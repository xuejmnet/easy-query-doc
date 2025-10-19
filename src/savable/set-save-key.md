---
title: 设置正确的主键
order: 130
---

# 设置正确的主键
主键是一个极其重要的列，我们认为主键必须由后端来生成，而不是通过前端传递,一个场景，存在一个表单和多个记录项,如果我们要修改记录项往往需要前端传递记录项信息，如果存在id那么就会将id一同传递到后端，但是如果前端传递了错误的id那么普通的savable会导致后端误用当前id，就会出现索引碎片或者乱序等一系列问题，所以我们应该如何处理这种情况呢

# SaveEntitySetPrimaryKeyGenerator
eq版本`3.1.41+`在使用savable的时候可以对子项进行设置正确的主键来保证其准确性

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
            bankCard.setId(saveBankCard.getId());//无脑使用前端传递的id会带来极大的风险
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
这样哪怕我们使用了雪花id，也不怕一对多子项前端上传的时候使用诸如`1`或者`2`这种id来破坏雪花id的单调性和数据库索引碎片问题


## 具体场景说明

首先这是我们的新增操作
```java
@PostMapping("/create")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object create() {

        SaveBank saveBank = new SaveBank();
        saveBank.setId("1");
        saveBank.setName("工商银行");
        saveBank.setAddress("城市广场1号");
        ArrayList<SaveBankCard> saveBankCards = new ArrayList<>();
        saveBank.setSaveBankCards(saveBankCards);
        SaveBankCard card1 = new SaveBankCard();
        card1.setId("2");
        card1.setType("储蓄卡");
        card1.setCode("123");
        saveBankCards.add(card1);
        SaveBankCard card2 = new SaveBankCard();
        card1.setId("3");
        card2.setType("信用卡");
        card2.setCode("456");
        saveBankCards.add(card2);

        easyEntityQuery.savable(saveBank).executeCommand();
        return "ok";
    }
```

### 请求json数据
```json
{
  "id": "1",
  "name": "工商银行",
  "address": "城市广场1号",
  "saveBankCards": [
    {
      "id": "2",
      "type": "储蓄卡",
      "code": "123"
    },
    {
      "id": "3",
      "type": "信用卡",
      "code": "456"
    }
  ]
}
```
当我们需要修改时可能会删除2,然后新增一个

```json
{
  "id": "1",
  "name": "工商银行",
  "address": "城市广场1号",
  "saveBankCards": [
    // {
    //   "id": "2",
    //   "type": "储蓄卡",
    //   "code": "123"
    // },
    {
      "id": "3",
      "type": "信用卡",
      "code": "456"
    },
    {
      "id": "4",
      "type": "借记卡",
      "code": "789"
    }
  ]
}
```
这个时候我们再通过save方法来保存
```java
        SaveBank saveBank = easyEntityQuery.queryable(SaveBank.class)
                .includes(save_bank -> save_bank.saveBankCards())
                .whereById(request.getId()).singleNotNull();

        saveBank.setName(request.getName());
        saveBank.setAddress(request.getAddress());

        ArrayList<SaveBankCard> requestBankCards = new ArrayList<>();
        for (BankUpdateRequest.InternalSaveBankCards saveBankCard : request.getSaveBankCards()) {
            SaveBankCard bankCard = new SaveBankCard();
            bankCard.setId(saveBankCard.getId());//无脑使用前端传递的id会带来极大的风险
            bankCard.setType(saveBankCard.getType());
            bankCard.setCode(saveBankCard.getCode());
            requestBankCards.add(bankCard);
        }
        saveBank.setSaveBankCards(requestBankCards);
```

我们会看到我们把请求的数据线构建出一个新的对象集合`bankCard.setId(saveBankCard.getId());`这句话会让前端传递id如果id已经存在数据库则做修改如果不存在则做新增，那么现在前端传递了一个4，很明显我们之前只有2和3那么这个4会被我们插入，但是如果我通过postman调用api接口传递一个99999呢，那么程序也会插入99999，这就是所有orm的保存无脑信任前端id带来的结果这个结果是致命的，因为你后续的所有id可能会在3-99999之间，导致id不再单调索引不在单调这会让插入变得相对较慢导致性能问题，正确的做法是应该后端来处理如果这个请求的id不在数据库里面，那么应该让后端独自生成一个新的id，这样就可以防止我们之前说的问题了，但是如何实现这个功能如果用户手动去处理那么这个是很复杂的，所以`eq`贴心的为大家实现了一个用来设置正确key的功能

将原先的代码修改为如下即可
```java
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
```

通过添加`easyEntityQuery.saveEntitySetPrimaryKey(bankCard);`这行代码让框架可以通过上下文对当前对象的所有key进行处理，如果当前对象未在上下文被追踪那么就重新对其进行id的赋值，那么用户如果希望是自行处理这种情况应该怎么做呢？

修改上述代码关键行修改为如下
```java
            // easyEntityQuery.saveEntitySetPrimaryKey(bankCard);
            EntityState trackEntityState = easyEntityQuery.getTrackEntityState(bankCard);
            if(trackEntityState==null){
                bankCard.setId(UUID.randomUUID().toString());
            }
```

因为对于一个高度抽象化的业务系统而言那么整体是可以抽象的，如果真的遇到无法抽象的那么就通过上述方式手动处理

### 是否可以设置为null
当然有聪明的小伙伴可能会问那我设置为null是否也可以，这样拦截器就可以自动处理id了，主键生成器也可以自动处理id

非常棒，对于简单的一对多业务表系统我们是可以这么做的就像上述的`SaveBankCard`对象其实你的id当不存在数据库直接使用null是没有任何关系的
但是如果你的对象是多层嵌套结构那么这可能不是一个好方法

```js
a:{
 id:'',
 name:'',
 b:[ ]
}

b:{
 id:'',
 name:'',
 aid:'',
 c:[ ]
}

c:{
    id:'',
    name:'',
    aid:'',
    bid:''
}
```

当我们在处理a.id的时候如果你的关联关系设置的是`a和b:a.id=b.aid`,`b和c:b.id=c.bid`,那么b的aid和c的bid会自动赋值，但是对于冗余字段而言`c.aid`不会自动赋值会一直未null因为c.aid并没有出现在关联关系中,
除非用户设置`b和c:b.aid=c.aid&&b.id=c.bid`

所以是否使用null还是使用后端创建的值这是一个相对比较需要抉择的问题，个人认为减少心智负担建议直接全部代码块赋值好把对应的集合对象构建好即可