---
title: 自定义DTO、VO返回结果
---

## API

<!-- ::: tabs

@tab entity -->

| 方法                           | 支持后续链式 | 描述                                                                                                                                                                                                                                            |
| ------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `select(o->proxy)`             | ✅           | 用户可以自定义实现返回结果<br> (返回结果必须是 Proxy 类, 简单说就是 DTO 需要添加注解`@EntityProxy`)                                                                                                                                             |
| `selectColumn(o->o.column())`  | ❌           | 用于用户返回单个字段, 当然也可以直接用`select(o->o.id())`需要`eq 2.0.0^`                                                                                                                                                                        |
| `select(Class<TR>)`            | ❌           | 自动映射表和 DTO 对应关系, (对应关系是 DTO 映射的 columnName 和实体的 columnName 一致则映射), 比如两个属性都是`name`, 但是实体添加了`@Column(value="my_name")`那么 DTO 的`name`属性如果没有添加对应的注解, 将无法自动映射需要手动`as`来进行查询 |
| `select(Class<TR>,expression)` | ❌           | 用户可以对任意`DTO`对象的 class 进行自动或者手动映射比如 <br> `select(DTO.class,o->Select.of(o.FETCHER.allFields(),o.name().as("myName")))`                                                                                                     |
| `selectAutoInclude`            | ❌           | 支持用户返回任意列的数据库对象关系关联的数据, 比如嵌套结构: <br> {name:.. , age:... ,list:[{...}, {...}]}                                                                                                                                       |
| `selectAutoInclude expression` | ❌           | 支持用户返回任意列的数据库对象关系关联的数据,<br>并且还可以`额外自定义join`返回其他数据, 比如嵌套结构: <br> {name:.. , age:... ,address:...,list:[{...}, {...}]},其中 address 是用户地址的所属信息额外赋值                                      |

<!-- ::: -->

## `select(o->proxy)`

该 api 返回自定义`proxy`对象比如我们创建了如下返回结果

::: tabs

@tab CardVO

```java

@Data
@FieldNameConstants
@EntityProxy
@SuppressWarnings("EasyQueryFieldMissMatch")
public class BankCardVO {

    private String id;
    private String uid;
    /**
     * 银行卡号
     */
    private String code;
    /**
     * 银行卡类型借记卡 储蓄卡
     */
    private String type;

    private String userName;
    private String bankName;
}
```

@tab UserVO

```java

@Data
@EntityProxy
@SuppressWarnings("EasyQueryFieldMissMatch")
@FieldNameConstants
public class DocUserVO {


    private String id;
    private String name;
    private String phone;
    private Integer age;
    private Long cardCount;

}

```

:::

因为我们添加了`@EntityProxy`注解所以默认会生成`BankCardVOProxy`的 apt 类，其中我们的`userName`和`bankName`是非`BankCard`表内的数据,
所以需要我们额外赋值


### 部分列获取
```java

List<DocBankCard> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> bank_card.type().eq("储蓄卡"))
        .select(bank_card -> bank_card.FETCHER.id().code())
        .toList();
```

### 自定义VO查询
```java



//手动join
List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .leftJoin(DocUser.class, (bank_card, user) -> bank_card.uid().eq(user.id()))
        .leftJoin(DocBank.class, (bank_card, user, bank) -> bank_card.bankId().eq(bank.id()))
        .where((bank_card, user, bank) -> {
            user.name().like("小明");
            bank_card.type().eq("储蓄卡");
        })
        .select((bank_card, user, bank) -> {
            BankCardVOProxy r = new BankCardVOProxy();
            r.selectAll(bank_card);//相当于是查询所有的bankCard字段
            r.userName().set(user.name());
            r.bankName().set(bank.name());
            return r;
        }).toList();

==> Preparing: SELECT t.id,t.uid,t.code,t.type,t1.name AS user_name,t2.name AS bank_name FROM doc_bank_card t LEFT JOIN doc_user t1 ON t.uid = t1.id LEFT JOIN doc_bank t2 ON t.bank_id = t2.id WHERE t1.name LIKE ? AND t.type = ?
==> Parameters: %小明%(String),储蓄卡(String)

//上下两种结果一样
//隐式join
List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            bank_card.user().name().like("小明");
            bank_card.type().eq("储蓄卡");
        })
        .select(bank_card -> {
            BankCardVOProxy r = new BankCardVOProxy();
            r.selectAll(bank_card);//相当于是查询所有的bankCard字段
            r.userName().set(bank_card.user().name());
            r.bankName().set(bank_card.bank().name());
            return r;
        }).toList();
==> Preparing: SELECT t.id,t.uid,t.code,t.type,t1.name AS user_name,t2.name AS bank_name FROM doc_bank_card t LEFT JOIN doc_user t1 ON t1.id = t.uid LEFT JOIN doc_bank t2 ON t2.id = t.bank_id WHERE t1.name LIKE ? AND t.type = ?
==> Parameters: %小明%(String),储蓄卡(String)



//隐式select子查询
List<DocUserVO> list = easyEntityQuery.queryable(DocUser.class)
        .where(user -> {
            user.name().like("小明");
        })
        .select(user -> {
            DocUserVOProxy r = new DocUserVOProxy();
            r.selectAll(user);//相当于是查询所有的bankCard字段
            r.cardCount().set(user.bankCards().count());
            return r;
                }).toList();

==> Preparing: SELECT t.id,t.name,t.phone,t.age,(SELECT COUNT(*) FROM doc_bank_card t1 WHERE t1.uid = t.id) AS card_count FROM doc_user t WHERE t.name LIKE ?
==> Parameters: %小明%(String)

//手动select子查询
List<DocUserVO> list = easyEntityQuery.queryable(DocUser.class)
        .where(user -> {
            user.name().like("小明");
        })
        .select(user -> {
            DocUserVOProxy r = new DocUserVOProxy();
            r.selectAll(user);//相当于是查询所有的bankCard字段
            Query<Long> longQuery = easyEntityQuery.queryable(DocBankCard.class)
                    .where(bank_card -> {
                        bank_card.uid().eq(user.id());
                    }).selectCount();
            r.cardCount().setSubQuery(longQuery);
            return r;
        }).toList();

==> Preparing: SELECT t.id,t.name,t.phone,t.age,(SELECT COUNT(*) FROM doc_bank_card t1 WHERE t1.uid = t.id) AS card_count FROM doc_user t WHERE t.name LIKE ?
==> Parameters: %小明%(String)

//手动sql片段
List<DocUserVO> list = easyEntityQuery.queryable(DocUser.class)
        .where(user -> {
            user.name().like("小明");
        })
        .select(user -> {
            DocUserVOProxy r = new DocUserVOProxy();
            r.selectAll(user);//相当于是查询所有的bankCard字段
            r.cardCount().setSQL("IFNULL({0},1)",c -> c.expression(user.age()));
            return r;
        }).toList();

==> Preparing: SELECT t.id,t.name,t.phone,t.age,IFNULL(t.age,1) AS card_count FROM doc_user t WHERE t.name LIKE ?
==> Parameters: %小明%(String)
```

### 代理对象赋值

| 方法            | 描述                                                              |
| --------------- | ----------------------------------------------------------------- |
| `set`           | `r.set(value)`将常量或者数据库函数值赋值给`proxy`对象需要类型一致 |
| `setNull`       | 赋值给列                                                          |
| `setSubQuery`   | 赋值一个子查询结果                                                |
| `setSQL`        | 赋值自定义字符串 sql 片段                                         |
| `setExpression` | 同`set`无需类型一致(弱类型)                                       |
| `selectAll`     | 同`t.*`将某张表的列自动映射匹配到结果对象中                       |




## `select(Class<TR>,expression)`

该 api 返回自定义结果对象比如我们创建了如下返回结果
::: tabs

@tab CardVO

```java

@Data
@FieldNameConstants
@SuppressWarnings("EasyQueryFieldMissMatch")
public class BankCardVO {

    private String id;
    private String uid;
    /**
     * 银行卡号
     */
    private String code;
    /**
     * 银行卡类型借记卡 储蓄卡
     */
    private String type;

    private String userName;
    private String bankName;
}
```

@tab UserVO

```java

@Data
@SuppressWarnings("EasyQueryFieldMissMatch")
@FieldNameConstants
public class DocUserVO {


    private String id;
    private String name;
    private String phone;
    private Integer age;
    private Long cardCount;

}

```

:::

### 自定义VO查询
区别于`select(o->proxy)`我们使用class结果而不是代理对象来进行结果的接受

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
                //添加FieldNameConstants,也可以使用方法引用BankCardVO::getUserName如果属性符合java的bean规范
                user.name().as(BankCardVO.Fields.userName),
                bank.name().as(BankCardVO.Fields.bankName)
        )).toList();




List<BankCardVO> list = easyEntityQuery.queryable(DocBankCard.class)
        .where(bank_card -> {
            bank_card.user().name().like("小明");
            bank_card.type().eq("储蓄卡");
        })
        .select(BankCardVO.class, bank_card -> Select.of(
                bank_card.FETCHER.allFields(),
                bank_card.user().name().as(BankCardVO.Fields.userName),
                bank_card.bank().name().as(BankCardVO.Fields.bankName)
        )).toList();




List<DocUserVO> list = easyEntityQuery.queryable(DocUser.class)
        .where(user -> {
            user.name().like("小明");
        })
        .select(DocUserVO.class,user -> Select.of(
                user.FETCHER.allFields(),
                user.bankCards().count().as(DocUserVO.Fields.cardCount)
        )).toList();



List<DocUserVO> list = easyEntityQuery.queryable(DocUser.class)
        .where(user -> {
            user.name().like("小明");
        })
        .select(DocUserVO.class,user -> Select.of(
                user.FETCHER.allFields(),
                user.expression().subQuery(()->{
                    return easyEntityQuery.queryable(DocBankCard.class)
                            .where(bank_card -> {
                                bank_card.uid().eq(user.id());
                            }).selectCount();
                }).as(DocUserVO.Fields.cardCount)
        )).toList();



List<DocUserVO> list = easyEntityQuery.queryable(DocUser.class)
        .where(user -> {
            user.name().like("小明");
        })
        .select(DocUserVO.class,user -> Select.of(
                user.FETCHER.allFields(),
                user.expression().sqlSegment("IFNULL({0},1)", c -> c.expression(user.age()),Integer.class).as(DocUserVO.Fields.cardCount)
        )).toList();
```


## `selectAutoInclude(Class<TR>,expression)`
因为`selectAutoInclude`篇幅过多所以这边建议您重新跳转到链接[结构化结果查询返回](/easy-query-doc/query/select-auto-include)

