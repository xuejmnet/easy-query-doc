---
title: include(s)案例
---
`include(s)`查询在对象建立好关系后即可使用,使用二次查询,第二次使用`in`关联字段来实现功能，而不是n+1次查询



## 对象关系
::: tabs

@tab SchoolClass
```java

//班级表
@Table("school_class")
@Data
@ToString
@EntityProxy
public class SchoolClass implements ProxyEntityAvailable<SchoolClass,SchoolClassProxy> {
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
```

@tab SchoolStudent
```java

//学生表
@Table("school_student")
@Data
@ToString
@EntityProxy
public class SchoolStudent implements ProxyEntityAvailable<SchoolStudent,SchoolStudentProxy> {
    @Column(primaryKey = true)
    private String id;
    private String classId;
    private String name;
    @Navigate(value = RelationTypeEnum.ManyToOne,selfProperty = "classId",targetProperty = "id")
    private SchoolClass schoolClass;
    @Navigate(value = RelationTypeEnum.OneToOne,targetProperty = "studentId")
    private SchoolStudentAddress schoolStudentAddress;
}
```

@tab SchoolStudentAddress
```java

//学生地址表
@Table("school_student_address")
@Data
@ToString
@EntityProxy
public class SchoolStudentAddress implements ProxyEntityAvailable<SchoolStudentAddress,SchoolStudentAddressProxy> {
    private String id;
    private String studentId;
    private String address;
    @Navigate(value = RelationTypeEnum.ManyToOne,selfProperty = "studentId",targetProperty = "id")
    private SchoolStudent schoolStudent;
}
```

@tab SchoolTeacher
```java

//教师表
@Table("school_teacher")
@Data
@ToString
@EntityProxy
public class SchoolTeacher implements ProxyEntityAvailable<SchoolTeacher,SchoolTeacherProxy> {
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

```

@tab SchoolClassTeacher
```java


//教师和班级的多对多关系表
@Table("school_class_teacher")
@Data
@ToString
@EntityProxy
public class SchoolClassTeacher implements ProxyEntityAvailable<SchoolClassTeacher,SchoolClassTeacherProxy> {
    @Column(primaryKey = true)
    private String classId;
    @Column(primaryKey = true)
    private String teacherId;
}

```

:::



::: warning 说明!!!
> `一对一`和`多对一`是拥有本质的区别的,`一对一`相当于匹配并且移除掉被匹配到的元素,`多对一`则不会删除元素,被匹配的元素依然可以被别人匹配到,
> 比如记录和记录对应的创建人，那么应该是`多对一`而不是`一对一`
:::

## OneToOne


::: tabs
学生和学生地址信息关系

@tab entity
```java
 List<SchoolStudent> stus = easyEntityQuery.queryable(SchoolStudent.class)
                        .include(o -> o.schoolStudentAddress())
                        .toList();

==> Preparing: SELECT `id`,`class_id`,`name` FROM `school_student`
<== Time Elapsed: 2(ms)
<== Total: 3
==> Preparing: SELECT `id`,`student_id`,`address` FROM `school_student_address` WHERE `student_id` IN (?,?,?)
==> Parameters: 1(String),2(String),3(String)
<== Time Elapsed: 2(ms)
<== Total: 3
```

@tab lambda
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
```

:::

## OneToMany

::: tip 说明!!!
> 一对多无论是否存在多的一方最终都会填充集合,永远不会为null
:::



::: tabs

@tab entity
```java
List<SchoolClass> classes = easyEntityQuery.queryable(SchoolClass.class)
                        .includes(o -> o.schoolStudents())
                        .toList();

==> Preparing: SELECT `id`,`name` FROM `school_class`
<== Time Elapsed: 2(ms)
<== Total: 3
==> Preparing: SELECT `id`,`class_id`,`name` FROM `school_student` WHERE `class_id` IN (?,?,?)
==> Parameters: class3(String),class2(String),class1(String)
<== Time Elapsed: 3(ms)
<== Total: 3
```
@tab lambda
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
```

:::

## ManyToOne



::: tabs

@tab entity

```java
List<SchoolStudent> stus = easyEntityQuery.queryable(SchoolStudent.class)
                        .include(o -> o.sSchoolClass())
                        .toList();

==> Preparing: SELECT `id`,`class_id`,`name` FROM `school_student`
<== Time Elapsed: 2(ms)
<== Total: 3
==> Preparing: SELECT `id`,`name` FROM `school_class` WHERE `id` IN (?,?)
==> Parameters: class2(String),class1(String)
<== Time Elapsed: 2(ms)
<== Total: 2
```
@tab lambda

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
```

:::

## ManyToMany
班级和老师之间的关系
::: tip 说明!!!
> 多对多无论是否存在多的一方最终都会填充集合,永远不会为null
:::



::: tabs

@tab entity
```java
List<SchoolClass> classes = easyQuery.queryable(SchoolClass.class)
                        .includes(o -> o.schoolTeachers())
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
```
@tab lambda
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
```

:::
## 多次include
查询班级下面的所有老师和学生


::: tabs

@tab entity
```java
List<SchoolClass> classes = easyEntityQuery.queryable(SchoolClass.class)
                    .includes(o -> o.schoolTeachers())
                    .includes(o -> o.schoolStudents())
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
@tab lambda
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

:::


## 多关联查询
### 省市区



::: tabs

@tab Province
```java
@Table("t_province")
@Data
@ToString
@EntityProxy
public class Province implements ProxyEntityAvailable<Province,ProvinceProxy>{
    @Column(primaryKey = true)
    private String code;
    private String name;
    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty = "provinceCode")
    private List<City> cities;
}

```
@tab City
```java

@Table("t_city")
@Data
@ToString
@EntityProxy
public class City implements ProxyEntityAvailable<City,CityProxy> {
    @Column(primaryKey = true)
    private String code;
    private String provinceCode;
    private String name;
    @Navigate(value = RelationTypeEnum.OneToMany,targetProperty = "cityCode")
    private List<Area> areas;
}

```
@tab Area
```java
@Table("t_area")
@Data
@ToString
@EntityProxy
public class Area implements ProxyEntityAvailable<Area,AreaProxy> {
    @Column(primaryKey = true)
    private String code;
    private String provinceCode;
    private String cityCode;
    private String name;
}

```

:::

获取对应的省份下的市区和区县



::: tabs

@tab entity
```java
List<Province> list = easyEntityQuery.queryable(Province.class)
    .includes(o -> o.cities(),cq->cq.includes(c -> c.areas()))
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

@tab lambda
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


:::

关联子查询过滤


::: tabs

@tab entity
```java

List<Province> provinces = easyEntityQuery.queryable(Province.class)
            .includes(o -> o.cities(),pq->{
                pq.where(x->x.code().eq("3306")).includes(x -> x.areas(),aq->{
                    aq.where(y->y.code().eq("330602"));
                });
            })
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
```
@tab lambda
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
```

:::


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


::: tabs

@tab SchoolStudent

```java
@Table("school_student")
@Data
@ToString
@EntityFileProxy
public class SchoolStudent implements ProxyEntityAvailable<SchoolStudent, SchoolStudentProxy> {
    @Column(primaryKey = true)
    private String id;
    private String classId;
    private String name;
//    private Integer age;
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = "classId", targetProperty = "id")
    private SchoolClass schoolClass;
    @Navigate(value = RelationTypeEnum.OneToOne, targetProperty = "studentId")
    private SchoolStudentAddress schoolStudentAddress;

}
@tab SchoolClass
```java

@Table("school_class")
@Data
@ToString
@EntityFileProxy
public class SchoolClass implements ProxyEntityAvailable<SchoolClass , SchoolClassProxy> {
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
```
@tab SchoolStudent
```java
@Table("school_student")
@Data
@ToString
@EntityFileProxy
public class SchoolStudent implements ProxyEntityAvailable<SchoolStudent, SchoolStudentProxy> {
    @Column(primaryKey = true)
    private String id;
    private String classId;
    private String name;
//    private Integer age;
    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = "classId", targetProperty = "id")
    private SchoolClass schoolClass;
    @Navigate(value = RelationTypeEnum.OneToOne, targetProperty = "studentId")
    private SchoolStudentAddress schoolStudentAddress;

}
```

@tab SchoolTeacher
```java
@Table("school_teacher")
@Data
@ToString
@EntityFileProxy
public class SchoolTeacher implements ProxyEntityAvailable<SchoolTeacher , SchoolTeacherProxy> {
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
```
@tab SchoolStudentAddress
```java
@Table("school_student_address")
@Data
@ToString
@EntityFileProxy
public class SchoolStudentAddress implements ProxyEntityAvailable<SchoolStudentAddress , SchoolStudentAddressProxy> {
    private String id;
    private String studentId;
    private String address;
    @Navigate(value = RelationTypeEnum.ManyToOne,selfProperty = "studentId",targetProperty = "id")
    private SchoolStudent schoolStudent;
}
```
@tab SchoolStudentVO
```java
@Data
@EntityProxy
public class SchoolStudentVO {
    private String id;
    private String classId;
    private String name;
    @Navigate(RelationTypeEnum.ManyToOne)
    private SchoolClassVO schoolClass;
    @Navigate(RelationTypeEnum.OneToOne)
    private SchoolStudentAddressVO schoolStudentAddress;
}

```
@tab SchoolClassVO
```java
@Data
@EntityProxy
public class SchoolClassVO {
    private String id;
    private String name;
    @Navigate(RelationTypeEnum.OneToMany)
    private List<SchoolStudentVO> schoolStudents;
    @Navigate(RelationTypeEnum.ManyToMany)
    private List<SchoolTeacherVO> schoolTeachers;
}
```
@tab SchoolStudentAddressVO
```java
@Data
@ToString
@EntityProxy
public class SchoolStudentAddressVO{
    private String id;
    private String studentId;
    private String address;
    private String name;
    @Navigate(value = RelationTypeEnum.ManyToOne)
    private SchoolStudentVO schoolStudent;

}
```
@tab SchoolTeacherVO
```java
@Data
@ToString
@EntityProxy
public class SchoolTeacherVO {
    private String id;
    private String name;
}
```

:::



::: tabs

@tab entity
```java
List<SchoolStudentVO> list1 = easyEntityQuery.queryable(SchoolStudent.class)
                        .include(o -> o.schoolClass())
                        .select(o -> new SchoolStudentVOProxy().adapter(r -> {
                            r.selectAll(o);
                            //第二个参数表示自定义设置映射
                            r.schoolClass().set(o.schoolClass());
                            //r.schoolClass().set(o.schoolClass()//x->{return voproxy()});
                        }))
                        .toList();
```
@tab lambda

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



:::
