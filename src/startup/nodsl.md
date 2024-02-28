---
title: 对象关系查询 ✨
---

为什么我们需要对象关系查询,为什么对象关系查询叫做`nodsl`一个好的orm的方向肯定是不仅仅是dsl语句,毕竟`dsl`语句只是强类型拼接`sql`,对象关系才是`orm`的精髓，但是如果一个`orm`只有对象关系查询那么这个`orm`也不是一个好的`orm`,一个好的`orm`应该是`dsl+nodsl`

默认不使用include那么是不会自动查询导航属性,如果select返回导航属性那么自动会进行include,如果是VO对象映射那么include也需要手动调用.

以下情况不需要调用`include`或者`includes`

- 返回`对一导航属性`而不是`对多`包括相关列,其中`对一`包括`多对一`,`一对一`
- 返回导航属性本身`.select(o->o.parent())`
- 返回导航属性的列比如`.selectColumn(o->o.parent().id())`
- 返回对多的导航属性比如`.select(o->o.roles().toList())`

## 关系对象
接下来我将演示学校的关系信息,也就是

`班级`,`老师`,`学生`,`学生家庭地址`

其中一个班级有多个学生,一个班级有多个老师,一个老师也可以教多个班级,每个学生都有自己的家庭地址



::: code-tabs
@tab 班级
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
    private List<SchoolStudent> schoolStudents;

    //多对多
    @Navigate(value = RelationTypeEnum.ManyToMany
            , mappingClass = SchoolClassTeacher.class
            , selfMappingProperty = "classId"
            , targetMappingProperty = "teacherId")

    private List<SchoolTeacher> schoolTeachers;

    @Override
    public Class<SchoolClassProxy> proxyTableClass() {
        return SchoolClassProxy.class;
    }
}

//班级和老师的映射表
@Table("school_class_teacher")
@Data
@ToString
@EntityFileProxy
public class SchoolClassTeacher implements ProxyEntityAvailable<SchoolClassTeacher , SchoolClassTeacherProxy> {
    @Column(primaryKey = true)
    private String classId;
    @Column(primaryKey = true)
    private String teacherId;

    @Override
    public Class<SchoolClassTeacherProxy> proxyTableClass() {
        return SchoolClassTeacherProxy.class;
    }
}
```

@tab 老师
```java

@Table("school_teacher")
@Data
@ToString
@EntityFileProxy
public class SchoolTeacher implements ProxyEntityAvailable<SchoolTeacher , SchoolTeacherProxy> {
    @Column(primaryKey = true)
    private String id;
    private String name;
    
    //导航属性如果您不需要根据老师来处理班级那么可以不加
    @Navigate(value = RelationTypeEnum.ManyToMany
            , mappingClass = SchoolClassTeacher.class
            , selfProperty = "id"
            , selfMappingProperty = "teacherId"
            , targetProperty = "id"
            , targetMappingProperty = "classId")
    private List<SchoolClass> schoolClasses;

    @Override
    public Class<SchoolTeacherProxy> proxyTableClass() {
        return SchoolTeacherProxy.class;
    }
}
```
@tab 学生
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

    @Navigate(value = RelationTypeEnum.ManyToOne, selfProperty = "classId")
    private SchoolClass schoolClass;

    @Navigate(value = RelationTypeEnum.OneToOne, targetProperty = "studentId")
    private SchoolStudentAddress schoolStudentAddress;

    @Override
    public Class<SchoolStudentProxy> proxyTableClass() {
        return SchoolStudentProxy.class;
    }
}
```
@tab 学生家庭地址
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

    @Override
    public Class<SchoolStudentAddressProxy> proxyTableClass() {
        return SchoolStudentAddressProxy.class;
    }
}
```

::: 
## 案例1
查询班级下面存在学生姓金的班级
```java
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().any(stu -> {
                        stu.name().likeMatchLeft("金");
                    });
                }).toList();
//上下写法一样
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().where(stu -> {
                        stu.name().likeMatchLeft("金");
                    }).any();
                }).toList();

//上下两种都可以表示查询班级表过滤班级关联的学生并且存在学生姓金的
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().where(stu -> {
                        stu.name().likeMatchLeft("金");
                    }).any();
                }).toList();
```
查询班级下面不存在学生姓金的班级

```java
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().none(stu -> {
                        stu.name().likeMatchLeft("金");
                    });
                }).toList();

//上下两种都可以表示查询班级表过滤班级关联的学生并且不存在学生姓金的
List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .where(s -> {
                    s.schoolStudents().where(stu -> {
                        stu.name().likeMatchLeft("金");
                    }).none();
                }).toList();
```

## 案例2
查询班级下面存在学生家地址是绍兴市的班级有哪些
```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().any(stu -> {
                stu.schoolStudentAddress().address().like("绍兴市");
            });
        }).toList();
```

## 案例3
查询班级下面存在学生姓金的有且只有5位的班级
```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().where(stu -> {
                stu.name().likeMatchLeft("金");
            }).count().eq(5L);
        }).toList();
```
## 案例4
查询班级下面存在学生平均年龄大于12岁的班级(可以用户获取班级语文平均分不足60的同理)
```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
        .where(s -> {
            s.schoolStudents().avg(stu->stu.age()).le(BigDecimal.valueOf(12));
        }).toList();
```


## 案例5
假设班级和学生没有直接关系

查询班级下面老师的有姓金的并且获取班级和老师
```java

List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
//include和includes分别获取对一和对多的关系 include(s)的第二个参数可以筛选返回的数据结果如果不加就返回当前班级下的所有关联的老师
        .includes(s -> s.schoolTeachers(),s->{
            //获取对多的老师的信息但是必须是姓金的才返回
            s.where(t->t.name().likeMatchLeft("金"));
        })
        .where(s -> {
            //判定班级下的老师有姓金的
            s.schoolTeachers().where(teacher->{
                teacher.name().likeMatchLeft("金");
            }).any();
        }).toList();
```

## 案例6
查询学生叫做小明的并且获取小明的所在班级和家庭地址
```java
List<SchoolStudent> list = easyEntityQuery.queryable(SchoolStudent.class)
                .include(s -> s.schoolStudentAddress())
                .include(s -> s.schoolClass())
                .where(s -> {
                    s.name().eq("小明");
                }).toList();
```


## 案例7
查询班级叫做`一班`的和班级下面的学生并且返回学生的家庭地址包括班级下的老师
```java
     List<SchoolClass> list = easyEntityQuery.queryable(SchoolClass.class)
                .includes(s -> s.schoolTeachers())
                .includes(s -> s.schoolStudents(),x->{
                    x.include(y->y.schoolStudentAddress());
                })
                .where(s -> {
                    s.name().eq("一班");
                }).toList();
```

## 案例8
返回VO对象自动include返回层级对象

::: code-tabs
@tab 班级VO
```java

@Data
@EntityFileProxy
public class SchoolClassVO {
    private String id;
    private String name;
    @Navigate(RelationTypeEnum.OneToMany)
    private List<SchoolStudentVO> schoolStudents;
    @Navigate(RelationTypeEnum.ManyToMany)
    private List<SchoolTeacherVO> schoolTeachers;
}
```

@tab 学生VO
```java

@Data
@EntityFileProxy
public class SchoolStudentVO {
    private String id;
    private String classId;
    private String name;
    
    @Navigate(RelationTypeEnum.OneToOne)
    private SchoolStudentAddressVO schoolStudentAddress;

}
```
@tab 学生地址VO
```java

@Data
@ToString
@EntityFileProxy
public class SchoolStudentAddressVO {
    private String id;
    private String studentId;
    private String address;
    private String name;
}

```
@tab 老师VO
```java

@Data
@ToString
@EntityFileProxy
public class SchoolTeacherVO {
    private String id;
    private String name;

}

```

::: 

自动筛选返回结构化数据
```java
//查询班级叫做一班的并且返回对应的VO并且会自动根据VO会拉取相应的数据
List<SchoolClassVO> listx= easyEntityQuery.queryable(SchoolClass.class)
                        .where(s -> s.name().like("一班"))
                        .selectAutoInclude(SchoolClassVO.class)
                        .toList();
```