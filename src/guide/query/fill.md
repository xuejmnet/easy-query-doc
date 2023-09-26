---
title: 关联查询 Fill
---
`easy-query`提供了注解配置以外的自定义填充数据,主要是针对配置外的方法,具体api为`fillOne`、`fillMany`,可以再查询时自定义关联属性(各自一个),并且支持直接`select vo`

::: warning 说明!!!
> 暂时不支持`proxy`模式
:::

## api说明
默认fill查询结果不消费null也就是produce里面不会消费null值
```java
<TREntity> Queryable<T1> fillOne(SQLFuncExpression1<SQLFillSelector, Queryable<TREntity>> fillSetterExpression, Property<TREntity, ?> targetProperty, Property<T1, ?> selfProperty, BiConsumer<T1, TREntity> produce)


<TREntity> Queryable<T1> fillMany(SQLFuncExpression1<SQLFillSelector, Queryable<TREntity>> fillSetterExpression, Property<TREntity, ?> targetProperty,Property<T1, ?> selfProperty,  BiConsumer<T1, Collection<TREntity>> produce)
```

参数  | 描述 | 场景 
--- | --- | --- 
condition | 是否需要执行当前方法  | 动态fill填充数据
fillSetterExpression | 填充数据如何查询 | 自定义填充数据
targetProperty | 目标表就是fill返回的表的属性  | 用于关联
selfProperty | 当前主表的属性  | 用于关联
produce | 如何填充  | 自定义填充数据
consumeNull | 当关联结果为null是否也会调用produce  | 过滤null或者不过滤

```java
List<Province> list = easyQuery.queryable(Province.class)
        .fillMany(x -> x.with(City.class).where(y -> y.eq(City::getCode, "3306"))
                , City::getProvinceCode
                , Province::getCode
                , (x, y) -> {
                    x.setCities(new ArrayList<>(y));
                })
        .toList();


List<City> list1 = easyQuery.queryable(City.class)
            .fillOne(x -> x.with(Province.class), Province::getCode, City::getProvinceCode, (x, y) -> {
                x.setProvince(y);
            })
            .toList();
```

vo转换
```java
    EasyPageResult<Province> pageResult1 = easyQuery.queryable(Province.class)
                .fillMany(x -> x.consumeNull(true).with(City.class).where(y -> y.eq(City::getCode, "3306")).select(CityVO.class)//填充数据转成CityVO,
                        , CityVO::getProvinceCode
                        , Province::getCode
                        , (x, y) -> {
                            if (EasyCollectionUtil.isNotEmpty(y)) {
                                CityVO first = EasyCollectionUtil.first(y);//获取第一条city并且赋值
                                x.setFirstCityName(first.getName());
                            }
                        })
                .toPageResult(1, 10);
```