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
mappingClass | Object.class | 中间表对应的entity.class
mappingClass | Object.class | 中间表对应的entity.class



::: warning 说明!!!
> 当使用多属性时必须两者一致比如`selfProperty`是长度为2的数组那么`targetProperty`也必须要长度为2
:::