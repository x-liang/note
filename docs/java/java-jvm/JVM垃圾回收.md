# 垃圾回收

# JVM笔记

## 介绍

### 什么是JVM

Java Virtual Machine Java程序的运行环境



### 学习路线

类加载器 -> JVM内存结构 -> 执行引擎



![image-20220510101926162](../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/image-20220510101926162.png)



## JVM内存结构

博客：[(41条消息) 一文搞懂JVM内存结构_xiaokanfuchen86的博客-CSDN博客_jvm内存结构](https://blog.csdn.net/xiaokanfuchen86/article/details/117625190)

Java 虚拟机在执行 Java 程序的过程中会把它管理的[内存](https://so.csdn.net/so/search?q=内存&spm=1001.2101.3001.7020)划分为若干个不同的数据区域。每个区域都有各自的作用。

分析 JVM 内存结构，主要就是分析 JVM 运行时数据存储区域。JVM 的运行时数据区主要包括：**堆、栈、方法区、程序计数器**等。而 JVM 的优化问题主要在线程共享的数据区中：**堆、方法区**。

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/jvm-memory.png" alt="img" style="zoom:100%;float:left" />

### 程序计数器

Program Counter Register 程序计数器（寄存器）

- 作用，是记住下一条jvm指令的执行地址

- 特点

  - 是线程私有的

  - 不会存在内存溢出

下面给出一个例子：

```java
0: getstatic #20              // PrintStream out = System.out; 
3: astore_1                   // -- 
4: aload_1                    // out.println(1); 
5: iconst_1                   // -- 
6: invokevirtual #26          // -- 
9: aload_1                    // out.println(2); 
10: iconst_2                  // -- 
11: invokevirtual #26         // -- 
14: aload_1                   // out.println(3); 
15: iconst_3                  // -- 
16: invokevirtual #26         // -- 
19: aload_1                   // out.println(4); 
20: iconst_4                  // -- 
21: invokevirtual #26         // -- 
24: aload_1                   // out.println(5); 
25: iconst_5                  // -- 
26: invokevirtual #26         // -- 
29: return
```

以上代码的右侧是Java的源代码，左侧是二进制字节码，JVM的指令

JVM的执行流程：

JVM指令 -> 解释器 -> 机器码 -> CPU

**程序计数器（Program Counter Register）**是一块较小的内存空间，可以看作是**当前线程**所执行字节码的**行号指示器**，指向下一个将要执行的指令代码，由执行引擎来读取下一条指令。更确切的说，**一个线程的执行，是通过字节码解释器改变当前线程的计数器的值，来获取下一条需要执行的字节码指令，从而确保线程的正确执行**。

为了确保线程切换后（上下文切换）能恢复到正确的执行位置，**每个线程都有一个独立的程序计数器**，各个线程的计数器互不影响，独立存储。也就是说程序计数器是**线程私有的内存**。

如果线程执行 Java 方法，这个计数器记录的是正在执行的虚拟机字节码指令的地址；如果执行的是 Native 方法，计数器值为Undefined。

**程序计数器不会发生内存溢出（OutOfMemoryError即OOM）问题。**



### 虚拟机栈

#### 定义

Java Virtual Machine Stacks （Java 虚拟机栈）

- 线程私有的

- 每个线程运行时所需要的内存，称为虚拟机栈

- 每个栈由多个栈帧（Frame）组成，对应着每次方法调用时所占用的内存

- 每个线程只能有一个活动栈帧，对应着当前正在执行的那个方法



**栈帧**是栈的元素。**每个方法在执行时都会创建一个栈帧**。栈帧中存储了**局部变量表、操作数栈、动态连接和方法出口**等信息。每个方法从调用到运行结束的过程，就对应着一个栈帧在栈中压栈到出栈的过程。

![img](../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/20190409182042686.png)

JVM虚拟机栈的大小可以通过参数来指定    **-Xss size**

默认的单位是字节，也可以指定单位，如KB(k,K)、MB(m,M)、GB(g,G)

```
-Xss1m
-Xss1024KB
```

栈的大小决定了函数调用的最大深度，如果函数调用的深度大于设置的Xss大小，那么将会抛“java.lang.StackOverflowError“ 异常。

默认的情况下，栈的大小是1024KB（windows系统例外，大小依赖于虚拟内存）



> 面试题：
>
> 1. 垃圾回收是否涉及栈内存？
>
>    不需要，栈内存随着栈针的出栈而自动回收掉，所以不需要垃圾回收器来管理。
>
> 2. 占内存分配的越大越好么？
>
>    占内存过大会导致单线程占用的内存过大，总的线程数变少，不建议调整，使用默认即可。
>
> 3. 方法的局部变量是否线程安全？
>
>    局部变量是线程私有的，不存在线程安全问题。
>
> 4. 虚拟机栈和本地方法栈的区别？
>
>    Java 虚拟机栈为 JVM 执行 Java 方法服务，本地方法栈则为 JVM 使用到的 Native 方法服务。





#### 案例1：CPU占用过多

定位过程：

- 用top定位哪个进程对cpu的占用过高

- ps H -eo pid,tid,%cpu | grep 进程id （用ps命令进一步定位是哪个线程引起的cpu占用过高）

- jstack 进程id。可以根据线程id 找到有问题的线程，进一步定位到问题代码的源码行号

  这里注意一下，ps输出的线程号是十进制的，jstack输出的线程编号是十六进制的。



#### 案例2：程序运行很长时间没有结果







### 本地方法栈

线程私有。为虚拟机使用到的Native 方法服务。如Java使用c或者c++编写的接口服务时，代码在此区运行。



### 堆

堆的作用是存放对象实例和数组。通过new关键字创建的对象，都会使用堆内存。

特点：

- 它是线程共享的，堆中的对象都需要考虑线程安全问题
- 有垃圾回收机制

参数控制：

- -Xms设置堆的最小空间大小。-Xmx设置堆的最大空间大小。

异常情况：

- 如果在堆中没有内存完成实例分配，并且堆也无法再扩展时，将会抛出OutOfMemoryError 异常

### 方法区

方法区同 Java 堆一样是被所有线程共享的区间，用于存储已被虚拟机加载的类信息、常量、静态变量、即时编译器编译后的代码。在JVM启动时被创建。更具体的说，静态变量+常量+类信息（版本、方法、字段等）+运行时常量池存在方法区中。常量池是方法区的一部分。

方法区在逻辑上是堆的一部分，但在具体实现上不强制方法区的位置，不同的虚拟机厂 商可以有不同的实现，如 JDK1.8 之前使用永久代实现，1.8 后使用元空间实现

> **注**：JDK1.8 使用元空间 MetaSpace 替代方法区，元空间并不在 JVM中，而是使用本地内存。元空间两个参数：
>
> 1.  MetaSpaceSize：初始化元空间大小，控制发生GC阈值
> 2.  MaxMetaspaceSize ： 限制元空间大小上限，防止异常占用过多物理内存
>
> <img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/image-20220510230231970.png" alt="image-20220510230231970" style="zoom:50%;float:left" />



#### 常量池

常量池中存储编译器生成的各种**字面量和符号引用**。字面量就是Java中常量的意思。比如文本字符串，final修饰的常量等。方法引用则包括类和接口的全限定名，方法名和描述符，字段名和描述符等。

注：JDK8以后，常量池保存在堆中。

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/jvm-memory-method-constant.png" alt="img" style="zoom:100%;float:left" />

优点：

- 常量池避免了频繁的创建和销毁对象而影响系统性能，其实现了对象的共享。

##### Class常量池

**定义：**Class常量池可以理解为是Class文件中的**资源仓库**。

**内容：**Class文件中除了包含类的版本、字段、方法、接口等描述信息外， 还有一项信息就是常量池，**用于存放编译期生成的各种字面量和符号引用**。

首先有如下类文件定义：

```java
public class Test {
    public static void main(String[] args) {
        System.out.println("hello world");
    }
}
```

我们通过java提供的工具来查看编译后的Test.class文件的详细信息

查看命令：

```
javap -v Test.class       
```

详细信息如下：

```
Classfile /D:/developer/gitee/spring-demo/java-demo/data-structure/src/test/java/Test.class
  Last modified 2022-5-11; size 413 bytes
  MD5 checksum ae5ed4a0ee5b45fd449f77ade8d7bd24
  Compiled from "Test.java"
public class Test
  minor version: 0
  major version: 52
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:  <font>这里就是这个类需要的常量，运行后，会保存到常量池中，#后面的数字也会变为真时的内存地址。</font>
   #1 = Methodref          #6.#15         // java/lang/Object."<init>":()V
   #2 = Fieldref           #16.#17        // java/lang/System.out:Ljava/io/PrintStream;
   #3 = String             #18            // hello world
   #4 = Methodref          #19.#20        // java/io/PrintStream.println:(Ljava/lang/String;)V
   #5 = Class              #21            // Test
   #6 = Class              #22            // java/lang/Object
   #7 = Utf8               <init>
   #8 = Utf8               ()V
   #9 = Utf8               Code
  #10 = Utf8               LineNumberTable
  #11 = Utf8               main
  #12 = Utf8               ([Ljava/lang/String;)V
  #13 = Utf8               SourceFile
  #14 = Utf8               Test.java
  #15 = NameAndType        #7:#8          // "<init>":()V
  #16 = Class              #23            // java/lang/System
  #17 = NameAndType        #24:#25        // out:Ljava/io/PrintStream;
  #18 = Utf8               hello world
  #19 = Class              #26            // java/io/PrintStream
  #20 = NameAndType        #27:#28        // println:(Ljava/lang/String;)V
  #21 = Utf8               Test
  #22 = Utf8               java/lang/Object
  #23 = Utf8               java/lang/System
  #24 = Utf8               out
  #25 = Utf8               Ljava/io/PrintStream;
  #26 = Utf8               java/io/PrintStream
  #27 = Utf8               println
  #28 = Utf8               (Ljava/lang/String;)V
{
  public Test();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 1: 0

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=2, locals=1, args_size=1
         0: getstatic     #2                  // Field java/lang/System.out:Ljava/io/PrintStream;
         3: ldc           #3                  // String hello world
         5: invokevirtual #4                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
         8: return
      LineNumberTable:
        line 4: 0
        line 5: 8
}
SourceFile: "Test.java"                                                                              
```

**字面量**

**定义：**字面量就是指**由字母、数字等构成的字符串或者数值常量**。

**PS：**字面量只可以右值出现【等号右边的值】如：int a = 1 这里的a为左值，1为右值。在这个例子中1就是字面量。

```java
private int compute() {
    int a = 1;//符号引用：a 字面量：1
    int b = 2;//符号引用：b 字面量：2
    String c = "有梦想的肥宅";//符号引用：c 字面量：有梦想的肥宅
    return a + b;
}
```

**符号引用**

符号引用是编译原理中的概念，是相对于直接引用来说的。主要包括了以下三类常量：

- **类和接口的全限定名**
- **字段的名称和描述符**
- **方法的名称和描述符**

**符号引用只有到运行时被加载到内存后，这些符号才有对应的内存地址信息，这些常量池一旦被装入内存就变成运行时常量池**，也就引出了下面动态链接的概念。

**动态链接：**对应的符号引用在程序加载或运行时会被转变为被加载到内存区域的代码的直接引用。

**例：**compute()这个符号引用在运行时就会被转变为compute()方法具体代码在内存中的地址，主要通过对象头里的类型指针去转换直接引用。

##### 字符串常量池

字符串的分配和其他的对象分配一样，耗费高昂的时间与空间代价，作为最基础的数据类型，大量频繁的创建字符串，极大程度地影响程序的性能。JVM为了提高性能和减少内存开销，在实例化字符串常量的时候进行了一些优化：

- 为字符串**开辟一个字符串常量池，类似于缓存区**
- 创建字符串常量时，首先查询字符串常量池是否存在该字符串
- 存在该字符串，返回引用实例，不存在，实例化该字符串并放入池中

三种字符串操作(Jdk1.7 及以上版本)

1. **直接赋值**

   ```
   String s = "有梦想的肥宅"; // s ：指向常量池中的引用
   ```

   **PS：**这种方式创建的字符串对象，**只会在常量池中**。

   创建步骤：

   JVM会先去常量池中通过 equals(key) 方法，判断是否有相同的对象：

   - **有**，则**直接返回该对象在常量池中的引用**
   - **没有**，则会在**常量池中创建一个新对象，再返回引用**

2. **new String()方法创建**

   ```
   String s1 = new String("有梦想的肥宅"); // s1指向内存中的对象引用
   ```

   **PS：**这种方式会保证**字符串常量池和堆中都有这个对象**，没有就创建，最后**返回堆内存中的对象引用**。

   **创建步骤：**

   因为有"有梦想的肥宅"这个字面量，所以会先检查字符串常量池中是否存在此字符串：

   - **不存在**，先在字符串常量池里创建一个字符串对象，再去堆内存中创建一个字符串对象"有梦想的肥宅"
   - **存在**，就直接去堆内存中创建一个字符串对象"有梦想的肥宅"， 最后，将内存中的引用返回

3. **intern()方法**

   ```java
   String s1 = new String("有梦想的肥宅"); 
   String s2 = s1.intern(); //s1.intern()返回的串池中的对象，s1引用的是堆中的对象
   System.out.println(s1 == s2); //false
   ```

   **PS：**这个方法是尝试将字符串对象放入串池，如果有则不放入，如果没有则放入串池，并把串池中的对象返回。

   **创建步骤：**

   还是会去常量池找看有没有"有梦想的肥宅"这个字符串：

   - **存在**，则返回串池中的对象引用
   - **不存在**，把字符串放入串池，并返回串池中的对象 引用

   **PS：**jdk1.6版本需要将 s1 复制到字符串常量池里

　

##### 八种基本类型的包装类和对象池

java中基本类型的包装类的大部分都实现了常量池技术（严格来说对象在堆上应该叫对象池），这些类是 Byte、Short、Integer、Long、Character、Boolean，另外两种浮点数类型的包装类则没有实现。

**PS：**Byte,Short,Integer,Long,Character这5种整型的包装类也只是在对应值小于等于127时才可使用对象池，因为一般这种比较小的数用到的概率相对较大。

```java
public class Test {
    public static void main(String[] args) {
        //1、5种整形的包装类Byte,Short,Integer,Long,Character的对象，在值小于127时可以使用对象池
        Integer i1 = 127; //PS：这种调用底层实际是执行的Integer.valueOf(127)，里面用到了IntegerCache对象池
        Integer i2 = 127;
        System.out.println(i1 == i2);//输出true

        //2、当值大于127时，不会从对象池中取对象
        Integer i3 = 128;
        Integer i4 = 128;
        System.out.println(i3 == i4);//输出false

        //3、用new关键词新生成对象不会使用对象池
        Integer i5 = new Integer(127);
        Integer i6 = new Integer(127);
        System.out.println(i5 == i6);//输出false

        //4、Boolean类也实现了对象池技术
        Boolean bool1 = true;
        Boolean bool2 = true;
        System.out.println(bool1 == bool2);//输出true

        //5、浮点类型的包装类没有实现对象池技术
        Double d1 = 1.0D;
        Double d2 = 1.0D;
        System.out.println(d1 == d2);//输出false
    }
}
```





### StringTable详解(就是串池)

首先来看一个代码示例：

```java
// StringTable [ "a", "b" ,"ab" ]  hashtable 结构，不能扩容
public class Demo1_22 {
    // 常量池中的信息，都会被加载到运行时常量池中， 这时 a b ab 都是常量池中的符号，还没有变为 java 字符串对象
    // ldc #2 会把 a 符号变为 "a" 字符串对象
    // ldc #3 会把 b 符号变为 "b" 字符串对象
    // ldc #4 会把 ab 符号变为 "ab" 字符串对象
    public static void main(String[] args) {
        String s1 = "a"; // 懒惰的
        String s2 = "b";
        String s3 = "ab";
        String s4 = s1 + s2; // new StringBuilder().append("a").append("b").toString()  new String("ab")
        // new String 会在常量池和堆内存中同时创建对象，但引用的是堆内存中的引用
        String s5 = "a" + "b";  // javac 在编译期间的优化，结果已经在编译期确定为ab
        System.out.println(s3 == s5);
        String ap = new String("a")+new String("b");
        // 这里注意一下，通过new 相加，这里a，b都会检查常量池，但是最后生成的结果"ab"不会保存到常量池
    }
}
```

编译过程中遇到编码问题，可以通过-encoding来指定编码，如下：

```shell
javac -encoding utf-8 Demo1_22.java
```

来查看一下编译后文件的详细信息：

```
Classfile /D:/path/to/Demo1_22.class
  Last modified 2022-5-11; size 776 bytes
  MD5 checksum 141d5699097730cd03bba544e9b27e1c
  Compiled from "Demo1_22.java"
public class cn.itcast.jvm.t1.stringtable.Demo1_22
  minor version: 0
  major version: 52
  flags: ACC_PUBLIC, ACC_SUPER
Constant pool:
   #1 = Methodref          #12.#25        // java/lang/Object."<init>":()V
   #2 = String             #26            // a
   #3 = String             #27            // b
   #4 = String             #28            // ab
   #5 = Class              #29            // java/lang/StringBuilder
   #6 = Methodref          #5.#25         // java/lang/StringBuilder."<init>":()V
   #7 = Methodref          #5.#30         // java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
   #8 = Methodref          #5.#31         // java/lang/StringBuilder.toString:()Ljava/lang/String;
   #9 = Fieldref           #32.#33        // java/lang/System.out:Ljava/io/PrintStream;
  #10 = Methodref          #34.#35        // java/io/PrintStream.println:(Z)V
  #11 = Class              #36            // cn/itcast/jvm/t1/stringtable/Demo1_22
  #12 = Class              #37            // java/lang/Object
  #13 = Utf8               <init>
  #14 = Utf8               ()V
  #15 = Utf8               Code
  #16 = Utf8               LineNumberTable
  #17 = Utf8               main
  #18 = Utf8               ([Ljava/lang/String;)V
  #19 = Utf8               StackMapTable
  #20 = Class              #38            // "[Ljava/lang/String;"
  #21 = Class              #39            // java/lang/String
  #22 = Class              #40            // java/io/PrintStream
  #23 = Utf8               SourceFile
  #24 = Utf8               Demo1_22.java
  #25 = NameAndType        #13:#14        // "<init>":()V
  #26 = Utf8               a
  #27 = Utf8               b
  #28 = Utf8               ab
  #29 = Utf8               java/lang/StringBuilder
  #30 = NameAndType        #41:#42        // append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
  #31 = NameAndType        #43:#44        // toString:()Ljava/lang/String;
  #32 = Class              #45            // java/lang/System
  #33 = NameAndType        #46:#47        // out:Ljava/io/PrintStream;
  #34 = Class              #40            // java/io/PrintStream
  #35 = NameAndType        #48:#49        // println:(Z)V
  #36 = Utf8               cn/itcast/jvm/t1/stringtable/Demo1_22
  #37 = Utf8               java/lang/Object
  #38 = Utf8               [Ljava/lang/String;
  #39 = Utf8               java/lang/String
  #40 = Utf8               java/io/PrintStream
  #41 = Utf8               append
  #42 = Utf8               (Ljava/lang/String;)Ljava/lang/StringBuilder;
  #43 = Utf8               toString
  #44 = Utf8               ()Ljava/lang/String;
  #45 = Utf8               java/lang/System
  #46 = Utf8               out
  #47 = Utf8               Ljava/io/PrintStream;
  #48 = Utf8               println
  #49 = Utf8               (Z)V
{
  public cn.itcast.jvm.t1.stringtable.Demo1_22();
    descriptor: ()V
    flags: ACC_PUBLIC
    Code:
      stack=1, locals=1, args_size=1
         0: aload_0
         1: invokespecial #1                  // Method java/lang/Object."<init>":()V
         4: return
      LineNumberTable:
        line 4: 0

  public static void main(java.lang.String[]);
    descriptor: ([Ljava/lang/String;)V
    flags: ACC_PUBLIC, ACC_STATIC
    Code:
      stack=3, locals=6, args_size=1
         0: ldc           #2                  // String a
         2: astore_1
         3: ldc           #3                  // String b
         5: astore_2
         6: ldc           #4                  // String ab
         8: astore_3
         9: new           #5                  // class java/lang/StringBuilder
        12: dup
        13: invokespecial #6                  // Method java/lang/StringBuilder."<init>":()V
        16: aload_1
        17: invokevirtual #7                  // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
        20: aload_2
        21: invokevirtual #7                  // Method java/lang/StringBuilder.append:(Ljava/lang/String;)Ljava/lang/StringBuilder;
        24: invokevirtual #8                  // Method java/lang/StringBuilder.toString:()Ljava/lang/String;
        27: astore        4
        29: ldc           #4                  // String ab
        31: astore        5
        33: getstatic     #9                  // Field java/lang/System.out:Ljava/io/PrintStream;
        36: aload_3
        37: aload         5
        39: if_acmpne     46
        42: iconst_1
        43: goto          47
        46: iconst_0
        47: invokevirtual #10                 // Method java/io/PrintStream.println:(Z)V
        50: return
      LineNumberTable:
        line 11: 0
        line 12: 3
        line 13: 6
        line 14: 9
        line 15: 29
        line 17: 33
        line 21: 50
      StackMapTable: number_of_entries = 2
        frame_type = 255 /* full_frame */
          offset_delta = 46
          locals = [ class "[Ljava/lang/String;", class java/lang/String, class java/lang/String, class java/lang/String, class java/lang/String, class java/lang/String ]
          stack = [ class java/io/PrintStream ]
        frame_type = 255 /* full_frame */
          offset_delta = 0
          locals = [ class "[Ljava/lang/String;", class java/lang/String, class java/lang/String, class java/lang/String, class java/lang/String, class java/lang/String ]
          stack = [ class java/io/PrintStream, int ]
}
SourceFile: "Demo1_22.java"
```



下面来看几道面试题：

```java
String s1 = "a"; 
String s2 = "b"; 
String s3 = "a" + "b"; 
String s4 = s1 + s2; 
String s5 = "ab"; 
String s6 = s4.intern(); 

// 问 
System.out.println(s3 == s4); 
System.out.println(s3 == s5); 
System.out.println(s3 == s6); 

String x2 = new String("c") + new String("d"); 
String x1 = "cd"; 
x2.intern(); 
// 问，如果调换了【最后两行代码】的位置呢，如果是jdk1.6呢 
System.out.println(x1 == x2);
```





#### StringTable存储位置

Java 8 中的存储位置：

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/image-20220511132237266.png" alt="image-20220511132237266" style="zoom:40%;float:left" />

java 6 中的存储位置：

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/image-20220511132330620.png" alt="image-20220511132330620" style="zoom:40%;float:left" />

将串池转移到堆内存后，更有利于内存的回收

#### StringTable的特性

- 常量池中的字符串仅是符号，第一次用到时才变为对象

- 利用串池的机制，来避免重复创建字符串对象

- 字符串变量拼接的原理是 StringBuilder （1.8）

- 字符串常量拼接的原理是编译期优化

- 可以使用 intern 方法，主动将串池中还没有的字符串对象放入串池

  - 1.8 将这个字符串对象尝试放入串池，如果有则并不会放入，如果没有则放入串池， 会把串池中的对象返回

  - 1.6 将这个字符串对象尝试放入串池，如果有则并不会放入，如果没有会把此对象复制一份，放入串池， 会把串池中的对象返回



#### StringTable调优

StringTable的实现类似于Hash表，默认的桶大小是65535（在Java11中），可以使用参数-XX:StringTableSzie=655350 来进行调整。

当项目中字符串变量较多时，可以适当增加StringTable的大小，来提高运行效率。





### 直接内存

优点：

- 常见于 NIO 操作时，用于数据缓冲区

- 分配回收成本较高，但读写性能高

- 不受 JVM 内存回收管理





首先来看一个例子：

```java
/**
 * 演示 ByteBuffer 作用
 */
public class Demo1_9 {
    static final String FROM = "E:\\path\\to\\big-file.mp4";
    static final String TO = "E:\\a.mp4";
    static final int _1Mb = 1024 * 1024;

    public static void main(String[] args) {
        io(); // io 用时：1535.586957 1766.963399 1359.240226
        directBuffer(); // directBuffer 用时：479.295165 702.291454 562.56592
    }

    private static void directBuffer() {
        long start = System.nanoTime();
        try (FileChannel from = new FileInputStream(FROM).getChannel();
             FileChannel to = new FileOutputStream(TO).getChannel();
        ) {
            ByteBuffer bb = ByteBuffer.allocateDirect(_1Mb);
            while (true) {
                int len = from.read(bb);
                if (len == -1) {
                    break;
                }
                bb.flip();
                to.write(bb);
                bb.clear();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        long end = System.nanoTime();
        System.out.println("directBuffer 用时：" + (end - start) / 1000_000.0);
    }

    private static void io() {
        long start = System.nanoTime();
        try (FileInputStream from = new FileInputStream(FROM);
             FileOutputStream to = new FileOutputStream(TO);
        ) {
            byte[] buf = new byte[_1Mb];
            while (true) {
                int len = from.read(buf);
                if (len == -1) {
                    break;
                }
                to.write(buf, 0, len);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        long end = System.nanoTime();
        System.out.println("io 用时：" + (end - start) / 1000_000.0);
    }
}

```

NIO会快很多



#### 文件读写流程：



直接内存溢出

```properties
Exception in thread "main" java.lang.OutOfMemoryError： Direct buffer memory
```





禁用显示的垃圾回收

```
-XX:DisableExplicitGC  
```





#### 直接内存的申请释放

在Java中分配直接内存，大有如下三种主要方式：

1. Unsafe.allocateMemory()
2. ByteBuffer.allocateDirect()
3. native方法

##### Unsafe类

在unsafe类中，提供了两个方法来进行直接内存的分配和释放

```java
// 申请直接内存内存
public native long allocateMemory(long var1); 
// 释放直接内存
public native void freeMemory(long var1);
```

下面给出一个使用的例子：

```java
static int _1Gb = 1024 * 1024 * 1024;

public static void main(String[] args) throws IOException {
    Unsafe unsafe = Unsafe.getUnsafe();
    // 分配内存
    long base = unsafe.allocateMemory(_1Gb);
    unsafe.setMemory(base, _1Gb, (byte) 0);
    System.in.read();
    // 释放内存
    unsafe.freeMemory(base);
    System.in.read();
}
```



##### ByteBuffer类

Unsafe是一个十分原始的底层方法，不适合开发者使用。而ByteBuffer则是留给开发者使用的。下面来看一下其实现：

```java
public static ByteBuffer allocateDirect(int capacity) {
    return new DirectByteBuffer(capacity);
}
```

可以看到，他创建了一个`DirectByteBuffer`对象

```java
DirectByteBuffer(int cap) {                   // package-private
    super(-1, 0, cap, cap);
    // 计算需要分配内存的大小
    boolean pa = VM.isDirectMemoryPageAligned();
    int ps = Bits.pageSize();
    long size = Math.max(1L, (long)cap + (pa ? ps : 0));
    Bits.reserveMemory(size, cap);
	// 分配直接内存
    long base = 0;
    try {
        base = UNSAFE.allocateMemory(size);
    } catch (OutOfMemoryError x) {
        Bits.unreserveMemory(size, cap);
        throw x;
    }
    UNSAFE.setMemory(base, size, (byte) 0);
    // 计算内存地址
    if (pa && (base % ps != 0)) {
        // Round up to page boundary
        address = base + ps - (base & (ps - 1));
    } else {
        address = base;
    }
    // 创建cleaner
    cleaner = Cleaner.create(this, new Deallocator(base, size, cap));
    att = null;
}
```

可以看到，DirectByteBuffer也是通过`UNSAFE.allocateMemory(size)`来申请的直接内存空间。那么释放直接内存的在哪里呢？

可以看到这么一行代码：`cleaner = Cleaner.create(this, new Deallocator(base, size, cap));`

Cleaner继承自`PhantomReference`，所以当垃圾回收器在回收`DirectByteBuffer`这个对象时，就会同步对cleaner进行回收工作；

<font color="red">TODO 补充一下虚引用</font>

Deallocator的实现

```java
private static class Deallocator implements Runnable {
    private long address;
    private long size;
    private int capacity;

    private Deallocator(long address, long size, int capacity) {
        assert (address != 0);
        this.address = address;
        this.size = size;
        this.capacity = capacity;
    }

    public void run() {
        if (address == 0) {
            // Paranoia
            return;
        }
        UNSAFE.freeMemory(address);
        address = 0;
        Bits.unreserveMemory(size, capacity);
    }
}
```





## 垃圾回收

### 如何判断对象可以被回收？

#### 引用计数法

每个对象有一个引用计数器，当对象被引用一次则计数器加1，当对象引用失效一次则计数器减1，对于为0的对象意味着是垃圾对象，可以被GC回收。

#### 可达性分析

从GC Roots作为起点开始搜索，那么整个连通图中的对象便都是活对象，对于GC Roots无法到达的对象便成了垃圾回收的对象，随时可被GC回收



#### 对引用计数和可达性分析算法的分析

目前虚拟机基本都是采用**可达性算法**，为什么不采用引用计数算法呢？下面就说说引用计数法是如何统计所有对象的引用计数的，再对比分析可达性算法是如何解决引用技术算法的不足。先简单说说这两个算法：

- **引用计数算法**（[reference-counting](https://link.zhihu.com/?target=http%3A//www.memorymanagement.org/glossary/r.html%23reference.counting)） ：每个对象有一个引用计数器，当对象被引用一次则计数器加1，当对象引用失效一次则计数器减1，对于计数器为0的对象意味着是垃圾对象，可以被GC回收。
- **可达性算法**(GC Roots Tracing)：从GC Roots作为起点开始搜索，那么整个连通图中的对象便都是活对象，对于GC Roots无法到达的对象便成了垃圾回收的对象，随时可被GC回收。

**采用引用计数算法的**系统只需在每个实例对象创建之初，通过计数器来记录所有的引用次数即可。而可达性算法，则需要再次GC时，遍历整个GC根节点来判断是否回收。

下面通过一段代码来对比说明：

```java
 public class GcDemo {

    public static void main(String[] args) {
        //分为6个步骤
        GcObject obj1 = new GcObject(); //Step 1
        GcObject obj2 = new GcObject(); //Step 2

        obj1.instance = obj2; //Step 3
        obj2.instance = obj1; //Step 4

        obj1 = null; //Step 5
        obj2 = null; //Step 6
    }
}

class GcObject{
    public Object instance = null;
}
```

很多文章以及Java虚拟机相关的书籍，都会告诉你如果采用引用计数算法，上述代码中obj1和obj2指向的对象已经不可能再被访问，彼此互相引用对方导致引用计数都不为0，最终无法被GC回收，而可达性算法能解决这个问题。

但这些文章和书籍并没有真正从内存角度来阐述这个过程是如何统计的，很多时候大家都在相互借鉴、翻译，却也都没有明白。或者干脆装作讲明白，或者假定读者依然明白。 其实很多人并不明白为什么引用计数法不为0，引用计数到底是如何维护所有对象引用的，可达性是如何可达的？ 接下来结合实例，从Java内存模型以及数学的图论知识角度来说明，希望能让大家彻底明白该过程。



**情况（一）：引用计数算法**



如果采用的是引用计数算法：

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/b9e5ecd5d1cfb1d045541c1f6e25e92c_720w.jpg" alt="img" style="zoom:100%;float:left" />

再回到前面代码GcDemo的main方法共分为6个步骤：

- Step1：GcObject实例1的引用计数加1，实例1的引用计数=1；
- Step2：GcObject实例2的引用计数加1，实例2的引用计数=1；
- Step3：GcObject实例2的引用计数再加1，实例2的引用计数=2；
- Step4：GcObject实例1的引用计数再加1，实例1的引用计数=2；

执行到Step 4，则GcObject实例1和实例2的引用计数都等于2。

接下来继续结果图：

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/3c1246661a548f933cd886070f6c1af1_720w.jpg" alt="img" style="zoom:100%;float:left" />

- Step5：栈帧中obj1不再指向Java堆，GcObject实例1的引用计数减1，结果为1；
- Step6：栈帧中obj2不再指向Java堆，GcObject实例2的引用计数减1，结果为1。

到此，发现GcObject实例1和实例2的计数引用都不为0，那么如果采用的引用计数算法的话，那么这两个实例所占的内存将得不到释放，这便产生了内存泄露。



**情况（二）：可达性算法**



这是目前主流的虚拟机都是采用GC Roots Tracing算法，比如Sun的Hotspot虚拟机便是采用该算法。 该算法的核心算法是从GC Roots对象作为起始点，利用数学中图论知识，图中可达对象便是存活对象，而不可达对象则是需要回收的垃圾内存。这里涉及两个概念，一是GC Roots，一是可达性。

那么可以作为**GC Roots的对象**（见下图）：

- 虚拟机栈的栈帧的局部变量表所引用的对象；
- 本地方法栈的JNI所引用的对象；
- 方法区的静态变量和常量所引用的对象；

关于**可达性**的对象，便是能与GC Roots构成连通图的对象，如下图：

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/22f72b18415405c3e0207925a8de74fa_720w.jpg" alt="img" style="zoom:100%;float:left" />

从上图，reference1、reference2、reference3都是GC Roots，可以看出：

- reference1-> 对象实例1；
- reference2-> 对象实例2；
- reference3-> 对象实例4；
- reference3-> 对象实例4 -> 对象实例6；

可以得出对象实例1、2、4、6都具有GC Roots可达性，也就是存活对象，不能被GC回收的对象。

而对于对象实例3、5直接虽然连通，但并没有任何一个GC Roots与之相连，这便是GC Roots不可达的对象，这就是GC需要回收的垃圾对象。

到这里，相信大家应该能彻底明白引用计数算法和可达性算法的区别吧**。**

再回过头来看看最前面的实例，GcObject实例1和实例2虽然从引用计数虽然都不为0，但从可达性算法来看，都是GC Roots不可达的对象。

总之，对于对象之间循环引用的情况，引用计数算法，则GC无法回收这两个对象，而可达性算法则可以正确回收。



#### 引用类型

在JVM中，引用类型主要分为强引用（Strong Reference）、软引用（Soft Reference）、弱引用（Weak Reference）、虚引用（Phantom Reference）这 4 种引用强度依次逐渐减弱。除强引用外，其他 3 种引用均可以在 java.lang.ref 包中找到它们的身影。如下图，显示了这 3 种引用类型对应的类，开发人员可以在应用程序中直接使用它们。
![在这里插入图片描述](../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/900fb2c037474f0b8951e22328807b13.png)

Reference 子类中只有终结器引用是包内可见的，其他 3 种引用类型均为 public，可以在应用程序中直接使用

**强引用（StrongReference）**：最传统的“引用”的定义，是指在程序代码之中普遍存在的引用赋值，即类似“Object obj = new Object()”这种引用关系。无论任何情况下，只要强引用关系还存在，垃圾收集器就永远不会回收掉被引用的对象。

**软引用（SoftReference）**：在系统将要发生内存溢出之前，将会把这些对象列入回收范围之中进行第二次回收。如果这次回收后还没有足够的内存，才会抛出内存流出异常。

**弱引用（WeakReference）**：被弱引用关联的对象只能生存到下一次垃圾收集之前。当垃圾收集器工作时，无论内存空间是否足够，都会回收掉被弱引用关联的对象。

**虚引用（PhantomReference）**：一个对象是否有虚引用的存在，完全不会对其生存时间构成影响，也无法通过虚引用来获得一个对象的实例。为一个对象设置虚引用关联的唯一目的就是能在这个对象被收集器回收时收到一个系统通知。

##### 强引用（Strong Reference）

强引用（Strong Reference） — 不回收

当在 Java 语言中使用 new 操作符创建一个新的对象，并将其赋值给一个变量的时候，这个变量就成为指向该对象的一个强引用。强引用的对象是可触及的，垃圾收集器就永远不会回收掉被引用的对象。

强引用具备以下特点：

- 强引用可以直接访问目标对象。
- 强引用所指向的对象在任何时候都不会被系统回收，虚拟机宁愿抛出 OOM 异常，也不会回收强引用所指向对象。
- 强引用可能导致内存泄漏。

##### 软引用（Soft Reference）

软引用（Soft Reference）——内存不足即回收

软引用是用来描述一些还有用，但非必需的对象。只被软引用关联着的对象，在系统将要发生内存溢出异常前，会把这些对象列进回收范围之中进行第二次回收，如果这次回收还没有足够的内存，才会抛出内存溢出异常。

软引用通常用来实现内存敏感的缓存。比如：高速缓存就有用到软引用。如果还有空闲内存，就可以暂时保留缓存，当内存不足时清理掉，这样就保证了使用缓存的同时，不会耗尽内存。

垃圾回收器在某个时刻决定回收软可达的对象的时候，会清理软引用，并可选地把引用存放到一个引用队列（Reference Queue）。

类似弱引用，只不过 Java 虚拟机会尽量让软引用的存活时间长一些，迫不得已才清理。



##### 弱引用（Weak Reference）

弱引用（Weak Reference）——发现即回收

弱引用也是用来描述那些非必需对象，只被弱引用关联的对象只能生存到下一次垃圾收集发生为止。在系统 GC 时，只要发现弱引用，不管系统堆空间使用是否充足，都会回收掉只被弱引用关联的对象。

但是，由于垃圾回收器的线程通常优先级很低，因此，并不一定能很快地发现持有弱引用的对象。在这种情况下，弱引用对象可以存在较长的时间。

弱引用和软引用一样，在构造弱引用时，也可以指定一个引用队列，当弱引用对象被回收时，就会加入指定的引用队列，通过这个队列可以跟踪对象的回收情况。

软引用、弱引用都非常适合来保存那些可有可无的缓存数据。如果这么做，当系统内存不足时，这些缓存数据会被回收，不会导致内存溢出。而当内存资源充足时，这些缓存数据又可以存在相当长的时间，从而起到加速系统的作用。




##### 虚引用（Phantom Reference）

虚引用（Phantom Reference）——对象回收跟踪

也称为“幽灵引用”或者“幻影引用”，是所有引用类型中最弱的一个。

一个对象是否有虚引用的存在，完全不会决定对象的生命周期。如果一个对象仅持有虚引用，那么它和没有引用几乎是一样的，随时都可能被垃圾回收器回收。它不能单独使用，也无法通过虚引用来获取被引用的对象。**当试图通过虚引用的 get()方法取得对象时，总是 null**

为一个对象设置虚引用关联的唯一目的在于跟踪垃圾回收过程。比如：能在这个对象被收集器回收时收到一个系统通知。

虚引用必须和引用队列一起使用。虚引用在创建时必须提供一个引用队列作为参数。当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象后，将这个虚引用加入引用队列，以通知应用程序对象的回收情况。

由于虚引用可以跟踪对象的回收时间，因此，也可以将一些资源释放操作放置在虚引用中执行和记录。



##### 终结器引用

它用于实现对象的 finalize() 方法，也可以称为终结器引用。无需手动编码，其内部配合引用队列使用。

在 GC 时，终结器引用入队。由 Finalizer 线程通过终结器引用找到被引用对象调用它的 finalize()方法，第二次 GC 时才回收被引用的对象



##### 使用示例

软引用的例子：

```java
public class SoftReferenceDemo {
    private static final int _4MB = 4 * 1024 * 1024;

    public static void main(String[] args) {
        List<SoftReference<byte[]>> list = new ArrayList<>();

        // 引用队列
        ReferenceQueue<byte[]> queue = new ReferenceQueue<>();

        for (int i = 0; i < 5; i++) {
            // 关联了引用队列， 当软引用所关联的 byte[]被回收时，软引用自己会加入到 queue 中去
            SoftReference<byte[]> ref = new SoftReference<>(new byte[_4MB], queue);
            System.out.println(ref.get());
            list.add(ref);
            System.out.println(list.size());
        }

        // 从队列中获取无用的 软引用对象，并移除
        Reference<? extends byte[]> poll = queue.poll();
        while( poll != null) {
            list.remove(poll);
            poll = queue.poll();
        }

        System.out.println("===========================");
        for (SoftReference<byte[]> reference : list) {
            System.out.println(reference.get());
        }
    }
}
```

弱引用的例子：

```java
/**
 * 演示弱引用
 * -Xmx20m -XX:+PrintGCDetails -verbose:gc
 */
public class WeakReferenceDemo {
    private static final int _4MB = 4 * 1024 * 1024;

    public static void main(String[] args) {
        //  list --> WeakReference --> byte[]
        List<WeakReference<byte[]>> list = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            WeakReference<byte[]> ref = new WeakReference<>(new byte[_4MB]);
            list.add(ref);
            for (WeakReference<byte[]> w : list) {
                System.out.print(w.get()+" ");
            }
            System.out.println();
        }
        System.out.println("循环结束：" + list.size());
    }
}
```



### 垃圾回收算法



#### 标记-清除算法

标记/清除算法，就是当堆中的有效内存空间（available memory）被耗尽的时候，就会停止整个程序（也被成为stop the world），然后进行两项工作，第一项则是标记，第二项则是清除

- 标记：标记的过程其实就是，遍历所有的GC Roots，然后将所有GC Roots可达的对象标记为存活的对象。

- 清除：清除的过程将遍历堆中所有的对象，将没有标记的对象全部清除掉。

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2NjdWFtYW4=,size_16,color_FFFFFF,t_70.png" alt="在这里插入图片描述" style="zoom:100%;float:left" />

优点：

- 算法实现简单（好像也不算什么优点）

缺点：

- 效率比较低（递归与全堆对象遍历），而且在进行GC的时候，需要停止应用程序，

- 这种方式清理出来的空闲内存是不连续的，内存的布局自然会乱七八糟。而为了应付这一点，JVM就不得不维持一个内存的空闲列表，这又是一种开销。而且在分配数组对象的时候，寻找连续的内存空间会不太好找。

  

#### 标记-复制算法

复制算法是针对标记—清除算法的缺点，在其基础上进行改进而得到的，它将可用内存按容量分为大小相等的两块，每次只使用其中的一块，当这一块的内存用完了，就将还存活着的对象复制到另外一块内存上面，然后再把已使用过的内存空间一次清理掉。

**如果对象的存活率过高，在复制对象时花费的时间就会很长，所以，想要使用复制算法，对象的存活率要非常低才行，而且要客服50%的内存浪费。**

![在这里插入图片描述](../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2NjdWFtYW4=,size_16,color_FFFFFF,t_70-16523214515602.png)

优点：

- 每次只对一块内存进行回收，运行高效

- 只需移动栈顶指针，按顺序分配内存即可，实现简单

- 内存回收时不用考虑内存碎片的出现

缺点：

- 可一次性分配的最大内存缩小了一半



#### 标记-整理算法

为了解决Copying算法的缺陷，充分利用内存空间，提出了Mark-Compact算法。

与标记/清除算法非常相似，它也是分为两个阶段：**标记和整理**。

- **标记：**它的第一个阶段与标记/清除算法是一模一样的，均是遍历GC Roots，然后将存活的对象标记。

- **整理：**移动所有存活的对象，且按照内存地址次序依次排列，然后将末端内存地址以后的内存全部回收。因此，第二阶段才称为整理阶段。

![在这里插入图片描述](../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2NjdWFtYW4=,size_16,color_FFFFFF,t_70-16523215733294.png)

可以看到，标记的存活对象将会被整理，按照内存地址依次排列，而未被标记的内存会被清理掉。如此一来，当我们需要给新对象分配内存时，JVM只需要持有一个内存的起始地址即可，这比维护一个空闲列表显然少了许多开销。

不难看出，**标记/整理算法不仅可以弥补标记/清除算法当中，内存区域分散的缺点，也消除了复制算法当中，内存减半的高额代价**，可谓是一举两得，一箭双雕，一石两鸟，一。。。。一女两男？

不过任何算法都会有其缺点，**标记/整理算法唯一的缺点就是效率也不高**，不仅要标记所有存活对象，还要整理所有存活对象的引用地址。从效率上来说，标记/整理算法要低于复制算法。



#### 总结

- **内存效率**：复制算法>标记清除算法>标记压缩算法（时间复杂度）
- **内存整齐度**：复制算法=标记清除算法>标记压缩算法
- **内存利用率**：复制算法<标记清除算法=标记压缩算法

### 分代垃圾回收

JVM在进行垃圾回收时，并不是只使用某一种算法，而是所有算法都会使用，由此就产生了分代收集算法。

分代收集算法是针对对象的不同特性，而使用适合的算法，这里面并没有实际上的新算法产生。**与其说分代搜集算法是第四个算法，不如说它是对前三个算法的实际应用**

在内存中对象大致可以分为三类：

- **朝生夕灭**：例如方法内的局部变量，循环内的临时变量等
- **老不死**：早晚要死的对象，例如缓存。
- **永生**：例如常量池，加载的类信息等。

**Java堆中内存划分：**

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/f113a034a345248ac88c8e7174038ed8.png" alt="Java堆划分" style="zoom:60%;float:left" />

注：在JDK9中开始采用G1回收器，开始采用了新的内存模型，弱化了分新生代和老年代的概念。



#### 新生代内存

**Minor GC**

对于朝生夕灭类的对象，存活时间短，还记得复制算法的使用要求吗？那就是对象存活率不能太高，因此**这类对象是最适合使用复制算法的**。

但是50%的内存浪费怎么解决呢？

JVM将新生代内存又划分了3块区域，80%的内存用来给新建对象分配内存，另外两块10%的内存作为对象的幸存区。一旦发生GC，将其中一个10%的幸存区和80%的Eden区的对象转移到另一个10%的幸存区内，每复制一次，年龄加1，接下来，前面90%的内存将全部被释放，（注意这里会一致有一个10%的幸存区是空的，用来在下一次GC保存存对象）

使用这样的方式，我们只浪费了10%的内存，这个是可以接受的，因为我们换来了内存的整齐排列与GC速度。但是这个策略的前提是，每次存活的对象占用的内存不能超过这10%的大小，一旦超过，多出的对象将无法复制。下面老年代开始登场了。

minor GC会触发一次 stop the world (minor gc 通常情况下很快)

#### 老年代内存

通常情况下，以下两种情况发生的时候，对象会从新生代区域转到年老带区域。

- 在新生代里的每一个对象，都会有一个**年龄**，当这些对象的年龄到达一定程度时（年龄就是熬过的GC次数，每次GC如果对象存活下来，则年龄加1，最大15次），则会被转到年老代，而这个转入年老代的年龄值，一般在JVM中是可以设置的。

- 在新生代存活对象占用的内存超过10%时，则多余的对象会放入年老代。这种时候，年老代就是新生代的“备用仓库”。

针对老不死对象的特性，显然不再适合使用复制算法，因为它的存活率太高，而且不要忘了，如果年老代再使用复制算法，它可是没有备用仓库的。因此一般针对**老不死对象只能采用标记/整理或者标记/清除算法**。

当老年代的空间不足，会先尝试触发minor gc，如果还不足，会触发full gc，full gc所需的时间更长

#### 永久代内存

永久带对应Java内存结构中的方法区，这里没有备用仓库，所以只能使用标记/清除和标记/整理算法。

### 垃圾回收器



JVM的相关参数：

| 含义               | 参数                                                         |
| ------------------ | ------------------------------------------------------------ |
| 堆初始大小         | -Xms                                                         |
| 堆最大大小         | -Xmx 或 -XX:MaxHeapSize=size                                 |
| 新生代大小         | -Xmn 或 (-XX:NewSize=size + -XX:MaxNewSize=size )            |
| 幸存区比例（动态） | -XX:InitialSurvivorRatio=ratio 和 -XX:+UseAdaptiveSizePolicy |
| 幸存区比例         | -XX:SurvivorRatio=ratio                                      |
| 晋升阈值           | -XX:MaxTenuringThreshold=threshold                           |
| 晋升详情           | -XX:+PrintTenuringDistribution                               |
| GC详情             | -XX:+PrintGCDetails -verbose:gc                              |
| FullGC 前 MinorGC  | -XX:+ScavengeBeforeFullGC                                    |

#### 垃圾回收器的分类

垃圾搜集器大致分为以下三类。

- 串行搜集器（serial collector）：它只有一条GC线程，且就像前面说的，它在运行的时候需要暂停用户程序（stop the world）。
- 并行搜集器（parallel collector）：它有多条GC线程，且它也需要暂停用户程序（stop the world）。

- 并发搜集器（concurrent collector）：它有一条或多条GC线程，且它需要在部分阶段暂停用户程序（stop the world），部分阶段与用户程序并发执行。



#### HotSport中的垃圾回收器

在hotspotJVM中，每一个种类的垃圾搜集器都有对应的实现，如下。

- 串行搜集器的实现：serial（用于新生代，采用复制算法）、serial old（用于年老代，采用标记/整理算法）
- 并行搜集器的实现：ParNew（用于新生代，采用复制算法）、Parallel Scavenge（用于新生代，采用复制算法）、Parallel old（用于年老代，采用标记/整理算法）

- 并发搜集器的实现：concurrent mark sweep[CMS]（用于年老代，采用标记/清除算法）

可以看到，上面每一种垃圾搜集器都是针对不同内存区域所设计的，因为它们采用的算法不同，凡是用于新生代的都是使用的复制算法，而用于年老代的都是使用的标记/清除或者标记/整理算法。

在实际应用中，我们需要给JVM的新生代和年老代分别选择垃圾搜集器，可以看到无论是新生代还是年老代都分别有三种实现，换句话说，我们应该有3*3=9种选择。但是，事实并非如此。

事实上，这六种垃圾搜集器只有六种选择，因为有的垃圾搜集器由于具体实现的方式等一系列原因无法在一起工作，如下图。

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/24191821-c3e4d156f40e46e7aa8f5c23ae017903.jpg" alt="img" style="zoom:100%;float:left" />

针对上图，红的就是串行搜集器，绿的是并行搜集器，唯一一个黄的是并发搜集器。上面三个是新生代的搜集器，下面三个是年老代的搜集器。两者之间有连线，则表示两者可以配合工作。

这六种组合并没有说哪个组合最强，哪个组合最弱，还是那句话，只有最合适的，没有最好的。因此这就需要我们对每一种组合有一定的认识，才能在使用的时候选择更适合的垃圾搜集器。

下面就开始意义介绍回收器



#### Serial Garbage Collector

**算法**：采用复制算法

**内存区域**：针对新生代设计

**执行方式**：单线程、串行

**执行过程**：当新生代内存不够用时，先**暂停全部用户程序**，然后开启**一条GC线程**使用复制算法对垃圾进行回收，这一过程中可能会有一些对象提升到年老代

**特点**：由于单线程运行，且整个GC阶段都要暂停用户程序，因此会造成应用程序停顿时间较长，但对于**小规模**的程序来说，却非常适合。

**适用场景**：平时的开发与调试程序使用，以及桌面应用交互程序。

**开启参数**：-XX:+UseSerialGC（client模式默认值）



#### Serial Old Garbage Collector

**算法**：**标记/整理**算法

**内存区域**：针对新生代设计



#### ParNew Garbage Collector

**算法**：采用复制算法

**内存区域**：针对新生代设计

**执行方式**：多线程、并行

**执行过程**：当新生代内存不够用时，先暂停全部用户程序，然后开启**若干条GC线程**使用复制算法并行进行垃圾回收，这一过程中可能会有一些对象提升到年老代

**特点**：采用多线程并行运行，因此会对系统的内核处理器数目比较敏感，至少需要多于一个的处理器，**有几个处理器就会开几个线程（不过线程数是可以使用参数-XX:ParallelGCThreads=<N>控制的）**，因此只**适合于多核多处理器的系统**。尽管整个GC阶段还是要暂停用户程序，但多线程并行处理并不会造成太长的停顿时间。因此就吞吐量来说，ParNew要大于serial，在处理器越多的时候，效果越明显。但是这并非绝对，**对于单个处理器来说，由于并行执行的开销（比如同步），ParNew的性能将会低于serial搜集器**。不仅是单个处理器的时候，如果在容量较小的堆上，甚至在两个处理器的情况下，ParNew的性能都并非一定可以高过serial。

**适用场景**：在中到大型的堆上，且系统处理器至少多于一个的情况

**开启参数**：-XX:+UseParNewGC



#### Parallel Scavenge Garbage Collector

这个搜集器与ParNew几乎一模一样，都是针对**新生代**设计，采用**复制算法**的并行搜集器。它与ParNew最大的不同就是可设置的参数不一样，它可以让我们**更精确的控制GC停顿时间以及吞吐量**。

parallel scavenge搜集器提供参数主要包括**控制最大的停顿时间（使用-XX:MaxGCPauseMillis=<N>），以及控制吞吐量（使用-XX:GCTimeRatio=<N>）**。由此可以看出，parallel scavenge就是为了提供吞吐量控制的搜集器。

不过千万不要以为把最大停顿时间调的越小越好，或者吞吐量越大越好，在使用parallel scavenge搜集器时，主要有三个性能指标，**最大停顿时间、吞吐量以及新生代区域的最小值**。

parallel scavenge搜集器具有相应的调节策略，它将会**优先满足最大停顿时间的目标，次之是吞吐量，最后才是新生代区域的最小值**。

因此，如果将最大停顿时间调的过小，将会牺牲整体的吞吐量以及新生代大小来满足你的私欲。手心手背都是肉，我们最好还是不要这么干。不过parallel scavenge有一个参数可以让parallel scavenge搜集器全权接手内存区域大小的调节，这其中还包括了晋升为年老代（可使用-XX:MaxTenuringThreshold=n调节）的年龄，也就是使用-XX:UseAdaptiveSizePolicy打开内存区域大小**自适应策略**。

parallel scavenge搜集器可使用参数-XX:+UseParallelGC开启，同时它也是server模式下默认的新生代搜集器。



常用参数：

-XX:+UseParallelGC ~ -XX:+UseParallelOldGC       开启ParallelGC

-XX:+UseAdaptiveSizePolicy    动态调整新生代的内存比例

-XX:GCTimeRatio=ratio            用来调整吞吐量的目标、就是GC时间站总运行时间的比例，ratio默认为99，即所占比例为1/(1+99)= 0.01，（通常设为19）

-XX:MaxGCPauseMillis=ms      指定每次GC的时间，默认200毫秒

-XX:ParallelGCThreads=n         GC的线程数



#### Parallel Old Garbage Collector

Parallel Old与ParNew或者Parallel Scavenge的关系就好似serial与serial old一样，相互之间的区别并不大，只不过parallel old是针对年**老代设计的并行搜集器**而已，因此它采用**标记/整理**算法。

Parallel Old搜集器还有一个重要的意义就是，**它是除了serial old以外唯一一个可以与parallel scavenge搭配工作的年老代搜集器**，因此为了避免serial old影响parallel scavenge可控制吞吐量的名声，**parallel old就作为了parallel scavenge真正意义上的搭档**。

它可以使用参数-XX:-UseParallelOldGC开启，不过在JDK6以后，它也是在开启parallel scavenge之后默认的年老代搜集器。

#### CMS Garbage Collector

Concurrent Mark Sweep（以下简称CMS）搜集器是唯一一个真正意义上实现了**应用程序与GC线程一起工作**（一起是针对客户而言，而并不一定是真正的一起，有可能是快速交替）的搜集器。

CMS是针对**年老代**设计的搜集器，并采用**标记/清除**算法，它也是**唯一一个**在年老代采用**标记/清除**算法的搜集器。

采用标记/清除算法是因为它特殊的处理方式造成的，它的处理分为四个阶段。

​     1、**初始标记**：需要暂停应用程序，快速标记存活对象。

​     2、**并发标记**：恢复应用程序，并发跟踪GC Roots。

​     3、**重新标记**：需要暂停应用程序，重新标记跟踪遗漏的对象。

​     4、**并发清除**：恢复应用程序，并发清除未标记的垃圾对象。

它比原来的标记/清除算法复杂了点，主要表现在**并发标记和并发清除**这两个阶段，而这两个阶段也是整个GC阶段中**耗时最长的阶段**，不过由于这两个阶段皆是与应用程序并发执行的，因此CMS搜集器造成的停顿时间是非常短暂的。这点还是比较好理解的。

不过它的**缺点**也是要简单提一下的，主要有以下几点。

​	1、由于GC线程与应用程序并发执行时会抢占CPU资源，因此会造成**整体的吞吐量下降**。也就是说，从吞吐量的指标上来说，CMS搜集器是要弱于parallel scavenge搜集器的。

​	2、标记/清除很大的一个缺点，那就是**内存碎片**的存在。因此JVM提供了-XX:+UseCMSCompactAtFullCollection参数用于在全局GC（full GC）后进行一次碎片整理的工作，由于每次全局GC后都进行碎片整理会较大的影响停顿时间，JVM又提供了参数-XX:CMSFullGCsBeforeCompaction去**控制在几次全局GC后会进行碎片整理**。

​	3、CMS最后一个缺点涉及到一个术语---并发模式失败（Concurrent Mode Failure），大意是：如果**并发搜集器不能在年老代填满之前完成不可达（unreachable）对象的回收**，或者**年老代中有效的空闲内存空间不能满足某一个内存的分配请求**，此时应用会被暂停，并在此暂停期间开始垃圾回收，直到回收完成才会恢复应用程序。这种无法并发完成搜集的情况就成为**并发模式失败（concurrent mode failure）**，而且这种情况的发生也意味着我们需要调节并发搜集器的参数了。



> 年老代填满之前无法完成对象回收是指**年老代在并发清除阶段清除不及时**，因此造成的空闲内存不足。而不能满足内存的分配请求，则主要指的是新生代在提升到年老代时，由于**年老代的内存碎片过多**，导致一些分配由于没有连续的内存无法满足。
>
> 实际上，在**并发模式失败**的情况下，**serial old**会作为备选垃圾收集器，进行一次全局GC（Full GC），因此serial old也算是CMS的“替补”。显然，由于serial old的介入，会造成较大的停顿时间。
>
> 为了尽量避免并发模式失败发生，我们可以调节-XX:CMSInitiatingOccupancyFraction=<N>参数，去控制当年老代的内存占用达到多少的时候（N%），便开启并发搜集器开始回收年老代。



常用参数：

-XX:+UseConcMarkSweepGC ~ -XX:+UseParNewGC ~ SerialOld   启动CMS垃圾回收器

-XX:ParallelGCThreads=n   并发线程数

-XX:ConcGCThreads=threads       并行线程数(建议设置为CPU核数的1/4)

-XX:CMSInitiatingOccupancyFraction=percent  控制内存占比达到多少比例时开启垃圾回收

-XX:+CMSScavengeBeforeRemark





#### Garbage First（G1）



TODO  https://blog.csdn.net/u011381576/article/details/79889804

G1(Garbage First)垃圾收集器是当今垃圾回收技术最前沿的成果之一。早在JDK7就已加入JVM的收集器大家庭中，成为HotSpot重点发展的垃圾回收技术。同优秀的CMS垃圾回收器一样，G1也是关注最小时延的垃圾回收器，也同样适合大尺寸堆内存的垃圾收集，官方也推荐使用G1来代替选择CMS。G1最大的特点是引入分区的思路，弱化了分代的概念，合理利用垃圾收集各个周期的资源，解决了其他收集器甚至CMS的众多缺陷。

之前介绍的几组垃圾收集器组合，都有几个共同点：

1. 年轻代、老年代是独立且连续的内存块；
2. 年轻代收集使用单eden、双survivor进行复制算法；
3. 老年代收集必须扫描整个老年代区域；
4. 都是以尽可能少而块地执行GC为设计原则。

G1垃圾收集器也是以关注延迟为目标、服务器端应用的垃圾收集器，被HotSpot团队寄予取代CMS的使命，也是一个非常具有调优潜力的垃圾收集器。虽然G1也有类似CMS的收集动作：初始标记、并发标记、重新标记、清除、转移回收，并且也以一个串行收集器做担保机制，但单纯地以类似前三种的过程描述显得并不是很妥当。事实上，G1收集与以上三组收集器有很大不同：

1. G1的设计原则是”首先收集尽可能多的垃圾(Garbage First)“。因此，G1并不会等内存耗尽(串行、并行)或者快耗尽(CMS)的时候开始垃圾收集，而是在内部采用了启发式算法，在老年代找出具有高收集收益的分区进行收集。同时G1可以根据用户设置的暂停时间目标自动调整年轻代和总堆大小，暂停目标越短年轻代空间越小、总空间就越大；
2. G1采用内存分区(Region)的思路，将内存划分为一个个相等大小的内存分区，回收时则以分区为单位进行回收，存活的对象复制到另一个空闲分区中。由于都是以相等大小的分区为单位进行操作，因此G1天然就是一种压缩方案(局部压缩)；
3. G1虽然也是分代收集器，但整个内存分区不存在物理上的年轻代与老年代的区别，也不需要完全独立的survivor(to space)堆做复制准备。G1只有逻辑上的分代概念，或者说每个分区都可能随G1的运行在不同代之间前后切换；
4. G1的收集都是STW的，但年轻代和老年代的收集界限比较模糊，采用了混合(mixed)收集的方式。即每次收集既可能只收集年轻代分区(年轻代收集)，也可能在收集年轻代的同时，包含部分老年代分区(混合收集)，这样即使堆内存很大时，也可以限制收集范围，从而降低停顿。



##### G1的内存模型



如下图所示：

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/40093686972_25da5b859f_z.jpg" alt="G1分区示意图" style="zoom:100%;float:left" />



**分区 Region**

G1采用了分区(Region)的思路，将整个堆空间分成若干个大小相等的内存区域，每次分配对象空间将逐段地使用内存。因此，在堆的使用上，G1并不要求对象的存储一定是物理上连续的，只要逻辑上连续即可；每个分区也不会确定地为某个代服务，可以按需在年轻代和老年代之间切换。启动时可以通过参数`-XX:G1HeapRegionSize=n`可指定分区大小(1MB~32MB，且必须是2的幂)，默认将整堆划分为2048个分区。

**卡片 Card**

在每个分区内部又被分成了若干个大小为512 Byte卡片(Card)，标识堆内存最小可用粒度所有分区的卡片将会记录在全局卡片表(Global Card Table)中，分配的对象会占用物理上连续的若干个卡片，当查找对分区内对象的引用时便可通过记录卡片来查找该引用对象(见RSet)。每次对内存的回收，都是对指定分区的卡片进行处理。

**堆 Heap**

G1同样可以通过`-Xms`/`-Xmx`来指定堆空间大小。当发生年轻代收集或混合收集时，通过计算GC与应用的耗费时间比，自动调整堆空间大小。如果GC频率太高，则通过增加堆尺寸，来减少GC频率，相应地GC占用的时间也随之降低；目标参数`-XX:GCTimeRatio`即为GC与应用的耗费时间比，G1默认为9，而CMS默认为99，因为CMS的设计原则是耗费在GC上的时间尽可能的少。另外，当空间不足，如对象空间分配或转移失败时，G1会首先尝试增加堆空间，如果扩容失败，则发起担保的Full GC。Full GC后，堆尺寸计算结果也会调整堆空间。



##### G1的分代模型

如下图所示，G1依然使用了分代的思想。与其他垃圾收集器类似，G1将内存在逻辑上划分为年轻代和老年代，其中年轻代又划分为Eden空间和Survivor空间。但年轻代空间并不是固定不变的，当现有年轻代分区占满时，JVM会分配新的空闲分区加入到年轻代空间。

整个年轻代内存会在初始空间`-XX:G1NewSizePercent`(默认整堆5%)与最大空间`-XX:G1MaxNewSizePercent`(默认60%)之间动态变化，且由参数目标暂停时间`-XX:MaxGCPauseMillis`(默认200ms)、需要扩缩容的大小以及分区的已记忆集合(RSet)计算得到。当然，G1依然可以设置固定的年轻代大小(参数`-XX:NewRatio`、`-Xmn`)，但同时暂停目标将失去意义。

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/image-20220512164944416.png" alt="image-20220512164944416" style="zoom:80%;float:left" />

##### G1的分区模型

G1对内存的使用以分区(Region)为单位，而对对象的分配则以卡片(Card)为单位。

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/40093686872_ce639c1121_z.jpg" alt="G1的分区模型" style="zoom:100%;float:left" />



**巨型对象 Humongous Region**

一个大小达到甚至超过分区大小一半的对象称为巨型对象(Humongous Object)。当线程为巨型分配空间时，不能简单在TLAB进行分配，因为巨型对象的移动成本很高，而且有可能一个分区不能容纳巨型对象。因此，巨型对象会直接在老年代分配，所占用的连续空间称为巨型分区(Humongous Region)。G1内部做了一个优化，一旦发现没有引用指向巨型对象，则可直接在年轻代收集周期中被回收。

巨型对象会独占一个、或多个连续分区，其中第一个分区被标记为开始巨型(StartsHumongous)，相邻连续分区被标记为连续巨型(ContinuesHumongous)。由于无法享受Lab带来的优化，并且确定一片连续的内存空间需要扫描整堆，因此确定巨型对象开始位置的成本非常高，如果可以，应用程序应避免生成巨型对象。



**记忆集合 Remember Set (RSet)**

在串行和并行收集器中，GC通过整堆扫描，来确定对象是否处于可达路径中。然而G1为了避免STW式的整堆扫描，在每个分区记录了一个已记忆集合(RSet)，内部类似一个反向指针，记录引用分区内对象的卡片索引。当要回收该分区时，通过扫描分区的RSet，来确定引用本分区内的对象是否存活，进而确定本分区内的对象存活情况。

事实上，并非所有的引用都需要记录在RSet中，如果一个分区确定需要扫描，那么无需RSet也可以无遗漏的得到引用关系。那么引用源自本分区的对象，当然不用落入RSet中；同时，G1 GC每次都会对年轻代进行整体收集，因此引用源自年轻代的对象，也不需要在RSet中记录。最后只有老年代的分区可能会有RSet记录，这些分区称为拥有RSet分区(an RSet’s owning region)。



**Per Region Table (PRT)**

RSet在内部使用Per Region Table(PRT)记录分区的引用情况。由于RSet的记录要占用分区的空间，如果一个分区非常”受欢迎”，那么RSet占用的空间会上升，从而降低分区的可用空间。G1应对这个问题采用了改变RSet的密度的方式，在PRT中将会以三种模式记录引用：

- 稀少：直接记录引用对象的卡片索引
- 细粒度：记录引用对象的分区索引
- 粗粒度：只记录引用情况，每个分区对应一个比特位

由上可知，粗粒度的PRT只是记录了引用数量，需要通过整堆扫描才能找出所有引用，因此扫描速度也是最慢的。



**收集集合 (Collect Set，CSet)**

收集集合(CSet)代表每次GC暂停时回收的一系列目标分区。在任意一次收集暂停中，CSet所有分区都会被释放，内部存活的对象都会被转移到分配的空闲分区中。因此无论是年轻代收集，还是混合收集，工作的机制都是一致的。年轻代收集CSet只容纳年轻代分区，而混合收集会通过启发式算法，在老年代候选回收分区中，筛选出回收收益最高的分区添加到CSet中。

候选老年代分区的CSet准入条件，可以通过活跃度阈值`-XX:G1MixedGCLiveThresholdPercent`(默认85%)进行设置，从而拦截那些回收开销巨大的对象；同时，每次混合收集可以包含候选老年代分区，可根据CSet对堆的总大小占比`-XX:G1OldCSetRegionThresholdPercent`(默认10%)设置数量上限。

由上述可知，G1的收集都是根据CSet进行操作的，年轻代收集与混合收集没有明显的不同，最大的区别在于两种收集的触发条件。



**年轻代收集集合 CSet of Young Collection**

应用线程不断活动后，年轻代空间会被逐渐填满。当JVM分配对象到Eden区域失败(Eden区已满)时，便会触发一次STW式的年轻代收集。在年轻代收集中，Eden分区存活的对象将被拷贝到Survivor分区；原有Survivor分区存活的对象，将根据任期阈值(tenuring threshold)分别晋升到PLAB中，新的survivor分区和老年代分区。而原有的年轻代分区将被整体回收掉。

同时，年轻代收集还负责维护对象的年龄(存活次数)，辅助判断老化(tenuring)对象晋升的时候是到Survivor分区还是到老年代分区。年轻代收集首先先将晋升对象尺寸总和、对象年龄信息维护到年龄表中，再根据年龄表、Survivor尺寸、Survivor填充容量-XX:TargetSurvivorRatio(默认50%)、最大任期阈值-XX:MaxTenuringThreshold(默认15)，计算出一个恰当的任期阈值，凡是超过任期阈值的对象都会被晋升到老年代。



**混合收集集合 CSet of Mixed Collection**

年轻代收集不断活动后，老年代的空间也会被逐渐填充。当老年代占用空间超过整堆比IHOP阈值-XX:InitiatingHeapOccupancyPercent(默认45%)时，G1就会启动一次混合垃圾收集周期。为了满足暂停目标，G1可能不能一口气将所有的候选分区收集掉，因此G1可能会产生连续多次的混合收集与应用线程交替执行，每次STW的混合收集与年轻代收集过程相类似。

为了确定包含到年轻代收集集合CSet的老年代分区，JVM通过参数混合周期的最大总次数-XX:G1MixedGCCountTarget(默认8)、堆废物百分比-XX:G1HeapWastePercent(默认5%)。通过候选老年代分区总数与混合周期最大总次数，确定每次包含到CSet的最小分区数量；根据堆废物百分比，当收集达到参数时，不再启动新的混合收集。而每次添加到CSet的分区，则通过计算得到的GC效率进行安排。



##### G1的收集周期

并发标记周期是G1中非常重要的阶段，这个阶段将会为混合收集周期识别垃圾最多的老年代分区。整个周期完成根标记、识别所有(可能)存活对象，并计算每个分区的活跃度，从而确定GC效率等级。

当达到IHOP阈值-XX:InitiatingHeapOccupancyPercent(老年代占整堆比，默认45%)时，便会触发并发标记周期。**整个并发标记周期将由初始标记(Initial Mark)、根分区扫描(Root Region Scanning)、并发标记(Concurrent Marking)、重新标记(Remark)、清除(Cleanup)几个阶段组成。**其中，初始标记(随年轻代收集一起活动)、重新标记、清除是STW的，而并发标记如果来不及标记存活对象，则可能在并发标记过程中，G1又触发了几次年轻代收集。

<img src="../../../.img/JVM%E5%9E%83%E5%9C%BE%E5%9B%9E%E6%94%B6/563799-20180510163645191-1911681386.png" alt="img" style="zoom:80%;float:left" />

**初始标记（Initial Mark）**

初始标记(Initial Mark)负责标记所有能被直接可达的根对象(原生栈对象、全局对象、JNI对象)，根是对象图的起点，因此初始标记需要将Mutator线程(Java应用线程)暂停掉，也就是需要一个STW的时间段。事实上，当达到IHOP阈值时，G1并不会立即发起并发标记周期，而是等待下一次年轻代收集，利用年轻代收集的STW时间段，完成初始标记，这种方式称为借道(Piggybacking)。

**根分区扫描（Root Region Scanning）**

在初始标记暂停结束后，年轻代收集也完成的对象复制到Survivor的工作，应用线程开始活跃起来。此时为了保证标记算法的正确性，所有新复制到Survivor分区的对象，都需要被扫描并标记成根，这个过程称为根分区扫描(Root Region Scanning)，同时扫描的Suvivor分区也被称为根分区(Root Region)。根分区扫描必须在下一次年轻代垃圾收集启动前完成(并发标记的过程中，可能会被若干次年轻代垃圾收集打断)，因为每次GC会产生新的存活对象集合。

**并发标记（Concurrent Marking）** 

并发标记 Concurrent Marking和应用线程并发执行，并发标记线程在并发标记阶段启动，由参数-XX:ConcGCThreads(默认GC线程数的1/4，即-XX:ParallelGCThreads/4)控制启动数量，每个线程每次只扫描一个分区，从而标记出存活对象图。在这一阶段会处理Previous/Next标记位图，扫描标记对象的引用字段。同时，并发标记线程还会定期检查和处理STAB全局缓冲区列表的记录，更新对象引用信息。参数-XX:+ClassUnloadingWithConcurrentMark会开启一个优化，如果一个类不可达(不是对象不可达)，则在重新标记阶段，这个类就会被直接卸载。所有的标记任务必须在堆满前就完成扫描，如果并发标记耗时很长，那么有可能在并发标记过程中，又经历了几次年轻代收集。如果堆满前没有完成标记任务，则会触发担保机制，经历一次长时间的串行Full GC。

**重新标记**

重新标记(Remark)是最后一个标记阶段。在该阶段中，G1需要一个暂停的时间，去处理剩下的SATB日志缓冲区和所有更新，找出所有未被访问的存活对象，同时安全完成存活数据计算。这个阶段也是并行执行的，通过参数-XX:ParallelGCThread可设置GC暂停时可用的GC线程数。同时，引用处理也是重新标记阶段的一部分，所有重度使用引用对象(弱引用、软引用、虚引用、最终引用)的应用都会在引用处理上产生开销。

**清除 Cleanup**

紧挨着重新标记阶段的清除(Clean)阶段也是STW的。Previous/Next标记位图、以及PTAMS/NTAMS，都会在清除阶段交换角色。清除阶段主要执行以下操作：

1、RSet梳理，启发式算法会根据活跃度和RSet尺寸对分区定义不同等级，同时RSet数理也有助于发现无用的引用。参数-XX:+PrintAdaptiveSizePolicy可以开启打印启发式算法决策细节；

2、整理堆分区，为混合收集周期识别回收收益高(基于释放空间和暂停目标)的老年代分区集合；

3、识别所有空闲分区，即发现无存活对象的分区。该分区可在清除阶段直接回收，无需等待下次收集周期。





### 垃圾回收调优







## 类文件结构



## 类加载器





相关博客：

https://www.cnblogs.com/zuoxiaolong/category/508918.html



-