## Spring 事物

事物：逻辑上的一组操作，组成这组操作的各个逻辑单元。要么一起成功，要么一起失败。

### 事物特性

原子性 （atomicity）:强调事务的不可分割.

一致性 （consistency）:事务的执行的前后数据的完整性保持一致.

隔离性 （isolation）:一个事务执行的过程中,不应该受到其他事务的干扰

持久性（durability） :事务一旦结束,数据就持久到数据库



### 存在的问题

**脏读:** 指当一个事务正在访问数据，并且对数据进行了修改，而这种修改还没有提交到数据库中，这时，另外一个事务也访问这个数据，然后使用了这个数据。因为这个数据是还没有提交的数据， 那么另外一个事务读到的这个数据是脏数据，依据脏数据所做的操作可能是不正确的。

**不可重复读:** 指在一个事务内，多次读同一数据。在这个事务还没有结束时，另外一个事务也访问该同一数据。那么，在第一个事务中的两次读数据之间，由于第二个事务的修改，那么第一个事务两次读到的数据可能是不一样的。这样就发生了在一个事务内两次读到的数据是不一样的，因此称为是不可重复读。

**幻读:** 指当事务不是独立执行时发生的一种现象，例如第一个事务对一个表中的数据进行了修改，这种修改涉及到表中的全部数据行。同时，第二个事务也修改这个表中的数据，这种修改是向表中插入一行新数据。那么，以后就会发生操作第一个事务的用户发现表中还有没有修改的数据行，就好象发生了幻觉一样。

### 如何解决

事物的隔离级别

| 隔离级别                    | 解决的问题             | 未解决的问题           |
| --------------------------- | ---------------------- | ---------------------- |
| 读未提交（READ UNCOMMITED） |                        | 脏读、不可重复读、幻读 |
| 读以提交（READ COMMITED）   | 脏读                   | 不可重复读、幻读       |
| 可重复读（REPEATABLE READ） | 脏读、不可重复读       | 幻读                   |
| 串行化（SERIALIZABLE）      | 脏读、不可重复读、幻读 |                        |

Mysql默认使用可重复读

Oracle默认使用读以提交

### Spring的事物传播机制

| 传播行为                  | 描述                                           |
| ------------------------- | ---------------------------------------------- |
| PROPAGATION_REQUIRED      | 支持当前事务，如果不存在 就新建一个(默认)      |
| PROPAGATION_SUPPORTS      | 支持当前事务，如果不存在，就不使用事务         |
| PROPAGATION_MANDATORY     | 支持当前事务，如果不存在，抛出异常             |
| PROPAGATION_REQUIRES_NEW  | 如果有事务存在，挂起当前事务，创建一个新的事务 |
| PROPAGATION_NOT_SUPPORTED | 以非事务方式运行，如果有事务存在，挂起当前事务 |
| PROPAGATION_NEVER         | 以非事务方式运行，如果有事务存在，抛出异常     |
| PROPAGATION_NESTED        | 如果当前事务存在，则嵌套事务执行               |







## Spring  待整理

#### Spring的扩展组件



##### BeanFactoryPostProcessor 总结

###### ConfigurationClassPostProcessor 总结

​		



##### BeanPostProcessor 总结



###### ServletContextAwareProcessor

很简单的一个postProcessor，主要是对实现了ServletContextAware和ServletConfigAware接口的bean设置servletContext和servletConfig

实现代码：

```java
@Override
public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
    if (getServletContext() != null && bean instanceof ServletContextAware) {
        ((ServletContextAware) bean).setServletContext(getServletContext());
    }
    if (getServletConfig() != null && bean instanceof ServletConfigAware) {
        ((ServletConfigAware) bean).setServletConfig(getServletConfig());
    }
    return bean;
}
```





##### TODO 为什么会有SmartInitializingSingleton这个组件



[Spring Boot小组件 - SmartInitializingSingleton - 沐魇 - 博客园 (cnblogs.com)](