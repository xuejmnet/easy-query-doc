import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  // { text: "案例", icon: "discover", link: "/demo/" },
  {
    text: "更新日志",
    icon: "creative",
    link: "/upgrade",
    // children: [
    //   {
    //     text: "基础操作",
    //     icon: "creative",
    //     prefix: "basic/",
    //     children: ["insert","update","delete", { text: "...", icon: "more", link: "" }],
    //   },
    //   {
    //     text: "查询",
    //     icon: "creative",
    //     prefix: "query/",
    //     children: ["query","paging", { text: "...", icon: "more", link: "" }],
    //   }
    // ],
  },
  {
    text: "项目地址",
    icon: "github",
    children:[
      {
        text: "github",
        icon: "github",
        link: "https://github.com/xuejmnet/easy-query"
      },

      {
        text: "gitee",
        icon: "gitee",
        link: "https://gitee.com/xuejm/easy-query"
      }
    ]
  }
  // {
  //   text: "V2 文档",
  //   icon: "note",
  //   link: "https://theme-hope.vuejs.press/zh/",
  // },
]);
