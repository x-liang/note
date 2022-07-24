const { defaultTheme } = require('@vuepress/theme-default')

module.exports = {
    locales:{
        '/':{
            lang: 'zh-CN',
            title: 'Java 成神之路',
            description: '这是我的第一个 VuePress 站点',
        }
    },
    base: "/",
    theme: defaultTheme({
        // 配置上边的导航栏
        navbar: [
            {
                text: 'Java 笔记',
                children: [
                    {
                        text: 'Java 基础',
                        children: [
                            {
                                text: 'Java 基础知识',
                                link: '/java/java-base/java-base.html'
                            }
                        ]
                    },
                    {
                        text: 'Java IO',
                        children:[
                            {
                                text: 'Java IO 基础知识',
                                link: '/java/java-io/Java IO 前置知识.html'
                            }
                        ]
                    },
                    {
                       text: 'Java 集合',
                       children:[
                            {
                                text: "Java 集合概览",
                                link: "/java/java-collection/java-collection-overview.html"
                            },
                            {
                                text: 'Java List集合',
                                link:'/java/java-collection/java-collection-list.html'
                            }
                       ]
                    },
                    {
                        text: 'Java 并发',
                        children:[
                            {
                                text:'Java 并发基础',
                                link:'/java/java-concurrent/Java并发基础.html'
                            }
                        ]
                    },
                    {
                        text:'JVM 详解',
                        children:[
                            {
                                text:'JVM概览',
                                link:'/java/java-jvm/JVM概览.html'
                            },
                            {
                                text:'JVM内存结构',
                                link:'/java/java-jvm/JVM内存结构.html'
                            },
                            {
                                text:'JVM垃圾回收',
                                link:'/java/java-jvm/JVM垃圾回收.html'
                            },
                            {
                                text:'JVM类文件结构',
                                link:'/java/java-jvm/JVM类文件结构.html'
                            },
                            {
                                text:'JVM类加载器',
                                link:'/java/java-jvm/JVM类加载器.html'
                            },
                            {
                                text:'Java内存模型',
                                link:'/java/java-jvm/JVM内存模型.html'
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
                                link:"/spring/test02.html"
                            }
                        ]
                    },
                    {
                        text: 'Spring 后置处理器解析',
                        children: [
                            {
                                text: 'Spring 后置处理器总览',
                                link: '/spring/spring-bean-post-processor/BeanPostProcessor-base.html'
                            }
                        ]
                    }

                ]
            },
            {
                text: 'Spring Cloud',
                children:[
                    {
                        text:'Spring Cloud Overview',
                        link: '/spring-cloud/spring-cloud-overview.md'
                    },
                    {
                        text: 'Spring Cloud Nacos',
                        link: '/spring-cloud/spring-cloud-alibaba-nacos.md'
                    },
                    {
                        text: 'Spring Cloud Sentinel',
                        link: '/spring-cloud/spring-cloud-alibaba-sentinel.md'
                    },
                    {
                        text: 'Spring Cloud Seate',
                        link: '/spring-cloud/spring-cloud-alibaba-seate.md'
                    },
                    {
                        text: 'Spring Cloud Ribbon',
                        link: '/spring-cloud/spring-cloud-ribbon/spring-cloud-ribbon.md'  
                    }
                ]
            },
            {
                text: "数据库",
                children:[
                    {
                        text: "MySQL",
                        children:[
                            {
                                text: "MySQL 基础篇",
                                link: "/database/mysql/mysql-base.html"
                            },
                            {
                                text: "MySQL 进阶篇",
                                link: "/database/mysql/mysql-advance.html"
                            },
                            {
                                text: "MySQL 运维篇",
                                link: "/database/mysql/mysql-devops.html"
                            },
                            {
                                text: "MySQL 应用篇",
                                link: "/database/mysql/mysql-apply.html"
                            }
                        ]
                    }
                ]
            },
            {
                text:'自我修养',
                children:[
                    {
                        text:'设计模式',
                        children:[
                            {
                                text:'代理模式',
                                link:'/quality/design-mode/design-proxy.html'
                            },
                            {
                                text:'装饰器模式',
                                link:'/quality/design-mode/design-decorator.html'
                            }
                            
                        ]
                    }
                ]
            },
            {
                text:'中间件',
                children:[
                    {
                        text:'Tomcat 专题',
                        children:[
                            {
                                text:'Tomcat专题',
                                link:'/middleware/tomcat/tomcat.md'
                            }
                            
                        ]
                    }
                ]
            },
            {
                text:'工具包',
                children:[
                    {
                        text: 'Junit 测试框架',
                        children:[
                            {
                                text:'Junit 5 使用总结',
                                link: '/tools/junit/junit5.md'
                            }
                        ]
                    },
                    {
                        text: 'Java 日志框架',
                        link: '/tools/log/log-framework.md'
                    }
                ]
            }
        ],
        // 配置左侧边栏
        sidebar: {
            '/java/': [
                {
                    text: 'Java 集合',
                    collapsible: false,
                    children: [
                        '/java/java-collection/java-collection-overview.html',
                        '/java/java-collection/java-collection-list.html'
                    ]
                },
                {
                    text: 'Java IO 模型',
                    collapsible: false,
                    children:[
                        '/java/java-io/Java IO 前置知识.html',
                        '/java/java-io/Java BIO.md'
                    ]
                },
                {
                    text: 'Java 并发编程',
                    collapsible: false,
                    children:[
                        '/java/java-concurrent/Java并发基础.html'
                    ]
                },
                {
                    text: 'JVM概览',
                    collapsible: false,
                    children:[
                        '/java/java-jvm/JVM概览.html',
                        '/java/java-jvm/JVM内存结构.html',
                        '/java/java-jvm/JVM垃圾回收.html',
                        '/java/java-jvm/JVM类文件结构.html',
                        '/java/java-jvm/JVM类加载器.html',
                        '/java/java-jvm/Java内存模型.html'
                    ]
                }
            ],
            '/spring/':[
                {
                    text: 'Spring Framework',
                    collapsible: false,
                    children:[
                        'test01',
                        'test02'
                    ]
                },
                {
                    text: 'Spring 后置处理器',
                    children:[
                        '/spring/spring-bean-post-processor/BeanPostProcessor-base.html',
                        '/spring/spring-bean-post-processor/BeanPostProcessor-ConfigurationClassPostProcessor.html'
                    ]
                }
            ],
            '/spring-cloud/':[
                {
                    text: '微服务架构',
                    children:[
                        '/spring-cloud/spring-cloud-overview.html',
                        '/spring-cloud/spring-cloud-alibaba-nacos.html',
                        '/spring-cloud/spring-cloud-alibaba-sentinel.html',
                        '/spring-cloud/spring-cloud-alibaba-seate.html'
                    ]
                },
                {
                    text:'常用组件',
                    children:[
                        '/spring-cloud/spring-cloud-openfeign.html',
                        '/spring-cloud/spring-cloud-ribbon/spring-cloud-ribbon.html'
                    ]
                }
            ],
            '/database/':[
                {
                    text: 'MySQL',
                    children:[
                       '/database/mysql/mysql-base.html',
                       "/database/mysql/mysql-advance.html",
                       "/database/mysql/mysql-devops.html",
                       "/database/mysql/mysql-apply.html"
                    ]
                }
            ],
            '/quality/':[
                {
                    text:'设计模式',
                    children:[
                        '/quality/design-mode/design-proxy.html',
                        '/quality/design-mode/design-decorator.html'
                    ]
                }
            ],
            '/middleware/':[
                {
                    text: 'Tomcat 专题',
                    collapsible: false,
                    children:[
                        '/middleware/tomcat/tomcat.md'
                    ]
                }

            ],
            '/tools':[
                {
                    test:'常用开发工具',
                    collapsible:false,
                    children:[
                        '/tools/junit/junit5.md',
                        '/tools/log/log-framework.md'
                    ]
                }
            ]

        },
        sidebarDepth: 2
    })
}