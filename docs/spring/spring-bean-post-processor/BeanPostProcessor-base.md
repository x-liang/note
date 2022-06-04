# 后置处理器

spring的后置处理器主要分为两类，一类是BeanFactoryPostProcessor，这个用来处理BeanDefinition信息，另一类是BeanPostProcessor，这个用来处理Bean实例的。这篇文章主要来介绍一下后置处理器的类定义和继承体系。





## BeanFactoryPostProcessor

### BeanFactoryPostProcessor

这个是`BeanFactoryPostProcessor`类定义信息，里面只有一个接口，它的调用时机是在`BeanDefinition`加载完成之后，进行Bean实例化之前。

```java
@FunctionalInterface
public interface BeanFactoryPostProcessor {
	/**
	 * 在BeanDefinition加载完成之后，进行Bean实例化之前调用。
	 */
	void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException;
}
```

### BeanDefinitionRegistryPostProcessor

`BeanDefinitionRegistryPostProcessor`是`BeanFactoryPostProcessor`的直接子类，这个后置处理器主要是用来注册BeanDefinition定义。调用时机也是在`BeanDefinition`加载完成之后，进行Bean实例化之前。但是需要注意的是这个方法会在父类的`postProcessBeanFactory`方法之前调用，因为这里会注册一些新的BeanDefinition，需要保证在调用父类中的`postProcessBeanFactory`方法之后，不能有新的BeanDefinition注册。

```java
public interface BeanDefinitionRegistryPostProcessor extends BeanFactoryPostProcessor {

	/**
	 * 这个扩展方法主要是用来注册BeanDefinition
	 */
	void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException;
}
```



### ConfigurationClassPostProcessor

`ConfigurationClassPostProcessor`是具体的实现类，注意这个类实现了`BeanDefinitionRegistryPostProcessor`, 所以内部或有两个实现方法，这个类主要用来处理`@Configuration`注解。具体的实现可以参考[ConfigurationClassPostProcessor详解](./BeanPostProcessor-ConfigurationClassPostProcessor.md)

```java
public class ConfigurationClassPostProcessor implements BeanDefinitionRegistryPostProcessor,
		PriorityOrdered, ResourceLoaderAware, ApplicationStartupAware, BeanClassLoaderAware, EnvironmentAware {
	...		
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
        ...
    }    
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {       
    	...
    }
}
```





### CustomAutowireConfigurer

具体的实现类

```java
public class CustomAutowireConfigurer implements BeanFactoryPostProcessor, BeanClassLoaderAware, Ordered {
	...
}
```



### EventListenerMethodProcessor

```java
public class EventListenerMethodProcessor
		implements SmartInitializingSingleton, ApplicationContextAware, BeanFactoryPostProcessor {
		...
}
```



### 后置处理器的调用入口

在刷新Bean容器的时候，通过反射的方式调用注册到Bean容器中的后置处理器。具体的方法在`AbstractApplicationContext#refresh`方法中。关于Bean加载的流程，参见Bean加载流程相关文章。

```java
// AbstractApplicationContext#refresh
public void refresh() throws BeansException, IllegalStateException {
	...
    // 注册BeanFactoryPostProcessor
    postProcessBeanFactory(beanFactory);
    // 发射执行BeanFactoryPostProcessor
	invokeBeanFactoryPostProcessors(beanFactory);
    ...
}
```

下面咱们来看看`invokeBeanFactoryPostProcessors(beanFactory);`方法：

```java
// AbstractApplicationContext#invokeBeanFactoryPostProcessors
protected void invokeBeanFactoryPostProcessors(ConfigurableListableBeanFactory beanFactory) {
    PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());

    // Detect a LoadTimeWeaver and prepare for weaving, if found in the meantime
    // (e.g. through an @Bean method registered by ConfigurationClassPostProcessor)
    if (!NativeDetector.inNativeImage() && beanFactory.getTempClassLoader() == null && 
        beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
        beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
        beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
    }
}
```

这里面最重要的就是`PostProcessorRegistrationDelegate.invokeBeanFactoryPostProcessors(beanFactory, getBeanFactoryPostProcessors());`这行语句，在看代码之前先捋一下代码的执行逻辑：

首先BeanFactoryPostProcessor有两个抽象类`BeanFactoryPostProcessor`和`BeanDefinitionRegistryPostProcessor`,在调用是要保证先执行`BeanDefinitionRegistryPostProcessor#postProcessBeanDefinitionRegistry`方法注册BeanDefinition，然后在执行`BeanFactoryPostProcessor#postProcessBeanFactory`方法，这样才能保证在执行`BeanFactoryPostProcessor#postProcessBeanFactory`方法之前，所有的BeanDefinition都以注册完成。

其次，不同的BeanFactoryPostProcessor的执行也是分优先级的，最优先执行的是通过入参传入的BeanFactoryPostProcessor，然后会通过BenFactory容器中查找实现了`PriorityOrdered`类的BeanFactoryPostProcessor，这个列表也会先进行排序，然后在遍历执行。在然后是实现了`Ordered`类的BeanFactoryPostProcessor，最后是其他全部的BeanFactoryPostProcessor，这里有一个点，就是BeanFactoryPostProcessor中可能也会注册BeanFactoryPostProcessor类型的BeanDefinition，所以会有一个循环检测的逻辑，来保证所有注册的BeanFactoryPostProcessor都能够被加载。这样设计有一个好处，就是可以通过高优先级的BeanFactoryPostProcessor注册低优先级的BeanFactoryPostProcessor，并保证执行顺序。在低优先级中也可以注册高优先级的后置处理器，但只能够在最后执行。

最后，针对`postProcessBeanFactory`这一方法，`BeanDefinitionRegistryPostProcessor`类型也会优先于`BeanFactoryPostProcessor`执行。

现在来看代码实现：

```java
// PostProcessorRegistrationDelegate#invokeBeanFactoryPostProcessors
public static void invokeBeanFactoryPostProcessors(
    ConfigurableListableBeanFactory beanFactory, List<BeanFactoryPostProcessor> beanFactoryPostProcessors) {
    // 用于记录执行过的bean名称
    Set<String> processedBeans = new HashSet<>();
    // 对BeanDefinitionRegistry 类型的处理
    if (beanFactory instanceof BeanDefinitionRegistry) {
        BeanDefinitionRegistry registry = (BeanDefinitionRegistry) beanFactory;
        // 用于记录常规 BeanFactoryPostProcessor
        List<BeanFactoryPostProcessor> regularPostProcessors = new ArrayList<>();
        // 用于记录 BeanDefinitionRegistryPostProcessor
        List<BeanDefinitionRegistryPostProcessor> registryProcessors = new ArrayList<>();

        /* 第一步：优先处理参数列表beanFactoryPostProcessors中是BeanDefinitionRegistryPostProcessor类型的processor */
        for (BeanFactoryPostProcessor postProcessor : beanFactoryPostProcessors) {
            if (postProcessor instanceof BeanDefinitionRegistryPostProcessor) {
                BeanDefinitionRegistryPostProcessor registryProcessor = (BeanDefinitionRegistryPostProcessor) postProcessor;
                /* 优先调用{@link BeanDefinitionRegisterPostProcessor#postProcessBeanDefinitionRegistry}*/
                registryProcessor.postProcessBeanDefinitionRegistry(registry);
                registryProcessors.add(registryProcessor);
            }
            else {
                // 记录常规BeanDefinitionPostProcessor
                regularPostProcessors.add(postProcessor);
            }
        }
        // currentRegistryProcessors 用于记录当前正要被执行的BeanDefinitionRegistryPostProcessor
        List<BeanDefinitionRegistryPostProcessor> currentRegistryProcessors = new ArrayList<>();

        // 第二步：在BeanFactory中查找实现了PriorityOrdered的BeanDefinitionRegistryPostProcessors，并调用。
        String[] postProcessorNames =
            beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
        for (String ppName : postProcessorNames) {
            if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
                // 实例化后置处理器
                currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                // 记录bean name，表示这个类已经处理过。
                processedBeans.add(ppName);
            }
        }
        // 排序，每一大类内部也会进行排序
        sortPostProcessors(currentRegistryProcessors, beanFactory);
        // 将currentRegistryProcessors列表记录到registryProcessors 中
        registryProcessors.addAll(currentRegistryProcessors);
        // 这里就会遍历列表调用`BeanDefinitionRegistry#postProcessBeanDefinitionRegistry()`方法
        invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry, beanFactory.getApplicationStartup());
        // 清空
        currentRegistryProcessors.clear();
        
        // 第三步：接下来，在BeanFactory中查找实现了Ordered的BeanDefinitionRegistryPostProcessors，并调用。
        // 在这一步中就可以看到，逻辑和第一步基本上是重复的。
        postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
        for (String ppName : postProcessorNames) {
            if (!processedBeans.contains(ppName) && beanFactory.isTypeMatch(ppName, Ordered.class)) {
                currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                processedBeans.add(ppName);
            }
        }
        sortPostProcessors(currentRegistryProcessors, beanFactory);
        registryProcessors.addAll(currentRegistryProcessors);
        invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors, registry, beanFactory.getApplicationStartup());
        currentRegistryProcessors.clear();

        // 第四步：调用所有其他BeanDefinitionRegistryPostProcessor(没有实现PriorityOrdered或者Ordered接口)，直到没有其他的出现。
        boolean reiterate = true;
        // 这个循环逻辑就是保证我在后置处理器中注册的BeanFactoryPostProcessor类型的BeanDefinition也能够被解析执行。
        while (reiterate) {
            reiterate = false;
            postProcessorNames = beanFactory.getBeanNamesForType(BeanDefinitionRegistryPostProcessor.class, true, false);
            for (String ppName : postProcessorNames) {
                if (!processedBeans.contains(ppName)) {
                    // 发现了一个尚未被处理的 BeanDefinitionRegistryPostProcessor
                    currentRegistryProcessors.add(beanFactory.getBean(ppName, BeanDefinitionRegistryPostProcessor.class));
                    processedBeans.add(ppName);
                    reiterate = true;
                }
            }
            sortPostProcessors(currentRegistryProcessors, beanFactory);
            registryProcessors.addAll(currentRegistryProcessors);
            invokeBeanDefinitionRegistryPostProcessors(currentRegistryProcessors,
                                                       registry, beanFactory.getApplicationStartup());
            currentRegistryProcessors.clear();
        }

        /* 执行BeanDefinitionRegistryPostProcessor 类型的的回调 postProcessBeanFactory() */
        invokeBeanFactoryPostProcessors(registryProcessors, beanFactory);
        // 执行 BeanFactoryPostProcessor 类型的回调 postProcessBeanFactory()
        invokeBeanFactoryPostProcessors(regularPostProcessors, beanFactory);
    }
    else {
        // 调用在上下文实例中注册的工厂处理器
        invokeBeanFactoryPostProcessors(beanFactoryPostProcessors, beanFactory);
    }

    // 第五步：在BeanFactory中查找BeanFactoryPostProcessor.class类型的beanName
    String[] postProcessorNames =
        beanFactory.getBeanNamesForType(BeanFactoryPostProcessor.class, true, false);

    /* BeanFactoryPostProcessors 把实现了 PriorityOrdered, Ordered, 和其他的BeanFactoryPostProcessors分开 */
    List<BeanFactoryPostProcessor> priorityOrderedPostProcessors = new ArrayList<>();
    List<String> orderedPostProcessorNames = new ArrayList<>();
    List<String> nonOrderedPostProcessorNames = new ArrayList<>();
    /* 这里会一次找出所有BeanFactoryPostProcessor类型的bean name,因为到这里就不会有新的BeanDefinition注册到容器中了。
       这里也有一个实现细节，就是每一个等级的BeanDefinition只有到了调用的时候才会初始化，这样高等级的BeanFactoryPostProcessor就可以
       修改低等级的BeanFactoryPostProcessor的bean定义信息了。
    */
    for (String ppName : postProcessorNames) {
        if (processedBeans.contains(ppName)) {
            // 跳过----已在上述第一阶段处理过
        }
        else if (beanFactory.isTypeMatch(ppName, PriorityOrdered.class)) {
            priorityOrderedPostProcessors.add(beanFactory.getBean(ppName, BeanFactoryPostProcessor.class));
        }
        else if (beanFactory.isTypeMatch(ppName, Ordered.class)) {
            orderedPostProcessorNames.add(ppName);
        }
        else {
            nonOrderedPostProcessorNames.add(ppName);
        }
    }

    // 第六步：调用实现PriorityOrdered的BeanFactoryPostProcessors。
    sortPostProcessors(priorityOrderedPostProcessors, beanFactory);
    invokeBeanFactoryPostProcessors(priorityOrderedPostProcessors, beanFactory);

    // 第七部：调用实现Ordered的BeanFactoryPostProcessors。
    List<BeanFactoryPostProcessor> orderedPostProcessors = new ArrayList<>(orderedPostProcessorNames.size());
    for (String postProcessorName : orderedPostProcessorNames) {
        orderedPostProcessors.add(beanFactory.getBean(postProcessorName, BeanFactoryPostProcessor.class));
    }
    sortPostProcessors(orderedPostProcessors, beanFactory);
    invokeBeanFactoryPostProcessors(orderedPostProcessors, beanFactory);

    // 第八步：调用所有其他BeanFactoryPostProcessors。
    List<BeanFactoryPostProcessor> nonOrderedPostProcessors = new ArrayList<>(nonOrderedPostProcessorNames.size());
    for (String postProcessorName : nonOrderedPostProcessorNames) {
        nonOrderedPostProcessors.add(beanFactory.getBean(postProcessorName, BeanFactoryPostProcessor.class));
    }
    invokeBeanFactoryPostProcessors(nonOrderedPostProcessors, beanFactory);

    //清除缓存merged bean definitions，因为后处理器可能已经修改了原始元数据，例如替换值中的占位符...
    beanFactory.clearMetadataCache();
}
```

至此，所有的BeanFactoryPostProcessor调用完成。

## BeanPostProcessor

