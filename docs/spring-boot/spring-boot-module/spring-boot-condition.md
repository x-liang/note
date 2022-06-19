# Spring Boot 条件装配

## Spring中的条件装配

条件装配在Spring中就已经定义过，但是应用不是很广泛，下面来看看Condition的定义：

```java
public interface Condition {

	boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata);
}
```



## SpringBootCondition

下面来看看`SpringBootCondition`源码：

```

```

