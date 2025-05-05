---
title: Compile
order: 20
category:
  - plugin
---


# 自动编译apt
在常规的项目中框架无法感知并且处理apt的注解,需要编译时才会生成对应的文件,所以如果一个类已经编译生成了对应的代理对象那么如果修改这个类中的属性那么是无法实时感知生成对应的代理对象

比如`private String name;`用户改成了`private String name1;`那么插件会实时编译出对应的`name1`到`proxy`类中当然如果你没有装插件可以通过重新编译项目即可但是当项目变大后每次重新编译会带来十分漫长的等待时间.

插件也贴心的准备了两个快捷方式分别是`CompileCurrentFile`和`AutoCompile`

## CompileCurrentFile
立刻编译当前的类只要类加了`@EntityProxy`注解即可


## CompileAll
立刻编译当前项目的所有类只要类加了`@EntityProxy`注解即可

## 使用方式

在对应的类中呼出get set的快捷方式即可看到对应的操作
<img  :src="$withBase('/images/plugin-compile.jpg')">

## 总结
有时候插件或者框架并不会100%正确生成Proxy有时候因为部分错误原因导致没有及时编译生成最新的代理对象，所以eq提供了`CompileCurrentFile`仅编译当前文件,防止`AutoCompile`带来的长时间阻塞编译生成