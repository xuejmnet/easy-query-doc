---
title: lambda表达式提示
order: 70
category:
  - plugin
---

# lambda表达式别名提示



## 参数名提示

我们都知道Easy Query无论在哪个模式下都需要编写lambda表达式,lambda表达式中最繁琐的一个地方在于参数名的编写，
一般推荐使用表别名作为参数名，现在可以在`1.9.34^`的版本依赖配合`0.0.25^`版本的插件自动提示并自动补充查询参数的编写。

首先使用`@EasyAlias`声明表别名。

<img :src="$withBase('/images/plugin-max1.jpg')">

查询此实体类时，插件将可以自动提示并自动补充查询参数的编写。
如果选择`where_code_block`提示则会额外生成对应的`{}`

<img :src="$withBase('/images/plugin-max2.jpg')">

<img :src="$withBase('/images/plugin-max3.jpg')">

关联查询

<img :src="$withBase('/images/plugin-max3_1.png')">
<img :src="$withBase('/images/plugin-max3_2.png')">


除了配置`@EasyAlias`，我们也可以在`Tools`->`QuickTipSetting`设置，为没有添加`@EasyAlias`的实体类添加表别名


# QuickTipSetting保存
首先现在当前项目根目录创建文件`easy-query.setting`,既可保存

<img :src="$withBase('/images/plugin-max4.jpg')">


<img :src="$withBase('/images/plugin-max5.jpg')">



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