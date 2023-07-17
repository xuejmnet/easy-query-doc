---
title: 关联查询
---

# 关联查询
`easy-query` 1.2.1+ 支持关联查询,支持多级关联查询

类型  | 描述 | 场景 
--- | --- | --- 
OneToOne | 一对一  | 学生和学生家庭信息
OneToMany | 一对多 | 班级和学生
ManyToOne | 多对一  | 学生和班级
ManyToMany | 多对多  | 班级和老师


::: warning 说明!!!
> `include` 内部属于独立查询,如果您需要差异更新并且没有配置默认启动追踪查询那么需要独立进行`asTracking()`
```java
  List<SchoolStudent> list1 = easyQuery.queryable(SchoolStudent.class)
                        //一对一查询启用追踪并且对子查询逻辑删除禁用
                        .include(o -> o.one(SchoolStudent::getSchoolStudentAddress).asTracking().disableLogicDelete())
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



## 案例
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

## 多对多
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


## 案例二
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
            .include(o -> o.many(Province::getCities).where(x->x.eq(City::getCode,"3306"))
                    .include(x -> x.many(City::getAreas).where(y->y.eq(Area::getCode,"330602"))))
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