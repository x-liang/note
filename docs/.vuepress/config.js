import { info } from "vuepress";
import { hopeTheme } from "vuepress-theme-hope";

module.exports = {
    locales: {
        '/': {
            lang: 'zh-CN',
            title: 'Java 成神之路',
            description: '这是我的第一个 VuePress 站点',
        }
    },
    base: "/",
    title: "教程",
    theme: hopeTheme({
        /**
         * 主题配置
         * "switch": 在深色模式，浅色模式和自动之间切换 (默认)
         * "toggle": 在深色模式和浅色模式之间切换
         * "auto": 自动根据用户设备主题或当前时间决定是否应用深色模式
         * "enable": 强制深色模式
         * "disable": 禁用深色模式
         */
        darkmode: "toggle",

        // 配置上边的导航栏
        navbar: [
            {
                text: 'Java 笔记',
                link: '/java/java-overview.md'
            },
            {
                text: 'Spring 笔记',
                children: [
                    {
                        text: 'Spring IOC',
                        children: [
                            {
                                text: "Spring IOC详解",
                                link: "/spring/test02.html"
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
                prefix: '/spring-cloud/',
                children: [
                    {
                        text: 'Spring Cloud Overview',
                        link: 'spring-cloud-overview.md'
                    },
                    {
                        text: 'Spring Cloud Nacos',
                        link: 'spring-cloud-alibaba-nacos.md'
                    },
                    {
                        text: 'Spring Cloud Sentinel',
                        link: 'spring-cloud-alibaba-sentinel.md'
                    },
                    {
                        text: 'Spring Cloud Seate',
                        link: 'spring-cloud-alibaba-seate.md'
                    },
                    {
                        text: 'Spring Cloud Ribbon',
                        link: 'spring-cloud-ribbon/spring-cloud-ribbon.md'
                    }
                ]
            },
            {
                text: "数据库",
                link: '/database/database-overview.md',
            },
            {
                text: '自我修养',
                link: "/quality/quality-overview.md"
            },
            {
                text: '中间件',
                link: "/middleware/middleware-overview.md"
            },
            {
                text: '工具包',
                link: "/tools/tools-overview.md"
            }
        ],
        // 配置左侧边栏
        sidebar: {
            '/java/': [
                {
                    text: "Java 总览",
                    link: '/java/java-overview.md'
                },
                {
                    text: "Java 基础",
                    collapsible: true,
                    children: [
                        '/java/java-base/java-base.md',
                        '/java/java-base/java-sql.md',
                        '/java/java-base/java-time.md',
                        '/java/java-servlet/java-servlet.md',
                        '/java/java-base/java-time.md',
                    ]
                },
                {
                    text: 'Java 8 新特性',
                    collapsible: true,
                    children: [
                        '/java/java-stream/java-lambda.md',
                        '/java/java-stream/java-stream.md',
                    ]
                },
                {
                    text: 'Java 集合',
                    collapsible: true,
                    children: [
                        '/java/java-collection/java-collection-list.html',
                        '/java/java-collection/java-collection-map.html'
                    ]
                },
                {
                    text: 'Java IO 模型',
                    collapsible: true,
                    children: [
                        '/java/java-io/java-io-base.html',
                        '/java/java-io/java-bio.md',
                        '/java/java-io/java-nio.md'
                    ]
                },
                {
                    text: 'Java 并发编程',
                    collapsible: true,
                    children: [
                        '/java/java-concurrent/java-concurrent-base.html',
                        '/java/java-concurrent/java-concurrent-container.html',
                        '/java/java-concurrent/java-concurrent-lock.html',
                        '/java/java-concurrent/java-concurrent-pool.html',
                        '/java/java-concurrent/java-concurrent-tools.html',
                        '/java/java-concurrent/java-concurrent-interview.html',
                    ]
                },
                {
                    text: 'JVM概览',
                    collapsible: true,
                    children: [
                        '/java/java-jvm/JVM概览.html',
                        '/java/java-jvm/JVM内存结构.html',
                        '/java/java-jvm/JVM垃圾回收.html',
                        '/java/java-jvm/JVM类文件结构.html',
                        '/java/java-jvm/JVM类加载器.html',
                        '/java/java-jvm/Java内存模型.html',
                        '/java/java-jvm/JVM调优.html',
                    ]
                }
            ],
            '/spring/': [
                {
                    text: 'Spring Framework',
                    collapsible: true,
                    children: [
                        'test01',
                        'test02'
                    ]
                },
                {
                    text: 'Spring 后置处理器',
                    children: [
                        '/spring/spring-bean-post-processor/BeanPostProcessor-base.html',
                        '/spring/spring-bean-post-processor/BeanPostProcessor-ConfigurationClassPostProcessor.html'
                    ]
                }
            ],
            '/spring-cloud/': [
                {
                    text: '微服务架构',
                    children: [
                        '/spring-cloud/spring-cloud-overview.html',
                        '/spring-cloud/spring-cloud-nacos/nacos-client-discovery.html',
                        '/spring-cloud/spring-cloud-nacos/nacos-overview.html',
                        '/spring-cloud/spring-cloud-sentinel/sentinel-source.html',
                        '/spring-cloud/spring-cloud-alibaba-seate.html',
                        '/spring-cloud/spring-cloud-gateway/spring-cloud-gateway.html'
                    ]
                },
                {
                    text: '常用组件',
                    children: [
                        '/spring-cloud/spring-cloud-openfeign/spring-cloud-openfeign.html',
                        '/spring-cloud/spring-cloud-ribbon/spring-cloud-ribbon.html'
                    ]
                }
            ],
            '/database/': [
                {
                    text: "数据库",
                    link: "/database/database-overview.md"
                },
                {
                    text: 'MySQL 详解',
                    collapsible: true,
                    children: [
                        '/database/mysql/mysql-base.html',
                        "/database/mysql/mysql-advance.html",
                        "/database/mysql/mysql-devops.html",
                        "/database/mysql/mysql-apply.html"
                    ]
                },
                {
                    text: "Redis 详解",
                    collapsible: true,
                    children:[
                        "/database/redis/redis-overview.md",
                        "/database/redis/redis-base.md",
                        "/database/redis/redis-cluster.md",
                    ]
                }
            ],
            '/quality/': [
                {
                    text: '设计模式',
                    collapsible: true,
                    children: [
                        '/quality/design-mode/design-overview.html',
                        '/quality/design-mode/design-proxy.html',
                        '/quality/design-mode/design-decorator.html',
                        '/quality/design-mode/design-adapter.html',
                        '/quality/design-mode/design-chain.html',
                        '/quality/design-mode/design-composite.html',
                        '/quality/design-mode/design-strategy.html',
                        '/quality/design-mode/design-factory.html',
                        '/quality/design-mode/design-singleton.html',
                    ]
                },
                {
                    text: '数据结构',
                    collapsible: true,
                    children: [
                        '/quality/data-structure/data-structure-overview.html',
                        '/quality/data-structure/data-structure-list.html',
                        '/quality/data-structure/data-structure-tree.html'
                    ]
                },
                {
                    text: "操作系统",
                    collapsible: true,
                    children: [
                        "/quality/operating-system/encoding.md",
                        "/quality/operating-system/encryption-algorithm.md"
                    ]
                }
            ],
            '/middleware/': [
                {
                    text: "常用工具总结",
                    link: '/middleware/middleware-overview.md'
                },
                {
                    text: "Mybatis 总结",
                    collapsible: true,
                    children: [
                        "/middleware/mybatis/1.Hello World.md",
                        "/middleware/mybatis/2.Global Config.md"
                    ]
                },
                {
                    text: "Shiro 总结",
                    link: '/middleware/shiro/shiro-overview.md'
                },
                {
                    text: "Sharding-Sphere 总结",
                    link: '/middleware/sharding-sphere/sharding-sphere.md'
                },
                {
                    text: 'Tomcat 专题',
                    collapsible: true,
                    children: [
                        '/middleware/tomcat/tomcat.md'
                    ]
                },
                {
                    text: 'Kafka 专题',
                    collapsible: true,
                    children: [
                        '/middleware/kafka/kafka-overview.md',
                        '/middleware/kafka/kafka-consumer.md',
                        '/middleware/kafka/kafka-producer.md',
                        '/middleware/kafka/kafka-broker.md',
                        '/middleware/kafka/spring-kafka.md',
                    ]
                },
                {
                    text: "日志的使用",
                    link: "/middleware/log/log-framework.md"                    
                },
                {
                    text: "Jackson 详解",
                    link: "/middleware/jackson/jackson-overview.md" 
                },
                {
                    text: "HikariCP 详解",
                    collapsible: true,
                    children: [
                        "/middleware/HikariCP/HikariCP-base.md" ,
                        "/middleware/HikariCP/HikariCP-source.md" ,
                    ] 
                }

            ],
            '/tools': [
                {
                    text: "常用工具总结",
                    link: "/tools/tools-overview.md"
                },
                {
                    text: '常用开发工具',
                    collapsible: true,
                    children: [
                        '/tools/junit/junit5.md',
                        '/tools/junit/junit4.md',
                        '/tools/maven/maven.md',
                        '/tools/git/git.md',
                        '/tools/gitlab/gitlab.md'
                    ]
                }
            ]

        },
        sidebarDepth: 2,
        blog: {
            avatar: "/logo.png",
            name: "Mr.Phoenix",
            roundAvatar: true,
            description: "我们的征途是星辰大海！",
            // 自动生成摘要
            autoExcerpt: true,
            // 热部署， 开启会影响性能，调试样式的时候开启，其他时间关闭就好
            hotReload: true
        },
        plugins: {
            // 关闭图片预览
            photoSwipe: false,
            // 开启博客
            blog: true,
            mdEnhance: {
                /**
                 * 用来支持流程图
                 */
                mermaid: true,
                /**
                 * 用来支持任务列表
                 */
                tasklist: true,
                // 启用幻灯片支持
                presentation: true,
            }
        }
    })
}