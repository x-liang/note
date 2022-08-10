# Java并发编程基础



## 内存模型

略



## 线程简介

操作系统在执行一个程序是会创建一个进程，在进程内可以创建多个线程，线程也是操作系统能够调度的最小单元。在JVM虚拟机内，线程拥有自己的程序计数器，虚拟机栈和局部变量等属性，也能够访问共享变量。CPU在这些线程上高速切换，让使用者感觉这些线程是在同时执行的。

Java程序天生就是多线程的。

使用多线程主要原因有一些几点：

- 更多的处理器核心：多线程可以释放多核处理器的性能
- 更快的响应时间：利用多线程处理复杂业务。
- 更好的编程模型：Java为分开发人员提供了良好的编程模型。

#### 线程的优先级

Java把线程优先级分为1~10，默认的优先级是5，可以通过setPriority(int)来设置。

> Java设置的优先级是否生效还跟操作系统有关。

#### 线程的状态

线程在运行周期中存在6种不同的状态

| 状态名称     | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| NEW          | 初试状态，线程被构建，但是还没有调用start方法                |
| RUNNABLE     | 运行状态，Java线程将操作系统中的就绪和运行状态状态统称“运行中” |
| BLOCKED      | 阻塞状态，表示线程阻塞与锁                                   |
| WAITING      | 等待状态，表示线程进入等待状态，进入该状态表示当前线程需要等待其他线程作出一些特定动作（通知或中断） |
| TIME_WAITING | 超时等待，改状态不同有WAITING，他可以在指定时间内自行返回    |
| TERMINATED   | 终止状态，表示当前线程已经执行完毕                           |

线程的状态变迁

![image-20220806125549399](../../../.img/java-concurrent-base/image-20220806125549399.png)



#### Daemon线程

Daemon线程是一种支持性线程。当Java虚拟机中不存在非Daemon线程时，Java虚拟机将会退出。

> Daemon线程需要在线程启动之前进行设置，在启动之后就不能在设置了。
>
> 可以通过Thread.setDeamon(true)来进行设置。



## 启动和终止线程

#### 构造和启动线程

创建线程主要有三种形式：

- 继承 Thread
- 实现 Runable
- 实现 Callable

##### 继成Thread, 重写run()方法

```java
public class Main { 
    public static void main(String[] args) { 
        new MyThread().start(); 
    }
}
class MyThread extends Thread { 
    @Override 
    public void run() { 
        System.out.println(Thread.currentThread().getName() + "\t" + Thread.currentThread().getId()); 
    }
}
```

##### 实现Runnable接口，重写run()方法

```java
public class Main { 
    public static void main(String[] args) {  
        // 将Runnable实现类作为Thread的构造参数传递到Thread类中，然后启动Thread类 
        MyRunnable runnable = new MyRunnable(); 
        new Thread(runnable).start(); 
    }
}
class MyRunnable implements Runnable { 
    @Override 
    public void run() { 
        System.out.println(Thread.currentThread().getName() + "\t" + Thread.currentThread().getId()); 
    }
}
```

可以看到两种方式都是围绕着Thread和Runnable，继承Thread类把run()写到类中，实现Runnable接口是把run()方法写到接口中然后再用Thread类来包装, 两种方式最终都是调用Thread类的start()方法来启动线程的。

两种方式在本质上没有明显的区别，在外观上有很大的区别，第一种方式是继承Thread类，因Java是单继承，如果一个类继承了Thread类，那么就没办法继承其它的类了，在继承上有一点受制，有一点不灵活，第二种方式就是为了解决第一种方式的单继承不灵活的问题，所以平常使用就使用第二种方式

其它变体写法：

```java
public class Main { 
    public static void main(String[] args) { 
        // 匿名内部类 
        new Thread(new Runnable() { 
            @Override 
            public void run() { 
                System.out.println(
                    Thread.currentThread().getName() + "\t" + Thread.currentThread().getId()); 
            } 
        }).start(); 
        // 尾部代码块, 是对匿名内部类形式的语法糖 
        new Thread() { 
            @Override 
            public void run() { 
                System.out.println(
                    Thread.currentThread().getName() + "\t" + Thread.currentThread().getId()); 
            } 
        }.start(); 
        // Runnable是函数式接口，所以可以使用Lamda表达式形式 
        Runnable runnable = () -> {
            System.out.println(
                Thread.currentThread().getName() + "\t" + Thread.currentThread().getId());
        }; 
        new Thread(runnable).start(); 
    }
}
```

##### 实现Callable接口，重写call()方法

Callable：有返回值的线程，能取消线程，可以判断线程是否执行完毕

```java
public class Main { 
    public static void main(String[] args) throws Exception {  
        // 将Callable包装成FutureTask，FutureTask也是一种Runnable 
        MyCallable callable = new MyCallable(); 
        FutureTask<Integer> futureTask = new FutureTask<>(callable); 
        new Thread(futureTask).start(); 
        // get方法会阻塞调用的线程 
        Integer sum = futureTask.get(); 
        System.out.println(
            Thread.currentThread().getName() + Thread.currentThread().getId() + "=" + sum); 
    }
}
class MyCallable implements Callable<Integer> { 
    @Override 
    public Integer call() throws Exception { 
        System.out.println(Thread.currentThread().getName() + "\t" + Thread.currentThread().getId() + "\t" + new Date() + " \tstarting..."); 
        int sum = 0; 
        for (int i = 0; i <= 100000; i++) { 
            sum += i; 
        } 
        Thread.sleep(5000); 
        System.out.println(Thread.currentThread().getName() + "\t" + Thread.currentThread().getId() + "\t" + new Date() + " \tover..."); 
        return sum; 
    }
}
```

##### 三种方式比较

- Thread: 继承方式, 不建议使用, 因为Java是单继承的，继承了Thread就没办法继承其它类了，不够灵活
- Runnable: 实现接口，比Thread类更加灵活，没有单继承的限制
- Callable: Thread和Runnable都是重写的run()方法并且没有返回值，Callable是重写的call()方法并且有返回值并可以借助FutureTask类来判断线程是否已经执行完毕或者取消线程执行
- 当线程不需要返回值时使用Runnable，需要返回值时就使用Callable，一般情况下不直接把线程体代码放到Thread类中，一般通过Thread类来启动线程
- Thread类是实现Runnable，Callable封装成FutureTask，FutureTask实现RunnableFuture，RunnableFuture继承Runnable，所以Callable也算是一种Runnable，所以三种实现方式本质上都是Runnable实现



#### 理解中断

有人也许认为“当调用interrupt方法时，调用对象的线程就会InterruptedException异常”， 其实这是一种误解，实际上interrupt方法只是改变了线程的“中断状态”而已，所谓中断状态是一个boolean值，表示线程是否被中断的状态。

```java
public class Thread implements Runnable {
    public void interrupt() {
    	中断状态 = true;
	}
    // 检查中断状态
    public boolean isInterrupted();
    // 检查中断状态并清除当前线程的中断状态
    public static boolean interrupted() {
        // 伪代码
        boolean isInterrupted = isInterrupted()；
        中断状态 = false;
    }
}
```

假设Thread-0执行了sleep、wait、join中的一个方法而停止运行，在Thread-1中调用了interrupt方法，此时线程Thread-0的确会抛出InterruptedException异常，但这其实是sleep、wait、join中的方法内部会对线程的“中断状态”进行检查，如果中断状态为true,就会抛出InterruptedException异常。假如某个线程的中断状态为true，但线程体中却没有调用或者没有判断线程中断状态的值，那么线程则不会抛出InterruptedException异常。

isInterrupted() 检查中断状态

若指定线程处于中断状态则返回true,若指定线程为非中断状态，则反回false, isInterrupted() 只是获取中断状态的值，并不会改变中断状态的值。

interrupted()

检查中断状态并清除当前线程的中断状态。如当前线程处于中断状态返回true，若当前线程处于非中断状态则返回false, 并清除中断状态(将中断状态设置为false), 只有这个方法才可以清除中断状态，Thread.interrupted的操作对象是当前线程，所以该方法并不能用于清除其它线程的中断状态。

interrupt()与interrupted()

- interrupt()：打断线程，将中断状态修改为true
- interrupted(): 不打断线程，获取线程的中断状态，并将中断状态设置为false



```java
public class InterrupptTest { 
    public static void main(String[] args) { 
        Thread thread = new Thread(new MyRunnable()); 
        thread.start(); 
        
        boolean interrupted = thread.isInterrupted(); 
        // interrupted=false 
        System.out.println("interrupted=" + interrupted); 
        
        thread.interrupt(); 
        boolean interrupted2 = thread.isInterrupted(); 
        // interrupted2=true 
        System.out.println("interrupted2=" + interrupted2); 
        
        boolean interrupted3 = Thread.interrupted(); 
        // interrupted3=false 
        System.out.println("interrupted3=" + interrupted3); 
    }
}
class MyRunnable implements Runnable { 
    @Override 
    public void run() {
        synchronized (this) {
            try { 
                wait(); 
            } catch (InterruptedException e) { 
                // InterruptedExceptionfalse 
                System.out.println("InterruptedException\t" + Thread.currentThread().isInterrupted()); 
            } 
        } 
    }
}
```



#### 终止线程

##### 简单粗暴法Stop

以弃用，这里不在说明。



##### 标志位法

这种方法的好处是让线程自己停下来，实现方式就是将一个变量作为标识，线程每隔一段时间去判断下这个变量是否停止为停止标识，如果是则停止，否则继续运行

1）代码实现

```java
import java.sql.Time;
import java.util.concurrent.TimeUnit;
public class StopThread {    
    public static void main(String[] args) throws InterruptedException {        
        ThreadDemo threadDemo = new ThreadDemo();        
        Thread thread = new Thread(threadDemo);        
        thread.start();        
        TimeUnit.SECONDS.sleep(3);        
        threadDemo.stop();    
    }
}
class ThreadDemo implements Runnable{    
    public volatile boolean flag = true;    
    @Override    
    public void run() {        
        while (flag){            
            System.out.println("do... something");        
        }    
    }    
    public void stop(){        
        flag = false;        
        System.out.println("run... stop");    
    }
}
```

2）注意点

- volatile关键字，在多线程的情况下改变变量的值，如果需要马上通知其他线程，那么可以使用这个关键字，这是基于volatile关键字的特性—>可见性。
- 在正常开发中肯定是不会去使用死循环来去判断是否需要停止线程的，这个可以在关键业务逻辑中去判断



##### interrupt停止标记法

1）interrupt中断方法介绍

熟悉这种方法前必须先了解一组API

- public void interrupt() 中断线程
- public static boolean interrupted() 测试当前线程是否中断，并清除线程中断状态。
- public boolean isInterrupted() 测试当前线程是否中断，不改变线程中断状态。

2）代码解析中断判断方法

其实interrupt中断方法和标志位法原理相似，但标识变量不需要自己定义

```java
public class StopThread3 {    
    public static void main(String[] args) throws InterruptedException {        
        InterruptThread thread = new InterruptThread();        
        thread.start();       
        Thread.sleep(3000);        
        thread.stop();    
    }
}
class InterruptThread {    
    public Thread thread;    
    public void start(){       
        thread = new Thread(()->{            
            while (!thread.isInterrupted()){               
                System.out.println("do...something");            
            }        
        });        
        thread.start();    
    }    
    public void stop(){        
        thread.interrupt();    
    }
}
```

3）interrupt中断方法的特性

如果在线程阻塞时调用中断方法会抛出异常，同时清理中断状态，那么上边通过where循环来判断中断状态的逻辑无法终止。可以通过下面的方式来解决。

```java
public class StopThread2 {   
    public static void main(String[] args) throws InterruptedException {        
        InterruptThread1 taskCase3 = new InterruptThread1();        
        taskCase3.start();        
        Thread.sleep(3000);        
        taskCase3.stop();    
    }
}
class InterruptThread1 {    
    private Thread thread;    
    public void start() {        
        thread = new Thread(() -> {            
            while (!Thread.currentThread().isInterrupted()) {                
                try {                    
                    System.out.println("doSomething");                    
                    TimeUnit.MICROSECONDS.sleep(100);               
                } catch (InterruptedException e) {
                    // 重置中断标志位为true                    
                    thread.interrupt();                    
                    e.printStackTrace();                    
                    System.out.println("抛出中断异常，中断程序");                
                }            
            }        
        });        
        thread.start();    
    }    
    public void stop() {        
        thread.interrupt();    
    }
}
```



## Thread常用方法

Thread

```java
public class Thread implements Runnable { 
	// 线程名字 
    private volatile String name; 
    // 线程优先级(1~10) 
    private int priority; 
    // 守护线程 
    private boolean daemon = false;
    // 线程id 
    private long tid; 
    // 线程组 
    private ThreadGroup group;  
    // 预定义3个优先级 
    public final static int MIN_PRIORITY = 1; 
    public final static int NORM_PRIORITY = 5; 
    public final static int MAX_PRIORITY = 10;   
    // 构造函数 
    public Thread(); 
    public Thread(String name); 
    public Thread(Runnable target); 
    public Thread(Runnable target, String name); 
    // 线程组 
    public Thread(ThreadGroup group, Runnable target);   
    // 返回当前正在执行线程对象的引用 
    public static native Thread currentThread();  
    // 启动一个新线程 
    public synchronized void start(); 
    // 线程的方法体，和启动线程没毛关系 
    public void run();  
    // 让线程睡眠一会，由活跃状态改为挂起状态 
    public static native void sleep(long millis) throws InterruptedException; 
    public static void sleep(long millis, int nanos) throws InterruptedException;  
    // 打断线程 中断线程 用于停止线程 
    // 调用该方法时并不需要获取Thread实例的锁。无论何时，任何线程都可以调用其它线程的interruptf方法 
    public void interrupt(); 
    public boolean isInterrupted();
    // 线程是否处于活动状态 
    public final native boolean isAlive();  
    // 交出CPU的使用权，从运行状态改为挂起状态 
    public static native void yield();  
    public final void join() throws InterruptedException;
    public final synchronized void join(long millis);
    public final synchronized void join(long millis, int nanos) throws InterruptedException;   
    // 设置线程优先级 
    public final void setPriority(int newPriority); 
    // 设置是否守护线程 
    public final void setDaemon(boolean on); 
    // 线程id 
    public long getId() { return this.tid; }   
    // 线程状态 
    public enum State { 
        // new 创建 NEW, 
        // runnable 就绪 
        RUNNABLE, 
        // blocked 阻塞 
        BLOCKED,
        // waiting 等待 
        WAITING, 
        // timed_waiting 
        TIMED_WAITING, 
        // terminated 结束 
        TERMINATED; 
    }
}
public static void main(String[] args) { 
    // main方法就是一个主线程 
    // 获取当前正在运行的线程 
    Thread thread = Thread.currentThread();
    // 线程名字 
    String name = thread.getName();
    // 线程id 
    long id = thread.getId(); 
    // 线程优先级 
    int priority = thread.getPriority(); 
    // 是否存活 
    boolean alive = thread.isAlive(); 
    // 是否守护线程 
    boolean daemon = thread.isDaemon();
    // Thread[name=main, id=1 ,priority=5 ,alive=true ,daemon=false] 
    System.out.println(
        "Thread[name=" + name + 
        ", id=" + id + 
        " ,priority=" + priority + 
        " ,alive=" + alive + 
        " ,daemon=" + daemon + "]"
    );
}
```

#### Thread.currentThread()

```java
public static void main(String[] args) { 
    Thread thread = Thread.currentThread(); 
    // 线程名称 
    String name = thread.getName();
    // 线程id 
    long id = thread.getId(); 
    // 线程已经启动且尚未终止 
    // 线程处于正在运行或准备开始运行的状态，就认为线程是“存活”的 
    boolean alive = thread.isAlive(); 
    // 线程优先级 int 
    priority = thread.getPriority();
    // 是否守护线程 
    boolean daemon = thread.isDaemon();  
    // Thread[name=main,id=1,alive=true,priority=5,daemon=false] 
    System.out.println("Thread[name=" + name + ",id=" + id + ",alive=" + alive + ",priority=" + priority + ",daemon=" + daemon + "]");
}
```

#### start() 与 run()

```java
public static void main(String[] args) throws Exception { 
    new Thread(()-> { 
        for (int i = 0; i < 5; i++) { 
        	System.out.println(Thread.currentThread().getName() + " " + i);
            try { 
                Thread.sleep(200); 
            } catch (InterruptedException e) {
            } 
        } 
    }, "Thread-A").start(); 
    new Thread(()-> { 
        for (int j = 0; j < 5; j++) { 
            System.out.println(Thread.currentThread().getName() + " " + j); 
            try { 
                Thread.sleep(200);
            } catch (InterruptedException e) {
            } 
        } 
    }, "Thread-B").run();
}
```

start(): 启动一个线程，线程之间是没有顺序的，是按CPU分配的时间片来回切换的。

run(): 调用线程的run方法，就是普通的方法调用，虽然将代码封装到两个线程体中，可以看到线程中打印的线程名字都是main主线程，run()方法用于封装线程的代码，具体要启动一个线程来运行线程体中的代码(run()方法)还是通过start()方法来实现，调用run()方法就是一种顺序编程不是并发编程。

#### sleep() 与 interrupt()

```java
public static native void sleep(long millis) throws InterruptedException;
public void interrupt();
```

sleep(long millis): 睡眠指定时间，程序暂停运行，睡眠期间会让出CPU的执行权，去执行其它线程，同时CPU也会监视睡眠的时间，一旦睡眠时间到就会立刻执行(因为睡眠过程中仍然保留着锁，有锁只要睡眠时间到就能立刻执行)。

1. sleep(): 睡眠指定时间，即让程序暂停指定时间运行，时间到了会继续执行代码，如果时间未到就要醒需要使用interrupt()来随时唤醒
2. interrupt(): 唤醒正在睡眠的程序，调用interrupt()方法，会使得sleep()方法抛出InterruptedException异常，当sleep()方法抛出异常就中断了sleep的方法，从而让程序继续运行下去

```java
public static void main(String[] args) throws Exception { 
    Thread thread0 = new Thread(()-> {
        try { 
            System.out.println(new Date() + "\t" + Thread.currentThread().getName() + "\t太困了，让我睡10秒，中间有事叫我，zZZ。。。"); 
            Thread.sleep(10000); 
        } catch (InterruptedException e) { 
            System.out.println(new Date() + "\t" + Thread.currentThread().getName() + "\t被叫醒了，又要继续干活了"); 
        } 
    }); 
    thread0.start(); 
    // 这里睡眠只是为了保证先让上面的那个线程先执行 
    Thread.sleep(2000); 
    new Thread(()-> { 
        System.out.println(new Date() + "\t" + Thread.currentThread().getName() + "\t醒醒，醒醒，别睡了，起来干活了！！！"); 
        // 无需获取锁就可以调用interrupt 
        thread0.interrupt(); 
    }).start();
}
```

#### wait() 与 notify()

wait、notify和notifyAll方法是Object类的final native方法。所以这些方法不能被子类重写，Object类是所有类的超类，因此在程序中可以通过this或者super来调用this.wait(), super.wait()

1. wait(): 导致线程进入等待阻塞状态，会一直等待直到它被其他线程通过notify()或者notifyAll唤醒。该方法只能在同步方法中调用。如果当前线程不是锁的持有者，该方法抛出一个IllegalMonitorStateException异常。wait(long timeout): 时间到了自动执行，类似于sleep(long millis)
2. notify(): 该方法只能在同步方法或同步块内部调用， 随机选择一个(注意：只会通知一个)在该对象上调用wait方法的线程，解除其阻塞状态
3. notifyAll(): 唤醒所有的wait对象

注意：

1. Object.wait()和Object.notify()和Object.notifyall()必须写在synchronized方法内部或者synchronized块内部
2. 让哪个对象等待wait就去通知notify哪个对象，不要让A对象等待，结果却去通知B对象，要操作同一个对象

wait():让程序暂停执行，相当于让当前，线程进入当前实例的等待队列，这个队列属于该实例对象，所以调用notify也必须使用该对象来调用，不能使用别的对象来调用。调用wait和notify必须使用同一个对象来调用。

#### sleep() 与 wait()

Thread.sleep(long millis): 睡眠时不会释放锁

```java
public static void main(String[] args) throws InterruptedException { 
    Object lock = new Object(); 
    new Thread(() -> { 
        synchronized (lock) { 
            for (int i = 0; i < 5; i++) { 
                System.out.println(new Date() + "\t" + Thread.currentThread().getName() + "\t" + i); 
                try { 
                    Thread.sleep(1000); 
                } catch (InterruptedException e) { 
                } 
            } 
        } 
    }).start(); 
    Thread.sleep(1000); 
    new Thread(() -> { 
        synchronized (lock) { 
            for (int i = 0; i < 5; i++) { 
                System.out.println(new Date() + "\t" + Thread.currentThread().getName() + "\t" + i); 
            } 
        } 
    }).start();
}
```

因main方法中Thread.sleep(1000)所以上面的线程Thread-0先被执行，当循环第一次时就会Thread.sleep(1000)睡眠，因为sleep并不会释放锁，所以Thread-1得不到执行的机会，所以直到Thread-0执行完毕释放锁对象lock，Thread-1才能拿到锁，然后执行Thread-1;



####  wait() 与 interrupt()

wait(): 方法的作用是释放锁，加入到等待队列，当调用interrupt()方法后，线程必须先获取到锁后，然后才抛出异常InterruptedException 。注意： 在获取锁之前是不会抛出异常的，只有在获取锁之后才会抛异常

所有能抛出InterruptedException的方法都可以通过interrupt()来取消的

```java
public static native void sleep(long millis) throws InterruptedException;
public final void wait() throws InterruptedException;
public final void join() throws InterruptedException;
public void interrupt()；
```

#### notify()和interrupt()

- 从让正在wait的线程重新运行这一点来说，notify方法和intterrupt方法的作用有些类似，但仍有以下不同之处：
- notify/notifyAll是java.lang.Object类的方法，唤醒的是该实例的等待队列中的线程，而不能直接指定某个具体的线程。notify/notifyAll唤醒的线程会继续执行wait的下一条语句，另外执行notify/notifyAll时线程必须要获取实例的锁
- interrupte方法是java.lang.Thread类的方法，可以直接指定线程并唤醒，当被interrupt的线程处于sleep或者wait中时会抛出InterruptedException异常。执行interrupt()并不需要获取取消线程的锁。
- 总之notify/notifyAll和interrupt的区别在于是否能直接让某个指定的线程唤醒、执行唤醒是否需要锁、方法属于的类不同

#### wait(long timeout): 

```java
public class SleepWaitTest { 
    public static void main(String[] args) throws InterruptedException {
        SleepWaitTest object = new SleepWaitTest(); 
        new Thread(() -> { 
            synchronized (object) { 
                System.out.println(new Date() + "\t" + Thread.currentThread().getName() + "\t等待打印文件..."); 
                try { 
                    object.wait(5000);
                } catch (InterruptedException e) { 
                    e.printStackTrace(); 
                } 
                System.out.println(new Date() + "\t" + Thread.currentThread().getName() + "\t打印结束。。。"); 
            } 
        }).start(); 
        // 先上面的线程先执行 
        Thread.sleep(1000);
        new Thread(() -> { 
            synchronized (object) { 
                for (int i = 0; i < 5; i++) { 
                    System.out.println(new Date() + "\t" + Thread.currentThread().getName() + "\t" + i); 
                } 
            } 
        }).start(); 
    }
}
```

因main方法中有Thread.sleep(1000)所以上面的线程Thread-0肯定会被先执行，当Thread-0被执行时就拿到了object对象锁，然后进入wait(5000)5秒钟等待，此时wait释放了锁，然后Thread-1就拿到了锁就执行线程体，Thread-1执行完后就释放了锁，当等待5秒后Thread-0就能再次获取object锁，这样就继续执行后面的代码。wait方法是释放锁的，如果wait方法不释放锁那么Thread-1是拿不到锁也就没有执行的机会的，事实是Thread-1得到了执行，所以说wait方法会释放锁

> sleep与wait的区别
>
> - sleep在Thread类中，wait在Object类中
> - sleep不会释放锁，wait会释放锁
> - sleep使用interrupt()来唤醒，wait需要notify或者notifyAll来通知

#### join()

让当前线程加入父线程，加入后父线程会一直wait，直到子线程执行完毕后父线程才能执行。当我们调用某个线程的这个方法时，这个方法会挂起调用线程，直到被调用线程结束执行，调用线程才会继续执行。

将某个线程加入到当前线程中来，一般某个线程和当前线程依赖关系比较强，必须先等待某个线程执行完毕才能执行当前线程。一般在run()方法内使用

join() 源码实现：

```java
public final void join() throws InterruptedException { 
    join(0);
}
public final synchronized void join(long millis) throws InterruptedException { 
    long base = System.currentTimeMillis(); 
    long now = 0; 
    if (millis < 0) { 
        throw new IllegalArgumentException("timeout value is negative"); 
    } 
    if (millis == 0) {  
        // 循环检查线程的状态是否还活着，如果死了就结束了，如果活着继续等到死 
        while (isAlive()) { 
            wait(0); 
        } 
    } else { 
        while (isAlive()) { 
            long delay = millis - now; 
            if (delay <= 0) { 
                break; 
            } 
            wait(delay); 
            now = System.currentTimeMillis() - base; 
        } 
    }
}
public final synchronized void join(long millis, int nanos) throws InterruptedException { 
    if (millis < 0) { 
        throw new IllegalArgumentException("timeout value is negative"); 
    } 
    if (nanos < 0 || nanos > 999999) { 
        throw new IllegalArgumentException("nanosecond timeout value out of range"); 
    } 
    if (nanos >= 500000 || (nanos != 0 && millis == 0)) { 
        millis++; 
    } 
    join(millis);
}
```



示例：

```java
public class JoinTest { 
    public static void main(String[] args) { 
        new Thread(new ParentRunnable()).start(); 
    }
}
class ParentRunnable implements Runnable { 
    @Override 
    public void run() { 
        // 线程处于new状态 
        Thread childThread = new Thread(new ChildRunable()); 
        // 线程处于runnable就绪状态 
        childThread.start(); 
        try { 
            // 当调用join时，parent会等待child执行完毕后再继续运行 
            // 将某个线程加入到当前线程 
            childThread.join(); 
        } catch (InterruptedException e) { 
            e.printStackTrace(); 
        } 
        for (int i = 0; i < 5; i++) { 
            System.out.println(new Date() + "\t" + Thread.currentThread().getName() + "父线程 running"); 
        } 
    }
}
class ChildRunable implements Runnable { 
    @Override
    public void run() { 
        for (int i = 0; i < 5; i++) { 
            try { 
                Thread.sleep(1000); 
            } catch (InterruptedException e) { 
            } 
            System.out.println(new Date() + "\t" + Thread.currentThread().getName() + "子线程 running"); 
        }
    }
}
```

程序进入主线程，运行Parent对应的线程，Parent的线程代码分两段，一段是启动一个子线程，一段是Parent线程的线程体代码，首先会将Child线程加入到Parent线程，join()方法会调用join(0)方法(join()方法是普通方法并没有加锁，join(0)会加锁)，join(0)会执行while(isAlive()) { wait(0);} 循环判断线程是否处于活动状态，如果是继续wait(0)知道isAlive=false结束掉join(0), 从而结束掉join(), 最后回到Parent线程体中继续执行其它代码。

在Parent调用child.join()后，child子线程正常运行，Parent父线程会等待child子线程结束后再继续运行。

- join() 和 join(long millis, int nanos) 最后都调用了 join(long millis)。
- join(long millis, int nanos)和join(long millis)方法 都是synchronized。
- join() 调用了join(0)，从源码可以看到join(0)不断检查当前线程是否处于Active状态。
- join() 和 sleep() 一样，都可以被中断（被中断时，会抛出 InterrupptedException 异常）；不同的是，join() 内部调用了wait()，会出让锁，而 sleep() 会一直保持锁。

#### yield()

交出CPU的执行时间，不会释放锁，让线程进入就绪状态，等待重新获取CPU执行时间，yield就像一个好人似的，当CPU轮到它了，它却说我先不急，先给其他线程执行吧, 此方法很少被使用到，

这个方法知识给操作系统一个建议，但不一定会被采纳。

sleep(long millis) 与 yeid()

- sleep(long millis): 需要指定具体睡眠的时间，不会释放锁，睡眠期间CPU会执行其它线程，睡眠时间到会立刻执行
- yeid(): 交出CPU的执行权，不会释放锁，和sleep不同的时当再次获取到CPU的执行，不能确定是什么时候，而sleep是能确定什么时候再次执行。两者的区别就是sleep后再次执行的时间能确定，而yeid是不能确定的
- yield会把CPU的执行权交出去，所以可以用yield来控制线程的执行速度，当一个线程执行的比较快，此时想让它执行的稍微慢一些可以使用该方法，想让线程变慢可以使用sleep和wait,但是这两个方法都需要指定具体时间，而yield不需要指定具体时间，让CPU决定什么时候能再次被执行，当放弃到下次再次被执行的中间时间就是间歇等待的时间

#### setDaemon(boolean on)

线程分两种：

- 用户线程：如果主线程main停止掉，不会影响用户线程，用户线程可以继续运行。
- 守护线程：如果主线程死亡，守护线程如果没有执行完毕也要跟着一块死(就像皇上死了，带刀侍卫也要一块死)，GC垃圾回收线程就是守护线程

用户线程：

```java
public static void main(String[] args) { 
    Thread thread = new Thread() { 
        @Override 
        public void run() { 
            IntStream.range(0, 5).forEach(i -> { 
                try { 
                    Thread.sleep(1000); 
                } catch (InterruptedException e) { 
                    e.printStackTrace(); 
                } 
                System.out.println(Thread.currentThread().getName() + "\ti=" + i); 
            }); 
        } 
	}; 
    thread.start(); 
    for (int i = 0; i < 2; i++) { 
        System.out.println(Thread.currentThread().getName() + "\ti=" + i);                               
    } 
    System.out.println("主线程执行结束，子线程仍然继续执行，主线程和用户线程的生命周期各自独立。");
}
```

执行结果：

```
main	i=0
main	i=1
主线程执行结束，子线程仍然继续执行，主线程和用户线程的生命周期各自独立。
Thread-0	i=0
Thread-0	i=1
Thread-0	i=2
Thread-0	i=3
Thread-0	i=4
```

守护线程：

```java
public static void main(String[] args) { 
    Thread thread = new Thread() { 
        @Override 
        public void run() { 
            IntStream.range(0, 5).forEach(i -> { 
                try { 
                    Thread.sleep(1000); 
                } catch (InterruptedException e) { 
                    e.printStackTrace(); 
                } 
                System.out.println(Thread.currentThread().getName() + "\ti=" + i); 
            }); 
        } 
    }; 
    thread.setDaemon(true); 
    thread.start(); 
    for (int i = 0; i < 2; i++) { 
        System.out.println(Thread.currentThread().getName() + "\ti=" + i); 
    } 
    System.out.println("主线程死亡，子线程也要陪着一块死！");
}
```

执行结果

```
main	i=0
main	i=1
主线程死亡，子线程也要陪着一块死！
```



## 线程间通信









