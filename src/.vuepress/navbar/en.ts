import { navbar } from "vuepress-theme-hope";

export const enNavbar = navbar([
  "/en/",
  "/en/demo/",
  "/en/discussions",
  {
    text: "Project",
    icon: "github",
    children:[
      {
        text: "GitHub",
        icon: "github",
        link: "https://github.com/xuejmnet/easy-query"
      },
      {
        text: "Gitee",
        icon: "gitee",
        link: "https://gitee.com/xuejm/easy-query"
      },
      {
        text: "GitCode",
        icon: "gitcode",
        link: "https://gitee.com/xuejm/easy-query"
      }
    ]
  },
  "/en/support"
]);

