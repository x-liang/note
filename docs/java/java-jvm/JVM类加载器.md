# 虚拟机类加载机制

## 类的加载时机

略

## 类的加载流程

### 加载

在加载阶段，Java虚拟机需要完成以下三件事情：

1. 通过一个类的全限定名来获取定义此类的二进制字节流。 

2. 将这个字节流所代表的静态存储结构转化为方法区的运行时数据结构。 

3. 在内存中生成一个代表这个类的java.lang.Class对象，作为方法区这个类的各种数据的访问入口。

通俗点讲，就是JVM把class文件的信息读取到了内存的方法区中。



### 验证

这一步主要是对class文件中存储的内容进行校验，包括格式是否正确，定于的内容是否正确等等。来保证程序可以正确执行。



### 准备

这一阶段，开始为类中定义的变量进行内存分配。需要注意的是这一步仅给类中的静态变量分配内存，而且仅仅是分配内存，并没有赋值的动作。

这里分配的内存通常在方法区中。



### 解析



### 初始化

**初始化阶段就是执行类构造器`<clinit>()`方法的过程。**

`<clinit>()`方法是由编译器自动收集类中的所有类变量的赋值动作和静态语句块（static{}块）中的 语句合并产生的，编译器收集的顺序是由语句在源文件中出现的顺序决定的，静态语句块中只能访问 到定义在静态语句块之前的变量，定义在它之后的变量，在前面的静态语句块可以赋值，但是不能访问

`<clinit>()`方法与类的构造函数不同，它不需要显 式地调用父类构造器，Java虚拟机会保证在子类的`<clinit>()`方法执行前，父类的clinit()方法已经执行 完毕。

`<clinit>()`方法对于类或接口来说并不是必需的，如果一个类中没有静态语句块，也没有对变量的 赋值操作，那么编译器可以不为这个类生成clinit()方法。

JVM会保证`<clinit>()`并发执行的安全性。

在初始化阶段，JVM会保证在构造函数中定义的语句在最后执行。

### 使用

### 卸载



## 类加载器

比较两个类是否“相 等”，只有在这两个类是由同一个类加载器加载的前提下才有意义，否则，即使这两个类来源于同一个 Class文件，被同一个Java虚拟机加载，只要加载它们的类加载器不同，那这两个类就必定不相等。

### 双亲委派模型



在Java体系里，主要存在三种类型的类加载器：

- 启动类加载器(Bootstrap Class Loader)：这个类加载器负责加载存放在 <JAVA_HOME>\lib目录
- 扩展类加载器(Extension Class Loader)：它负责加载<JAVA_HOME>\lib\ext目录中的类库。(sun.misc.Launcher # ExtClassLoader)
- 应用程序类加载器(Application Class Loader)：负责加载用户类路径上所有的类库(sun.misc.Launcher # AppClassLoader)



一句话理解双亲委派模型：**一个类加载器收到了类加载的请求，他首先把这个请求委派给父类加载器去完成，当父加载器反馈自己无法完成这个加载请求时，才会自己去完成加载。**

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





