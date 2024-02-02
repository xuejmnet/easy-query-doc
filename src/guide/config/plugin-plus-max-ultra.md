---
title: 解放生产力🔥🔥🔥
---

为了解放生产力我推荐您使用`EasyEntityQuery`的apt模式无论是原生`apt`还是`file proxy`都可以让你的代码编写有一个质的飞跃和提升,或许我们做的还不够好但是您的使用体验和反馈会让整个生态繁荣

# 配合插件

## 解决痛点一

我们都知道`easy-query`无论在哪个模式下都需要编写lambda,lambda的编写是复杂的是最麻烦的,便捷轻量的`easy-quer`y配合`x->{}`或者`((a,b,c)->)`的变量名命名是痛苦的
所以我们在`easy-query:1.9.34^`版本并且插件`0.0.25^`后推出了变量名功能

### EasyAlias
为插件赋能添加别名用于lambda

<img src="/plugin-max1.jpg">

添加别名用于lambda的参数入参名称

<img src="/plugin-max2.jpg">

直接使用`where`、`select`等支持代码直接生成lambda的箭头符合如果带有`_code_block`并且会生成对应的`{}`大括号一对
<img src="/plugin-max3.jpg">


::: warning 注意点及说明!!!
> 如果您没有配置`@EasyAlias`那么可以在`Tools`->`QuickTipSetting`设置
:::

### QuickTipSetting
为没有添加`@EasyAlias`的对象添加lambda入参别名
<img src="/plugin-max4.jpg">


<img src="/plugin-max5.jpg">



::: tip 填写说明
> `o,t1:t2,t1:t2:t3`先按逗号分割,然后按冒号分割,分割结果按逗号分组,如果每组数量和lambda数量一致则使用这边的参数,如果配置了`@EasyAlias`对应的那个还是用`@EasyAlias`
比如查询单表没有配置`@EasyAlias`但是全局配置了`o,t1:t2,t1:t2:t3`,那么入参一个就会生成`queryable(Topic.class).where(o->)`
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


## 智能提示
`select`,`where`,`where_code_block`,`orderBy`,`orderBy_code_block`,`groupBy`,`having`,`having_code_block`,`on`,`on_code_block`
前面几个都是直接`.`使用即可

只有`join`比较特殊,`join`需要编写完`.leftJoin(Toplic.class, on )`在第一个join表写完后逗号后面空格填写`on`那么就会有对应的只能提示来填充lambda参数

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
easyEntityQuery.queryable(Topic.class).whereById("id").required("自定义错误")//抛错 未找到主题信息 
// select id,name,age.... from topic where id=?
easyEntityQuery.queryable(Topic.class).findNotNull("id","自定义错误")//抛错 未找到主题信息
// select id,name,age.... from topic where id=? limit 1
easyEntityQuery.queryable(Topic.class).whereById("id").firstNotNull("自定义错误")//抛错 未找到主题信息
// select id,name,age.... from topic where id=? 附加断言仅一条
easyEntityQuery.queryable(Topic.class).whereById("id").singleNotNull("自定义错误")//抛错 未找到主题信息
```

## 快速匿名对象

`anonymous`智能提示

<img src="/plugin-max6.jpg">


<img src="/plugin-max7.jpg">



<img src="/plugin-max8.jpg">


<img src="/plugin-max9.jpg">


<img src="/plugin-max10.jpg">