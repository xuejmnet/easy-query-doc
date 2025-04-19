---
title: 数学函数
order: 50
---

`eq`提供了丰富的Math函数,主要在`number`类型的属性后面直接使用或者通过`SQLMathExpreesion`的静态方法调用

函数名  | 说明  
---  | ---  
abs  | 绝对值  
sign | 返回一个整数，表示数字的符号（正数返回1，负数返回-1，零返回0）  
floor | 向下取整  
ceiling | 向上取整  
round(propTypeColumn) | 四舍五入  
round(propTypeColumn, decimals) | 四舍五入到指定小数位  
exp | e 的幂次方  
log(propTypeColumn) | 自然对数（以 e 为底）  
log(propTypeColumn, newBase) | 指定底数的对数  
log10 | 以 10 为底的对数  
pow(propTypeColumn) | 幂运算（可能用于传入后续参数）  
pow(propTypeColumn, exponent) | 幂运算，`base^exponent`  
sqrt | 平方根  
cos | 余弦三角函数  
sin | 正弦三角函数  
tan | 正切三角函数  
acos | 反余弦函数  
asin | 反正弦函数  
atan | 反正切函数  
atan2 | 坐标 (x, y) 的反正切，考虑象限  
truncate | 截断为整数或指定精度的小数


## 案例

```java


List<Draft6<BigDecimal, BigDecimal, Integer, BigDecimal, BigDecimal, BigDecimal>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.score(),
                t_blog.score().abs(),
                t_blog.score().sign(),
                t_blog.score().floor(),
                t_blog.score().ceiling(),
                t_blog.score().log()
        )).toList();
```