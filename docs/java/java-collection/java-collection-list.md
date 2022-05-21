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

当构造ArrayList有指定其大小时，如果指定的容量大于0，就以用户指定的数值为ArrayList的大小，如果指定的数值小于0抛出异常，如果等于0，就令存放数据的elementData直接指向EMPTY_ELEMENTDATA

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

### 扩容机制

说到ArrayList一般都会说到其底层的扩容机制，相关的方法有add，grow等等。接下来从add方法入手，模拟往ArrayList中添加元素时的扩容过程。首先，使用无参构造函数构造一个ArrayList，那么其elementData会指向DEFAULTCAPACITY_EMPTY_ELEMENTDATA，然后调用如下的add方法加入第一个元素

```java
public boolean add(E e) {
    ensureCapacityInternal(size + 1);  // Increments modCount!!
    elementData[size++] = e;
    return true;
}
```

要添加一个元素，先要判断当前ArrayList中的数据域elementData的大小是否足够多存放一个元素，即在正式添加这个元素前，应该确保elementData的大小至少为当前elementData中所存放元素的个数size + 1。所以添加第一个元素时要求至少大小minCapacity为1。这个确保工作用到了ensureCapacityInternal方法

```java
private void ensureCapacityInternal(int minCapacity) {
    ensureExplicitCapacity(calculateCapacity(elementData, minCapacity));
}
private static int calculateCapacity(Object[] elementData, int minCapacity) {
    // 这个方法只有在第一次add的时候，才有效，会设置一个默认的大小：10，以后会默认返回一个minCapacity
    if (elementData== DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
        return Math.max(DEFAULT_CAPACITY, minCapacity);
    }
    return minCapacity;
}
```

可以看出，如果是第一次添加元素，且创建ArrayList对象使用的是无参构造函数，那么默认第一次要扩容的大小为DEFAULT_CAPACITY，即10 (代码中选择的是DEFAULT_CAPACITY跟minCapacity中的最大值，但实际上第一次添加元素的时候minCapacity就是1) ，这就是DEFAULTCAPACITY_EMPTY_ELEMENTDATA跟EMPTY_ELEMENTDATA的区别所在，如果用户在创建ArrayList对象时使用的是有参构造函数指定了其初始容量，那么第一次扩容时就不会尝试扩容至10，而是以用户指定的容量大小为主

我的理解是，如果用户使用的是无参构造函数，可以认为他对ArrayList的初始容量大小并没有什么要求，那么JDK在第一次扩容，索性就直接将容量扩充为10，这样在添加第一到第十个元素的时候也不用去扩容，如果用户指定了初始容量，那么就以用户指定的为准，不去默认扩容，就算用户设置的初始容量也为0，在添加前几个元素的时候可能会出现多几次的扩容操作，也不去管，完全尊重用户

接下来是`ensureExplicitCapacity`方法，Explicit意为明确的，确实的，也就是说经过`calculateCapacity`方法决策后的最小容量才是确切的最小容量：

```java
private void ensureExplicitCapacity(int minCapacity) {
    modCount++;
    // overflow-conscious code
    if (minCapacity - elementData.length > 0)
        grow(minCapacity);
}
```

判断所要求的最小容量`minCapacity`跟当前`elementData`的容量的关系，最小容量为1，而当前`elementData`的容量为0，所以要扩容，调用`grow`方法进行，此时`minCapacity`值为10

下面开始真正的扩容流程：

```java
private void grow(int minCapacity) {
    // overflow-consciouscode
    int oldCapacity = elementData.length;
    int newCapacity = oldCapacity + (oldCapacity >> 1);
    if (newCapacity - minCapacity < 0)
        newCapacity = minCapacity;
    if (newCapacity - MAX_ARRAY_SIZE > 0)
        newCapacity = hugeCapacity(minCapacity);
    // minCapacity is usually close to size, so this is a win:
    elementData = Arrays.copyOf(elementData, newCapacity);
}
```

先设置新的容量大小newCapacity为旧容量大小的1.5倍，但如果newCapacity比所要求的最小容量minCapacity还小，就把newCapacity设为minCapacity；如果newCapacity比设计的elementData最大大小MAX_ARRAY_SIZE还大，就调用hugeCapacity方法来计算最终要设置的新容量

此时newCapacity为0，minCapacity为10，且10小于MAX_ARRAY_SIZE，所以最终的newCapacity为10，然后将elementData扩容至10，最后回到add方法执行elementData[size++] = e语句，将添加的这第一个元素正式加入elementData，同时size置为1，表示当前整个ArrayList中存储的元素个数为1，第一个元素添加成功
接下来添加第二个元素，传入ensureCapacityInternal方法的minCapacity参数为2，经calculateCapacity方法决策后返回的还是2，然后执行ensureExplicitCapacity方法，由于当前elementData的长度为10，故不会经过扩容，直接回到add方法执行将元素放入elementData数组的操作。添加第三，四，五…十个元素的过程都是相同的

当添加第十一个元素时，传入ensureCapacityInternal方法的minCapacity参数为11，经calculateCapacity方法后返回11，然后执行ensureExplicitCapacity方法，由于当前elementData的长度为10小于11，所以会执行grow(11)，当前容量为10，所以计算得到newCapacity为15，15大于11，所以最后newCapacity值为15，这也就是说我们常说的默认扩容1.5倍

最后再来看一下`hugeCapacity`方法，

```java
private static int hugeCapacity(int minCapacity) {
    if (minCapacity < 0) // overflow
        throw new OutOfMemoryError();
    return (minCapacity > MAX_ARRAY_SIZE) ?
        Integer.MAX_VALUE :
        MAX_ARRAY_SIZE;
}
```

在grow方法中可以看到当`newCapacity`计算出的结果大于`MAX_ARRAY_SIZE`，就需要执行`hugeCapacity`方法来确定`newCapacity`的最终结果。如果所要求的最小容量minCapacity也比`MAX_ARRAY_SIZE`还大，就直接取整型变量最大值为新容量的大小，否则取`MAX_ARRAY_SIZE`作为新容量的大小，确定了最终的新容量大小newCapacity的值

### 删除元素

删除元素主要涉及的方法为remove(int index)方法：

```
public E remove(int index) {
    rangeCheck(index);
    modCount++;
    E oldValue = elementData(index);
    int numMoved = size - index - 1;
    if (numMoved > 0)
        System.arraycopy(elementData, index+1, elementData, index, numMoved);
    elementData[--size] = null; // clear to let GC do its work
    return oldValue;
}
```

该方法首先对索引index的合法性进行校验，然后获取被删除元素，作为方法最后的返回值

用numMoved = size - index - 1计算出删除元素后要复制的空间长度，因为每删除一个元素(除了删除最后一个元素)后都要把从被删除元素的后一个元素开始直到最后一个元素之间的所有元素向前移动一位，当index为size - 1的时候，自然计算得到的值为0，即不用复制进行前移元素。当numMoved大于0，就把elementData中最后numMoved个元素通过复制一起向前移动一位，最后返回被删除元素，方法执行完毕。





> 为什么MAX_ARRAY_SIZE的最大值是Integer.MAX_VALUE - 8？
>
> 这里要注意，Java引用地址的大小，在32位虚拟机中是4bytes，在64位虚拟机中是8bytes。
>
> 数组的对象头中比其他类型的对象多保存了一个数组长度，这部分数据占32bytes，在32位虚拟机中刚好占用8个引用指针的大小。





