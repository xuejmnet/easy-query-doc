---
title: select
---

# 说明

`easy-query`在 java 的静态语言特性下，参考众多 C# ORM(efcore,freesql,sqlsugar...),和 java ORM(mybatis-plus,beetlsql...)实现了支持单表多表，复杂，嵌套的 sql 表达式，并且拥有强类型语法提示，可以帮助不想写 sql 的用户，有洁癖的用户多一个选择.

## select

`eq`的`select`是用来终结当前表达式生成新的表达式的方式,简单理解为表示告诉框架当前表达式需要返回的结果是`select`的结果,如果您了解`stream api`那么可以简单的理解为其`map`操作

::: tip 概念补充 说明!!!

> `eq`这个 orm 与之前您认识的 java 其他 orm 不相同,这个 orm 实现了近乎 95%的 sql 功能,其中一个就是子查询嵌套,所谓的子查询嵌套就是将之前查询结果视作`派生表`或叫做`内嵌视图`,后续我们将其统一称其为`内嵌视图`,比如`select .... from (select id,name from table where name like ?) t where t.id = ?`这个 sql 的括号内的那一部分(`select id,name from table where name like ?`)我们称之为`内嵌视图`
> :::

所以我们可以很轻易的实现其他 orm 无法实现的

```sql
select ... from
    (
        select
            key1,
            key2,
            count() as c,
            avg() as a,
            sum() as s
        from
            table
        where
            name like ?
        group by
            key1,
            key2
    ) t1
    left join table2 t2 on t.key1 = t2.key1
where.....
```

## select 后置风格

和原生 SQL 不同，在`eq`提供的 DSL 中，使用的是`select`后置风格，这个风格多见于`c#`语言的`orm`中和`stream api`有一种异曲同工之处，那么为什么`eq`选择`select`后置?

- 强类型的 java 语言类型`select`后置有助于推导表达式后续可操作的类,比如`stream api`
- `select后置`其实本质和书写 sql 是一样的,虽然你在编写 sql 的时候是 select 先写但是你在不写`from group by`等操作后是无法编写 select 的内容只能用`*`来代替,所以其实 sql 的书写本质也是`select后置`

<img src="/sql-executor.png" width="500">

::: tip 说明!!!

> 这张图充分的说明了 sql 的执行过程和解析过程也是 eq 的书写过程,该执行流程中唯一能调换的就是`select`和`order by`的顺序

- 每次 select 会对之前的表达式进行汇总生成`内嵌视图`,对后续的 select 继续操作那么将对`内嵌视图`进行操作
  :::

`select`语句出现在`where`，`orderBy`，`groupBy`，`having`等之后,如果表达式调用了`select`那么这个 sql 就是确定了的如果再次调用`where`那么前面的表达式将被视为`派生表`或`内嵌视图`，比如`select .... from (select id,name from table ) t where t.id = ?`每次`select`会对当前表达式进行一次结果集包装(`派生表`或`内嵌视图`)

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
