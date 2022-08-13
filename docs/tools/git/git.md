# Git 使用



## 彻底删除历史提交的大文件



删除文件

```shell
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch 路径" --prune-empty --tag-name-filter cat -- --all
```

回收空间

```shell
rm -rf .git/refs/original && git reflog expire --expire=now --all
git gc --prune=now
```

