---
title: Structured Property Filling
order: 200
---
`easy-query` provides custom data filling beyond annotation configuration, mainly for methods outside configuration. The specific APIs are `fillOne` and `fillMany`, which can customize associated properties (one each) during queries and support direct `select vo`.

## API Description
By default, fill query results don't consume null, meaning produce won't consume null values. To consume null and handle null, set consumeNull to true.
```java
<TREntity> Query<T1> fillMany(SQLFuncExpression<Query<TREntity>> fillSetterExpression, String targetProperty, String selfProperty, BiConsumer<T1, Collection<TREntity>> produce, boolean consumeNull);


<TREntity> Query<T1> fillOne(SQLFuncExpression<Query<TREntity>> fillSetterExpression, String targetProperty, String selfProperty, BiConsumer<T1, TREntity> produce, boolean consumeNull);
```

Parameter  | Description | Scenario 
--- | --- | --- 
fillSetterExpression | How to query filled data | Custom filled data
targetProperty | Property of target table (fill return table)  | For association 
selfProperty | Property of current main table  | For association
produce | How to fill  | Custom filled data
consumeNull | Whether to call produce when association result is null  | Filter null or not

::: warning Note!!!
> If you want `targetProperty` and `selfProperty` to support strong typing, you can use lombok's `@FieldNameConstants` annotation or use `CityProxy.Fields.provinceCode, ProvinceProxy.Fields.code` in proxy mode
:::

```java
 List<Province> list =  easyQuery.queryable(Province.class)
                .fillMany(()->{
                    return easyQuery.queryable(City.class);
                },"provinceCode", "code", (x, y) -> {
                    x.setCities(new ArrayList<>(y));
                }).toList();


        List<City> list1 = easyQuery.queryable(City.class)
                .fillOne(()->{
                    return easyQuery.queryable(Province.class);
                },"code","provinceCode", (x, y) -> {
                    x.setProvince(y);
                })
                .toList();
```

VO conversion:
```java
    EasyPageResult<Province> pageResult1 = easyQuery.queryable(Province.class)
                .fillMany(x -> x.consumeNull(true).with(City.class).where(y -> y.eq(City::getCode, "3306")).select(CityVO.class)//Convert filled data to CityVO,
                        , "provinceCode"
                        , "code"
                        , (x, y) -> {
                            if (EasyCollectionUtil.isNotEmpty(y)) {
                                CityVO first = EasyCollectionUtil.first(y);//Get first city and assign
                                x.setFirstCityName(first.getName());
                            }
                        })
                .toPageResult(1, 10);
```

