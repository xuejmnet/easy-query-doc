import { sidebar } from "vuepress-theme-hope";

export const cnSidebar = sidebar({
  "/cn/": [
    "",
    // "portfolio",
    {
      text: "快速开始",
      icon: "laptop-code",
      prefix: "startup/",
      children: "structure",
    },
    {
      text: "使用指南",
      prefix: "guide/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "框架相关",
      prefix: "framework/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "crud功能模块",
      prefix: "ability/",
      collapsible:true,
      children: [

        {
          text: "select",
          prefix: "select/",
          collapsible:true,
          children: "structure",
        },
        {
          text: "where",
          prefix: "where/",
          collapsible:true,
          children: "structure",
        },
        {
          text: "join",
          prefix: "join/",
          collapsible:true,
          children: "structure",
        },
        {
          text: "order-by",
          prefix: "order-by/",
          collapsible:true,
          children: "structure",
        },
        {
          text: "group-by",
          prefix: "group-by/",
          collapsible:true,
          children: "structure",
        },"insert","update","delete","transaction","insertOrUpdate","batch","dynamic-table-name","native-sql"
      ],
    },
    {
      text: "计算属性",
      prefix: "prop/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "内置函数",
      prefix: "func/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "code-first",
      prefix: "code-first/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "高级",
      prefix: "adv/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "分库分表",
      prefix: "super/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "案例",
      prefix: "demo/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "实战",
      prefix: "practice/",
      collapsible:true,
      children: [
        {
          text: "设计",
          prefix: "configuration/",
          collapsible:true,
          children: "structure",
        },
        {
          text: "apt",
          prefix: "apt/",
          collapsible:true,
          children: "structure",
        }
      ],
    },
    "support","members"
  ],
});
