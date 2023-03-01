---
layout: post
title: "简述nginx"
subtitle: "Talk About Nginx"
date: 2023-03-01 11:29:39
author: linbao
header-img:
catalog: true
tags:
  - nginx
---

## 一．Nginx 概述

Nginx 是一款自由的、开源的、高性能的 HTTP 和代理服务器。在 BSD-like 协议下发行。其特点是占有内存少，并发能力强，事实上 nginx 的并发能力在同类型的网页服务器中表现较好。
Nginx 可以作为一个 HTTP 服务器进行网站的发布处理，也可以作为代理服务器，比如，作为反向代理服务器实现负载均衡；作为正向代理服务器加速访问网络资源等。

## 二、几种代理模式

- 正向代理
- 反向代理
- 透明代理

```
一般实现代理技术的方式就是在服务器上安装代理服务软件，让其成为一个代理服务器，从而实现代理技术。
```

### （一）正向代理

注：一般情况下，如果没有特别说明，代理技术默认说的是正向代理技术。

#### 1、什么正向代理？

```
正向代理（forward）是一个位于客户端和原始服务器(origin server)之间的服务器，为了从原始服务器取得内容，客户端向代理服务器发送一个请求并指定目标，然后代理服务器向目标服务器转交请求并将获得的内容返回给客户端。
注意：客户端必须设置正向代理服务器，当然前提是要知道正向代理服务器的IP地址，还有代理程序的端口。
```

![正向代理-图1](/img/in-post/talk-about-nginx/正向代理-图1.png)

#### 2、正向代理的意义及场景

（1）用户访问本来无法访问的服务器 B 的资源
![正向代理-图2](/img/in-post/talk-about-nginx/正向代理-图2.png)
假设最初用户要访问服务器需要经过 R1 和 R2 两个路由器，那么当 R1 或者 R2 发生故障时，用户就无法访问服务器了。但是如果用户让代理服务器去代替自己访问服务器，由于代理服务器不用经过 R1 或 R2，而是通过其它的路由节点访问服务器 B，那么用户 A 就可以得到服务器 B 的数据了。

（2）加速访问服务器资源
假设用户到服务器，经过的路由器的链路是一个低带宽链路。而用户到代理服务器，代理服务器到目标服务器都是高带宽链路。那么很显然就起到了加速访问服务器资源的作用。
现在随着带宽流量的飞速发展，这种做法已经不像以前那么流行了。但在以前，很多人使用正向代理就是提速。

（3）Cache 作用
![正向代理-图3](/img/in-post/talk-about-nginx/正向代理-图3.png)
用户访问服务器某数据 F 之前，已经有人通过代理服务器访问过服务器上得数据 F，那么代理服务器会把数据 F 保存一段时间，如果有人正好取该数据 F，那么代理服务器不再访问服务器，而把缓存的数据 F 直接发给用户。这一技术在 Cache 中术语就叫 Cache 命中。如果有更多的像该用户的用户来访问代理服务器，那么这些用户都可以直接从代理服务器中取得数据 F，而不用千里迢迢的去服务器下载数据了。不光是正向代理，反向代理也使用了 Cache（缓存）技术。

（4）客户端访问授权
![正向代理-图4](/img/in-post/talk-about-nginx/正向代理-图4.png)
防火墙作为网关，用来过滤外网对其的访问。假设用户 A 和用户 B 都设置了代理服务器，用户 A 允许访问互联网，而用户 B 不允许访问互联网（这个在代理服务器 Z 上做限制）这样用户 A 因为授权，可以通过代理服务器访问到服务器 B，而用户 B 因为没有被代理服务器 Z 授权，所以访问服务器 B 时，数据包会被直接丢弃。

（5）隐藏访问者的行踪
可以看出配置代理服务器后，目标服务器并不知道访问自己的实际是用户，因为代理服务器代替用户去直接与服务器进行交互。

### （二）反向代理

#### 1、什么反向代理？

```
正向代理代理的是客户端，反向代理正好与之相反；
对于客户端而言代理服务器就像是原始服务器，并且客户端不需要进行任何特别的设置。客户端向反向代理的命名空间(name-space)中的内容发送普通请求，接着反向代理将判断向何处(原始服务器)转交请求，并将获得的内容返回给客户端。
```

#### 2、反向代理的意义及场景

（1）保护和隐藏原始资源服务器
![反向代理-图1](/img/in-post/talk-about-nginx/反向代理-图1.png)
假设在这个虚拟环境中，防火墙只允许代理服务器访问原始服务器。用户感知不到自己访问的是代理服务器而不是原始服务器，但实用际上是反向代理服务器处理用户的应答，从原始资源服务器中取得用户的需求资源，然后发送给用户。在这个过程中，防火墙和反向代理的共同作用保护了原始资源服务器，但用户并不知情。

（2）负载均衡
客户端发送的、nginx 反向代理服务器接收到的请求数量，称为负载量
请求数量按照一定的规则进行分发到不同的服务器处理的规则，就是一种均衡规则
所以将服务器接收到的请求按照规则分发的过程，称为负载均衡。
负载均衡在实际项目操作过程中，有硬件负载均衡和软件负载均衡两种，硬件负载均衡也称为硬负载，软件负载均衡是利用现有的技术结合主机硬件实现的一种消息队列分发机制
![反向代理-图2](/img/in-post/talk-about-nginx/反向代理-图2.png)

nginx 支持的负载均衡调度算法方式如下：

- weight 轮询（默认）：接收到的请求按照顺序逐一分配到不同的后端服务器，即使在使用过程中，某一台后端服务器宕机，nginx 会自动将该服务器剔除出队列，请求受理情况不会受到任何影响。 这种方式下，可以给不同的后端服务器设置一个权重值（weight），用于调整不同的服务器上请求的分配率；权重数据越大，被分配到请求的几率越大；该权重值，主要是针对实际工作环境中不同的后端服务器硬件配置进行调整的。
- ip_hash：每个请求按照发起客户端的 ip 的 hash 结果进行匹配，这样的算法下一个固定 ip 地址的客户端总会访问到同一个后端服务器，这也在一定程度上解决了集群部署环境下 session 共享的问题。
- fair：智能调整调度算法，动态的根据后端服务器的请求处理到响应的时间进行均衡分配，响应时间短处理效率高的服务器分配到请求的概率高，响应时间长处理效率低的服务器分配到的请求少；结合了前两者的优点的一种调度算法。但是需要注意的是 nginx 默认不支持 fair 算法，如果要使用这种调度算法，请安装 upstream_fair 模块
- url_hash：按照访问的 url 的 hash 结果分配请求，每个请求的 url 会指向后端固定的某个服务器，可以在 nginx 作为静态服务器的情况下提高缓存效率。同样要注意 nginx 默认不支持这种调度算法，要使用的话需要安装 nginx 的 hash 软件包

### （三）透明代理

```
透明代理的意思是客户端根本不需要知道有代理服务器的存在，它改编你的request fields（报文），并会传送真实IP。注意，加密的透明代理则是属于匿名代理，意思是不用设置使用代理了。
```

透明代理实践的例子就是时下很多公司使用的行为管理软件。如下图所示：
![透明代理-图1](/img/in-post/talk-about-nginx/透明代理-图1.png)
用户 A 和用户 B 并不知道行为管理设备充当透明代理行为，当用户 A 或用户 B 向服务器 A 或服务器 B 提交请求的时候，透明代理设备根据自身策略拦截并修改用户 A 或 B 的报文，并作为实际的请求方，向服务器 A 或 B 发送请求，当接收信息回传，透明代理再根据自身的设置把允许的报文发回至用户 A 或 B，如上图，如果透明代理设置不允许访问服务器 B，那么用户 A 或者用户 B 就不会得到服务器 B 的数据。

### （四）正向代理和透明代理的区别

- 正向代理时，客户端明确指明请求要交给正向代理服务，也就是说要设置代理。而透明代理对客户端是透明的，客户端不知道更不用设置透明代理，但是客户端发出去的请求都会被透明代理拦截。
- 正向代理为了实现某些额外的需求，有可能会修改请求报文，但按照 RFC 文档的要求，透明代理不会修改请求报文。
- 正向代理可以内网也可以外网，但透明代理都是内网。

## 三、Nginx 配置

在项目使用中，使用最多的三个核心功能是反向代理、负载均衡和静态服务器
这三个不同的功能的使用，都跟 nginx 的配置密切相关，nginx 服务器的配置信息主要集中在 nginx.conf 这个配置文件中，结构大致如下：

```
main                                # 全局配置
events {                            # nginx工作模式配置
}
http {                                # http设置
    ....
    server {                        # 服务器主机配置
        ....
        location {                    # 路由配置
            ....
        }
        location path {
            ....
        }
        location otherpath {
            ....
        }
    }
    server {
        ....
        location {
            ....
        }
    }
    upstream name {                    # 负载均衡配置
        ....
    }
}
```

如上述配置文件所示，主要由 6 个部分组成：

```
1.main：用于进行nginx全局信息的配置
2.events：用于nginx工作模式的配置
3.http：用于进行http协议信息的一些配置
4.server：用于进行服务器访问信息的配置
5.location：用于进行访问路由的配置
6.upstream：用于进行负载均衡的配置
```

### main 模块

```
# user nobody;
worker_processes 2;
# error_log logs/error.log
# error_log logs/error.log notice
# error_log logs/error.log info
# pid logs/nginx.pid
worker_rlimit_nofile 1024;
```

上述配置都是存放在 main 全局配置模块中的配置项

- user 用来指定 nginx worker 进程运行用户以及用户组，默认 nobody 账号运行
- worker_processes 指定 nginx 要开启的子进程数量，运行过程中监控每个进程消耗内存(一般几 M~几十 M 不等)根据实际情况进行调整，通常数量是 CPU 内核数量的整数倍
- error_log 定义错误日志文件的位置及输出级别【debug / info / notice / warn / error / crit】
- pid 用来指定进程 id 的存储文件的位置
- worker_rlimit_nofile 用于指定一个进程可以打开最多文件数量的描述

### events 模块

```
events {
    worker_connections 1024;
    multi_accept on;
    use epoll;
}
```

上述配置是针对 nginx 服务器的工作模式的一些操作配置

- worker_connections 指定最大可以同时接收的连接数量，这里一定要注意，最大连接数量是和 worker processes 共同决定的。
- multi_accept 配置指定 nginx 在收到一个新连接通知后尽可能多的接受更多的连接
- use epoll 配置指定了线程轮询的方法，如果是 linux2.6+，使用 epoll，如果是 BSD 如 Mac 请使用 Kqueue

### http 模块

作为 web 服务器，http 模块是 nginx 最核心的一个模块，配置项也是比较多的，项目中会设置到很多的实际业务场景，需要根据硬件信息进行适当的配置，常规情况下，使用默认配置即可！

```
http {
    ##
    # 基础配置
    ##

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    # server_tokens off;

    # server_names_hash_bucket_size 64;
    # server_name_in_redirect off;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ##
    # SSL证书配置
    ##

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # Dropping SSLv3, ref: POODLE
    ssl_prefer_server_ciphers on;

    ##
    # 日志配置
    ##

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    ##
    # Gzip 压缩配置
    ##

    gzip on;
    gzip_disable "msie6";

    # gzip_vary on;
    # gzip_proxied any;
    # gzip_comp_level 6;
    # gzip_buffers 16 8k;
    # gzip_http_version 1.1;
    # gzip_types text/plain text/css application/json application/javascript
    text/xml application/xml application/xml+rss text/javascript;

    ##
    # 虚拟主机配置
    ##

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
```

#### (1) 基础配置

- sendfile on：配置 on 让 sendfile 发挥作用，将文件的回写过程交给数据缓冲去完成，而不是放在应用中完成，这样的话在性能提升有有好处
- tc_nopush on：让 nginx 在一个数据包中发送所有的头文件，而不是一个一个单独发
- tcp_nodelay on：让 nginx 不要缓存数据，而是一段一段发送，如果数据的传输有实时性的要求的话可以配置它，发送完一小段数据就立刻能得到返回值，但是不要滥用哦
- keepalive_timeout 10：给客户端分配连接超时间，服务器会在这个时间过后关闭连接。一般设置时间较短，可以让 nginx 工作持续性更好
- client_header_timeout 10：设置请求头的超时时间
- client_body_timeout 10:设置请求体的超时时间
- send_timeout 10：指定客户端响应超时时间，如果客户端两次操作间隔超过这个时间，服务器就会关闭这个链接
- limit_conn_zone $binary_remote_addr zone=addr:5m ：设置用于保存各种 key 的共享内存的参数，
- limit_conn addr 100: 给定的 key 设置最大连接数
- server_tokens：虽然不会让 nginx 执行速度更快，但是可以在错误页面关闭 nginx 版本提示，对于网站安全性的提升有好处哦
- include /etc/nginx/mime.types：指定在当前文件中包含另一个文件的指令
- default_type application/octet-stream：指定默认处理的文件类型可以是二进制
- type_hash_max_size 2048：混淆数据，影响三列冲突率，值越大消耗内存越多，散列 key 冲突率会降低，检索速度更快；值越小 key，占用内存较少，冲突率越高，检索速度变慢

#### (2) 日志配置

- access_log logs/access.log：设置存储访问记录的日志
- error_log logs/error.log：设置存储记录错误发生的日志

#### (3) SSL 证书加密

- ssl_protocols：指令用于启动特定的加密协议，nginx 在 1.1.13 和 1.0.12 版本后默认是 ssl_protocols SSLv3 TLSv1 TLSv1.1 TLSv1.2，TLSv1.1 与 TLSv1.2 要确保 OpenSSL >= 1.0.1 ，SSLv3 现在还有很多地方在用但有不少被攻击的漏洞。
- ssl prefer server ciphers：设置协商加密算法时，优先使用我们服务端的加密套件，而不是客户端浏览器的加密套件

#### (4) 压缩配置

- gzip 是告诉 nginx 采用 gzip 压缩的形式发送数据。这将会减少我们发送的数据量。
- gzip_disable 为指定的客户端禁用 gzip 功能。我们设置成 IE6 或者更低版本以使我们的方案能够广泛兼容。
- gzip_static 告诉 nginx 在压缩资源之前，先查找是否有预先 gzip 处理过的资源。这要求你预先压缩你的文件（在这个例子中被注释掉了），从而允许你使用最高压缩比，这样 nginx 就不用再压缩这些文件了（想要更详尽的 gzip_static 的信息，请点击这里）。
- gzip_proxied 允许或者禁止压缩基于请求和响应的响应流。我们设置为 any，意味着将会压缩所有的请求。
- gzip_min_length 设置对数据启用压缩的最少字节数。如果一个请求小于 1000 字节，我们最好不要压缩它，因为压缩这些小的数据会降低处理此请求的所有进程的速度。
- gzip_comp_level 设置数据的压缩等级。这个等级可以是 1-9 之间的任意数值，9 是最慢但是压缩比最大的。我们设置为 4，这是一个比较折中的设置。
- gzip_type 设置需要压缩的数据格式。上面例子中已经有一些了，你也可以再添加更多的格式。

#### (5) 文件缓存配置

- open_file_cache 打开缓存的同时也指定了缓存最大数目，以及缓存的时间。我们可以设置一个相对高的最大时间，这样我们可以在它们不活动超过 20 秒后清除掉。
- open_file_cache_valid 在 open_file_cache 中指定检测正确信息的间隔时间。
- open_file_cache_min_uses 定义了 open_file_cache 中指令参数不活动时间期间里最小的文件数。
- open_file_cache_errors 指定了当搜索一个文件时是否缓存错误信息，也包括再次给配置中添加文件。我们也包括了服务器模块，这些是在不同文件中定义的。如果你的服务器模块不在这些位置，你就得修改这一行来指定正确的位置。

### server 模块

srever 模块配置是 http 模块中的一个子模块，用来定义一个虚拟访问主机，也就是一个虚拟服务器的配置信息

```
server {
    listen        80;
    server_name localhost    192.168.1.100;
root        /nginx/www;
    index        index.php index.html index.html;
    charset        utf-8;
    access_log    logs/access.log;
    error_log    logs/error.log;
    ......
}
```

核心配置信息如下：

- server：一个虚拟主机的配置，一个 http 中可以配置多个 server
- listen：监听端口，也可以加上 IP 地址；如， listen 127.0.0.1:80
- server_name：用来指定 ip 地址或者域名，多个配置之间用空格分隔。

```
注： -虚拟服务器的识别标志，匹配到特定的server块，转发到对应的应用服务器中去
    -当listen出现了ip时，server_name就失去了意义
```

- root：表示整个 server 虚拟主机内的根目录，所有当前主机中 web 项目的根
- index：定义用户访问 web 网站时的默认首页
- charset：用于设置 www/路径中配置的网页的默认编码格式
- access_log：用于指定该虚拟主机服务器中的访问记录日志存放路径
- error_log：用于指定该虚拟主机服务器中访问错误日志的存放路径

### location 模块

location 模块是 nginx 配置中出现最多的一个配置，主要用于配置路由访问信息
在路由访问信息配置中关联到反向代理、负载均衡等等各项功能，所以 location 模块也是一个非常重要的配置模块

#### 基本配置

```
http://127.0.0.1:80/test/api
location /test {
root    /nginx/www;
#alias  /nginx/www;
    index    index.php index.html index.htm;
}

```

- location：通过指定模式来与客户端请求的 URI 相匹配
- root：上层目录的定义
- alias：目录别名的定义
- index：在不指定访问具体资源时，默认展示的资源文件列表

```
root与alias主要区别
在于nginx如何解释location后面的uri，这会使两者分别以不同的方式将请求映射到服务器文件上。
root的处理结果是：root路径 ＋ location路径
alias的处理结果是：使用alias路径替换location路径
alias是一个目录别名的定义，root则是最上层目录的定义。
还有一个重要的区别是alias后面必须要用“/”结束，否则会找不到文件的，而root则可有可无。
例如：
# 如果一个请求的URI是/t/a.html时，web服务器将会返回服务器上的/www/root/html/t/a.html的文件。
location ^~ /t/ {
	root /www/root/html/;
}

# 如果一个请求的URI是/t/a.html时，web服务器将会返回服务器上的/www/root/html/new_t/a.html的文件。
# 注意这里是new_t，因为alias会把location后面配置的路径丢弃掉，把当前匹配到的目录指向到指定的目录。
location ^~ /t/ {
	alias /www/root/html/new_t/;
}
```

location 配置

```
语法规则（按优先级）
=        表示精确匹配，优先级最高
^~      表示uri以某个常规字符串开头，用于匹配url路径（而且不对url做编码处理，例如请求/static/20%/aa，可以被规则^~ /static/ /aa 匹配到（注意是空格））
~        表示区分大小写的正则匹配
~*      表示不区分大小写的正则匹配
!~       表示区分大小写不匹配的正则
!~*     表示不区分大小写不匹配的正则
/         表示通用匹配，任何请求都会匹配到
```

#### 反向代理配置方式

通过反向代理代理服务器访问模式，通过 proxy_set 配置让客户端访问透明化

```
location / {
    proxy_pass http://localhost:8888;
    proxy_set_header X-real-ip $remote_addr;
    proxy_set_header Host $http_host;
}
```

### upstream 模块

upstream 模块主要负责负载均衡的配置，通过默认的轮询调度方式来分发请求到后端服务器
简单的配置方式如下

```
upstream name {
    ip_hash;
    server 192.168.1.100:8000;
    server 192.168.1.100:8001 down;
    server 192.168.1.100:8002 max_fails=3;
    server 192.168.1.100:8003 fail_timeout=20s;
    server 192.168.1.100:8004 max_fails=3 fail_timeout=20s;
}
```

核心配置信息如下

```
ip_hash：指定请求调度算法，默认是weight权重轮询调度，可以指定
server host:port：分发服务器的列表配置
-- down：表示该主机暂停服务
-- max_fails：表示失败最大次数，超过失败最大次数暂停服务
-- fail_timeout：表示如果请求受理失败，暂停指定的时间之后重新发起请求
```
