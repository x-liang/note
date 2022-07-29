# Java 集合之Map

### Map集合

Map是一种键值对(key-value)集合，Map集合中的每一个元素都包含一个键对象和一个值对象。其中，键对象不允许重复，而值对象可以重复。

#### HashMap

HashMap使用数组+链表+树来实现。

由于在实际使用场景中，Hash Map的size较小，在计算hash的时候，hash冲突的概率会很大，所以HashMap的主要工作就是解决hash冲突和扩缩容

##### 如何解决hash冲突问题？

**一：先聊聊HashMap的存储结构**

<img src="../../../.img/java-collection-map/20200611094411635651.png" alt="技术分享图片" style="zoom:50%;" />

上图是HashMap的数据存储结构的表述图片。HashMap底层使用数组，每个数组元素存的是Node类型（或者TreeNode），table的每一个位置，可以成为Hash桶，也就是说，会将相同hash值的项存放到一个Hash桶中，也就是在Table的下标中相同，为了解决同一个位置有多个元素（冲突），HashMap用来拉链法和红黑树两种数据结构来解决冲突。

**二：解决冲突的第一次努力 - hash计算**

计算hash的过程，主要分了两个步骤

1. 计算key的hash值

   计算hash的源码如下：

   ```java
   static final int hash(Object key) {
       int h;
       return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
   }
   ```

   如果key为null，则hash为0

   如果key不为null，则将key的hash值和hash值的高16为进行异或运算得出最终的结果


2. 将hash值映射到数组下标内

   这个很好理解，只取hash码的低位，从而映射到数组内。计算结果使用下面的语句

   ```java
   (size-1) & hash
   ```

   

   > 为什么让高16为参加运算？

   ​		当数组的长度很短时，只有低位数的hashcode值能参与运算。而让高16位参与运算可以更好的均匀散列，减少碰撞，进一步降低hash冲突的几率。并且使得高16位和低16位的信息都被保留了。

   ​		这里的hash值是一个int值，4bit，32位，而16刚好是一半。

   > 为什么是异或运算？

   ​		因为异或运算的结果更均匀



**三：解决冲突的第二次努力 - 链表/树**

即使在计算hash的过程中已经尽力防止hash冲突了，但是仍然不可避免。所以当出现hash冲突时，数组上的元素会以链表或树的形式来保存数据。

##### 如何解决扩缩容问题？

TODO



##### HashMap的源码实现

以下源码都来自JDK1.8

首先来看一下Node的数据结构：

```java
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;

    Node(int hash, K key, V value, Node<K,V> next) {
        this.hash = hash;
        this.key = key;
        this.value = value;
        this.next = next;
    }

    public final K getKey()        { return key; }
    public final V getValue()      { return value; }
    public final String toString() { return key + "=" + value; }

    public final int hashCode() {
        return Objects.hashCode(key) ^ Objects.hashCode(value);
    }

    public final V setValue(V newValue) {
        V oldValue = value;
        value = newValue;
        return oldValue;
    }

    public final boolean equals(Object o) {
        if (o == this)
            return true;
        if (o instanceof Map.Entry) {
            Map.Entry<?,?> e = (Map.Entry<?,?>)o;
            if (Objects.equals(key, e.getKey()) &&
                Objects.equals(value, e.getValue()))
                return true;
        }
        return false;
    }
}
```

这个结构比较简单，没什么可说的。

**接下来看一下Hash Map的初始化**

```java
// 默认的加载因子0.75f
static final float DEFAULT_LOAD_FACTOR = 0.75f;
// 指定初始化容量和加载因子
public HashMap(int initialCapacity, float loadFactor) {
    if (initialCapacity < 0)
        throw new IllegalArgumentException("Illegal initial capacity: " + initialCapacity);
    if (initialCapacity > MAXIMUM_CAPACITY)
        initialCapacity = MAXIMUM_CAPACITY;
    if (loadFactor <= 0 || Float.isNaN(loadFactor))
        throw new IllegalArgumentException("Illegal load factor: " + loadFactor);
    this.loadFactor = loadFactor;
    this.threshold = tableSizeFor(initialCapacity);
}
// 指定初始化容量
public HashMap(int initialCapacity) {
    this(initialCapacity, DEFAULT_LOAD_FACTOR);
}
// 默认的构造方法
public HashMap() {
    this.loadFactor = DEFAULT_LOAD_FACTOR; // all other fields defaulted
}
// 这里计算的结果是大于cap的最小的2的幂次方
static final int tableSizeFor(int cap) {
    int n = cap - 1;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
}
```

默认情况下仅指定了一个加载因子，默认0.75f，而数组的初始化实在第一次put操作的时候完成的。

下面真正干活的代码要来了。

**HashMap的PUT操作**

put操作时hashMap中一个比较核心的操作，是否扩容以及是否转换成红黑树都在这里进行判断。

```java
// 实际保存值的数组
transient Node<K,V>[] table;
// 链表和树之间转换的一个阈值
static final int TREEIFY_THRESHOLD = 8;

transient int size;

transient int modCount;

int threshold;

// 添加元素
public V put(K key, V value) {
    return putVal(hash(key), key, value, false, true);
}

// 具体干活的方法
final V putVal(int hash, K key, V value, boolean onlyIfAbsent, boolean evict) {
    Node<K,V>[] tab; Node<K,V> p; int n, i;
    if ((tab = table) == null || (n = tab.length) == 0)
        // 如果容器为空(第一次添加)，则进行实例化
        n = (tab = resize()).length;
    if ((p = tab[i = (n - 1) & hash]) == null)
        // 如果hash映射到数组内的位置为null，则直接对索引位置进行赋值
        tab[i] = newNode(hash, key, value, null);
    else {
        // 到这里说明存在hash冲突
        Node<K,V> e; K k;
        if (p.hash == hash && ((k = p.key) == key || (key != null && key.equals(k))))
            // 如果hash相同 并且 key相等
            e = p;
        else if (p instanceof TreeNode)
            // 如果时树结构
            e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
        else {
            // 执行到这里就说明对应数组索引的参数为链表结构(这里肯定不为空)，并且hash相同
            for (int binCount = 0; ; ++binCount) {
                // binCount的作用就是为了计数
                if ((e = p.next) == null) {
                    // 将新值添加到链表的最后端
                    p.next = newNode(hash, key, value, null);
                    if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                        // 判断是否需要转换成树
                        treeifyBin(tab, hash);
                    break;
                }
                if (e.hash == hash && ((k = e.key) == key || (key != null && key.equals(k))))
                    // 如果存在相同的key，直接跳出循环
                    break;
                p = e;
            }
        }
        if (e != null) {
            // 如果e不为null, 说明存在重复的key
            V oldValue = e.value;
            if (!onlyIfAbsent || oldValue == null)
                e.value = value;
            // 扩展接口，空实现
            afterNodeAccess(e);
            // 返回旧值
            return oldValue;
        }
    }
    ++modCount;
    if (++size > threshold)
        // 如果size超过阈值，进行扩容
        resize();
    // 扩展接口，空实现
    afterNodeInsertion(evict);
    return null;
}
```



**HashMap的扩缩容操作**

面试重点

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    // 数组长度
    int oldCap = (oldTab == null) ? 0 : oldTab.length;
    // 阈值
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
        if (oldCap >= MAXIMUM_CAPACITY) {
            // 如果旧的容量已经是最大值了，则放弃扩容，将阈值设置为Integer.MAX_VALUE
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY && oldCap >= DEFAULT_INITIAL_CAPACITY)
            // 将新的容量和阈值设置为原始的2倍
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        // 在初始化HashMap时如果指定了initialCapacity，这里的threshold就是大于initialCapacity的最小的2的幂次方
        newCap = oldThr;
    else {               // zero initial threshold signifies using defaults
        // 这里进行初始化
        newCap = DEFAULT_INITIAL_CAPACITY;
        // 阈值等于 加载因子 * 初试容量
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ? (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    // 初始化新的数组
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    // 将旧数组的数据拷贝到新数组
    if (oldTab != null) {
        for (int j = 0; j < oldCap; ++j) {
            Node<K,V> e;
            if ((e = oldTab[j]) != null) {
                oldTab[j] = null;
                if (e.next == null)
                    newTab[e.hash & (newCap - 1)] = e;
                else if (e instanceof TreeNode)
                    ((TreeNode<K,V>)e).split(this, newTab, j, oldCap);
                else { // preserve order
                    // 注意：这里旧数组中，同一个链表的数据，转移到新数组，要么在原索引位置要么在 原索引+odlCap位置，这里直接分成连个链表，直接赋值
                    // 一个字： 妙啊
                    Node<K,V> loHead = null, loTail = null;
                    Node<K,V> hiHead = null, hiTail = null;
                    Node<K,V> next;
                    do {
                        next = e.next;
                        if ((e.hash & oldCap) == 0) {
                            if (loTail == null)
                                loHead = e;
                            else
                                loTail.next = e;
                            loTail = e;
                        }
                        else {
                            if (hiTail == null)
                                hiHead = e;
                            else
                                hiTail.next = e;
                            hiTail = e;
                        }
                    } while ((e = next) != null);
                    if (loTail != null) {
                        loTail.next = null;
                        newTab[j] = loHead;
                    }
                    if (hiTail != null) {
                        hiTail.next = null;
                        newTab[j + oldCap] = hiHead;
                    }
                }
            }
        }
    }
    return newTab;
}
```

**HashMap的GET操作**

```java
public V get(Object key) {
    Node<K,V> e;
    return (e = getNode(hash(key), key)) == null ? null : e.value;
}
    
final Node<K,V> getNode(int hash, Object key) {
    Node<K,V>[] tab; Node<K,V> first, e; int n; K k;
    if ((tab = table) != null && (n = tab.length) > 0 && (first = tab[(n - 1) & hash]) != null) {
        if (first.hash == hash && ((k = first.key) == key || (key != null && key.equals(k))))
            // always check first node
            return first;
        if ((e = first.next) != null) {
            if (first instanceof TreeNode)
                return ((TreeNode<K,V>)first).getTreeNode(hash, key);
            do {
                if (e.hash == hash && ((k = e.key) == key || (key != null && key.equals(k))))
                    return e;
            } while ((e = e.next) != null);
        }
    }
    return null;
} 
```

**HashMap的remove操作**

```java
public V remove(Object key) {
    Node<K,V> e;
    return (e = removeNode(hash(key), key, null, false, true)) == null ? null : e.value;
}

final Node<K,V> removeNode(int hash, Object key, Object value, boolean matchValue, boolean movable) {
    Node<K,V>[] tab; Node<K,V> p; int n, index;
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (p = tab[index = (n - 1) & hash]) != null) {
        Node<K,V> node = null, e; K k; V v;
        if (p.hash == hash && ((k = p.key) == key || (key != null && key.equals(k))))
            node = p;
        else if ((e = p.next) != null) {
            if (p instanceof TreeNode)
                node = ((TreeNode<K,V>)p).getTreeNode(hash, key);
            else {
                do {
                    if (e.hash == hash && ((k = e.key) == key || (key != null && key.equals(k)))) {
                        node = e;
                        break;
                    }
                    p = e;
                } while ((e = e.next) != null);
            }
        }
        if (node != null && (!matchValue || (v = node.value) == value || (value != null && value.equals(v)))) {
            if (node instanceof TreeNode)
                ((TreeNode<K,V>)node).removeTreeNode(this, tab, movable);
            else if (node == p)
                tab[index] = node.next;
            else
                p.next = node.next;
            ++modCount;
            --size;
            afterNodeRemoval(node);
            return node;
        }
    }
    return null;
}
```



**看一看列表是如何转换成tree的**

TODO

```java
final void treeifyBin(Node<K,V>[] tab, int hash) {
    int n, index; Node<K,V> e;
    if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
        resize();
    else if ((e = tab[index = (n - 1) & hash]) != null) {
        TreeNode<K,V> hd = null, tl = null;
        do {
            TreeNode<K,V> p = replacementTreeNode(e, null);
            if (tl == null)
                hd = p;
            else {
                p.prev = tl;
                tl.next = p;
            }
            tl = p;
        } while ((e = e.next) != null);
        if ((tab[index] = hd) != null)
            hd.treeify(tab);
    }
}
    
TreeNode<K,V> replacementTreeNode(Node<K,V> p, Node<K,V> next) {
    return new TreeNode<>(p.hash, p.key, p.value, next);
}

```

