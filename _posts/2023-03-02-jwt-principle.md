---
layout: post
title: "jwt认证令牌的原理介绍"
subtitle: "JWT"
date: 2023-03-02 16:12:19
author: linbao
header-img:
catalog: true
tags:
  - 认证
---

随着前后端分离的发展，以及数据中心的建立，越来越多的公司会创建一个中心服务器，服务于各种产品线。

而这些产品线上的产品，它们可能有着各种终端设备，包括但不仅限于浏览器、桌面应用、移动端应用、平板应用、甚至智能家居

![image-20200422163727151](/img/in-post/jwt-principle/image-20200422163727151.png)

> 实际上，不同的产品线通常有自己的服务器，产品内部的数据一般和自己的服务器交互。
>
> 但中心服务器仍然有必要存在，因为同一家公司的产品总是会存在共享的数据，比如用户数据

这些设备与中心服务器之间会进行 http 通信

一般来说，中心服务器至少承担着认证和授权的功能，例如登录：各种设备发送消息到中心服务器，然后中心服务器响应一个身份令牌

当这种结构出现后，就出现一个问题：它们之间还能使用传统的 cookie 方式传递令牌信息吗？

其实，也是可以的，因为 cookie 在传输中无非是一个消息头而已，只不过浏览器对这个消息头有特殊处理罢了。

但浏览器之外的设备肯定不喜欢 cookie，因为浏览器有着对 cookie 完善的管理机制，但是在其他设备上，就需要开发者自己手动处理了。

jwt 的出现就是为了解决这个问题

# 概述

jwt 全称`Json Web Token`，强行翻译过来就是`json格式的互联网令牌`

它要解决的问题，就是为多种终端设备，提供**统一的、安全的**令牌格式

![image-20200422165350268](/img/in-post/jwt-principle/image-20200422165350268.png)

因此，jwt 只是一个令牌格式而已，你可以把它存储到 cookie，也可以存储到 localstorage，没有任何限制！

同样的，对于传输，你可以使用任何传输方式来传输 jwt，一般来说，我们会使用消息头来传输它

比如，当登录成功后，服务器可以给客户端响应一个 jwt：

```
HTTP/1.1 200 OK
...

set-cookie:token=jwt令牌

authorization:jwt令牌

...

{..., token:jwt令牌}

```

可以看到，jwt 令牌可以出现在响应的任何一个地方，客户端和服务器自行约定即可。

> 当然，它也可以出现在响应的多个地方，比如为了充分利用浏览器的 cookie，同时为了照顾其他设备，也可以让 jwt 出现在`set-cookie`和`authorization或body`中，尽管这会增加额外的传输量。

当客户端拿到令牌后，它要做的只有一件事：存储它。

当后续请求发生时，你只需要将它作为请求的一部分发送到服务器即可。

虽然 jwt 没有明确要求应该如何附带到请求中，但通常我们会使用如下的格式：

```

GET /api/resources HTTP/1.1
...
authorization: bearer jwt令牌
...

```

> 这种格式是 OAuth2 附带 token 的一种规范格式
>
> 至于什么是 OAuth2，那是另一个话题了,有兴趣的可以下去了解一下。

这样一来，服务器就能够收到这个令牌了，通过对令牌的验证，即可知道该令牌是否有效。

它们的完整交互流程是非常简单清晰的

![image-20200422172837190](/img/in-post/jwt-principle/image-20200422172837190.png)

# 令牌的组成

为了保证令牌的安全性，jwt 令牌由三个部分组成，分别是：

1. header：令牌头部，记录了整个令牌的类型和签名算法
2. payload：令牌负荷，记录了保存的主体信息，比如你要保存的用户信息就可以放到这里
3. signature：令牌签名，按照头部固定的签名算法对整个令牌进行签名，该签名的作用是：保证令牌不被伪造和篡改

它们组合而成的完整格式是：`header.payload.signature`

比如，一个完整的 jwt 令牌如下：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE1ODc1NDgyMTV9.BCwUy3jnUQ_E6TqCayc7rCHkx-vxxdagUwPOWqwYCFc
```

它各个部分的值分别是：

- `header：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
- `payload：eyJmb28iOiJiYXIiLCJpYXQiOjE1ODc1NDgyMTV9`
- `signature: BCwUy3jnUQ_E6TqCayc7rCHkx-vxxdagUwPOWqwYCFc`

下面分别对每个部分进行说明

## header

它是令牌头部，记录了整个令牌的类型和签名算法

它的格式是一个`json`对象，如下：

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

该对象记录了：

- alg：signature 部分使用的签名算法，通常可以取两个值
  - HS256：一种对称加密算法，使用同一个秘钥对 signature 加密解密
  - RS256：一种非对称加密算法，使用私钥加密，公钥解密
- typ：整个令牌的类型，固定写`JWT`即可

设置好了`header`之后，就可以生成`header`部分了

具体的生成方式及其简单，就是把`header`部分使用`base64 url`编码即可

> `base64 url`不是一个加密算法，而是一种编码方式，它是在`base64`算法的基础上对`+`、`=`、`/`三个字符做出特殊处理的算法
>
> 而`base64`是使用 64 个可打印字符来表示一个二进制数据.

浏览器提供了`btoa`函数，可以完成这个操作：

```js
window.btoa(
  JSON.stringify({
    alg: "HS256",
    typ: "JWT",
  })
);
// 得到字符串：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

同样的，浏览器也提供了`atob`函数，可以对其进行解码：

```js
window.atob("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
// 得到字符串：{"alg":"HS256","typ":"JWT"}
```

> nodejs 中没有提供这两个函数，可以安装第三方库`atob`和`btoa`搞定
>
> 或者，手动搞定

## payload

这部分是 jwt 的主体信息，它仍然是一个 JSON 对象，它可以包含以下内容：

```json
{
  "ss"："发行者",
	"iat"："发布时间",
	"exp"："到期时间",
	"sub"："主题",
	"aud"："听众",
	"nbf"："在此之前不可用",
  "jti"："JWT ID"
}
```

以上属性可以全写，也可以一个都不写，它只是一个规范，就算写了，也需要你在将来验证这个 jwt 令牌时手动处理才能发挥作用

上述属性表达的含义分别是：

- ss：发行该 jwt 的是谁，可以写公司名字，也可以写服务名称
- iat：该 jwt 的发放时间，通常写当前时间的时间戳
- exp：该 jwt 的到期时间，通常写时间戳
- sub：该 jwt 是用于干嘛的
- aud：该 jwt 是发放给哪个终端的，可以是终端类型，也可以是用户名称，随意一点
- nbf：一个时间点，在该时间点到达之前，这个令牌是不可用的
- jti：jwt 的唯一编号，设置此项的目的，主要是为了防止重放攻击（重放攻击是在某些场景下，用户使用之前的令牌发送到服务器，被服务器正确的识别，从而导致不可预期的行为发生）

当用户登陆成功之后，我可能需要把用户的一些信息写入到 jwt 令牌中，比如用户 id、账号等等（密码就算了）

其实 payload 这一部分只是一个 json 对象而已，你可以向对象中加入任何想要加入的信息

比如，下面的 json 对象仍然是一个有效的 payload

```json
{
  "foo": "bar",
  "iat": 1587548215
}
```

`foo: bar`是我们自定义的信息，`iat: 1587548215`是 jwt 规范中的信息

最终，payload 部分和 header 一样，需要通过`base64 url`编码得到：

```js
window.btoa(
  JSON.stringify({
    foo: "bar",
    iat: 1587548215,
  })
);
// 得到字符串：eyJmb28iOiJiYXIiLCJpYXQiOjE1ODc1NDgyMTV9
```

## signature

这一部分是 jwt 的签名，正是它的存在，保证了整个 jwt 不被篡改

这部分的生成，是对前面两个部分的编码结果，按照头部指定的方式进行加密

比如：头部指定的加密方法是`HS256`，前面两部分的编码结果是`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE1ODc1NDgyMTV9`

则第三部分就是用对称加密算法`HS256`对字符串`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE1ODc1NDgyMTV9`进行加密，当然你得指定一个秘钥，比如`shhhhh`

```js
HS256(
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE1ODc1NDgyMTV9`,
  "shhhhh"
);
// 得到：BCwUy3jnUQ_E6TqCayc7rCHkx-vxxdagUwPOWqwYCFc
```

最终，将三部分组合在一起，就得到了完整的 jwt

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE1ODc1NDgyMTV9.BCwUy3jnUQ_E6TqCayc7rCHkx-vxxdagUwPOWqwYCFc
```

由于签名使用的秘钥保存在服务器，这样一来，客户端就无法伪造出签名，因为它拿不到秘钥。

换句话说，之所以说无法伪造 jwt，就是因为第三部分的存在。

而前面两部分并没有加密，只是一个编码结果而已，可以认为几乎是明文传输

> 这不会造成太大的问题，因为既然用户登陆成功了，它当然有权力查看自己的用户信息
>
> 甚至在某些网站，用户的基本信息可以被任何人查看
>
> 你要保证的，是不要把敏感的信息存放到 jwt 中，比如密码

jwt 的`signature`可以保证令牌不被伪造，那如何保证令牌不被篡改呢？

比如，某个用户登陆成功了，获得了 jwt，但他人为的篡改了`payload`，比如把自己的账户余额修改为原来的两倍，然后重新编码出`payload`发送到服务器，服务器如何得知这些信息被篡改过了呢？

这就要说到令牌的验证了

# 令牌的验证

![image-20200422172837190](/img/in-post/jwt-principle/image-20200422172837190.png)

令牌在服务器组装完成后，会以任意的方式发送到客户端

客户端会把令牌保存起来，后续的请求会将令牌发送给服务器

而服务器需要验证令牌是否正确，如何验证呢？

首先，服务器要验证这个令牌是否被篡改过，验证方式非常简单，就是对`header+payload`用同样的秘钥和加密算法进行重新加密

然后把加密的结果和传入 jwt 的`signature`进行对比，如果完全相同，则表示前面两部分没有动过，就是自己颁发的，如果不同，肯定是被篡改过了。

```
传入的header.传入的payload.传入的signature
新的signature = header中的加密算法(传入的header.传入的payload, 秘钥)
验证：新的signature == 传入的signature
```

当令牌验证为没有被篡改后，服务器可以进行其他验证：比如是否过期等等，这些就因情况而定了

注意：这些验证都需要服务器手动完成，没有哪个服务器会给你进行自动验证，当然，你可以借助第三方库来完成这些操作

# 总结

最后，总结一下 jwt 的特点：

- jwt 本质上是一种令牌格式。它和终端设备无关，同样和服务器无关，甚至与如何传输无关，它只是规范了令牌的格式而已
- jwt 由三部分组成：header、payload、signature。主体信息在 payload
- jwt 难以被篡改和伪造。这是因为有第三部分的签名存在。
