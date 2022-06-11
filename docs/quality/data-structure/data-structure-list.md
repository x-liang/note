# 表、栈和队列



## 集合

### Collection集合

Collections API 在java.util包中，而Collection接口是Java对集合的抽象，他存储了一组类型相同的对象。下面是集合接口提供的一些重要的API：

```java
public interface Collection<E> extends Iterable<E> {
	// 查询操作
    int size();
    boolean isEmpty();
    boolean contains(Object o);
    Iterator<E> iterator();
    Object[] toArray();
    <T> T[] toArray(T[] a);
	// 修改操作
    boolean add(E e);
    boolean remove(Object o);
    // 通用操作
    boolean containsAll(Collection<?> c);
    boolean addAll(Collection<? extends E> c);
    boolean removeAll(Collection<?> c);
    default boolean removeIf(Predicate<? super E> filter) {
        Objects.requireNonNull(filter);
        boolean removed = false;
        final Iterator<E> each = iterator();
        while (each.hasNext()) {
            if (filter.test(each.next())) {
                each.remove();
                removed = true;
            }
        }
        return removed;
    }
    boolean retainAll(Collection<?> c);
    void clear();
    // 
    boolean equals(Object o);
    int hashCode();
	// 流操作
    @Override
    default Spliterator<E> spliterator() {
        return Spliterators.spliterator(this, 0);
    }
    default Stream<E> stream() {
        return StreamSupport.stream(spliterator(), false);
    }
    default Stream<E> parallelStream() {
        return StreamSupport.stream(spliterator(), true);
    }
}
```

上面的接口名称都比较好理解，这里不过多解释，但是有一点要说，Collection接口扩展了Iterable接口，而实现了Iterable接口的类可以拥有增强for循环的功能。下面来看看Iterable接口。

### Iterator接口

首先来看看Iterable的接口定义：

```java
public interface Iterable<T> {
    Iterator<T> iterator();
}
```

可以看到，扩展Iterable接口必须实现`iterator（）`方法，并返回一个`Iterator`类型的对象，该对象的定义为：

```java
public interface Iterator<E> { 
    boolean hasNext();
    E next(); 
    default void remove() {
        throw new UnsupportedOperationException("remove");
    }
}
```

通过这个接口的定义，我们大致能猜测到他的一个使用思路，首先通过`hasNext()`方法判断是否有下一个元素，然后通过`next()`方法获取下一个元素。如下：

```java
public void print(Collection<AnyType> coll){
    Iterator<AnyType> it = coll.iterator();
    while(it.hasNext()){
        AnyType item = it.next();
    }
}
```

### List接口

List接口有两种典型的实现，ArrayList和LinkedList

#### ArrayList：列表的数组实现



#### LinkedList：列表的链表实现





## 栈



## 队列
