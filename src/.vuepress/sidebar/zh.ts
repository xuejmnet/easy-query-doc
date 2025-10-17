import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    "what-is-easy-query",
    "quick-query",
    // "portfolio",
    "feature",
    "best-practices",
    "question",
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
      text: "插件指南",
      prefix: "plugin/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "CRUD功能模块",
      prefix: "ability/",
      collapsible:true,
      children: [

        {
          text: "查询",
          prefix: "select/",
          collapsible:true,
          children: "structure",
        },
        {
          text: "返回VO、DTO",
          prefix: "return-result/",
          collapsible:true,
          children: "structure",
        },
        {
          text: "CRUD进阶",
          prefix: "adv/",
          collapsible:true,
          children: "structure",
        },"insert","update","delete","transaction","insertOrUpdate","batch","dynamic-table-name","native-sql"
      ],
    },
    {
      text: "导航属性🔥",
      prefix: "navigate/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "关联查询🔥🔥",
      prefix: "include/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "聚合根保存🔥🔥🔥",
      prefix: "savable/",
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
      text: "计算属性",
      prefix: "prop/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "子查询",
      prefix: "sub-query/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "性能相关",
      prefix: "performance/",
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
      text: "cache",
      prefix: "cache/",
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
      text: "性能",
      prefix: "performance/",
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
    "support","members",
    "context-mode",
    "v2-v3",
    "catalog",
  ],
});