---
title: 日期函数
order: 40
---

## 日期格式化(format)
支持几乎任意类型的`format`格式化

```java

String format1="yyyy年MM-01 HH:mm分ss秒";
String format2="yyyy-MM-dd HH:mm:ss";
String format3="yyyy/MM-/01 HH时mm分ss秒";

List<Draft4<LocalDateTime, String, String, String>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.createTime(),
                t_blog.createTime().format(format1),
                t_blog.createTime().format(format2),
                t_blog.createTime().format(format3)
        )).toList();

Assert.assertFalse(list.isEmpty());
for (Draft4<LocalDateTime, String, String, String> timeAndFormat : list) {
    LocalDateTime value1 = timeAndFormat.getValue1();
    String formatv1 = value1.format(DateTimeFormatter.ofPattern(format1));
    Assert.assertEquals(formatv1, timeAndFormat.getValue2());
    String formatv2 = value1.format(DateTimeFormatter.ofPattern(format2));
    Assert.assertEquals(formatv2, timeAndFormat.getValue3());
    String formatv3 = value1.format(DateTimeFormatter.ofPattern(format3));
    Assert.assertEquals(formatv3, timeAndFormat.getValue4());
}
```

## 日期计算(plus | plusDays | plusMonths | plusYears | plusSeconds | plusMinutes | plusHours)
对日期部分增加或减少对应值比如加`1天`


参数  | 说明  
---  | --- 
duration  | 增加或者减少的值常量
durationColumn  | 增加或者减少的值数据库列
TimeUnitEnum  | eq提供的时间选择单位(不使用系统的是因为系统有纳秒而数据库大部分不支持纳秒)

```java

List<Draft7<LocalDateTime, LocalDateTime, LocalDateTime, LocalDateTime, LocalDateTime, LocalDateTime, LocalDateTime>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.createTime(),
                t_blog.createTime().plus(1, TimeUnitEnum.DAYS),
                t_blog.createTime().plusMinutes(10),
                t_blog.createTime().plusSeconds(10),
                t_blog.createTime().plusHours(10),
                t_blog.createTime().plusMonths(10),
                t_blog.createTime().plusYears(1)
        )).toList();
Assert.assertFalse(list.isEmpty());
for (Draft7<LocalDateTime, LocalDateTime, LocalDateTime, LocalDateTime, LocalDateTime, LocalDateTime, LocalDateTime> timeAndFormat : list) {
    LocalDateTime value1 = timeAndFormat.getValue1();
    Assert.assertEquals(value1.plusDays(1), timeAndFormat.getValue2());
    Assert.assertEquals(value1.plusMinutes(10), timeAndFormat.getValue3());
    Assert.assertEquals(value1.plusSeconds(10), timeAndFormat.getValue4());
    Assert.assertEquals(value1.plusHours(10), timeAndFormat.getValue5());
    Assert.assertEquals(value1.plusMonths(10), timeAndFormat.getValue6());
    Assert.assertEquals(value1.plusYears(1), timeAndFormat.getValue7());
}
```

## 日期属性

参数  | 说明  
---  | --- 
dayOfYear  | 时间是一年中的第几天 1- 366
dayOfWeek  | 时间是一周中的第几天  0-6 周日为0
dayOfWeekSunDayIsLastDay  | 时间是一周中的第几天  1-7 周日为7
year  | 时间中的年值
month  | 时间中的月值
day  | 时间中的天值
hour  | 时间中的小时值
minute  | 时间中的分值
second  | 时间中的秒值

### dayOfYear
返回时间是一年中的第几天,如果是1月4日返回的是4如果是2月4日返回的是35,因为1月有31天所以2月4日是一年中的第35天

```java
List<Draft2<LocalDateTime, Integer>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.createTime(),
                t_blog.createTime().dayOfYear()
        )).toList();
Assert.assertFalse(list.isEmpty());
for (Draft2<LocalDateTime, Integer> item : list) {
    int dayOfYear = item.getValue1().getDayOfYear();
    Assert.assertEquals(item.getValue2().intValue(), dayOfYear);
}
```


### dayOfWeek
返回周一到周日对应的值默认周日是0
星期  | 值  
---  | --- 
星期日  | 0
星期一  | 1
星期二  | 2
星期三 | 3
星期四 | 4
星期五 | 5
星期六 | 6

```java

List<Draft2<LocalDateTime, Integer>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.createTime(),
                t_blog.createTime().dayOfWeek()
        )).toList();
Assert.assertFalse(list.isEmpty());
for (Draft2<LocalDateTime, Integer> item : list) {
    DayOfWeek dayOfWeek = item.getValue1().getDayOfWeek();
    int i = item.getValue2().intValue();
    if(i==0){
        Assert.assertEquals(7, dayOfWeek.getValue());
    }else{
        Assert.assertEquals(i, dayOfWeek.getValue());
    }
}
```

### dayOfWeekSunDayIsLastDay
星期  | 值  
---  | --- 
星期一  | 1
星期二  | 2
星期三 | 3
星期四 | 4
星期五 | 5
星期六 | 6
星期日  | 7

```java

List<Draft2<LocalDateTime, Integer>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.createTime(),
                t_blog.createTime().dayOfWeekSunDayIsLastDay()
        )).toList();
Assert.assertFalse(list.isEmpty());
for (Draft2<LocalDateTime, Integer> item : list) {
    DayOfWeek dayOfWeek = item.getValue1().getDayOfWeek();
    Assert.assertEquals(item.getValue2().intValue(), dayOfWeek.getValue());
}
```


### year | month | day | hour | minute | second
返回时间的属性
```java
LocalDateTime time2025 = LocalDateTime.of(2025, 1, 2, 3, 4, 5);
```

参数  | 值  
---  | --- 
year  | 2025
month  | 1
day  | 2
hour  | 3
minute  | 4
second  | 5

```java

List<Draft7<LocalDateTime, Integer, Integer, Integer, Integer, Integer, Integer>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.createTime(),
                t_blog.createTime().year(),
                t_blog.createTime().month(),
                t_blog.createTime().day(),
                t_blog.createTime().hour(),
                t_blog.createTime().minute(),
                t_blog.createTime().second()
        )).toList();
Assert.assertFalse(list.isEmpty());
for (Draft7<LocalDateTime, Integer, Integer, Integer, Integer, Integer, Integer> item : list) {
    LocalDateTime value1 = item.getValue1();
    Assert.assertEquals(value1.getYear(), item.getValue2().intValue());
    Assert.assertEquals(value1.getMonth().ordinal()+1, item.getValue3().intValue());
    Assert.assertEquals(value1.getDayOfMonth(), item.getValue4().intValue());
    Assert.assertEquals(value1.getHour(), item.getValue5().intValue());
    Assert.assertEquals(value1.getMinute(), item.getValue6().intValue());
    Assert.assertEquals(value1.getSecond(), item.getValue7().intValue());
}
```

### dateTimeProp
```java

List<Draft7<LocalDateTime, Integer, Integer, Integer, Integer, Integer, Integer>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.createTime(),
                t_blog.createTime().dateTimeProp(DateTimeUnitEnum.Year),
                t_blog.createTime().dateTimeProp(DateTimeUnitEnum.Month),
                t_blog.createTime().dateTimeProp(DateTimeUnitEnum.Day),
                t_blog.createTime().dateTimeProp(DateTimeUnitEnum.Hour),
                t_blog.createTime().dateTimeProp(DateTimeUnitEnum.Minute),
                t_blog.createTime().dateTimeProp(DateTimeUnitEnum.Second)
        )).toList();
Assert.assertFalse(list.isEmpty());
for (Draft7<LocalDateTime, Integer, Integer, Integer, Integer, Integer, Integer> item : list) {
    LocalDateTime value1 = item.getValue1();
    Assert.assertEquals(value1.getYear(), item.getValue2().intValue());
    Assert.assertEquals(value1.getMonth().ordinal()+1, item.getValue3().intValue());
    Assert.assertEquals(value1.getDayOfMonth(), item.getValue4().intValue());
    Assert.assertEquals(value1.getHour(), item.getValue5().intValue());
    Assert.assertEquals(value1.getMinute(), item.getValue6().intValue());
    Assert.assertEquals(value1.getSecond(), item.getValue7().intValue());
}
```

## 获取时间间隔(duration)
获取两个时间的间隔，默认 `before.duration(after)`返回正数,如果相反则返回负数,如果希望返回的是正数可以使用math函数`before.duration(after).toDays().abs()`

[更多`Math`函数请查看](/easy-query-doc/func/math)
```java

LocalDateTime time2025 = LocalDateTime.of(2025, 1, 1, 0, 0, 0);
List<Draft6<LocalDateTime, Long, Long, Long, Long, Long>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.createTime(),
                t_blog.createTime().duration(time2025).toDays(),
                t_blog.createTime().duration(time2025).toHours(),
                t_blog.createTime().duration(time2025).toMinutes(),
                t_blog.createTime().duration(time2025).toSeconds(),
                t_blog.createTime().duration(time2025).toValues(DateTimeDurationEnum.Days)
        )).toList();
Assert.assertFalse(list.isEmpty());
for (Draft6<LocalDateTime, Long, Long, Long, Long, Long> item : list) {
    LocalDateTime value1 = item.getValue1();
    Duration between = Duration.between(value1, time2025);

    Assert.assertEquals(between.toDays(), item.getValue2().longValue());
    Assert.assertEquals(between.toHours(), item.getValue3().longValue());
    Assert.assertEquals(between.toMinutes(), item.getValue4().longValue());
    Assert.assertEquals(between.getSeconds(), item.getValue5().longValue());
    Assert.assertEquals(between.toDays(), item.getValue6().longValue());
}
```

## now | utcNow
```java

List<Draft2<LocalDateTime, LocalDateTime>> list = easyEntityQuery.queryable(BlogEntity.class)
        .select(t_blog -> Select.DRAFT.of(
                t_blog.expression().now(),
                t_blog.expression().utcNow()
        )).toList();
```