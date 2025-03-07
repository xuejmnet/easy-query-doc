---
title: 插件助手
---

工欲善其事必先利其器,一款好用的助手插件可以帮助我们节省大量的时间去编写处理重复性劳动

## 功能介绍
- 无需构建项目，刷新Maven，使用插件可以直接生成代理类并添加接口
- sql日志批量生成无占位可直接运行的sql 快捷键shift+m
- 根据表生成对应的实体（自定义模板导出导入）
- 查询时提示表别名
- 查询时提示更直观的关系运算符



支持的idea版本


::: tip 说明!!!
> IntelliJ IDEA Ultimate
> 插件0.0.95<=支持idea 2022.2.5+
> 插件0.0.96+支持idea 2023.1.7+
:::


idea 社区版
可以进入qq群文件下载或者联系群主即可


不支持的版本如果需要支持可以加qq群联系群主


因为插件内部附带`com.intellij.database`这个包所以社区版本的idea无法安装,如果不需要代码生成工具那么可以进群和联系群主会编译去除该插件的版本


::: warning 说明!!!
> 如果您非旗舰版idea可能无法使用当前插件您可以进群联系作者,我会给您编译一个社区版本支持的插件
:::


## 版本升级
如果你是`@EntityProxy`那么只需要升级对应的框架版本和插件版本然后重新clean即可,如果你是`@EntityFileProxy`那么升级完框架和插件版本后需要重新调用插件的`AutoCompile`让生成的代理文件重新生成一遍

## 插件下载
从idea的插件市场下载插件

<img src="/plugin-market.jpg">


## SQL格式化
Easy Query插件支持将SQL和参数进行格式化成可以执行的SQL。

<img src="/plugin-tools.png">


::: warning 注意点及说明!!!
> 数据库格式化只是简单的把参数拼接到sql中这样就可以直接运行，但是因为参数的复杂程度可能导致sql拼接不正确，所以这边不能太依赖这个插件尤其是参数中存在括号参数等会被误认为是参数从而导致拼接错误,轻易实际为准,sql预览这个只是锦上添花并不能作为实际的参考
:::

<img src="/plugin-sql-format-preview.jpg">
<img src="/plugin-sql-format-preview2.jpg">

## 快速生成接口

<img src="/startup5.png">

::: warning 说明!!!
> 如果EasyQueryImplement没有效果请检查类是否添加了`@EntityProxy`或者`@EntityFileProxy`
:::

<img src="/startup6.png">

## Entity对象生成
<img src="/plugin-database-1.png">

<img src="/plugin-database-2.png">
<img src="/plugin-database-3.png">
<img src="/plugin-database-4.png">
<img src="/plugin-database-5.png">
<img src="/plugin-database-6.png">
<img src="/plugin-database-7.png">


## 创建DTO
手动创建DTO是一件很麻烦的事情,可以在`easy-query:1.10.60^`+`插件0.0.48^`快速生成嵌套结构化对象模型,

<img src="/EQDTO1.jpg">
<img src="/EQDTO2.jpg">
<img src="/EQDTO3.jpg">
<img src="/EQDTO4.jpg">
<img src="/EQDTO5.jpg">
<img src="/EQDTO6.jpg">

## 参数名提示

我们都知道Easy Query无论在哪个模式下都需要编写lambda表达式,lambda表达式中最繁琐的一个地方在于参数名的编写，
一般推荐使用表别名作为参数名，现在可以在`1.9.34^`的版本依赖配合`0.0.25^`版本的插件自动提示并自动补充查询参数的编写。

首先使用`@EasyAlias`声明表别名。

<img src="/plugin-max1.jpg">

查询此实体类时，插件将可以自动提示并自动补充查询参数的编写。
如果选择`where_code_block`提示则会额外生成对应的`{}`

<img src="/plugin-max2.jpg">

<img src="/plugin-max3.jpg">

关联查询

<img src="/plugin-max3_1.png">
<img src="/plugin-max3_2.png">


除了配置`@EasyAlias`，我们也可以在`Tools`->`QuickTipSetting`设置，为没有添加`@EasyAlias`的实体类添加表别名

<img src="/plugin-max4.jpg">


<img src="/plugin-max5.jpg">



::: tip 填写说明
> `o,t1:t2,t1:t2:t3`先按逗号分割,然后按冒号分割,分割结果按逗号分组,如果每组数量和lambda数量一致则使用这边的参数,如果配置了`@EasyAlias`对应的那个还是用`@EasyAlias`
比如查询单表没有配置`@EasyAlias`，但是全局配置了`o,t1:t2,t1:t2:t3`,
那么如果只有一个入参就会生成`where(o->)`，关联查询时，有两个入参生成就会生成`where((t1,t2)->)`
> 如果参数不匹配则会按照每个对象的对象名称获取大写字母组成缩写,但是如果大写字母就一个则采用类名小写模式,比如`queryable(Topic.class).where(t->)`
```java

    /**
     * 将对象类型转成lambda入参短名称
     * @param str Topic || SysUser
     * @param index 在第几个参数位
     * @param total 总共有几个参数
     * @return
     */
    public static String lambdaShortName(String str,int index,int total) {
        char[] chars = str.toCharArray();
        if(chars.length==0){
            return "t";
        }
        for (int i = 0; i < chars.length; i++) {
            if (Character.isUpperCase(chars[i])) {
                String parameter = String.valueOf(chars[i]).toLowerCase();
                if(total>1){
                    return parameter+(index+1);
                }
                return parameter;
            }
        }
        return str.toLowerCase();
    }
```
:::

智能提示选项中，`select`,`where`,`where_code_block`,`orderBy`,`orderBy_code_block`,`groupBy`,`having`,`having_code_block`,`on`,`on_code_block`
都是直接使用`.`即可产生提示，因为它们前面已经填了实体类，有足够的上下文满足生成提示的条件，`join`相关的提示写法比较特殊,比如`.leftJoin(Toplic.class,)`，
也是需要填完实体类后才能产生提示，只不过在参数中填写的。


## 关系运算符提示

我们都知道，Easy Query的关系运算符中，`>`是`gt`方法，`<`是`lt`方法。
对于这些符合无需特别去记忆，Easy Query插件贴心的提供了这些关系运算符的提示，
我们可以直接使用`>`，`<`等关系运算符的提示，插件将自动替换对应的方法名。

<img src="/plugin-max11.jpg">

<img src="/plugin-max12.jpg">

<img src="/plugin-max13.jpg">

<img src="/plugin-max14.jpg">

<img src="/plugin-max15.jpg">

<img src="/plugin-max16.jpg">

<!-- ## 快速匿名对象

`anonymous`智能提示

<img src="/plugin-max6.jpg">


<img src="/plugin-max7.jpg">



<img src="/plugin-max8.jpg">


<img src="/plugin-max9.jpg">


<img src="/plugin-max10.jpg"> -->

## 默认错误消息
`EasyAssertMessage`注解实现默认错误消息
```java
@EasyAssertMessage("未找到主题信息")
@EasyAlias("topic")
public class Topic{
    //......
}
//默认错误
// select 1 from topic where id=?
easyEntityQuery.queryable(Topic.class).whereById("id").required()//抛错 未找到主题信息 
// select id,name,age.... from topic where id=?
easyEntityQuery.queryable(Topic.class).findNotNull("id")//抛错 未找到主题信息
// select id,name,age.... from topic where id=? limit 1
easyEntityQuery.queryable(Topic.class).whereById("id").firstNotNull()//抛错 未找到主题信息
// select id,name,age.... from topic where id=? 附加断言仅一条
easyEntityQuery.queryable(Topic.class).whereById("id").singleNotNull()//抛错 未找到主题信息



//手动错误
// select 1 from topic where id=?
easyEntityQuery.queryable(Topic.class).whereById("id").required("自定义错误")//抛错 自定义错误 
// select id,name,age.... from topic where id=?
easyEntityQuery.queryable(Topic.class).findNotNull("id","自定义错误")//抛错 自定义错误
// select id,name,age.... from topic where id=? limit 1
easyEntityQuery.queryable(Topic.class).whereById("id").firstNotNull("自定义错误")//抛错 自定义错误
// select id,name,age.... from topic where id=? 附加断言仅一条
easyEntityQuery.queryable(Topic.class).whereById("id").singleNotNull("自定义错误")//抛错 自定义错误
```
