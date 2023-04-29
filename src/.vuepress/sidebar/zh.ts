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
          prefix: "basic/",
          children: ["readme.md","logging","insert","update","delete","performance"],
        },
        {
          text: "查询",
          prefix: "query/",
          children: ["readme.md","paging","multi-query","group","select","native-sql","dynamic-table","to-map","select-column","where"],
        },
        {
          text: "高级",
          prefix: "adv/",
          children: ["readme.md","logic-delete","interceptor","column-encryption","data-tracking","version"],
        },
        {
          text: "超级",
          prefix: "super/",
          children: ["readme.md"],
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
          prefix: "entity/",
          collapsible:true,
          children: ["readme.md"],
        }
      ],
    },
    "slides",
  ],
});
