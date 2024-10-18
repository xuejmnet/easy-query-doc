---
title: 关联查询 Include
---

`easy-query` 1.2.1+ 支持关联查询,支持多级关联查询,并且只支持first和tolist两个返回方法,支持vo对象返回支持`include`追加追踪、禁止、逻辑删除、where过滤、order、limit等一系列处理，但是返回结果必须是数据库对象实例(include方法内部),如果需要额外字段返回可以使用`columnInclude`/`columnIncludeMany`自定义返回

::: warning 说明!!!
> `OneToOne`和`ManyToOne`有着天然的区别,比如每条记录都有一个创建人id,如果你添加创建人关系对象到记录对象里面,那么应该设置`ManyToOne`表示多条记录都会有这个创建人,而不是`OneToOne`，如果您设置`OneToOne`那么如果2条记录有相同的创建人则只会有一个创建人被关联上,具体可以反向推导比如一个人有多少条记录很明显是`OneToMany`那么反过来就是`ManyToOne`
:::

类型  | 描述 | 场景 
--- | --- | --- 
OneToOne | 一对一  | 学生和学生家庭信息
OneToMany | 一对多 | 班级和学生
ManyToOne | 多对一  | 学生和班级
ManyToMany | 多对多  | 班级和老师

```java

List<SchoolClass> classes = easyEntityQuery.queryable(SchoolClass.class)
                        //查询班级并且连带查询每个班级最先入学的前5位学生
                        .include(o -> o.schoolStudents(),x->x.orderBy(u->u.createTime().asc()).limit(5))
                        .toList();

```


::: tip 感谢!!!
> 以下关系图有网友 [`糊搞`](https://gitee.com/gollyhu) 大佬提供十分感谢
:::

### 一对一说明
<img src="/include1.png">

### 多对一说明
<img src="/include2.png">

### 一对多说明

<img src="/include3.png">

### 多对多说明

<img src="/include4.png">

### 多次include

<img src="/include5.png">

### 多关联查询

<img src="/include6.png">


::: warning 说明!!!
> `include` 内部属于独立查询,如果您需要差异更新并且没有配置默认启动追踪查询那么需要独立进行`asTracking()`等,include的后one或者many的第二个参数表示以多少关联属性为一组进行获取

对象模式`include/includes`参数说明 其中如果您的导航属性是`ToOne`那么请使用`include`如果是`ToMany`那么是`includes`

包含的两个参数第一个参数表示你要返回的导航属性,第二个参数表示对返回导航属性如何进行增强
```java
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                //表示查询学校班级的同时附带查询出班级的老师
                .includes(s -> s.schoolTeachers())
                //查询学校班级的同时附带查询出班级的学生(这个学生是每个班级年龄最大的三个)并且返回的学生也需要返回学生地址
                .includes(s -> s.schoolStudents(),x->{
                    x.include(y->y.schoolStudentAddress())
                    .orderBy(y->y.age().desc())
                    .limit(3);
                })
                .where(s -> {
                    s.name().eq("一班");
                }).toList();
```

::: code-tabs
@tab 对象模式
```java
List<SchoolStudent> list = easyEntityQuery.queryable(SchoolStudent.class)
        //一对一查询启用追踪并且对子查询逻辑删除禁用
        .include(o -> o.schoolClass(),q->q.asNoTracking().disableLogicDelete())
        .toList();


List<SchoolStudent> list2 = easyEntityQuery.queryable(SchoolStudent.class)
        //一对一查询启用追踪并且对子查询逻辑删除禁用
        //如果查询学生有20个以上假如21个那么会先用20个id进行in查询,再用1个id进行查询最后进行合并
        .include(o -> o.schoolClass(),20)
        .toList();
```

@tab lambda模式
```java
  List<SchoolStudent> list1 = easyQuery.queryable(SchoolStudent.class)
                        //一对一查询启用追踪并且对子查询逻辑删除禁用
                        .include(o -> o.one(SchoolStudent::getSchoolStudentAddress).asTracking().disableLogicDelete())
                        .toList();


  List<SchoolStudent> list1 = easyQuery.queryable(SchoolStudent.class)
                        //一对一查询启用追踪并且对子查询逻辑删除禁用
                        //如果查询学生有20个以上假如21个那么会先用20个id进行in查询,再用1个id进行查询最后进行合并
                        .include(o -> o.one(SchoolStudent::getSchoolStudentAddress,20))
                        .toList();
```
@tab 属性模式
```java
  List<SchoolStudent> list1 = easyQueryClient.queryable(SchoolStudent.class)
                        //一对一查询启用追踪并且对子查询逻辑删除禁用
                        .include(o -> o.with("schoolStudentAddress").asTracking().disableLogicDelete())
                        .toList();


  List<SchoolStudent> list1 = easyQueryClient.queryable(SchoolStudent.class)
                        //一对一查询启用追踪并且对子查询逻辑删除禁用
                        //如果查询学生有20个以上假如21个那么会先用20个id进行in查询,再用1个id进行查询最后进行合并
                        .include(o -> o.with("schoolStudentAddress",20))
                        .toList();
```


::: 

## Navigate


属性  | 是否必填 | 默认值  | 描述
--- | --- | --- | --- 
value | `true`  | - | 表示当前对象和目标对象的关系`RelationTypeEnum`枚举
selfProperty | `false`  | - | 当前对象的哪个属性关联目标对象,空表示使用当前对象的主键
targetProperty | `false`  | - | 当前对象的`selfProperty`属性关联目标的哪个属性,空表示使用目标对象的主键
mappingClass | `false`  | Object.class | 中间表对象,必须是表对象实体字节
selfMappingProperty | `false`多对多必填  | - | 当前对象的`selfProperty`属性对应中间表的哪个属性,多对多不能为空
targetMappingProperty | `false`多对多必填  | - | 目标对象的`targetProperty`属性对应中间表的哪个属性,多对多不能为空



## 普通链接查询
```java
//班级表
@Table("school_class")
@Data
@ToString
public class SchoolClass {
    @Column(primaryKey = true)//主键
    private String id;
    private String name;
    //一对多 一个班级多个学生
    @Navigate(value = RelationTypeEnum.OneToMany, targetProperty = "classId")
    //完整配置,property忽略表示对应的主键
//    @Navigate(value = RelationTypeEnum.OneToMany,selfProperty = "id",targetProperty = "classId")
    private List<SchoolStudent> schoolStudents;

    //中间表多对多配置,其中mappingClass表示中间表,selfMappingProperty表示中间表的哪个字段和当前表对应,
    //targetMappingProperty表示中间表的哪个字段和目标表的属性对应
    @Navigate(value = RelationTypeEnum.ManyToMany
            , mappingClass = SchoolClassTeacher.class
            , selfMappingProperty = "classId"
            , targetMappingProperty = "teacherId")
    //完整配置其中自己的属性和目标属性忽略表示主键
//    @Navigate(value = RelationTypeEnum.ManyToMany
//            , selfProperty = "id"
//            , targetProperty = "id"
//            , mappingClass = SchoolClassTeacher.class
//            , selfMappingProperty = "classId"
//            , targetMappingProperty = "teacherId")

    private List<SchoolTeacher> schoolTeachers;
}

//学生表
@Table("school_student")
@Data
@ToString
public class SchoolStudent {
    @Column(primaryKey = true)
    private String id;
    private String classId;
    private String name;
    @Navigate(value = RelationTypeEnum.ManyToOne,selfProperty = "classId",targetProperty = "id")
    private SchoolClass schoolClass;
    @Navigate(value = RelationTypeEnum.OneToOne,targetProperty = "studentId")
    private SchoolStudentAddress schoolStudentAddress;
}

//学生地址表
@Table("school_student_address")
@Data
@ToString
public class SchoolStudentAddress {
    private String id;
    private String studentId;
    private String address;
    @Navigate(value = RelationTypeEnum.ManyToOne,selfProperty = "studentId",targetProperty = "id")
    private SchoolStudent schoolStudent;
}

//教师表
@Table("school_teacher")
@Data
@ToString
public class SchoolTeacher {
    @Column(primaryKey = true)
    private String id;
    private String name;
    @Navigate(value = RelationTypeEnum.ManyToMany
            , mappingClass = SchoolClassTeacher.class
            , selfProperty = "id"
            , selfMappingProperty = "teacherId"
            , targetProperty = "id"
            , targetMappingProperty = "classId")
    private List<SchoolClass> schoolClasses;
}

//教师和班级的多对多关系表
@Table("school_class_teacher")
@Data
@ToString
public class SchoolClassTeacher {
    @Column(primaryKey = true)
    private String classId;
    @Column(primaryKey = true)
    private String teacherId;
}
```

## OneToOne
学生和学生地址信息关系
```java
 List<SchoolStudent> stus = easyQuery.queryable(SchoolStudent.class)
                        .include(o -> o.one(SchoolStudent::getSchoolStudentAddress))
                        .toList();

==> Preparing: SELECT `id`,`class_id`,`name` FROM `school_student`
<== Time Elapsed: 2(ms)
<== Total: 3
==> Preparing: SELECT `id`,`student_id`,`address` FROM `school_student_address` WHERE `student_id` IN (?,?,?)
==> Parameters: 1(String),2(String),3(String)
<== Time Elapsed: 2(ms)
<== Total: 3
[SchoolStudent(id=1, classId=class1, name=学生1, schoolClass=null, schoolStudentAddress=SchoolStudentAddress(id=address1, studentId=1, address=地址1, schoolStudent=null)), SchoolStudent(id=2, classId=class2, name=学生2, schoolClass=null, schoolStudentAddress=SchoolStudentAddress(id=address2, studentId=2, address=地址2, schoolStudent=null)), SchoolStudent(id=3, classId=class1, name=学生3, schoolClass=null, schoolStudentAddress=SchoolStudentAddress(id=address3, studentId=3, address=地址3, schoolStudent=null))]
```

## OneToMany

::: tip 说明!!!
> 一对多无论是否存在多的一方最终都会填充集合,永远不会为null
:::

```java
List<SchoolClass> classes = easyQuery.queryable(SchoolClass.class)
                        .include(o -> o.many(SchoolClass::getSchoolStudents))
                        .toList();

==> Preparing: SELECT `id`,`name` FROM `school_class`
<== Time Elapsed: 2(ms)
<== Total: 3
==> Preparing: SELECT `id`,`class_id`,`name` FROM `school_student` WHERE `class_id` IN (?,?,?)
==> Parameters: class3(String),class2(String),class1(String)
<== Time Elapsed: 3(ms)
<== Total: 3
[SchoolClass(id=class1, name=班级1, schoolStudents=[SchoolStudent(id=1, classId=class1, name=学生1, schoolClass=null, schoolStudentAddress=null), SchoolStudent(id=3, classId=class1, name=学生3, schoolClass=null, schoolStudentAddress=null)], schoolTeachers=null), SchoolClass(id=class2, name=班级2, schoolStudents=[SchoolStudent(id=2, classId=class2, name=学生2, schoolClass=null, schoolStudentAddress=null)], schoolTeachers=null), SchoolClass(id=class3, name=班级3, schoolStudents=[], schoolTeachers=null)]
```

## ManyToOne

```java
List<SchoolStudent> stus = easyQuery.queryable(SchoolStudent.class)
                        .include(o -> o.one(SchoolStudent::getSchoolClass))
                        .toList();

==> Preparing: SELECT `id`,`class_id`,`name` FROM `school_student`
<== Time Elapsed: 2(ms)
<== Total: 3
==> Preparing: SELECT `id`,`name` FROM `school_class` WHERE `id` IN (?,?)
==> Parameters: class2(String),class1(String)
<== Time Elapsed: 2(ms)
<== Total: 2
[SchoolStudent(id=1, classId=class1, name=学生1, schoolClass=SchoolClass(id=class1, name=班级1, schoolStudents=null, schoolTeachers=null), schoolStudentAddress=null), SchoolStudent(id=2, classId=class2, name=学生2, schoolClass=SchoolClass(id=class2, name=班级2, schoolStudents=null, schoolTeachers=null), schoolStudentAddress=null), SchoolStudent(id=3, classId=class1, name=学生3, schoolClass=SchoolClass(id=class1, name=班级1, schoolStudents=null, schoolTeachers=null), schoolStudentAddress=null)]
```

## ManyToMany
班级和老师之间的关系
::: tip 说明!!!
> 多对多无论是否存在多的一方最终都会填充集合,永远不会为null
:::
```java
List<SchoolClass> classes = easyQuery.queryable(SchoolClass.class)
                        .include(o -> o.many(SchoolClass::getSchoolTeachers))
                        .toList();



==> Preparing: SELECT `id`,`name` FROM `school_class`
<== Time Elapsed: 1(ms)
<== Total: 3
==> Preparing: SELECT `class_id`,`teacher_id` FROM `school_class_teacher` WHERE `class_id` IN (?,?,?)
==> Parameters: class3(String),class2(String),class1(String)
<== Time Elapsed: 3(ms)
<== Total: 3
==> Preparing: SELECT `id`,`name` FROM `school_teacher` WHERE `id` IN (?,?)
==> Parameters: teacher2(String),teacher1(String)
<== Time Elapsed: 2(ms)
<== Total: 2
[SchoolClass(id=class1, name=班级1, schoolStudents=null, schoolTeachers=[SchoolTeacher(id=teacher1, name=老师1, schoolClasses=null), SchoolTeacher(id=teacher2, name=老师2, schoolClasses=null)]), SchoolClass(id=class2, name=班级2, schoolStudents=null, schoolTeachers=[SchoolTeacher(id=teacher2, name=老师2, schoolClasses=null)]), SchoolClass(id=class3, name=班级3, schoolStudents=null, schoolTeachers=[])]
```
## 多次include
查询班级下面的所有老师和学生
```java
List<SchoolClass> classes = easyQuery.queryable(SchoolClass.class)
                    .include(o -> o.many(SchoolClass::getSchoolTeachers))
                    .include(o -> o.many(SchoolClass::getSchoolStudents))
                    .toList();



==> Preparing: SELECT `id`,`name` FROM `school_class`
<== Time Elapsed: 2(ms)
<== Total: 3
==> Preparing: SELECT `class_id`,`teacher_id` FROM `school_class_teacher` WHERE `class_id` IN (?,?,?)
==> Parameters: class3(String),class2(String),class1(String)
<== Time Elapsed: 2(ms)
<== Total: 3
==> Preparing: SELECT `id`,`name` FROM `school_teacher` WHERE `id` IN (?,?)
==> Parameters: teacher2(String),teacher1(String)
<== Time Elapsed: 2(ms)
<== Total: 2
==> Preparing: SELECT `id`,`class_id`,`name` FROM `school_student` WHERE `class_id` IN (?,?,?)
==> Parameters: class3(String),class2(String),class1(String)
<== Time Elapsed: 1(ms)
<== Total: 3
```


## 多关联查询
### 省市区
```java
@Table("t_province")
@Data
@ToString
public class Province {
    @Column(primaryKey = true)
    private String code;
    private String name;
    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty = "provinceCode")
    private List<City> cities;
}

@Table("t_city")
@Data
@ToString
public class City {
    @Column(primaryKey = true)
    private String code;
    private String provinceCode;
    private String name;
    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty = "cityCode")
    private List<Area> areas;
}


@Table("t_area")
@Data
@ToString
public class Area {
    @Column(primaryKey = true)
    private String code;
    private String provinceCode;
    private String cityCode;
    private String name;
}

```

获取对应的省份下的市区和区县
```java
List<Province> list = easyQuery.queryable(Province.class)
    .include(o -> o.many(Province::getCities).include(x -> x.many(City::getAreas)))
    .toList();

==> Preparing: SELECT `code`,`name` FROM `t_province`
<== Time Elapsed: 1(ms)
<== Total: 2
==> Preparing: SELECT `code`,`province_code`,`name` FROM `t_city` WHERE `province_code` IN (?,?)
==> Parameters: 33(String),32(String)
<== Time Elapsed: 2(ms)
<== Total: 24
==> Preparing: SELECT `code`,`province_code`,`city_code`,`name` FROM `t_area` WHERE `city_code` IN (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
==> Parameters: 3211(String),3310(String),3210(String),3208(String),3307(String),3207(String),3306(String),3206(String),3305(String),3205(String),3304(String),3204(String),3303(String),3203(String),3302(String),3202(String),3213(String),3301(String),3201(String),3212(String),3311(String),3309(String),3209(String),3308(String)
<== Time Elapsed: 4(ms)
<== Total: 197
```


关联子查询过滤
```java

List<Province> provinces = easyQuery.queryable(Province.class)
            .include(o -> o.many(Province::getCities).where(x->x.eq(City::getCode,"3306")).include(x -> x.many(City::getAreas).where(y->y.eq(Area::getCode,"330602"))))
            .toList();

==> Preparing: SELECT `code`,`name` FROM `t_province`
<== Time Elapsed: 3(ms)
<== Total: 2
==> Preparing: SELECT `code`,`province_code`,`name` FROM `t_city` WHERE `province_code` IN (?,?) AND `code` = ?
==> Parameters: 33(String),32(String),3306(String)
<== Time Elapsed: 3(ms)
<== Total: 1
==> Preparing: SELECT `code`,`province_code`,`city_code`,`name` FROM `t_area` WHERE `city_code` IN (?) AND `code` = ?
==> Parameters: 3306(String),330602(String)
<== Time Elapsed: 2(ms)
<== Total: 1

[Province(code=32, name=江苏省, cities=[]), Province(code=33, name=浙江省, cities=[City(code=3306, provinceCode=33, name=绍兴市, areas=[Area(code=330602, provinceCode=33, cityCode=3306, name=越城区)])])]
```


## 关联查询VO返回自定义列

针对关联查询的返回结果如果需要支持vo对象返回,譬如学生和班级是一对多的关系,但是我查询学生的时候只希望联级查询班级的id、名称不希望查询出额外信息,那么可以通过vo的形式来返回自定义列的关联查询。



::: warning 说明!!!
> 虽然`include`方法支持vo对象返回,但是需要满足返回对象必须包含navigate映射的属性,就是说navigate的`selfProperty`和`targetProperty`可以以不同的列返回,但是必须存在于返回结果中,因为关联查询采用的是`splitQuery`


方法  | 描述 | 说明 
--- | --- | --- 
columnInclude | 如果映射属性是对象  | 支持最后一个参数为表达式,用来实现VO查询需要实现的列处理,如果不填写默认`columnAll`
columnIncludeMany | 如果映射属性是集合 | 支持最后一个参数为表达式,用来实现VO查询需要实现的列处理,如果不填写默认`columnAll`

```java
  List<SchoolStudent> list1 = easyQuery.queryable(SchoolStudent.class)
                        //一对一查询启用追踪并且对子查询逻辑删除禁用
                        .include(o -> o.one(SchoolStudent::getSchoolStudentAddress).asTracking().disableLogicDelete())
                        .toList();
```
:::

```java
//学生VO对象
@Data
public class SchoolStudentVO {
    private String id;
    private String classId;
    private String name;
    @Navigate(RelationTypeEnum.ManyToOne)//VO对象使用只需要定义关联关系,其余信息不需要定义,定义了也会忽略
    private SchoolClassVO schoolClass;
    @Navigate(RelationTypeEnum.OneToOne)//VO对象使用只需要定义关联关系,其余信息不需要定义,定义了也会忽略
    private SchoolStudentAddressVO schoolStudentAddress;
}

//学生地址VO对象
@Data
@ToString
public class SchoolStudentAddressVO {
    private String id;
    private String studentId;
    private String address;
    @Navigate(value = RelationTypeEnum.ManyToOne)//VO对象使用只需要定义关联关系,其余信息不需要定义,定义了也会忽略
    private SchoolStudentVO schoolStudent;
}

//班级
@Data
public class SchoolClassVO {
    private String id;
    private String name;
    @Navigate(RelationTypeEnum.OneToMany)
    private List<SchoolStudentVO> schoolStudents;
    @Navigate(RelationTypeEnum.ManyToMany)
    private List<SchoolTeacherVO> schoolTeachers;
}

//教师
@Data
@ToString
public class SchoolTeacherVO {
    private String id;
    private String name;
}

```

通过VO返回实现自定义列,并且实现额外的处理
```java
//查询学生表,并且额外查出对应的班级表
//一对一
List<SchoolStudentVO> list1 = easyQuery.queryable(SchoolStudent.class)
        .include(o -> o.one(SchoolStudent::getSchoolClass))
        .select(SchoolStudentVO.class,o->o
                .columnAll()
                //columnInclude表示单个关联属性的映射,多个采用columnIncludeMany,关联查询结果将学生表的班级
                //信息映射到VO对的班级信息上面
                .columnInclude(SchoolStudent::getSchoolClass,SchoolStudentVO::getSchoolClass)
        )
        .toList();



==> Preparing: SELECT t.`id`,t.`class_id`,t.`name` FROM `school_student` t
<== Time Elapsed: 2(ms)
<== Total: 3
==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t WHERE t.`id` IN (?,?)
==> Parameters: class2(String),class1(String)
<== Time Elapsed: 1(ms)
<== Total: 2


//一对一自定义列
List<SchoolStudentVO> list1 = easyQuery.queryable(SchoolStudent.class)
                        .include(o -> o.one(SchoolStudent::getSchoolClass))
                        .select(SchoolStudentVO.class,o->o
                                .columnAll()
                                //将学生表信息查询额外查询出班级表,并且班级表只查询id不查询其他信息
                                .columnInclude(SchoolStudent::getSchoolClass,SchoolStudentVO::getSchoolClass,s->s.column(SchoolClassVO::getId))
                        )
                        .toList();



==> Preparing: SELECT t.`id`,t.`class_id`,t.`name` FROM `school_student` t
<== Time Elapsed: 8(ms)
<== Total: 3
==> Preparing: SELECT t.`id` FROM `school_class` t WHERE t.`id` IN (?,?)
==> Parameters: class2(String),class1(String)
<== Time Elapsed: 3(ms)
<== Total: 2


//一对一自定义sql
List<SchoolStudentVO> list1 = easyQuery.queryable(SchoolStudent.class)
                        .include(o -> o.one(SchoolStudent::getSchoolStudentAddress).asTracking().disableLogicDelete())
                        .select(SchoolStudentVO.class,o->o.columnAll()
                                .columnInclude(SchoolStudent::getSchoolStudentAddress,SchoolStudentVO::getSchoolStudentAddress))
                        .toList();


==> Preparing: SELECT t.`id`,t.`class_id`,t.`name` FROM `school_student` t
<== Time Elapsed: 8(ms)
<== Total: 3
==> Preparing: SELECT t.`id`,t.`student_id`,t.`address` FROM `school_student_address` t WHERE t.`student_id` IN (?,?,?)
==> Parameters: 1(String),2(String),3(String)
<== Time Elapsed: 3(ms)
<== Total: 3


//一对多
List<SchoolClassVO> list1 = easyQuery.queryable(SchoolClass.class)
                        .include(o -> o.many(SchoolClass::getSchoolStudents))
                        .select(SchoolClassVO.class,o->o.columnAll()
                                .columnIncludeMany(SchoolClass::getSchoolStudents,SchoolClassVO::getSchoolStudents))
                        .toList();



==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t
<== Time Elapsed: 2(ms)
<== Total: 3
==> Preparing: SELECT t.`id`,t.`class_id`,t.`name` FROM `school_student` t WHERE t.`class_id` IN (?,?,?)
==> Parameters: class3(String),class2(String),class1(String)
<== Time Elapsed: 2(ms)
<== Total: 3


//多对多
List<SchoolClassVO> list2 = easyQuery.queryable(SchoolClass.class)
                        .include(o -> o.many(SchoolClass::getSchoolTeachers))
                        .select(SchoolClassVO.class,o->o.columnAll()
                                .columnIncludeMany(SchoolClass::getSchoolTeachers,SchoolClassVO::getSchoolTeachers))
                        .toList();
                        
==> Preparing: SELECT t.`id`,t.`name` FROM `school_class` t
<== Time Elapsed: 13(ms)
<== Total: 3
==> Preparing: SELECT `class_id`,`teacher_id` FROM `school_class_teacher` WHERE `class_id` IN (?,?,?)
==> Parameters: class3(String),class2(String),class1(String)
<== Time Elapsed: 7(ms)
<== Total: 3
==> Preparing: SELECT t.`id`,t.`name` FROM `school_teacher` t WHERE t.`id` IN (?,?)
==> Parameters: teacher2(String),teacher1(String)
<== Time Elapsed: 8(ms)
<== Total: 2
```

