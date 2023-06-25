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
          children: ["readme.md","config-kotlin.md","config-option","logging","performance","insert","update","delete","transaction","value-converter"],
        },
        {
          text: "查询",
          prefix: "query/",
          children: ["readme.md","paging","multi-query","group","select","native-sql","dynamic-table","to-map","select-column","union","select-sub","where","reuse"],
        },
        {
          text: "高级",
          prefix: "adv/",
          children: ["readme.md","logic-delete","interceptor","column-encryption","data-tracking","version","column-func","atomic-update"],
        },
        {
          text: "超级",
          prefix: "super/",
          children: ["readme.md","sharding-table.md","sharding-datasource.md","sharding-all.md","default-route-rule","default-route-initializer","sharding-mod.md","sharding-time.md",
          "sharding-all-time.md","sharding-multi.md","sharding-sequence.md"],
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
    "support"
  ],
});
