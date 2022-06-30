# Java  线程池



## ThreadPoolExecutor



## ScheduledThreadPoolExecutor

ScheduledThreadPoolExecutor实现了按时间调度来执行任务，具体而言有一下两个方面：

（1）延迟执行任务

```java
public ScheduledFuture<?> schedule(Runnable command, long delay, TimeUnit unit) 

public <V> ScheduledFuture<V> schedule(Callable<V> callable, long delay, TimeUnit unit) 
```



（2）周期执行任务

```java
public ScheduledFuture<?> scheduleAtFixedRate(Runnable command, long initialDelay, long period, TimeUnit unit) 
    
public ScheduledFuture<?> scheduleWithFixedDelay(Runnable command, long initialDelay, long delay, TimeUnit unit)
```

