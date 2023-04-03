import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    {
      text: "文档",
      icon: "note",
      prefix: "guide/",
      children: [
        {
          text: "基础操作",
          icon: "creative",
          prefix: "basic/",
          collapsible:true,
          children: ["readme.md","insert","update","delete"],
        },
        {
          text: "查询",
          icon: "creative",
          prefix: "query/",
          collapsible:true,
          children: ["readme.md","paging","multi-query","group","select","native-sql","dynamic-table","to-map","select-column","where"],
        },
        {
          text: "高级",
          icon: "creative",
          prefix: "adv/",
          collapsible:true,
          children: ["readme.md","logic-delete","interceptor","column-encryption","data-tracking","version"],
        }
      ],
    },
    {
      text: "实战",
      icon: "note",
      prefix: "practice/",
      children: [
        {
          text: "对象",
          icon: "creative",
          prefix: "entity/",
          collapsible:true,
          children: ["readme.md"],
        }
      ],
    },
    "slides",
  ],
});
