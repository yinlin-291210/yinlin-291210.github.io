# [Hux Blog](https://huangxuan.me)

> I never expect this becomes popular.

![](http://huangxuan.me/img/blog-desktop.jpg)

## 本博客基于 [Hux Blog](https://huangxuan.me)

### 开始

1. 确保你的环境安装有[Ruby](https://www.ruby-lang.org/en/)、[Bundler](https://bundler.io/)、[Jekyll](https://jekyllrb.com/)。

2. 安装成功后，英文好的同学可以直接看 hux blog 的文档，英文不好的同学建议不要看上面的中文文档，比较老，坑也比较多，可以先 fork 我的代码，再按下述配置。

3. 通过`Gemfile`下载依赖

```sh
$ bundle install
```

4. 在本地启动服务（默认端口为:4000）

```sh
$ bundle exec jekyll serve # alternatively, npm start
```

5. 在`_config.yml`编辑基本配置

```yml
# Site settings
title: 林宝の加油站 # 站点标题
SEOTitle: 林宝の加油站 | linbao Blog # 对搜索引擎友好标题
header-img: img/home-bg.jpg # 默认文章背景图片路径
email: linyin857@gmail.com # 个人邮箱
description: "share my mind" # 个人描述
keyword: "林宝の加油站, linbao, linbaofangxinfei, 林宝放心飞, 博客, 个人网站, 互联网, Web, JavaScript, React, React Native, Vue, 前端, Mind" # 可索引关键字
url: "https://yinlin-291210.github.io/" # your host, for absolute URL
baseurl: "" # for example, '/blog' if your blog hosted on 'host/blog'
```

记得修改后，需要重启服务才能生效。

6. 更多配置信息应参考[Hux Blog](https://huangxuan.me)或[Jekyll](https://jekyllrb.com/)官网。

### 如何推送

不同于`hexo`，`jekyll`不需要本地编译，你在本地看到的效果就是最终呈现在`github pages`上的效果  
开发者只需关注自己的文章内容，写好文章通过`git`推上去后，`github pages`会自动将文章编译成 html 推送到博客网站上。

### 如何快速创建文章

jekyll 是有文章命名规范的，参考[创建文章脚本](./auto-generate-post.sh)和[文档](https://yinlin-291210.github.io/2023/01/31/write-template-by-shell/)，会自动生成符合规范的文章，默认只会创建`_posts`下的文章。

### 为什么引入的图片不显示

图片的路径（除外链）应该参考编译后的目录结构，由于文章编译后的目录结构比较复杂，因此推荐将图片存放在`img/in-post`下，根据文件名区分，同时，博客的所有图片都应放在`img`文件夹下。

## License

Apache License 2.0.
Copyright (c) 2015-present Huxpro

Hux Blog is derived from [Clean Blog Jekyll Theme (MIT License)](https://github.com/BlackrockDigital/startbootstrap-clean-blog-jekyll/)
Copyright (c) 2013-2016 Blackrock Digital LLC.
