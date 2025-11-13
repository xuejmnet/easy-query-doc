---
title: 结构化属性填充
order: 200
---
`easy-query`提供了注解配置以外的自定义填充数据,主要是针对配置外的方法,具体api为`fillOne`、`fillMany`,可以再查询时自定义关联属性(各自一个),并且支持直接`select vo`


## api说明
默认fill查询结果不消费null也就是produce里面不会消费null值,如果要消费null对null处理可以在consumeNull处设置为true
```java
<TREntity> Query<T1> fillMany(SQLFuncExpression<Query<TREntity>> fillSetterExpression, String targetProperty, String selfProperty, BiConsumer<T1, Collection<TREntity>> produce, boolean consumeNull);


<TREntity> Query<T1> fillOne(SQLFuncExpression<Query<TREntity>> fillSetterExpression, String targetProperty, String selfProperty, BiConsumer<T1, TREntity> produce, boolean consumeNull);
```

参数  | 描述 | 场景 
--- | --- | --- 
fillSetterExpression | 填充数据如何查询 | 自定义填充数据
fillContext | 用于设置selfProperty和targetProperty和是否消费null值  | 用于关联 
produce | 如何填充  | 自定义填充数据


::: warning 说明!!!
> 如果希望`targetProperty`和`selfProperty`支持强类型可以通过lombok的`@FieldNameConstants`注解或者使用proxy模式下的`CityProxy.Fields.provinceCode, ProvinceProxy.Fields.code`
:::


```java
 List<Province> list =  easyQuery.queryable(Province.class)
                .fillMany(()->{
                    return easyQuery.queryable(City.class);
                },c->c.self_target("code", "provinceCode"), (x, y) -> {
                    x.setCities(new ArrayList<>(y));
                }).toList();


        List<City> list1 = easyQuery.queryable(City.class)
                .fillOne(()->{
                    return easyQuery.queryable(Province.class);
                },c->c.self_target("code", "provinceCode"), (x, y) -> {
                    x.setProvince(y);
                })
                .toList();
```

vo转换
```java
    EasyPageResult<Province> pageResult1 = easyQuery.queryable(Province.class)
                .fillMany(x -> easyQuery.queryable(City.class).where(y -> y.code().eq("3306")).select(CityVO.class)//填充数据转成CityVO,
                        ,c->c.self_target("code", "provinceCode"), (x, y) -> {
                            if (EasyCollectionUtil.isNotEmpty(y)) {
                                CityVO first = EasyCollectionUtil.first(y);//获取第一条city并且赋值
                                x.setFirstCityName(first.getName());
                            }
                        })
                .toPageResult(1, 10);
```