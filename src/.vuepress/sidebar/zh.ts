import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    {
      icon: "discover",
      text: "案例",
      prefix: "demo/",
      link: "demo/",
      children: "structure",
    },
    {
      text: "文档",
      icon: "note",
      prefix: "guide/",
      children: [
        {
          text: "基础操作",
          icon: "creative",
          prefix: "basic/",
          children: ["readme.md","insert","update","delete"],
        },
        {
          text: "查询",
          icon: "creative",
          prefix: "query/",
          children: ["readme.md","paging"],
        }
      ],
    },
    "slides",
  ],
});
