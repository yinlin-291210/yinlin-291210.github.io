---
layout: post
title: "浏览器缓存之强缓存与协商缓存"
subtitle: "Browser Cache"
date: 2023-03-01 22:01:07
author: linbao
header-img:
catalog: true
tags:
  - browser
  - http
---

# 浏览器缓存之强缓存与协商缓存

浏览器缓存是浏览器在本地磁盘对用户最近请求过的文档进行存储，当访问者再次访问同一页面时，浏览器就可以直接从本地磁盘加载文档。 浏览器缓存主要分为强缓存和协商缓存。

### 强缓存

当请求资源的时，如果是之前请求过的并使用强缓存，那么在过期时间内将不会发送本次请求向服务器获取资源，而是直接从浏览器缓存中获取（不管资源是否改动）。过期了将重新从服务器获取，并再次强缓存。

第一次访问页面，浏览器会根据服务器返回的 response Header 来判断是否对资源进行缓存，如果响应头中有 cache-control 或 expires 字段，代表该资源是强缓存。

强制缓存直接减少请求数，是提升最大的缓存策略。

#### Expires

是 HTTP/1.0 控制网页缓存的字段，值为一个时间戳，服务器返回该资源缓存的到期时间。

```ini
expires: Fri, 20 Jan 2023 02:18:25 GMT
```

但 Expires 有个缺点，就是它判断是否过期是用本地时间来判断的，本地时间是可以自己修改的。

#### Cache-Control

为了解决 Expires 的缺点，在 HTTP/1.1 中，增加了一个字段 Cache-control，该字段的 max-age 表示资源缓存的最大有效时间，在该时间内，客户端不需要向服务器发送请求。
这两者的区别就是前者是绝对时间，而后者是相对时间。

```ini
cache-control: max-age=3600
// 在 3600 秒后该资源过期，如果未超过过期时间，浏览器会直接使用缓存结果，强制缓存生效
```

常见 cache-control 取值：

- max-age：最大有效时间。
- no-cache：要求客户端缓存，只不过每次都会向服务器发起请求，来验证当前缓存的有效性。
- no-store：不使用缓存。
- public：所有的内容都可以被缓存（客户端和代理服务器）。
- private：默认值。所有的内容只有客户端才可以缓存，代理服务器不能缓存。

这里有个问题，就是 max-age = 0 ，和 no-cache 实际上看起来两者效果是一样的，但是二者有什么区别呢，我理解的是，no-cache 直接不进行强缓存，让你去走协商缓存，而 max-age=0 是进行强缓存，但是过期了，需要更新。

注意：为了兼容 HTTP/1.0 和 HTTP/1.1，expires 和 cache-control 一般都会同时设置。当 Cache-Control 与 expires 两者都存在时，Cache-Control 优先级更高。

#### memory cache 与 disk cache

memory cache：表示缓存来自内存，常规情况下，浏览器的 TAB 关闭后该次浏览的 memory cache 便会失效。而如果极端情况下 (例如一个页面的缓存就占用了超级多的内存)，那可能在 TAB 没关闭之前，排在前面的缓存就已经失效了。

disk cache：表示缓存来自硬盘，因此它是持久存储的，是实际存在于文件系统中的，绝大部分的缓存都来自 disk cache。而且它允许相同的资源在跨会话，甚至跨站点的情况下使用。在浏览器自动清理时，会自动清理缓存。

两者都属于强缓存，主要区别在于存储位置和读取速度上

- memory cache 表示缓存来自内存， disk cache 表示缓存来自硬盘，因此 memory cache 要比 disk cache 快的多。
- memory cache：当前 tab 页关闭后，数据将不存在（资源被释放掉了），再次打开相同的页面时，原来的 memory cache 会变成 disk cache。
- disk cache：关闭 tab 页甚至关闭浏览器后，数据依然存在，下次打开仍然会是 disk cache。

### 协商缓存

协商缓存在请求数上和没有缓存是一致的，但如果是 304 的话，返回的仅仅是一个状态码而已，并没有实际的文件内容，因此 在响应体体积上的节省是它的优化点。

查询协商缓存条件：

- 没有 Cache-Control 和 Expires
- Cache-Control 和 Expires 过期了
- Cache-Control 的属性设置为 no-cache

当请求的时候符合以上条件时，浏览器就会进入协商缓存阶段，如果命中就返回 304 从缓存中取资源。如果没有命中缓存，服务器就直接发送新的资源状态码为 200。负责协商缓存的头信息是`Last-Modified/If-Modified-Since`和`ETag/If-None-Match。`

#### Last-Modified & If-Modified-Since

Last-Modified:是服务器响应请求时，返回该资源文件在服务器最后被修改的时间，从`Respnse Headers`上获取。

If-Modified-Since:则是客户端再次发起该请求时，`Request Headers`携带上次请求返回的 Last-Modified 值。

Last-Modified 的验证流程：

1. 第一次访问页面时，服务器的响应头会返回 Last-Modified 字段。
2. 客户端再次发起该请求时，请求头 If-Modified-Since 字段会携带上次请求返回的 Last-Modified 值。
3. 服务器根据 if-modified-since 的值，与该资源在服务器最后被修改时间做对比，若服务器上的时间大于 Last-Modified 的值，则重新返回资源，返回 200，表示资源已更新；反之则返回 304，代表资源未更新，可继续使用缓存。

Last-Modified 有一定的缺陷：

- 如果资源更新的速度是秒以下单位，那么该缓存是不能被使用的，因为它的时间单位最低是秒。
- 如果文件是通过服务器动态生成的，那么该方法的更新时间永远是生成的时间，尽管文件可能没有变化，所以起不到缓存的作用。

#### `Etag` & If-None-Match

为了解决 Last-Modified 和 if-modified-since 的缺陷，出现了一组新的字段 `Etag `和 If-None-Match。`Etag` 优先级高于 Last-Modified，若 `Etag` 与 Last-Modified 两者同时存在，服务器优先校验 `Etag` 。

`ETag`：当前资源文件的一个唯一标识(由服务器生成)，若文件内容发生变化该值就会改变。

If-None-Match:则是客户端再次发起该请求时，`Request Headers`携带上次请求返回的`ETag`值。

`ETag `的验证流程：

1. 第一次访问页面时，服务器的响应头会返回 `etag `字段。
2. 客户端再次发起该请求时，请求头 If-None-Match 字段会携带上次请求返回的 `etag `值。
3. 服务器根据 If-None-Match 的值，与该资源在服务器的`Etag`值做对比，若值发生变化，状态码为 200，表示资源已更新；反之则返回 304，代表资源无更新，可继续使用缓存。

![](sp20230203_100432_793.png)

### 缓存的应用模式

#### 模式 1：不常变化的资源

```ini
Cache-Control: max-age=31536000
```

通常在处理这类资源资源时，给它们的 Cache-Control 配置一个很大的 max-age=31536000 (一年)，这样浏览器之后请求相同的 URL 会命中强制缓存。而为了解决更新的问题，就需要在文件名(或者路径)中添加 hash， 版本号等动态字符，之后更改动态字符，达到更改引用 URL 的目的，从而让之前的强制缓存失效 (其实并未立即失效，只是不再使用了而已)。

#### 模式 2：经常变化的资源

```ini
Cache-Control: no-cache
```

这里的资源不单单指静态资源，也可能是网页资源，例如博客、文章等。这类资源的特点是：URL 不能变化，但内容经常变化。我们可以设置 Cache-Control: no-cache 来使浏览器每次请求都必须找服务器验证资源是否有效。

### 用户行为对浏览器缓存的影响：

打开网页，地址栏输入地址： 查找 disk cache 中是否有匹配。如有则使用；如没有则发送网络请求。
普通刷新 (`F5`)：因为 TAB 并没有关闭，因此 memory cache 是可用的，会被优先使用(如果匹配的话)。其次才是 disk cache。
强制刷新 (`Ctrl + F5`)：浏览器不使用缓存,从服务器请求资源
![](f07f7b3598667.png)

### 疑问：

Cache-Control 除了`Respnse Headers`可以设置外，`Request Headers`也可以设置，两个 Cache-Control 有什么区别？同时都设置时效果是怎样的？
