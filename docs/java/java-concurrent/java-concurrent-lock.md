# Java中的锁



## Lock接口

Lock是在JDK1.5中添加的，于synchronized相比，Lock接口最大的有点就是对锁获取于释放的可操作性性。



Lock接口提供的synchronized不具备的功能。

| 特性               | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| 尝试非阻塞的获取锁 | 当前线程尝试获取锁，如果这一时刻锁没有被其他线程获取到，则成功获取并持有锁。 |
| 能被中断的获取锁   | 于synchronized不同，获取到锁的线程能够响应中断，当获取到锁的线程被中断时，中断异常将会被抛出，同事所会被释放。 |
| 超时获取锁         | 在指定的截止时间之前获取锁，如果截止时间到了仍旧无法获取锁，则返回。 |



Lock锁的典型使用方式：

```java
Lock lock = new ReentrantLock();
lock.lock();
try{
}finally{
    lock.unlock();
}
```

在finally中编写释放锁的代码，来保证锁的正常释放。

不要再try块内进行锁的获取，当获取锁异常时，也会导致锁无故释放。



下面先简单介绍一下Lock提供的接口：

| 方法名                                    | 描述                                                         |
| ----------------------------------------- | ------------------------------------------------------------ |
| void lock()                               | 获取锁。调用该方法当前线程将会获取锁，当锁获得后，从该方法返回。 |
| void lockInterruptibly()                  | 可中断地获取锁，和lock方法的不同之处在于该方法会响应中断，即在<br/>锁的获取中可以中断当前线程 |
| boolean tryLock()                         | 尝试非阻塞的获取锁，调用该方法后立刻返回，如果能够获取则返回<br/>true,否则返回false |
| boolean tryLock(long time, TimeUnit unit) | 超时的获取锁，当前线程在以下3种情况下会返回：<br/>①当前线程在超时时间内获得了锁<br/>②当前线程在超时时间内被中断<br/>③超时时间结束，返回false |
| void unlock()                             | 释放锁                                                       |
| Condition newCondition()                  | 获取等待通知组件，该组件和当前的锁绑定，当前线程只有获得了锁，<br/>才能调用该组件的waitO方法，而调用后，当前线程将释放锁 |



## 队列同步器

AbstractQueuedSynchronizer(AQS)，即抽象队列同步器，提供了一套可用于实现锁同步机制的框架，不夸张地说，AQS是JUC同步框架的基石。AQS通过一个FIFO队列维护线程同步状态，实现类只需要继承该类，并重写指定方法即可实现一套线程同步机制。

AQS根据资源互斥级别提供了**独占和共享**两种资源访问模式；同时其定义Condition结构提供了wait/signal等待唤醒机制。在JUC中，诸如ReentrantLock、CountDownLatch等都基于AQS实现。



### AQS 框架原理

AQS的原理并不复杂，AQS维护了一个volatile int state变量和一个CLH(三个人名缩写)双向队列，队列中的节点持有线程引用，每个节点均可通过getState()，setState()，compareAndSetState()对state进行修改和访问。

![img](../../../.img/java-concurrent-lock/2479735-20210912120424026-1094893993.png)

当线程获取锁时，即试图对`state`变量做修改，如修改成功则获取锁；如修改失败则包装为节点挂载到队列中，等待持有锁的线程释放锁并唤醒队列中的节点。

**AQS模板方法**

`AQS`内部封装了队列维护逻辑，采用模版方法的模式提供实现了以下方法：

```java
tryAcquire(int);        // 尝试获取独占锁，可获取返回true，否则false
tryRelease(int);        // 尝试释放独占锁，可释放返回true，否则false
tryAcquireShared(int);  // 尝试以共享方式获取锁，失败返回负数，只能获取一次返回0，否则返回个数
tryReleaseShared(int);  // 尝试释放共享锁，可获取返回true，否则false
isHeldExclusively();    // 判断线程是否独占资源
```

如实现类只需实现独占锁/共享锁功能，可只实现`tryAcquire/tryRelease`或`tryAcquireShared/tryReleaseShared`。虽然实现`tryAcquire/tryRelease`可自行设定逻辑，但建议使用`state`方法对`state`变量进行操作以实现同步类。



### AQS实现分析

#### 同步队列

同步器依赖内部的同步队列（一个FIFO双向队列）来完成同步状态管理。当前线程获取同步状态是失败时，同步器会将当前线程以及等待状态等信息构建为一个节点（Node）并将其加入到同步队列中。同时会阻塞当前线程。当同步状态释放时，会吧首节点的线程唤醒，使其再次尝试获取同步状态。

同步队列中的节点（Node）用来保存获取同步状态失败的的线程引用，等待状态以及前驱后集结点，节点属性如下：

| 属性类型与名称  | 描述                                                         |
| --------------- | ------------------------------------------------------------ |
| int waitStatus  | 等待状态<br />包含如下状态<br />1. CANCELLED： 值为1，由于在同步队列中等待的线程等待超时或者被中断，需要<br/>从同步队列中取消等待，节点进入等待状态不会变化<br />2. SIGNAL ：值为-1，后继节点的线程处于等待状态，而当前节点的线程如果释放了<br>同步状态或者被取消，将会通知后继节点，是后继节点的线程得以运行<br />3. CONDITION：值为-2，节点在等待队列中，节点的线程等待在Condition上，当其<br/>他线程Condition调用了signal()方法后，该节点将会从等待队列中转移到同步队列中<br>去。加入到同步队列状态的获取中<br />4. PROPAGATE：值为-3，表示下一次共享时同步状态获取将会无条件的传播下去<br />5. INITIAL：值为0，初始化状态<br /> |
| Node prev       | 前驱节点，当节点加入同步队列时被设置                         |
| Node next       | 后继节点                                                     |
| Node nextWaiter | 等待队列中的后继节点，如果当前节点是共享的，name这个字段是一个SHARED常量，<br/>也就是说节点类型(独占和共享)和等待队列中的后继节点共用同一个字段 |
| Thread thread   | 获取同步状态的线程                                           |



**waitStatus状态详述：**

**CANCELLED**：由于超时或中断，此节点被取消。节点一旦被取消了就不会再改变状态。特别是，取消节点的线程不会再阻塞。

**SIGNAL**：此节点后面的节点已（或即将）被阻止（通过park），因此当前节点在释放或取消时必须断开后面的节点为了避免竞争，acquire方法时前面的节点必须是SIGNAL状态，然后重试原子acquire，然后在失败时阻塞。

**CONDITION：**此节点当前在条件队列中。标记为CONDITION的节点会被移动到一个特殊的条件等待队列（此时状态将设置为0），直到条件时才会被重新移动到同步等待队列 。（此处使用此值与字段的其他用途无关，但简化了机制。）

**PROPAGATE：**传播：应将releaseShared传播到其他节点。这是在doReleaseShared中设置的（仅适用于头部节点），以确保传播继续，即使此后有其他操作介入。

0:以上数值均未按数字排列以简化使用。非负值表示节点不需要发出信号。所以，大多数代码不需要检查特定的值，只需要检查符号。对于正常同步节点，该字段初始化为0；对于条件节点，该字段初始化为条件。它是使用CAS修改的（或者在可能的情况下，使用无条件的volatile写入）。





[AQS : waitStatus = Propagate 的作用解析 以及读锁无法全获取问题 - 执生 - 博客园 (cnblogs.com)](https://www.cnblogs.com/lqlqlq/p/12991275.html?ivk_sa=1024320u)

看图说话，队列同步器的基本数据结构如下：

![image-20220411184522197](../../../.img/java-concurrent-lock/image-20220411184522197.png)

同步队列包含两个节点类型的引用，一个指向头结点，一个指向尾节点。追加节点的过程通过`compareAndSetTail(Node expect, Node update)`方法来实现，从而保证了追加节点过程的线程安全。

同步队列遵循FIFO原则，首节点是获取同步状态成功的节点，首节点的同步线程在释放同步状态时，或唤醒后继节点，而后继节点在获取同步状态成功时，会将自己设置为首节点。这里需要注意，设置首节点的过程，不需要同步操作，因为每一时刻，只有一个线程能够获取到同步状态。

![image-20220411185342502](../../../.img/java-concurrent-lock/image-20220411185342502.png)



#### 独占锁分析

通过调用同步器的acquire(int arg)方法可以获取同步状态，该方法对中断不敏感。

```java
public final void acquire(int arg) {
    // tryAcquire需实现类处理，如获取资源成功，直接返回
    if (!tryAcquire(arg) && 
        // 如获取资源失败，将线程包装为Node添加到队列中阻塞等待
        acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        // 如果在程序执行期间，程序被中断，这里要做中断补偿。
        selfInterrupt();
}

static void selfInterrupt() {
    Thread.currentThread().interrupt();
}
```

该方法主要完成同步状态获取，节点构造，加入同步队列以及在同步队列中自旋等操作。

首先通过tryAcquire()方法线程安全的获取同步状态，如果获取同步状态失败，则构造同步节点，通过addWaiter(Node node)方法加入到同步队列的尾部。Node.EXCLUSIVE表示线程以独占的方式等待锁。最后调用acquireQueued(Node node, int arg)方法来循环获取同步状态。

> 注：这里的tryAcquire是一个抽象方法，需要子类实现。

下面看一下节点的创建及添加过程：

```java
// 构造节点的过程
private Node addWaiter(Node mode) {
    // 创建一个节点
    Node node = new Node(Thread.currentThread(), mode);
    // Try the fast path of enq; backup to full enq on failure
    Node pred = tail;
    if (pred != null) {
        node.prev = pred;
        // 以cas的方式修改tail
        if (compareAndSetTail(pred, node)) {
            // 设置链表额指针
            pred.next = node;
            return node;
        }
    }
    // 如果tail为null，需要初始化
    enq(node);
    return node;
}
/**
 * 第一次向链表添加节点时，tail和head都是null，
 * 这里通过死循环加CAS来保证任务一定完成并且多线程安全，好好体会一下无锁并发。
 */
private Node enq(final Node node) {
    // 死循环的方式初始化链表
    for (;;) {
        Node t = tail;
        if (t == null) { // Must initialize
            // 链表的开头是个空节点
            if (compareAndSetHead(new Node()))
                // 这里初始化完后，会再次进入循环
                tail = head;
        } else {
            // 将node加入链表
            node.prev = t;
            if (compareAndSetTail(t, node)) {
                t.next = node;
                return t;
            }
        }
    }
}
```

首先通过compareAndSetTail(Node expect, Node update)方法来保证线程的安全添加。enq方法则保证线程的初始化列表。

当节点进入同步队列之后，就进入了一个自旋的过程。查看acquireQueued方法：

```java
final boolean acquireQueued(final Node node, int arg) {
    boolean failed = true;
    try {
        // interrupted是中断标记
        boolean interrupted = false;
        // 自旋
        for (;;) {
            final Node p = node.predecessor();
            // 检查node的前置节点是否为头结点 && 尝试获取锁
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                failed = false;
                return interrupted;
            }
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
// 设置为头结点
private void setHead(Node node) {
    // 这里是直接把node设置为头结点，而不是修改头结点的指针。
    head = node;
    node.thread = null;
    node.prev = null;
}
```

这里通过死循环的方式尝试获取同步锁，只有前驱节点是头结点的节点才能获取通过状态。这种方式可以很好的维护一个FIFO队列。

在获取到锁之后，会吧当前节点设置为头结点。

如果没有获取到锁，会执行shouldParkAfterFailedAcquire方法和parkAndCheckInterrupt方法，下面就来看看这两个方法做了什么事情。

```java
// 这里判断在获取同步状态失败后是否需要被park住
private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
    int ws = pred.waitStatus;
    if (ws == Node.SIGNAL)
        return true;
    if (ws > 0) {
        // 头结点取消执行了，跳过头结点，重新尝试
        do {
            node.prev = pred = pred.prev;
        } while (pred.waitStatus > 0);
        pred.next = node;
    } else {
        // 将waitStatus改为Node.SIGNAL
        compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
    }
    return false;
}

private final boolean parkAndCheckInterrupt() {
    // park住当前线程
    LockSupport.park(this);
    // 被唤醒时返回中断状态，这里会清除中断状态
    return Thread.interrupted();
}
```



独占式通过状态获取流程：

![image-20220412150105953](../../../.img/java-concurrent-lock/image-20220412150105953.png)

下面看一下释放锁的逻辑：

```java
public final boolean release(int arg) {
    if (tryRelease(arg)) {
        // 如果释放资源成功，尝试唤醒下一个节点
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}
private void unparkSuccessor(Node node) {
    int ws = node.waitStatus;
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);

    Node s = node.next;
    if (s == null || s.waitStatus > 0) {
        s = null;
        // 从尾部节点开始遍历，找到最靠前的一个需要执行的节点
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null)
        // 通过unpark唤醒线程
        LockSupport.unpark(s.thread);
}
```

同样，tryRelease是一个抽象方法。释放资源后，会判断waitStatus状态，唤醒后继节点。

#### 共享锁分析

共享锁与独占锁额区别在于在同一时刻是否有多个线程同时获取到同步状态。

下面直接上代码：

```java
// 已共享方式获取锁
public final void acquireShared(int arg) {
    if (tryAcquireShared(arg) < 0)
        doAcquireShared(arg);
}
// 构造节点放入队列
private void doAcquireShared(int arg) {
    final Node node = addWaiter(Node.SHARED);
    boolean failed = true;
    try {
        boolean interrupted = false;
        for (;;) {
            final Node p = node.predecessor();
            if (p == head) {
                // 如何共享获取的逻辑在tryAcquireShared方法中
                int r = tryAcquireShared(arg);
                if (r >= 0) {
                    // 设置Head节点
                    setHeadAndPropagate(node, r);
                    p.next = null; // help GC
                    if (interrupted)
                        selfInterrupt();
                    failed = false;
                    return;
                }
            }
            if (shouldParkAfterFailedAcquire(p, node) && parkAndCheckInterrupt())
                interrupted = true;
        }
    } finally {
        if (failed)
            cancelAcquire(node);
    }
}
/**
 * propagate 传播
 * 
 */
private void setHeadAndPropagate(Node node, int propagate) {
    Node h = head; // Record old head for check below
    setHead(node);
	// setHead方法会设置一个新的head，h指向的是旧的head
    // if判断会同时判断old head 和new head，（h重新赋值后会指向新的head）
    if (propagate > 0 || h == null || h.waitStatus < 0 || (h = head) == null || h.waitStatus < 0) {
        Node s = node.next;
        if (s == null || s.isShared())
            // 这里直接进入锁释放的逻辑，让后面的节点争抢锁。
            doReleaseShared();
    }
}
```

重点来看tryAcquireShared方法，这是一个抽象方法，实现由子类完成。这里主要说明一下返回值：

- 如果获取共享锁失败，返回负数
- 如果获取共享锁成功，但是后续节点无法获取共享锁，返回0
- 如果获取共享锁成功，而且后续节点也可以获取共享锁，返回正数。

下面看共享锁释放的逻辑：

```java
public final boolean releaseShared(int arg) {
    if (tryReleaseShared(arg)) {
        doReleaseShared();
        return true;
    }
    return false;
}
private void doReleaseShared() {
    for (;;) {
        Node h = head;
        if (h != null && h != tail) {
            int ws = h.waitStatus;
            if (ws == Node.SIGNAL) {
                if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                    continue;            // loop to recheck cases
                unparkSuccessor(h);
            }
            else if (ws == 0 && !compareAndSetWaitStatus(h, 0, Node.PROPAGATE))
                continue;                // loop on failed CAS
        }
        if (h == head)                   // loop if head changed
            break;
    }
}
private void unparkSuccessor(Node node) {
    int ws = node.waitStatus;
    if (ws < 0)
        compareAndSetWaitStatus(node, ws, 0);

    Node s = node.next;
    if (s == null || s.waitStatus > 0) {
        s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
            if (t.waitStatus <= 0)
                s = t;
    }
    if (s != null)
        LockSupport.unpark(s.thread);
}
```



### 重入锁

TODO

### 读写锁

TODO