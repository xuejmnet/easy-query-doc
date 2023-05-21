---
title: 条件比较
order: 200
---

# 条件比较
`easy-query`的查询、修改、删除核心过滤方法就是`WherePredicate`和`SqlPredicate`两种是同一种东西,条件比较永远是`column` `compare` `value`,column永远在左侧

## API

方法  | sql | 描述  
--- | --- | --- 
gt | >  | 列 大于 值
ge | >=  | 列 大于等于 值
eq | =  | 列 等于 值
ne | !=  | 列 不等于 值
le | <=  | 列 小于等于 值
lt | < | 列 小于 值
likeMatchLeft | like word%  | 列左匹配
likeMatchRight | like %word  | 列右匹配
like | like %word%  | 列包含值
notLikeMatchLeft | not like word%  | 列 不匹配左侧
notLikeMatchRight | not like %word  | 列 不匹配右侧
notLike | not like %word%  | 列不包含值
isNull | is null  | 列 为null
isNotNull | is not null  | 列 不为null
in | in  | 列 在集合内部,集合为空返回False
notIn | not in  | 列 不在集合内部,集合为空返回True
rangeOpenClosed | < x <=  | 区间 (left..right] = {x \| left < x <= right} 一般用于范围比如时间,小的时间在前大的时间在后
rangeOpen | < x <  | 区间 (left..right) = {x \| left < x < right} 一般用于范围比如时间,小的时间在前大的时间在后
rangeClosedOpen | <= x <  | [left..right) = {x \| left <= x < right} 一般用于范围比如时间,小的时间在前大的时间在后
rangeClosed | <= x <=  | \[left..right\] = {x \| left <= x <= right} 一般用于范围比如时间,小的时间在前大的时间在后
columnFunc | 自定义  | 自定义函数包裹column