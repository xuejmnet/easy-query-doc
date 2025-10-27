---
title: Date Functions
order: 40
---

## Date Formatting (format)
Supports almost any type of `format` formatting

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

## Date Calculation (plus | plusDays | plusMonths | plusYears | plusSeconds | plusMinutes | plusHours)
Add or subtract corresponding values to date parts, such as adding `1 day`


Parameter  | Description  
---  | --- 
duration  | The value constant to add or subtract
durationColumn  | The database column value to add or subtract
TimeUnitEnum  | The time selection unit provided by eq (not using the system's because the system has nanoseconds while most databases don't support nanoseconds)

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

## Date Properties

Parameter  | Description  
---  | --- 
dayOfYear  | The day of the year 1-366
dayOfWeek  | The day of the week 0-6, Sunday is 0
dayOfWeekSunDayIsLastDay  | The day of the week 1-7, Sunday is 7
year  | The year value in the time
month  | The month value in the time
day  | The day value in the time
hour  | The hour value in the time
minute  | The minute value in the time
second  | The second value in the time

### dayOfYear
Returns which day of the year the time is. For January 4th, it returns 4. For February 4th, it returns 35, because January has 31 days, so February 4th is the 35th day of the year.

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
Returns the value corresponding to Monday to Sunday, with Sunday being 0 by default
Day of Week  | Value  
---  | --- 
Sunday  | 0
Monday  | 1
Tuesday  | 2
Wednesday | 3
Thursday | 4
Friday | 5
Saturday | 6

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
Day of Week  | Value  
---  | --- 
Monday  | 1
Tuesday  | 2
Wednesday | 3
Thursday | 4
Friday | 5
Saturday | 6
Sunday  | 7

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
Returns the properties of the time
```java
LocalDateTime time2025 = LocalDateTime.of(2025, 1, 2, 3, 4, 5);
```

Parameter  | Value  
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

## Get Time Interval (duration)
Get the interval between two times. By default, `before.duration(after)` returns a positive number. If reversed, it returns a negative number. If you want to return a positive number, you can use the math function `before.duration(after).toDays().abs()`

[More `Math` functions please check](/easy-query-doc/en/func/math)
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

