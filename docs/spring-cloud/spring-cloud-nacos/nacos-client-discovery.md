# Nacos服务注册发现原理



## 服务注册流程



### Spring CLoud 中的接口抽象

我们都知道，Nacos是基于Spring CLoud 来完成的服务注册发现，那么Spring Cloud又是如何定义的接口呢，下面我们来一探究竟

Spring CLoud 定义的抽象接口在`AbstractAutoServiceRegistration`中，它是通过监听`WebServerInitializedEvent`事件来完成接口的调用链。下面我们来看一看源码实现（这里只粘了注册流程相关的代码）：

```java
public abstract class AbstractAutoServiceRegistration<R extends Registration>
		implements AutoServiceRegistration, ApplicationContextAware,
		ApplicationListener<WebServerInitializedEvent> {
	
    private final ServiceRegistry<R> serviceRegistry;
    private AutoServiceRegistrationProperties properties;     
	
   	protected AbstractAutoServiceRegistration(ServiceRegistry<R> serviceRegistry,
                                              AutoServiceRegistrationProperties properties) {
		this.serviceRegistry = serviceRegistry;
		this.properties = properties;
	}
            
            
	@Override
	@SuppressWarnings("deprecation")
	public void onApplicationEvent(WebServerInitializedEvent event) {
		bind(event);
	}

	@Deprecated
	public void bind(WebServerInitializedEvent event) {
		ApplicationContext context = event.getApplicationContext();
		if (context instanceof ConfigurableWebServerApplicationContext) {
			if ("management".equals(((ConfigurableWebServerApplicationContext) context).getServerNamespace())) {
				return;
			}
		}
		this.port.compareAndSet(0, event.getWebServer().getPort());
		this.start();
	}

	public void start() {
        if (!isEnabled()) {
            if (logger.isDebugEnabled()) {
                logger.debug("Discovery Lifecycle disabled. Not starting");
            }
            return;
        }
        // only initialize if nonSecurePort is greater than 0 and it isn't already running
        // because of containerPortInitializer below
        if (!this.running.get()) {
            this.context.publishEvent(new InstancePreRegisteredEvent(this, getRegistration()));
            register();
            if (shouldRegisterManagement()) {
                registerManagement();
            }
            this.context.publishEvent(new InstanceRegisteredEvent<>(this, getConfiguration()));
            this.running.compareAndSet(false, true);
        }
	}
    
    protected boolean shouldRegisterManagement() {
		if (this.properties == null || this.properties.isRegisterManagement()) {
			return getManagementPort() != null && ManagementServerPortUtils.isDifferent(this.context);
		}
		return false;
	}     
    
    protected void registerManagement() {
		R registration = getManagementRegistration();
		if (registration != null) {
			this.serviceRegistry.register(registration);
		}
	}  
            
	protected void register() {
		this.serviceRegistry.register(getRegistration());
	}
            
    protected abstract R getRegistration();

	protected abstract R getManagementRegistration();
            
	protected abstract boolean isEnabled();	
		
}	
```

在这里，实际的注册流程由`ServiceRegistry`完成，而在Spring CLoud中`ServiceRegistry`只定义了抽象类，所以他需要在nacos中进行实现。`Registration`表示客户端的基本信息。









### Nacos中的实现

Nacos通过实现Spring Cloud 中的`AbstractAutoServiceRegistration`抽象类来完成接口的注册，下面来看看源码：

```java
public class NacosAutoServiceRegistration
		extends AbstractAutoServiceRegistration<Registration> {
	
    private NacosRegistration registration;

	public NacosAutoServiceRegistration(ServiceRegistry<Registration> serviceRegistry,
			AutoServiceRegistrationProperties autoServiceRegistrationProperties,
			NacosRegistration registration) {
		super(serviceRegistry, autoServiceRegistrationProperties);
		this.registration = registration;
	}
    
    @Override
	protected NacosRegistration getRegistration() {
		if (this.registration.getPort() < 0 && this.getPort().get() > 0) {
			this.registration.setPort(this.getPort().get());
		}
		Assert.isTrue(this.registration.getPort() > 0, "service.port has not been set");
		return this.registration;
	}

	@Override
	protected NacosRegistration getManagementRegistration() {
		return null;
	}
    
    @Override
	protected void register() {
		if (!this.registration.getNacosDiscoveryProperties().isRegisterEnabled()) {
			log.debug("Registration disabled.");
			return;
		}
		if (this.registration.getPort() < 0) {
			this.registration.setPort(getPort().get());
		}
		super.register();
	}

    @Override
	protected boolean isEnabled() {
		return this.registration.getNacosDiscoveryProperties().isRegisterEnabled();
	}
}
```

下面来看看`NacosServiceRegistry`,

```java
public class NacosServiceRegistry implements ServiceRegistry<Registration> {

	private final NacosDiscoveryProperties nacosDiscoveryProperties;

	private final NacosServiceManager nacosServiceManager;

	public NacosServiceRegistry(NacosServiceManager nacosServiceManager,
			NacosDiscoveryProperties nacosDiscoveryProperties) {
		this.nacosDiscoveryProperties = nacosDiscoveryProperties;
		this.nacosServiceManager = nacosServiceManager;
	}
    
    @Override
	public void register(Registration registration) {
		if (StringUtils.isEmpty(registration.getServiceId())) {
			log.warn("No service to register for nacos client...");
			return;
		}
		NamingService namingService = namingService();
		String serviceId = registration.getServiceId();
		String group = nacosDiscoveryProperties.getGroup();

		Instance instance = getNacosInstanceFromRegistration(registration);

		try {
			namingService.registerInstance(serviceId, group, instance);
			log.info("nacos registry, {} {} {}:{} register finished", group, serviceId,
					instance.getIp(), instance.getPort());
		}
		catch (Exception e) {
			if (nacosDiscoveryProperties.isFailFast()) {
				log.error("nacos registry, {} register failed...{},", serviceId,
						registration.toString(), e);
				rethrowRuntimeException(e);
			}
			else {
				log.warn("Failfast is false. {} register failed...{},", serviceId,
						registration.toString(), e);
			}
		}
	}
        
    private Instance getNacosInstanceFromRegistration(Registration registration) {
		Instance instance = new Instance();
		instance.setIp(registration.getHost());
		instance.setPort(registration.getPort());
		instance.setWeight(nacosDiscoveryProperties.getWeight());
		instance.setClusterName(nacosDiscoveryProperties.getClusterName());
		instance.setEnabled(nacosDiscoveryProperties.isInstanceEnabled());
		instance.setMetadata(registration.getMetadata());
		instance.setEphemeral(nacosDiscoveryProperties.isEphemeral());
		return instance;
	}
    
    private NamingService namingService() {
		return nacosServiceManager
				.getNamingService(nacosDiscoveryProperties.getNacosProperties());
	}


}
```



## 服务发现源码分析

https://www.jianshu.com/p/f3c37e3abc23