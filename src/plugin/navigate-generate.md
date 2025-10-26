---
title: 导航属性快速生成
order: 50
category:
  - plugin
---

# 导航属性快速生成
第一步 我们在实体类内部输入`nav2...`即可提示弹出对应的导航属性创建界面UI

<img :src="$withBase('/images/navigate2.jpg')">


第二步设置关联关系一对多,一对一，多对一，多对多...
<img :src="$withBase('/images/navigate-ui.jpg')">

选择好对应的关联键后点击确认插件会帮你自动生成强类型属性或者lombok属性或字符串

当然你也可以手写关联关系