---
layout: post
title: "用shell写个markdown模版"
subtitle: "折磨,但好玩"
date: 2023-01-31 18:02:13
author: linbao
header-img:
catalog: true
tags:
  - shell
  - tools
---

## 废话不多说，直接上结果

![](/img/in-post/write-template-by-shell/result.png)

## 心路历程

### 起因

jekyll 的 文章命名是有规范的，要`Y-M-D-{TITLE}`这种格式，并且写的 md 文件内容需要有上图那些信息，不然不是检索不到就是缺胳膊少腿。  
我写了两篇就觉得折磨的不行，每次还要记着日期，还得复制之前文章的信息，还要在文章里记录秒级的时间，我真的是受不鸟啦，想着难道 jekyll 就没有像 hexo 那样的模版吗，实在不想复制了，网上一搜，靠，还真没有，我英语又贼差，实在看不下去 jekyll 的官网文档，那就放弃吗？
8 可能的，拜托，我可是个程序员哎，怎么可能被这点东西难到，官方没有，那就自己造！

### 怎么搞

一开始没想用 shell 实现，毕竟没玩过，作为深度 js 开发者，我是想用 nodejs 来实现的，但转念一想，又没有频繁 IO，又没有异步事件，不过是写个脚本用 nodejs 是不是有点小题大做了，而且若是非 js 开发者估计是看不懂代码的，不如用写脚本最适合的 shell，不需要任何配置，即开即用。  
但刚开始接触一门新语言是困难的，shell 上手简单，但坑是真多，可读性也差，比如"、'、`的区别，"\$name"和$name，还有用关键字去做流程控制而非特殊字符等等，让我觉得即使 js 也是脚本语言，但比 shell 友好多了，但既然选择了它，就慢慢填坑，搞定它吧。  
终于功夫不负有心人，完成了这段充斥着 js 思想的代码。

```shell
# 当前时间+文章名称
postName=`date +%Y-%m-%d`"-"$1".md"
# 文章标题
title='"'$1'"'
# 文章子标题
subtitle=$title
# 头部照片
headerImg=''
# 标签
tags=''
# 父级文件夹路径
parentUrl='_posts'
# 添加标题或子标题
function addTitle(){
    read -p "Please enter your $*title:(dafault:${title})" title2
    if [[ $title2 != '' ]]
    then
        # 若传参为sub，说明为子标题
        if [[ $* = 'sub' ]]
        then
            subtitle='"'$title2'"'
        else
            title='"'$title2'"'
            subtitle=$title
        fi
    fi
}
# 添加头部图片地址
function addHeaderImg(){
    read -p "Please enter your headerImgUrl:" url
    if [[ $url != '' ]]
    then
        headerImg='"'$url'"'
    fi
}
# 添加tags
function addTags(){
    read -p "Please enter your Tags:(用逗号隔开)" tagsStr
    if [[ $tagsStr != '' ]]
    then
        array=(`echo $tagsStr | tr ',' ' '`)
        tags="\n"
        length=${#array[@]}
        for i in "${!array[@]}"; do
        tags="$tags  - ${array[i]}"
        if [[ $i -ne `expr $length - 1` ]]
        then
            tags="$tags""\n"
        fi
        done
        return
    else
        return
    fi
}
# 创建文件
function touchMd(){
cd $parentUrl
touch $postName
string=$*
OLD_IFS=”$IFS”
IFS=$'\n'
array=($string)
IFS="$OlD_IFS"
for i in "${array[@]}"; do
    echo "$i"
done > $postName
echo "成功创建文章！"
}
# 创建文章（主函数）
function createPost(){
    addTitle
    addTitle "sub"
    addHeaderImg
    addTags
    template="---
layout: post
title: "$title"
subtitle: "$subtitle"
date: `date +%Y-%m-%d\ %k:%M:%S`
author: "linbao"
header-img: ${headerImg}
catalog: true
tags: ${tags}
---"
    echo "$template"
    read -p "Are you sure you use this template?(y/n,default:y)" para
    case $para in
        [yY])
            touchMd "$template"
            ;;
        [nN])
            ;;
        *)
            touchMd "$template"
            ;;
    esac # end c
    exit 0
}

# 第一步判断有没有带文件名参数，没有直接exit 1
if [[ $1 = '' ]]
then
    echo 'Please enter title...'
    exit 1
fi

# 第二步展示文件名，不喜欢则exit 0，不然进主函数，走正常逻辑
read -p "Are you funking sure this is your post-name ${postName}:(y/n,default:y)" para
case $para in
	[yY])
        createPost
		;;
	[nN])
        exit 0
		;;
	*)
        createPost
        ;;
esac # end case

read -p "Please enter any key to exit" exit_shell
```

## 流程

1. 终端输入 `$ ./auto-generate-post.sh {post-title}`
   比如`$ ./auto-generate-post.sh write-template-by-shel`
   输出

```shell
Are you funking sure this is your post-name 2023-02-01-write-template-by-shel.md:(y/n,default:y)
```

2. 键入 y 或直接回车，输出

```shell
Please enter your title:(dafault:"write-template-by-shel")
```

可以自定义文章标题，若直接回车就使用文件名作为标题。

3. 键入回车，输出

```shell
Please enter your subtitle:(dafault:"write-template-by-shel")
```

，可以自定义子标题，用于在首页概述文章，直接回车就使用文章标题作为子标题。

4. 键入回车，输出

```shell
Please enter your headerImgUrl:
```

，可以设置文章的背景图片路径，可以不填，直接回车。

5. 键入回车，输出

```shell
Please enter your Tags:(用逗号隔开)
```

，可以给文章添加标签，如`技术、生活、想法`之类的，需要用`,`号隔开，也可以不写直接回车。

6. 键入回车，会输出文章的模版供你参考，如下

```shell
---
layout: post
title: "write-template-by-shel"
subtitle: "write-template-by-shel"
date: 2023-02-01 16:28:07
author: linbao
header-img:
catalog: true
tags:
---
```

其中 layout、author 和 catalog 是写死的，若想修改可以在代码中修改，最下面一行会让你确认是否使用这个模版，键入 y 或回车后会生成文章，如最上方图片的形式。

## end

作为 shell 的初学者，这代码应该写的不怎么样，但功能都实现了，有兴趣的朋友可以给我提 pr。
