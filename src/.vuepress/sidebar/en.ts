import { sidebar } from "vuepress-theme-hope";

export const enSidebar = sidebar({
  "/en/": [
    "",
    "what-is-easy-query",
    "feature-map",
    "quick-query",
    "feature",
    "best-practices",
    "question",
    {
      text: "Quick Start",
      icon: "laptop-code",
      prefix: "startup/",
      children: "structure",
    },
    {
      text: "Usage Guide",
      prefix: "guide/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Framework Related",
      prefix: "framework/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Plugin Guide",
      prefix: "plugin/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "CRUD Function Modules",
      prefix: "ability/",
      collapsible:true,
      children: [
        {
          text: "Query",
          prefix: "select/",
          collapsible:true,
          children: "structure",
        },
        {
          text: "Return VO, DTO",
          prefix: "return-result/",
          collapsible:true,
          children: "structure",
        },
        {
          text: "CRUD Advanced",
          prefix: "adv/",
          collapsible:true,
          children: "structure",
        },"select","where","insert","update","delete","transaction","insertOrUpdate","batch","dynamic-table-name","native-sql"
      ],
    },
    {
      text: "Navigation Properties🔥",
      prefix: "navigate/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Associated Queries🔥🔥",
      prefix: "include/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Aggregate Root Saving🔥🔥🔥",
      prefix: "savable/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "DTO Query🔥🔥🔥",
      prefix: "dto-query/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Built-in Functions",
      prefix: "func/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Computed Properties",
      prefix: "prop/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Subqueries",
      prefix: "sub-query/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Performance Related",
      prefix: "performance/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Code-First",
      prefix: "code-first/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Cache",
      prefix: "cache/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Advanced",
      prefix: "adv/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Sharding",
      prefix: "super/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Examples",
      prefix: "demo/",
      collapsible:true,
      children: "structure",
    },
    {
      text: "Practical Guide",
      prefix: "practice/",
      collapsible:true,
      children: [
        {
          text: "Design",
          prefix: "configuration/",
          collapsible:true,
          children: "structure",
        },
        {
          text: "APT",
          prefix: "apt/",
          collapsible:true,
          children: "structure",
        }
      ],
    },
    {
      text: "Framework Other",
      prefix: "other/",
      collapsible:true,
      children: "structure",
    },
    "support",
    "members",
    "context-mode",
    "v2-v3",
    "catalog",
  ],
});

