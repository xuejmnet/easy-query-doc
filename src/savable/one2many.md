---
title: 一对多保存
order: 20
---

# 一对多保存
一种经常会用到的主从结构表,对于主从结构表的更新在没有很好地变更保存的时候，常用的是先删除后新增从表记录,但是如果遇到从表的id是参与业务逻辑的那么这种保存则会变得不合适,对于这种主从结构`eq`的`savable`可以轻松的应对实现


::: tabs
@tab 关系图

<img :src="$withBase('/images/saven2m.png')">

@tab SaveUser
```java

@Table("t_save_user")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_user")
public class SaveUser implements ProxyEntityAvailable<SaveUser, SaveUserProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String name;
    private Integer age;
    private LocalDateTime createTime;

    /**
     * 用户拥有的银行卡
     **/
    @Navigate(value = RelationTypeEnum.OneToMany, selfProperty = {SaveUser.Fields.id}, targetProperty = {SaveBankCard.Fields.uid})
    private List<SaveBankCard> saveBankCards;
}
```
@tab SaveBank
```java

@Table("t_save_bank")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_bank")
public class SaveBank implements ProxyEntityAvailable<SaveBank, SaveBankProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String name;
    private String address;

    /**
     * 银行办法的银行卡
     **/
    @Navigate(value = RelationTypeEnum.OneToMany,
            selfProperty = {SaveBank.Fields.id},
            targetProperty = {SaveBankCard.Fields.bankId},
            cascade = CascadeTypeEnum.DELETE)
    private List<SaveBankCard> saveBankCards;
}
```
@tab SaveBankCard
```java
@Table("t_save_bank_card")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_bank_card")
public class SaveBankCard implements ProxyEntityAvailable<SaveBankCard , SaveBankCardProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String type;
    private String code;
    private String uid;
    private String bankId;
}
```
:::

这是一个非常常见的`User->BankCard`和`Bank->BankCard`两个聚合根同一个值对象,但是`User`和`BankCard`并不是正真意义上的聚合根和值对象,因为`BankCard`并不会因为和`User`的脱钩后被删除,但是`BankCard`会因为`Bank`的脱钩而被删除,所以在配置的时候我们可以选择`cascade = CascadeTypeEnum.DELETE`

## 一对多创建


::: tabs

@tab 流程图
<img :src="$withBase('/images/one2manysave1.png')">

@tab 创建对象

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
@tab sql

```sql

-- 第1条sql数据
INSERT INTO `t_save_bank` (`id`, `name`, `address`)
VALUES ('1', '工商银行', '城市广场1号')
-- 第2条sql数据
INSERT INTO `t_save_bank_card` (`id`, `type`, `code`, `bank_id`)
VALUES ('2', '储蓄卡', '123', '1')
-- 第3条sql数据
INSERT INTO `t_save_bank_card` (`id`, `type`, `code`, `bank_id`)
VALUES ('3', '信用卡', '456', '1')
```

:::

只需要将子表数据装载到对应的对象集合中那么框架保存会自动处理其关联关系值,用户不需要手动赋值

## 从表差异更新

直接按存在的id进行查询,然后构建新的对象放到list内部替换被追踪的saveBank即可



::: tabs

@tab 流程图
<img :src="$withBase('/images/one2manysave2.png')">

@tab 修改dto
```java


/**
 * create time 2025/9/18 22:12
 * {@link com.eq.doc.domain.save.SaveBank}
 *
 * @author xuejiaming
 */
@Data
@SuppressWarnings("EasyQueryFieldMissMatch")
public class BankUpdateRequest {
    private String id;
    private String name;
    private String address;

    /**
     * 银行办法的银行卡
     **/
    private List<InternalSaveBankCards> saveBankCards;


    /**
     * {@link com.eq.doc.domain.save.SaveBankCard}
     **/
    @Data
    public static class InternalSaveBankCards {
        private String id;
        private String type;
        private String code;
    }
}
```
@tab 请求json
```json
{
    "id":"1",
    "name": "工商银行",
    "address":"城市广场2号",
    "saveBankCards":[
        {
            "id":"2",
            "type":"储蓄卡",
            "code":"1234"
        },

        {
            "id":"4",
            "type":"信用卡",
            "code":"98765"
        }
    ]
}
```
@tab 接口代码
```java

    @PostMapping("/update")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object update(@RequestBody BankUpdateRequest request) {

        SaveBank saveBank = easyEntityQuery.queryable(SaveBank.class)
                .includes(save_bank -> save_bank.saveBankCards())
                .whereById(request.getId()).singleNotNull();
        
        saveBank.setName(request.getName());
        saveBank.setAddress(request.getAddress());

        Set<String> requestIds = request.getSaveBankCards().stream().map(o -> o.getId()).filter(o -> o != null).collect(Collectors.toSet());
        //移除不需要的银行卡
        saveBank.getSaveBankCards().removeIf(o -> !requestIds.contains(o.getId()));
        Map<String, SaveBankCard> bankCardMap = saveBank.getSaveBankCards().stream().collect(Collectors.toMap(o -> o.getId(), o -> o));
        ArrayList<SaveBankCard> newCards = new ArrayList<>();
        for (BankUpdateRequest.InternalSaveBankCards saveBankCard : request.getSaveBankCards()) {
            SaveBankCard dbBankCard = bankCardMap.get(saveBankCard.getId());
            if(dbBankCard==null){
                SaveBankCard bankCard = new SaveBankCard();
                bankCard.setId(saveBankCard.getId());
                bankCard.setType(saveBankCard.getType());
                bankCard.setCode(saveBankCard.getCode());
                newCards.add(bankCard);
            }else{
                dbBankCard.setType(saveBankCard.getType());
                dbBankCard.setCode(saveBankCard.getCode());
            }
        }
        saveBank.getSaveBankCards().addAll(newCards);

        easyEntityQuery.savable(saveBank).executeCommand();
        return "ok";
    }
```
@tab sql
```sql

-- 第1条sql数据
DELETE FROM `t_save_bank_card`
WHERE `id` = '3'
-- 第2条sql数据
UPDATE `t_save_bank`
SET `address` = '城市广场2号'
WHERE `id` = '1'
-- 第3条sql数据
INSERT INTO `t_save_bank_card` (`id`, `type`, `code`, `bank_id`)
VALUES ('4', '信用卡', '98765', '1')
-- 第4条sql数据
UPDATE `t_save_bank_card`
SET `code` = '1234'
WHERE `id` = '2'
```
:::

框架正确的处理了子表`BankCard`，正确感知出了需要被删除和需要被新增的银行卡信息

虽然框架正确的处理了这个操作但是在用户实现上面也是未免有些麻烦那么接下来将以简单的方式来实现，请求对象和请求json都不变我们改变api接口如下
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
```sql

SELECT `id`, `name`, `address`
FROM `t_save_bank`
WHERE `id` = '1'

SELECT t.`id`, t.`type`, t.`code`, t.`uid`, t.`bank_id`
FROM `t_save_bank_card` t
WHERE t.`bank_id` IN ('1')

DELETE FROM `t_save_bank_card`
WHERE `id` = '3'

UPDATE `t_save_bank`
SET `address` = '城市广场2号'
WHERE `id` = '1'

UPDATE `t_save_bank_card`
SET `code` = '1234'
WHERE `id` = '2'
```
通过请求接口创建出应该被保存的子表，后续通过`mergeCollection`将其差异化合并到导航属性上,然后通过`savable`可以差异化生成本次需要的保存命令

前两条sql通过`includes`进行查询，后三条sql通过`savable`进行差异化处理

::: danger 说明!!!
> `savable`中的如果当对象是修改的那么必须使用被追踪的对象，不可以用用户自己new的对象。
:::

## 业务key一对多保存
有时候我们在一对多保存的时候可能会使用非业务id来作为保存的“唯一”键，而不是主键，当然这个唯一并不是数据库内唯一，框架认为是在聚合根下对于这个值对象而言是不会重复的，但是跨聚合根还是允许重复的。

用户和银行卡的关系是一对多，这个关系我们在保存的时候完全可以用银行卡号作为key来实现保存的时候交互使用银行卡code而不是id这也是一种方式


## SaveKey
`SaveKey`的作用就是在保存数据的时候如果用户不提供主键信息，那么用户可以根据实体标记的`SaveKey`找到对应的原始记录，从而实现在逻辑层面让同一个聚合根下的`SaveKey`也是唯一的

::: danger 说明!!!
> `SaveKey`的值不能为null(默认),具体以`RelationValueFactory`为准用户也可以设置不能是空或者横杠之类的值
> 一个聚合根内导航属性内`SaveKey`不允许重复
:::

修改银行卡实体，添加`SaveKey`
```java

@Table("t_save_bank_card")
@Data
@EntityProxy
@FieldNameConstants
@EasyAlias("save_bank_card")
public class SaveBankCard implements ProxyEntityAvailable<SaveBankCard , SaveBankCardProxy> {
    @Column(primaryKey = true, primaryKeyGenerator = UUIDPrimaryKey.class)
    private String id;
    private String type;
    @SaveKey
    private String code;
    private String uid;
    private String bankId;
}
```

### 保存用户银行卡
```java

    @PostMapping("/createUser")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object createUser() {

        SaveUser saveUser = new SaveUser();
        saveUser.setId("1");
        saveUser.setName("小明");
        saveUser.setAge(20);
        List<SaveBankCard> saveBankCards = easyEntityQuery.queryable(SaveBankCard.class)
                .whereByIds(Arrays.asList("2", "3"))
                .toList();
        saveUser.setSaveBankCards(saveBankCards);

        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
```sql
-- 第1条sql数据
SELECT `id`, `type`, `code`, `uid`, `bank_id`
FROM `t_save_bank_card`
WHERE `id` IN ('2', '3')
-- 第2条sql数据
INSERT INTO `t_save_user` (`id`, `name`, `age`)
VALUES ('1', '小明', 20)
-- 第3条sql数据
UPDATE `t_save_bank_card`
SET `uid` = '1'
WHERE `id` = '2'
-- 第4条sql数据
UPDATE `t_save_bank_card`
SET `uid` = '1'
WHERE `id` = '3'
```

### 请求变更用户银行卡
请求上传的时候不传递已经存在的银行卡id（当然实际业务我们肯定是传递银行卡id的），只传递code也就是银行卡编号，来处理一对多保存

- 先查询当前用户并且包含查询用户的银行卡信息
- 查询请求的银行卡信息，然后set替换用户的银行卡
- 保存框架会自动根据差异数据进行比对生成差异sql实现保存功能
::: tabs

@tab 流程图
<img :src="$withBase('/images/one2manysave3.png')">

@tab DTO
```java

/**
 * create time 2025/9/18 22:12
 * {@link com.eq.doc.domain.save.SaveUser}
 *
 * @author xuejiaming
 */
@Data
@SuppressWarnings("EasyQueryFieldMissMatch")
public class UserUpdateRequest {
    private String id;
    private String name;
    private Integer age;

    /**
     * 银行办法的银行卡
     **/
    private List<InternalSaveBankCards> saveBankCards;


    /**
     * {@link com.eq.doc.domain.save.SaveBankCard}
     **/
    @Data
    public static class InternalSaveBankCards {
        private String code;
    }
}
```
@tab 接口
```java

    @PostMapping("/update3")
    @Transactional(rollbackFor = Exception.class)
    @EasyQueryTrack
    public Object update3(@RequestBody UserUpdateRequest request) {
        SaveUser saveUser = easyEntityQuery.queryable(SaveUser.class)
                .includes(save_user -> save_user.saveBankCards())
                .singleNotNull();

        saveUser.setName(request.getName());
        saveUser.setAge(request.getAge());
        List<String> codes = request.getSaveBankCards().stream().map(o -> o.getCode()).toList();
        List<SaveBankCard> requestBankCards = easyEntityQuery.queryable(SaveBankCard.class)
                .where(save_bank_card -> {
                    save_bank_card.code().in(codes);
                }).toList();

        saveUser.setSaveBankCards(requestBankCards);
        easyEntityQuery.savable(saveUser).executeCommand();
        return "ok";
    }
```
@tab JSON
```json
{
    "id":"1",
    "name": "小明",
    "age": 20,
    "saveBankCards":[
        {
            "type":"储蓄卡",
            "code":"123"
        },

        {
            "type":"信用卡",
            "code":"789"
        }
    ]
}
```
@tab sql
```sql

SELECT `id`, `name`, `age`, `create_time`
FROM `t_save_user`

SELECT t.`id`, t.`type`, t.`code`, t.`uid`, t.`bank_id`
FROM `t_save_bank_card` t
WHERE t.`uid` IN ('1')

SELECT `id`, `type`, `code`, `uid`, `bank_id`
FROM `t_save_bank_card`
WHERE `code` IN ('123', '789')

UPDATE `t_save_bank_card`
SET `uid` = NULL
WHERE `id` = '3'

UPDATE `t_save_bank_card`
SET `uid` = '1'
WHERE `id` = '4'
```

:::


这次我们发现框架能正确的反应出新增一个`code:789`然后脱钩`code:456`，但是用户会发现一个问题,其实我们应该以银行卡为聚合根来驱动，银行卡选择用户而不是用户为聚合根选择银行卡

## 中间表一对多保存
在用户角色多对多的模型结构中，`eq`也支持定义一对多的关系，譬如`user->user_role`,这种一对多是因为多对多某种意义上是两个一对多指向同一个中间表，所以我们可以通过直接处理中间表关系来实现对应的差异保存

多对多关系转换成一对多保存可以让保存在性能上比完全使用多对多更加优秀,具体内容请[跳转到多对多章节查看](/easy-query-doc/savable/many2many)