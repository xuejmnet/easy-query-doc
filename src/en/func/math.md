---
title: Math Functions
order: 50
---

`eq` provides a rich set of Math functions, mainly used directly after `number` type properties or called through static methods of `SQLMathExpreesion`

Function Name  | Description  
---  | ---  
abs  | Absolute value  
sign | Returns an integer indicating the sign of the number (returns 1 for positive, -1 for negative, 0 for zero)  
floor | Round down  
ceiling | Round up  
round(propTypeColumn) | Round to nearest  
round(propTypeColumn, decimals) | Round to specified decimal places  
exp | e to the power  
log(propTypeColumn) | Natural logarithm (base e)  
log(propTypeColumn, newBase) | Logarithm with specified base  
log10 | Base 10 logarithm  
pow(propTypeColumn) | Power operation (may be used to pass subsequent parameters)  
pow(propTypeColumn, exponent) | Power operation, `base^exponent`  
sqrt | Square root  
cos | Cosine trigonometric function  
sin | Sine trigonometric function  
tan | Tangent trigonometric function  
acos | Inverse cosine function  
asin | Inverse sine function  
atan | Inverse tangent function  
atan2 | Inverse tangent of coordinates (x, y), considering quadrants  
truncate | Truncate to integer or decimal with specified precision


## Examples

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

