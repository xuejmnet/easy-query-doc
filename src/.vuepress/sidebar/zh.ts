import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    {
      text: "快速开始",
      prefix: "startup/",
      children: ["what-is-easy-query","quick-start","complex-query"],
    },
    // "quick-preview",
    "question",
    {
      text: "使用指南",
      prefix: "use-guide/",
      children: ["spring-boot","sb-multi-datasource","solon","kotlin","kapt"],
    },
    {
      text: "目录",
      prefix: "directory/",
      children: ["ability","annotation"],
    },
    {
      text: "框架相关",
      prefix: "framework/",
      children: ["config-option","key-word","annotation","replace-configure","logging","mapping-rule","easy-trans","plugin"],
    },
    // {
    //   text: "基础操作",
    //   prefix: "basic/",
    //   collapsible:true,
    //   children: ["readme.md","api-use","performance-desc","performance","quick-preview"],
    // },
    {
      text: "功能模块",
      prefix: "ability/",
      children: ["readme.md",
        {
          text: "select",
          prefix: "select/",
          collapsible:true,
          children: ["select","api","common-api","single","dto-vo",
            "anonymous-type","page","select-auto-include","select-auto-include-configurable","partition","union",
            "tree","case-when","stream-query","to-map","select-sub","relation",
          "relation-filter","relation-extra-filter","fill"],
        },
        {
          text: "where",
          prefix: "where/",
          collapsible:true,
          children: ["readme","api","and-or","condition-compare","dynamic-where","where-sub"],
        },
        {
          text: "join",
          prefix: "join/",
          collapsible:true,
          children: ["multi","implicit-multi","implicit-group"],
        },
        {
          text: "order-by",
          prefix: "order-by/",
          collapsible:true,
          children: ["order","dynamic-sort"],
        },
        {
          text: "group-by",
          prefix: "group-by/",
          collapsible:true,
          children: ["group"],
        },"insert","update","delete","transaction","insertOrUpdate","batch","dynamic-table-name","reuse","native-sql"],
    },
    // {
    //   text: "功能模块2",
    //   prefix: "ability/",
    //   collapsible:true,
    //   children: ["readme.md",
    //     {
    //       text: "查询",
    //       prefix: "ability/",
    //       collapsible:true,
    //       children: ["readme.md","select","insert","update","delete","transaction","insertOrUpdate"],
    //     }
    //     ,"insert","update","delete","transaction","insertOrUpdate"],
    // },
    // {
    //   text: "查询",
    //   prefix: "query/",
    //   children: ["readme.md","native-sql"],
    // },
    {
      text: "计算属性",
      prefix: "prop/",
      collapsible:true,
      children: ["readme.md","json-prop","collection-prop","enum-prop","sql-column-prop","status-prop","combine-prop","aggregate-prop","sql-column-generate-prop","simple-sql-prop"],
    },
    {
      text: "code-first",
      prefix: "code-first/",
      collapsible:true,
      children: ["readme.md","quick-start","api","custom"],
    },
    {
      text: "高级",
      prefix: "adv/",
      collapsible:true,
      children: ["readme.md","logic-delete","auto-key","interceptor","batch","sql-func-v1","sql-func","column-encryption","column-sql-func-auto","data-tracking","version","column-func-new","column-func","value-object","jdbc-listener","type-handler","relation-property-strategy"],
    },
    {
      text: "注解",
      prefix: "annotations/",
      collapsible:true,
      children: ["navigate-flat"],
    },
    {
      text: "超级",
      prefix: "super/",
      collapsible:true,
      children: ["readme.md","sharding-table.md","sharding-datasource.md","sharding-all.md","default-route-rule","default-route-initializer","sharding-mod.md","sharding-time.md",
      "sharding-all-time.md","sharding-multi.md","sharding-sequence.md"],
    },
    {
      text: "案例",
      prefix: "examples/",
      collapsible:true,
      children: ["example1","example2","include-example"],
    },
    {
      text: "实战",
      icon: "note",
      prefix: "practice/",
      children: [
        {
          text: "基础配置",
          prefix: "configuration/",
          collapsible:true,
          children: ["readme.md","entity.md","exception.md"],
        },
        {
          text: "注解处理器",
          prefix: "apt/",
          collapsible:true,
          children: ["readme.md","compile-repo.md"],
        }
      ],
    },
    "support",
    "members"
  ],
});
