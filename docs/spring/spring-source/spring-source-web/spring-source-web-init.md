# 从启动流程说起

提前声明，文中所粘贴代码均为核心流程，省略了日志和校验逻辑，try cache等



Servlet在在启动时首先会调用Listener接口，在调用init接口。在Spring中，最主要的接口就是ContextLoaderListener接口。下面先看看这个接口，然后在看init的初始化流程。

## ContextLoaderListener

ContextLoaderListener继承自`ServeltContextListener`，他的主要作用就是用来监听ServeltContext声明周期的改变，其内部只定义了2个接口，如下：

```java
public interface ServletContextListener extends EventListener {
    /**
     * 在web应用中的filters和servlets初始化之前，会通知所有的Listener
     */
    default public void contextInitialized(ServletContextEvent sce) {}
    /**
     * 在Listener被通知之前，所有的filter和servlets都被销毁
     */
    default public void contextDestroyed(ServletContextEvent sce) {}
}
```

可以看到，在初始化servlet之前和销毁servlet之后，都会通知Listener。下面就看看Spring的具体实现。

```java
public class ContextLoaderListener extends ContextLoader implements ServletContextListener {

	@Override
	public void contextInitialized(ServletContextEvent event) {
		// 初始化webApplicationContext
		initWebApplicationContext(event.getServletContext());
	}

	@Override
	public void contextDestroyed(ServletContextEvent event) {
		closeWebApplicationContext(event.getServletContext());
		ContextCleanupListener.cleanupAttributes(event.getServletContext());
	}
}
```

这个类继承自`ContextLoader`,在这个类中有这样一段代码：

```java
private static final String DEFAULT_STRATEGIES_PATH = "ContextLoader.properties";
static {
     ClassPathResource resource = new ClassPathResource(DEFAULT_STRATEGIES_PATH, ContextLoader.class);
     defaultStrategies = PropertiesLoaderUtils.loadProperties(resource);
}
```

该方法在配置文件中加载了默认策略，配置文件中的内容如下：

```properties
org.springframework.web.context.WebApplicationContext=org.springframework.web.context.support.XmlWebApplicationContext
```

接着，咱们在回到`ContextLoaderListener#contextInitialized`这个方法，这个方法内只有一行代码啊，就是调用`ContextLoader#initWebApplicationContext`方法；

### 初始化Web应用上下文

初始化web应用上下文，主要包含几大流程：

- 检查是否包含root application context
- 如果当前context为null，创建一个新的context，
- 刷新当前应用上下文
- 将context设置为root application context

代码如下：

```java
public WebApplicationContext initWebApplicationContext(ServletContext servletContext) {
    if (servletContext.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE)!=null){
        // 禁止多次初始化context实例
        throw new IllegalStateException("already present");
    }
    ...
    try {
        if (this.context == null) {
            //通过 createWebApplicationContext 方法创建上下文，默认创建 XmlWebApplicationContext
            this.context = createWebApplicationContext(servletContext);
        }
        if (this.context instanceof ConfigurableWebApplicationContext) {
            ConfigurableWebApplicationContext cwac = (ConfigurableWebApplicationContext) this.context;
            // 判断这个是否被启动过
            if (!cwac.isActive()) {
                if (cwac.getParent() == null) {
                    // 从5.0开始，loadParentContext返回null
                    ApplicationContext parent = loadParentContext(servletContext);
                    cwac.setParent(parent);
                }
                // 在该方法中调用上下文的 refresh 方法，refresh 就是启动上下文的入口
                configureAndRefreshWebApplicationContext(cwac, servletContext);
            }
        }
        // 将contextClass信息记录到servletContext中
        servletContext.setAttribute(
            WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE, this.context);
        ...
        return this.context;
    }
}
```



#### 创建应用上下文

在创建应用上下文的过程中，使用上面代码中加载的默认策略。

代码如下（这里只粘了核心代码，省略了一些try cache和校验逻辑）：

```java
protected WebApplicationContext createWebApplicationContext(ServletContext sc) {
    // 判断要使用的ApplicationContext的类型，对应到web.xml中的配置contextClass，默认为XmlWebApplicationContext
    Class<?> contextClass = determineContextClass(sc);
	...
    // 实例化
    return (ConfigurableWebApplicationContext) BeanUtils.instantiateClass(contextClass);
}

protected Class<?> determineContextClass(ServletContext servletContext) {
    // 获取context中的contextClass属性   （标签下）
    String contextClassName = servletContext.getInitParameter(CONTEXT_CLASS_PARAM);
    if (contextClassName != null) {
        return ClassUtils.forName(contextClassName, ClassUtils.getDefaultClassLoader());
    } else {
        // 这里加载的默认策略，即XmlWebApplicationContext
        contextClassName = defaultStrategies.getProperty(WebApplicationContext.class.getName());
        return ClassUtils.forName(contextClassName, ContextLoader.class.getClassLoader());
    }
}
```





#### 刷新上限文

```java
protected void configureAndRefreshWebApplicationContext(ConfigurableWebApplicationContext wac, 
                                                        ServletContext sc) {
    if (ObjectUtils.identityToString(wac).equals(wac.getId())) {
        // The application context id is still set to its original default value
        // -> assign a more useful id based on available information
        // 获取contextId属性
        String idParam = sc.getInitParameter(CONTEXT_ID_PARAM);
        if (idParam != null) {
            wac.setId(idParam);
        }
        else {
            // 生成默认的id
            wac.setId(ConfigurableWebApplicationContext.APPLICATION_CONTEXT_ID_PREFIX +
                      ObjectUtils.getDisplayString(sc.getContextPath()));
        }
    }

    /** wac 默认的实例是XmlWebApplication, 设置ServletContext*/
    wac.setServletContext(sc);

    /** contextConfigLocation 是用来配置spring的配置文件的*/
    String configLocationParam = sc.getInitParameter(CONFIG_LOCATION_PARAM);
    if (configLocationParam != null) {
        wac.setConfigLocation(configLocationParam);
    }

    // 这里get的时候会默认创建一个StandardEnvironment类型的环境bean，并且是ConfigurableEnvironment类型
    ConfigurableEnvironment env = wac.getEnvironment();
    if (env instanceof ConfigurableWebEnvironment) {
        ((ConfigurableWebEnvironment) env).initPropertySources(sc, null);
    }

    customizeContext(sc, wac);
    wac.refresh();
}

```















