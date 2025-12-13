---
title: JSON函数
order: 70
---
# JSON函数
`eq3.1.68+`已实现部分JSON函数,支持以强类型便捷的方式对json数据进行筛选查询,目前主要api分为`JSONObject`和`JSONArray`

## JSONObject
存储对象列为`JSON对象`


方法  | 功能  
---  | --- 
getField  | 获取对应json的key的值
getJSONElement  | 获取对应json的key的对象或数组
getJSONObject  | 获取对应json的key的json对象
getJSONArray  | 获取对应json的key的json数组
getString  | 获取对应json的key的值
getBoolean  | 获取对应json的key的值
getLocalDateTime  | 获取对应json的key的值
getLocalDate  | 获取对应json的key的值
getInteger  | 获取对应json的key的值
getLong  | 获取对应json的key的值
getBigDecimal  | 获取对应json的key的值
containsKey  | 判断对应json是否包含key

## JSONArray
存储对象列为`JSON数组`


方法  | 功能  
---  | --- 
getElement  | 获取对应json的key的值
getJSONElement  | 获取对应json的key的值
getJSONObject  | 获取对应json的key的json对象
getJSONArray  | 获取对应json的key的json数组
getString  | 获取对应json的key的值
getBoolean  | 获取对应json的key的值
getLocalDateTime  | 获取对应json的key的值
getLocalDate  | 获取对应json的key的值
getInteger  | 获取对应json的key的值
getLong  | 获取对应json的key的值
getBigDecimal  | 获取对应json的key的值