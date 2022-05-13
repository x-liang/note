const { defaultTheme } = require('@vuepress/theme-default')

module.exports = {
    lang: 'zh-CN',
    title: 'Java 成神之路',
    description: '这是我的第一个 VuePress 站点',
    base: "/note/",

    theme: defaultTheme({
        // 在这里进行配置
        navbar: [
            {
                text: 'Java 笔记',

                children: [
                   {
                       text: 'Java 集合',
                       children:[
                           {
                               text:"Java Map详解",
                               link:"/Java/测试.md"
                           }
                       ]
                   }

                ]
            },
            {
                text: 'Spring 笔记',
                children:[
                    {
                        text: 'Spring IOC',
                        children:[
                            {
                                text:"Spring IOC详解",
                                link:"/spring/test02.md"
                            }
                        ]
                    }
                ]
            }

        ],
        sidebar: {
            '/Java/': [
                {
                    text: 'Guild',
                    children:['/Java/测试.md']
                },
                {
                    text: '进阶',
                    children:['/Java/test01.md']
                }

            ],
            '/spring/':[
                {
                    text: 'Spring Framework',
                    collapsible: true,
                    
                    children:[
                        'test01',
                        'test02'
                    ]
                    
                }
            ]
        },
        sidebarDepth: 2
    }),


}