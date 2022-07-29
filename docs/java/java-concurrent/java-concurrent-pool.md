# Java  线程池



### Java中的线程池

在开发的过程中，合理的使用线程池能够带来三个好处。

- 降低资源消耗：通过重复利用已创建的线程降低线程创建和销毁造成的消耗
- 提高响应速度：当任务到达时，任务可以不需要等到线程创建就能立即执行。
- 提高线程可管理性：线程是稀缺的资源，如果无限制的创建，不仅会消耗系统资源，还会降低系统的稳定性，使用线程池可以进行统一分配、调优和监控。

#### ThreadPoolExecutor

ThreadPoolExecutor是Java对线程池的一个具体实现。



##### 线程池状态

主要分为5种状态

| 线程池状态 | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| RUNNING    | 允许提交并处理任务                                           |
| SHUTDOWN   | 不允许提交新任务，但是会处理完已提交的任务                   |
| STOP       | 不允许提交新任务，也不会处理阻塞队里中未执行的任务<br />并设置正在执行的线程的中断标志位 |
| TIDYING    | 所有任务执行完毕，池中工作线程数为0，等待执行terminated()钩子方法 |
| TERMINATED | terminated()钩子方法执行完毕                                 |

- 线程池的shutdown()方法，将线程池有RUNNING转换为SHUTDOWN状态
- 线程池的shutdownNow()方法将线程池由RUNNING状态或SHUTDOWN状态转换为STOP状态

注：SHUTDOWN状态和STOP状态先会转换为TIDYING状态转换为STOP状态

##### 创建线程池

要创建线程池，必须通过构造函数来进行创建，下面众多构造函数中参数最全的一个：

```java
public ThreadPoolExecutor(int corePoolSize,//核心线程数
                          int maximumPoolSize,//最大线程数
                          long keepAliveTime,//线程空闲时间
                          TimeUnit unit,//时间单位
                          BlockingQueue<Runnable> workQueue,//任务队列
                          ThreadFactory threadFactory,//线程工厂
                          RejectedExecutionHandler handler//拒绝策略) 
{
    ...
}
```

- corePoolSize：线程池中核心线程数的最大值
- maximumPoolSize：线程池中能拥有最多线程数
- keepAliveTime：表示空闲线程的存活时间
- unit：表示keepAliveTime的时间单位
- workQueue：用于缓存任务的缓冲队列，它决定了缓存任务的排队策略
- handler： 线程池对拒绝任务的处理策略

##### 线程池的工作原理

当调用线程池execute()方法添加一个任务时，线程池会做如下判断：

1. 如果此时线程池中的数量小于corePoolSize，即使线程池中的线程都处于空闲状态，也要创建新的线程来处理被添加的任务。
2. 如果此时线程池中的数量等于 corePoolSize，但是缓冲队列 workQueue未满，那么任务被放入缓冲队列。
3. 如果此时线程池中的数量大于corePoolSize，缓冲队列workQueue满，并且线程池中的数量小于maximumPoolSize，建新的线程来处理被添加的任务。
4. 如果此时线程池中的数量大于corePoolSize，缓冲队列workQueue满，并且线程池中的数量等于maximumPoolSize，那么通过 handler所指定的策略来处理此任务。也就是：处理任务的优先级为：核心线程corePoolSize、任务队列workQueue、最大线程maximumPoolSize，如果三者都满了，使用handler处理被拒绝的任务。
5. 当线程池中的线程数量大于 corePoolSize时，如果某线程空闲时间超过keepAliveTime，线程将被终止。这样，线程池可以动态的调整池中的线程数

<img src="../../../.img/java-concurrent-pool/image-20220414103954905.png" alt="image-20220414103954905" style="zoom:50%;" />



当一个线程无事可做，超过一定的时间（keepAliveTime）时，线程池会判断，如果当前运行的线程数大于 corePoolSize，那么这个线程就被停掉。所以线程池的所有任务完成后，它最终会收缩到 corePoolSize 的大小。

注：如果线程池设置了allowCoreThreadTimeout参数为true（默认false），那么当空闲线程超过keepaliveTime后直接停掉。（不会判断线程数是否大于corePoolSize）即：最终线程数会变为0。



**线程池中的三种等待队列**

ThreadPoolExecutor线程池推荐了三种等待队列，它们是：SynchronousQueue 、LinkedBlockingQueue 和 ArrayBlockingQueue。

- 有界队列：

SynchronousQueue ：一个不存储元素的阻塞队列，每个插入操作必须等到另一个线程调用移除操作，否则插入操作一直处于 阻塞状态，吞吐量通常要高于LinkedBlockingQueue，静态工厂方法 Executors.newCachedThreadPool 使用了这个队列。

ArrayBlockingQueue：一个由数组支持的有界阻塞队列。此队列按 FIFO（先进先出）原则对元素进行排序。一旦创建了这样的缓存区，就不能再增加其容量。试图向已满队列中放入元素会导致操作受阻塞；试图从空队列中提取元素将导致类似阻塞。

- 无界队列：

LinkedBlockingQueue：基于链表结构的无界阻塞队列，它可以指定容量也可以不指定容量（实际上任何无限容量的队列/栈都是有容量的，这个容量就是Integer.MAX_VALUE）

PriorityBlockingQueue：是一个按照优先级进行内部元素排序的无界阻塞队列。队列中的元素必须实现 Comparable 接口，这样才能通过实现compareTo()方法进行排序。优先级最高的元素将始终排在队列的头部；PriorityBlockingQueue 不会保证优先级一样的元素的排序。

注意：keepAliveTime和maximumPoolSize及BlockingQueue的类型均有关系。如果BlockingQueue是无界的，那么永远不会触发maximumPoolSize，自然keepAliveTime也就没有了意义。


**threadFactory**

threadFactory ：指定创建线程的工厂。（可以不指定）

如果不指定线程工厂时，ThreadPoolExecutor 会使用ThreadPoolExecutor.defaultThreadFactory 创建线程。默认工厂创建的线程：同属于相同的线程组，具有同为 Thread.NORM_PRIORITY 的优先级，以及名为 “pool-XXX-thread-” 的线程名（XXX为创建线程时顺序序号），且创建的线程都是非守护进程。


**handler 拒绝策略：**

handler ：表示当 workQueue 已满，且池中的线程数达到 maximumPoolSize 时，线程池拒绝添加新任务时采取的策略。（可以不指定）


| 策略                                     | BB                                             |
| ---------------------------------------- | ---------------------------------------------- |
| ThreadPoolExecutor.AbortPolicy()         | 抛出RejectedExecutionException异常。默认策略   |
| ThreadPoolExecutor.CallerRunsPolicy()    | 由向线程池提交任务的线程来执行该任务           |
| ThreadPoolExecutor.DiscardPolicy()       | 抛弃当前的任务                                 |
| ThreadPoolExecutor.DiscardOldestPolicy() | 抛弃最旧的任务（最先提交而没有得到执行的任务） |

最科学的的还是 AbortPolicy 提供的处理方式：抛出异常，由开发人员进行处理。




##### 线程池的常用方法

- getCorePoolSize()：返回线程池的核心线程数，这个值是一直不变的，返回在构造函数中设置的coreSize大小；
- getMaximumPoolSize()：返回线程池的最大线程数，这个值是一直不变的，返回在构造函数中设置的coreSize大小；
- getLargestPoolSize()：记录了曾经出现的最大线程个数（水位线）；
- getPoolSize()：线程池中当前线程的数量；
- getActiveCount()：Returns the approximate（近似） number of threads that are actively executing tasks；
- prestartAllCoreThreads()：会启动所有核心线程，无论是否有待执行的任务，线程池都会创建新的线程，直到池中线程数量达到 corePoolSize；
- prestartCoreThread()：会启动一个核心线程（同上）；
- allowCoreThreadTimeOut(true)：允许核心线程在KeepAliveTime时间后，退出；



#### Executors

Executors类的底层实现便是ThreadPoolExecutor！ Executors 工厂方法有：

- Executors.newCachedThreadPool()：无界线程池，可以进行自动线程回收
- Executors.newFixedThreadPool(int)：固定大小线程池
- Executors.newSingleThreadExecutor()：单个后台线程

它们均为大多数使用场景预定义了设置。不过在阿里java文档中说明，尽量不要用该类创建线程池。



[(39条消息) ThreadPoolExecutor详解_赶路人儿的博客-CSDN博客_threadpoolexecutor

[](https://blog.csdn.net/liuxiao723846/article/details/108026782)



[(39条消息) ThreadPoolExecutor使用介绍_wangwenhui11的博客-CSDN博客_threadpoolexecutor](https://blog.csdn.net/wangwenhui11/article/details/6760474?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2~default~CTRLIST~Rate-1.pc_relevant_antiscanv2&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2~default~CTRLIST~Rate-1.pc_relevant_antiscanv2&utm_relevant_index=1)





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

