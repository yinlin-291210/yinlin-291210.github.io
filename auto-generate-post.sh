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