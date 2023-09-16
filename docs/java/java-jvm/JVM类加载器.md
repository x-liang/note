# 虚拟机类加载机制

## 一、类的加载时机

略

## 二、类的加载流程

### 2.1 加载

在加载阶段，Java虚拟机需要完成以下三件事情：

1. 通过一个类的全限定名来获取定义此类的二进制字节流。 

2. 将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构。 

3. 在内存中生成一个代表这个类的java.lang.Class对象，作为方法区这个类的各种数据的访问入口。

通俗点讲，就是JVM把class文件的信息读取到了内存的方法区中。



### 2.2 验证

目的在于确保Class文件的字节流中包含信息符合当前虚拟机要求，不会危害虚拟机自身安全。主要包括四种验证，文件格式验证，元数据验证，字节码验证，符号引用验证。

### 2.3 准备

为类变量(即static修饰的字段变量)分配内存并且设置该类变量的初始值即0(如static int i=5;这里只将i初始化为0，至于5的值将在初始化时赋值)，这里不包含用final修饰的static，因为final在编译的时候就会分配了，注意这里不会为实例变量分配初始化，类变量会分配在方法区中，而实例变量是会随着对象一起分配到Java堆中。

这里分配的内存通常在方法区中。

### 2.4 解析

主要将常量池中的符号引用替换为直接引用的过程。符号引用就是一组符号来描述目标，可以是任何字面量，而直接引用就是直接指向目标的指针、相对偏移量或一个间接定位到目标的句柄。有类或接口的解析，字段解析，类方法解析，接口方法解析(这里涉及到字节码变量的引用，如需更详细了解，可参考《深入Java虚拟机》)。

### 2.5 初始化

**初始化阶段就是执行类构造器`<clinit>()`方法的过程。**

`<clinit>()`方法是由编译器自动收集类中的所有类变量的赋值动作和静态语句块（static{}块）中的 语句合并产生的，编译器收集的顺序是由语句在源文件中出现的顺序决定的，静态语句块中只能访问 到定义在静态语句块之前的变量，定义在它之后的变量，在前面的静态语句块可以赋值，但是不能访问

`<clinit>()`方法与类的构造函数不同，它不需要显 式地调用父类构造器，Java虚拟机会保证在子类的`<clinit>()`方法执行前，父类的clinit()方法已经执行 完毕。

`<clinit>()`方法对于类或接口来说并不是必需的，如果一个类中没有静态语句块，也没有对变量的 赋值操作，那么编译器可以不为这个类生成clinit()方法。

JVM会保证`<clinit>()`并发执行的安全性。

在初始化阶段，JVM会保证在构造函数中定义的语句在最后执行。

### 2.6 使用

### 2.7 卸载



## 三、类加载器

比较两个类是否“相 等”，只有在这两个类是由同一个类加载器加载的前提下才有意义，否则，即使这两个类来源于同一个 Class文件，被同一个Java虚拟机加载，只要加载它们的类加载器不同，那这两个类就必定不相等。

### 3.1 类加载器简介

在Java体系里，主要存在三种类型的类加载器：

- 启动类加载器(Bootstrap Class Loader)：这个类加载器负责加载存放在 <JAVA_HOME>\lib目录
- 扩展类加载器(Extension Class Loader)：它负责加载<JAVA_HOME>\lib\ext目录中的类库。(sun.misc.Launcher # ExtClassLoader)
- 应用程序类加载器(Application Class Loader)：负责加载用户类路径上所有的类库(sun.misc.Launcher # AppClassLoader)

#### 3.1.1 启动类加载器

启动类加载器主要加载的是JVM自身需要的类，这个类加载使用C++语言实现的，是虚拟机自身的一部分，它负责将 <JAVA_HOME>/lib路径下的核心类库或-Xbootclasspath参数指定的路径下的jar包加载到内存中，注意必由于虚拟机是按照文件名识别加载jar包的，如rt.jar，如果文件名不被虚拟机识别，即使把jar包丢到lib目录下也是没有作用的(出于安全考虑，Bootstrap启动类加载器只加载包名为java、javax、sun等开头的类)。



#### 3.1.2 扩展类加载器

扩展类加载器是指Sun公司(已被Oracle收购)实现的sun.misc.Launcher$ExtClassLoader类，由Java语言实现的，是Launcher的静态内部类，它负责加载<JAVA_HOME>/lib/ext目录下或者由系统变量-Djava.ext.dir指定位路径中的类库，开发者可以直接使用标准扩展类加载器。

```java
//ExtClassLoader类中获取路径的代码
private static File[] getExtDirs() {
     //加载<JAVA_HOME>/lib/ext目录中的类库
     String s = System.getProperty("java.ext.dirs");
     File[] dirs;
     if (s != null) {
         StringTokenizer st =
             new StringTokenizer(s, File.pathSeparator);
         int count = st.countTokens();
         dirs = new File[count];
         for (int i = 0; i < count; i++) {
             dirs[i] = new File(st.nextToken());
         }
     } else {
         dirs = new File[0];
     }
     return dirs;
 }
```



#### 3.1.3 应用类加载器

是指 Sun公司实现的sun.misc.Launcher$AppClassLoader。它负责加载系统类路径java -classpath或-D java.class.path 指定路径下的类库，也就是我们经常用到的classpath路径，开发者可以直接使用系统类加载器，一般情况下该类加载是程序中默认的类加载器，通过ClassLoader#getSystemClassLoader()方法可以获取到该类加载器。
　 在Java的日常应用程序开发中，类的加载几乎是由上述3种类加载器相互配合执行的，在必要时，我们还可以自定义类加载器，需要注意的是，Java虚拟机对class文件采用的是按需加载的方式，也就是说当需要使用该类时才会将它的class文件加载到内存生成class对象，而且加载某个类的class文件时，Java虚拟机采用的是双亲委派模式即把请求交由父类处理，它一种任务委派模式，下面我们进一步了解它。

### 3.2 双亲委派模型

一句话理解双亲委派模型：**一个类加载器收到了类加载的请求，他首先把这个请求委派给父类加载器去完成，当父加载器反馈自己无法完成这个加载请求时，才会自己去完成加载。**

请注意双亲委派模式中的父子关系并非通常所说的类继承关系，而是采用组合关系来复用父类加载器的相关代码，类加载器间的关系如下：

<img src="./.JVM%E7%B1%BB%E5%8A%A0%E8%BD%BD%E5%99%A8.assets/image-20230904211851132.png" alt="image-20230904211851132" style="zoom:67%;" />







双亲委派模型的源码实现：

```java
protected synchronized Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException { 
    // 首先，检查请求的类是否已经被加载过了 
    Class c = findLoadedClass(name); 
    if (c == null) { 
        try { 
            if (parent != null) { 
                // 调用父类加载器
                c = parent.loadClass(name, false); 
            } else { 
                // 如果parent为null，这里会调用启动类加载器进行加载
                c = findBootstrapClassOrNull(name); 
            }
        } catch (ClassNotFoundException e) { 
            // 如果父类加载器抛出ClassNotFoundException 
            // 说明父类加载器无法完成加载请求 
        }
        if (c == null) { 
            // 在父类加载器无法加载时 
            // 再调用本身的findClass方法来进行类加载 
            c = findClass(name); 
        } 
    }
    if (resolve) { 
        resolveClass(c); 
    }
	return c;
}
```



### 破坏双亲委派模型

略





