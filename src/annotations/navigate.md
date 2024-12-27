---
title: Navigate
---

# Navigate
用来指定属性关系和当前对象的对应关系,支持entity和vo指定对象关系(vo只需要指定value)

属性  | 默认值 | 描述  
--- | --- | --- 
value | - | 用于指定一对一、一对多、多对一、多对多
selfProperty | {} | 当前对象的哪个属性关联目标对象,空表示使用当前对象的主键
targetProperty | {} | 当前对象的`selfProperty`}`属性关联目标的哪个属性,空表示使用目标对象的主键
mappingClass | Object.class | 中间表对应的entity.class
selfMappingProperty | {} | selfProperty映射到mappingClass时候的属性
targetMappingProperty | {} | targetProperty映射到mappingClass时候的属性
propIsProxy | true | 是否是代理对象(原作用兼容proxy和非proxy使用可以废弃了)
orderByProps | {} | Navigate标记的属性如何排序返回
offset | 0 | Navigate标记的属性跳过多少条
limit | 0 | Navigate标记的属性获取多少条
extraFilter | DefaultNavigateExtraFilterStrategy.class | 如何过滤中间mappingClass和Navigate标记的表添加额外过滤条件



::: warning 说明!!!
> 当使用多属性时必须两者一致比如`selfProperty`是长度为2的数组那么`targetProperty`也必须要长度为2
> `limit`目前使用`union all`来实现后续考虑使用`partation by`
:::