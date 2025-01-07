---
title: 对象映射规则
---

# 对象映射规则
`eq 2.4.0+`版本提供`mapping-strategy`提供三个选择,默认(之前版本)是`COLUMN_ONLY`，新版本提供了额外两种选择`PROPERTY_ONLY`和`COLUMN_AND_PROPERTY`

如果你无法理解那么请在`新项目`的时候选择`PROPERTY_ONLY`❗️

如果你无法理解那么请在`新项目`的时候选择`PROPERTY_ONLY`❗️

如果你无法理解那么请在`新项目`的时候选择`PROPERTY_ONLY`❗️



`convert`函数表示映射的列名,值为`propertyName`+`nameConversion`如果属性添加`@Column(value="xx")`则结果为`xx`

| 方法                                                      | 描述                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| COLUMN_ONLY                                           | `convert(A.property)==convert(AVO.property)` |
| PROPERTY_ONLY                   | `A.property==AVO.property`                                                     |
| COLUMN_AND_PROPERTY              | `findNull(convert(A.property),A.property)==findNull(convert(AVO.property),AVO.property)`  |

## 实体和结果


::: tabs

@tab entity
```java
public class A{
    @Column(value="c")
    private String a;
    private String b;
}
```
@tab vo

```java
public class AVO{
    private String a;
    private String b;
    @Column(value="c")
    private String d;
}
```
:::


## COLUMN_ONLY(默认)
表示实体的对应的列名和映射对象的列名相同能映射

A.a->AVO.d

A.b->AVO.b

N/A->AVO.a


## PROPERTY_ONLY
表示实体的对应的属性名和映射对象的属性名相同能映射

A.a->AVO.a

A.b->AVO.b

N/A->AVO.d


## COLUMN_AND_PROPERTY
表示先使用实体对应的列名匹配如果无法映射则使用属性名进行匹配


A.a->AVO.d

A.b->AVO.b

N/A->AVO.a