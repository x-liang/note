# Java 集合之List

## ArrayList 源码分析(JDK8)

### 集成体系

首先来看类的定义：

```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable {
	...
}
```

ArrayList实现了`RandomAccess`接口，另外LinkedList类则没有实现这个接口。这是个标志接口，接口里并没有定义任何方法。只要List实现了这个接口，就表示它支持快速随机访问。例如`Collections`类中的`binarySearch`方法

```java
public static <T> int binarySearch(List<? extends Comparable<? super T>> list, T key) {
    if (list instanceof RandomAccess || list.size()<BINARYSEARCH_THRESHOLD)
        return Collections.indexedBinarySearch(list, key);
    else
        return Collections.iteratorBinarySearch(list, key);
}
```

可以看出，如果List实现了RandomAccess接口，在遍历的时候就会采用基于索引的传统for循环，否则就使用迭代器遍历。

也就是说在JDK的设计中，遍历ArrayList时采用for循环，遍历LinkedList时采用迭代器iterator遍历。因为遍历ArrayList采用for循环会比使用迭代器快，而遍历LinkedList时采用迭代器iterator遍历会比使用for循环快

原因：ArrayList是基于数组(索引)的存储结构，因此使用索引去获取一个元素的复杂度为O(1)，所以使用for进行遍历已经足够快，没有必要去借助迭代器花费额外的时间；而LinkedList底层是基于双向链表实现的，使用索引获取元素的复杂度为O(n)，而使用迭代器遍历LinkedList的话是直接顺着链表节点的后继节点移动的，所以使用迭代器遍历花费时间比使用for循环要少


### 主要成员变量

```java
private static final int DEFAULT_CAPACITY = 10; //默认容量，在加入第一个元素时扩容会用到
private static final Object[] EMPTY_ELEMENTDATA = {}; //一个空数组
//也是一个空数组，与上面那个空数组的区别在ArrayList的构造函数以及存入第一个元素时再进行分析
private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {}; 
transient Object[] elementData; //存放数据元素的数组
private int size; //当前结构中存储的元素个数
private static final int MAX_ARRAY_SIZE = Integer.MAX_VALUE - 8;//JDK设定的elementData数组最大大小
```

### 构造函数

```java
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        throw new IllegalArgumentException("Illegal Capacity: "+ initialCapacity);
    }
}
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}
```

当构造ArrayList有指定其大小时，如果指定的大小大于0，就以用户指定的数值为ArrayList的大小，如果指定的数值小于0抛出异常，如果等于0，就令存放数据的elementData直接指向EMPTY_ELEMENTDATA

如果使用无参构造函数，就令elementData指向DEFAULTCAPACITY_EMPTY_ELEMENTDATA

```java
public ArrayList(Collection<? extends E> c) {
    Object[] a = c.toArray();
    if ((size = a.length) != 0) {
        if (c.getClass() == ArrayList.class) {
            elementData = a;
        } else {
            elementData = Arrays.copyOf(a, size, Object[].class);
        }
    } else {
        // replace with empty array.
        elementData = EMPTY_ELEMENTDATA;
    }
}
```

















