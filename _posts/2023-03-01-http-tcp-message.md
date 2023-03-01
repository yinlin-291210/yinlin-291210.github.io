---
layout: post
title: "Http协议中使用的TCP协议报文简述-三次握手"
subtitle: "HTTP TCP Message"
date: 2023-03-01 11:17:27
author: linbao
header-img:
catalog: true
tags:
  - http
  - tcp
---

# Http 协议中使用的 TCP 协议报文简述-三次握手

三次握手 Three-way Handshake

一个虚拟连接的建立是通过三次握手来实现的

1. (B) --> [SYN] --> (A)

假如服务器 A 和客户机 B 通讯. 当 A 要和 B 通信时，B 首先向 A 发一个 SYN (Synchronize) 标记的包，告诉 A 请求建立连接.

注意: 一个 SYN 包就是仅 SYN 标记设为 1 的 TCP 包(参见 TCP 包头 Resources). 认识到这点很重要，只有当 A 受到 B 发来的 SYN 包，才可建立连接，除此之外别无他法。因此，如果你的防火墙丢弃所有的发往外网接口的 SYN 包，那么你将不能让外部任何主机主动建立连接。

2. (B) <-- [SYN/ACK] <--(A)

接着，A 收到后会发一个对 SYN 包的确认包(SYN/ACK)回去，表示对第一个 SYN 包的确认，并继续握手操作.

注意: SYN/ACK 包是仅 SYN 和 ACK 标记为 1 的包.

3. (B) --> [ACK] --> (A)

B 收到 SYN/ACK 包,B 发一个确认包(ACK)，通知 A 连接已建立。至此，三次握手完成，一个 TCP 连接完成

Note: ACK 包就是仅 ACK 标记设为 1 的 TCP 包. 需要注意的是当三此握手完成、连接建立以后，TCP 连接的每个包都会设置 ACK 位

这就是为何连接跟踪很重要的原因了. 没有连接跟踪,防火墙将无法判断收到的 ACK 包是否属于一个已经建立的连接.一般的包过滤(Ipchains)收到 ACK 包时,会让它通过(这绝对不是个好主意). 而当状态型防火墙收到此种包时，它会先在连接表中查找是否属于哪个已建连接，否则丢弃该包

四次握手 Four-way Handshake

四次握手用来关闭已建立的 TCP 连接

1. (B) --> ACK/FIN --> (A)

2. (B) <-- ACK <-- (A)

3. (B) <-- ACK/FIN <-- (A)

4. (B) --> ACK --> (A)

注意: 由于 TCP 连接是双向连接, 因此关闭连接需要在两个方向上做。ACK/FIN 包(ACK 和 FIN 标记设为 1)通常被认为是 FIN(终结)包.然而, 由于连接还没有关闭, FIN 包总是打上 ACK 标记. 没有 ACK 标记而仅有 FIN 标记的包不是合法的包，并且通常被认为是恶意的

连接复位 Resetting a connection

四次握手不是关闭 TCP 连接的唯一方法. 有时,如果主机需要尽快关闭连接(或连接超时,端口或主机不可达),RST (Reset)包将被发送. 注意在，由于 RST 包不是 TCP 连接中的必须部分, 可以只发送 RST 包(即不带 ACK 标记). 但在正常的 TCP 连接中 RST 包可以带 ACK 确认标记

请注意 RST 包是可以不要收到方确认的?

无效的 TCP 标记 Invalid TCP Flags

到目前为止，你已经看到了 SYN, ACK, FIN, 和 RST 标记. 另外，还有 PSH (Push) 和 URG (Urgent)标记.

最常见的非法组合是 SYN/FIN 包. 注意:由于 SYN 包是用来初始化连接的, 它不可能和 FIN 和 RST 标记一起出现. 这也是一个恶意攻击.

由于现在大多数防火墙已知 SYN/FIN 包, 别的一些组合,例如 SYN/FIN/PSH, SYN/FIN/RST, SYN/FIN/RST/PSH。很明显，当网络中出现这种包时，很你的网络肯定受到攻击了。

别的已知的非法包有 FIN (无 ACK 标记)和"NULL"包。如同早先讨论的，由于 ACK/FIN 包的出现是为了关闭一个 TCP 连接，那么正常的 FIN 包总是带有 ACK 标记。"NULL"包就是没有任何 TCP 标记的包(URG,ACK,PSH,RST,SYN,FIN 都为 0)。

到目前为止，正常的网络活动下，TCP 协议栈不可能产生带有上面提到的任何一种标记组合的 TCP 包。当你发现这些不正常的包时，肯定有人对你的网络不怀好意。

UDP (用户数据包协议 User Datagram Protocol) TCP 是面向连接的，而 UDP 是非连接的协议。UDP 没有对接受进行确认的标记和确认机制。对丢包的处理是在应用层来完成的。(or accidental arrival).

此处需要重点注意的事情是：在正常情况下，当 UDP 包到达一个关闭的端口时，会返回一个 UDP 复位包。由于 UDP 是非面向连接的, 因此没有任何确认信息来确认包是否正确到达目的地。因此如果你的防火墙丢弃 UDP 包，它会开放所有的 UDP 端口(?)。

由于 Internet 上正常情况下一些包将被丢弃，甚至某些发往已关闭端口(非防火墙的)的 UDP 包将不会到达目的，它们将返回一个复位 UDP 包。

因为这个原因，UDP 端口扫描总是不精确、不可靠的。

看起来大 UDP 包的碎片是常见的 DOS (Denial of Service)攻击的常见形式 (这里有个 DOS 攻击的例子，http://grc.com/dos/grcdos.htm ).

ICMP (网间控制消息协议 Internet Control Message Protocol) 如同名字一样， ICMP 用来在主机/路由器之间传递控制信息的协议。 ICMP 包可以包含诊断信息(ping, traceroute - 注意目前 unix 系统中的 traceroute 用 UDP 包而不是 ICMP)，错误信息(网络/主机/端口 不可达 network/host/port unreachable), 信息(时间戳 timestamp, 地址掩码 address mask request, etc.)，或控制信息 (source quench, redirect, etc.) 。

你可以在http://www.iana.org/assignments/icmp-parameters中找到ICMP包的类型。

尽管 ICMP 通常是无害的，还是有些类型的 ICMP 信息需要丢弃。

Redirect (5), Alternate Host Address (6), Router Advertisement (9) 能用来转发通讯。

Echo (8), Timestamp (13) and Address Mask Request (17) 能用来分别判断主机是否起来，本地时间 和地址掩码。注意它们是和返回的信息类别有关的。它们自己本身是不能被利用的，但它们泄露出的信息对攻击者是有用的。

ICMP 消息有时也被用来作为 DOS 攻击的一部分(例如：洪水 ping flood ping,死 ping ?

呵呵，有趣 ping of death)?/p>

包碎片注意 A Note About Packet Fragmentation

如果一个包的大小超过了 TCP 的最大段长度 MSS (Maximum Segment Size) 或 MTU (Maximum Transmission Unit)，能够把此包发往目的的唯一方法是把此包分片。由于包分片是正常的，它可以被利用来做恶意的攻击。

因为分片的包的第一个分片包含一个包头，若没有包分片的重组功能，包过滤器不可能检测附加的包分片。典型的攻击 Typical attacks involve in overlapping the packet data in which packet header is 典型的攻击 Typical attacks involve in overlapping the packet data in which packet header isnormal until is it overwritten with differentdestination IP (or port) thereby bypassing firewall rules。包分片能作为 DOS 攻击的一部分，它可以 crash older IP stacks 或涨死 CPU 连接能力。

Netfilter/Iptables 中的连接跟踪代码能自动做分片重组。它仍有弱点，可能受到饱和连接攻击，可以把 CPU 资源耗光。 握手阶段：

序号 方向 seq ack  
1 A->B 10000 0  
2 B->A 20000 10000+1=10001  
3 A->B 10001 20000+1=20001

解释：  
1：A 向 B 发起连接请求，以一个随机数初始化 A 的 seq,这里假设为 10000，此时 ACK ＝ 0

2：B 收到 A 的连接请求后，也以一个随机数初始化 B 的 seq，这里假设为 20000，意思是：你的请求我已收到，我这方的数据流就从这个数开始。B 的 ACK 是 A 的 seq 加 1，即 10000 ＋ 1 ＝ 10001

3：A 收到 B 的回复后，它的 seq 是它的上个请求的 seq 加 1，即 10000 ＋ 1 ＝ 10001，意思也是：你的回复我收到了，我这方的数据流就从这个数开始。A 此时的 ACK 是 B 的 seq 加 1，即 20000+1=20001

数据传输阶段：

序号 方向 seq ack size  
23 A->B 40000 70000 1514  
24 B->A 70000 40000+1514-54=41460 54  
25 A->B 41460 70000+54-54=70000 1514  
26 B->A 70000 41460+1514-54=42920 54

解释：  
23:B 接收到 A 发来的 seq=40000,ack=70000,size=1514 的数据包  
24:于是 B 向 A 也发一个数据包，告诉 B，你的上个包我收到了。B 的 seq 就以它收到的数据包的 ACK 填充，ACK 是它收到的数据包的 SEQ 加上数据包的大小(不包括以太网协议头，IP 头，TCP 头)，以证实 B 发过来的数据全收到了。  
25:A 在收到 B 发过来的 ack 为 41460 的数据包时，一看到 41460，正好是它的上个数据包的 seq 加上包的大小，就明白，上次发送的数据包已安全到达。于是它再发一个数据包给 B。这个正在发送的数据包的 seq 也以它收到的数据包的 ACK 填充，ACK 就以它收到的数据包的 seq(70000)加上包的 size(54)填充,即 ack=70000+54-54(全是头长，没数据项)。

其实在握手和结束时确认号应该是对方序列号加 1,传输数据时则是对方序列号加上对方携带应用层数据的长度.如果从以太网包返回来计算所加的长度,就嫌走弯路了. 另外,如果对方没有数据过来,则自己的确认号不变,序列号为上次的序列号加上本次应用层数据发送长度.

在 TCP/IP 协议中，TCP 协议提供可靠的连接服务，采用三次握手建立一个连接，如
图 1 所示。
（1）第一次握手：建立连接时，客户端 A 发送 SYN 包（SYN=j）到服务器 B，并进入 SYN_SEND 状态，等待服务器 B 确认。
（2）第二次握手：服务器 B 收到 SYN 包，必须确认客户 A 的 SYN（ACK=j+1），同时自己也发送一个 SYN 包（SYN=k），即 SYN+ACK 包，此时服务器 B 进入 SYN_RECV 状态。
（3）第三次握手：客户端 A 收到服务器 B 的 SYN ＋ ACK 包，向服务器 B 发送确认包 ACK（ACK=k+1），此包发送完毕，客户端 A 和服务器 B 进入 ESTABLISHED 状态，完成三次握手。

完成三次握手，客户端与服务器开始传送数据。

由于 TCP 连接是全双工的，因此每个方向都必须单独进行关闭。这个原则是当一方完成它的数据发送任务后就能发送一个 FIN 来终止这个方向的连接。收到一个 FIN 只意味着这一方向上没有数据流动，一个 TCP 连接在收到一个 FIN 后仍能发送数据。首先进行关闭的一方将执行主动关闭，而另一方执行被动关闭。
（1）客户端 A 发送一个 FIN，用来关闭客户 A 到服务器 B 的数据传送（报文段 4）。
（2）服务器 B 收到这个 FIN，它发回一个 ACK，确认序号为收到的序号加 1（报文段 5）。和 SYN 一样，一个 FIN 将占用一个序号。
（3）服务器 B 关闭与客户端 A 的连接，发送一个 FIN 给客户端 A（报文段 6）。
（4）客户端 A 发回 ACK 报文确认，并将确认序号设置为收到序号加 1（报文段 7）。 TCP 采用四次挥手关闭连接如图 2 所示。

1．为什么建立连接协议是三次握手，而关闭连接却是四次握手呢？

这是因为服务端的 LISTEN 状态下的 SOCKET 当收到 SYN 报文的建连请求后，它可以把 ACK 和 SYN（ACK 起应答作用，而 SYN 起同步作用）放在一个报文里来发送。但关闭连接时，当收到对方的 FIN 报文通知时，它仅仅表示对方没有数据发送给你了；但未必你所有的数据都全部发送给对方了，所以你可以未必会马上会关闭 SOCKET,也即你可能还需要发送一些数据给对方之后，再发送 FIN 报文给对方来表示你同意现在可以关闭连接了，所以它这里的 ACK 报文和 FIN 报文多数情况下都是分开发送的。

2．为什么 TIME_WAIT 状态还需要等 2MSL 后才能返回到 CLOSED 状态？

这是因为虽然双方都同意关闭连接了，而且握手的 4 个报文也都协调和发送完毕，按理可以直接回到 CLOSED 状态（就好比从 SYN_SEND 状态到 ESTABLISH 状态那样）；但是因为我们必须要假想网络是不可靠的，你无法保证你最后发送的 ACK 报文会一定被对方收到，因此对方处于 LAST_ACK 状态下的 SOCKET 可能会因为超时未收到 ACK 报文，而重发 FIN 报文，所以这个 TIME_WAIT 状态的作用就是用来重发可能丢失的 ACK 报文。

TCP 状态机  
TCP 协议的操作可以使用一个具有 11 种状态的有限状态机（ Finite State Machine ）来表示，图 3-12 描述了 TCP 的有限状态机，图中的圆角矩形表示状态，箭头表示状态之间的转换，各状态的描述如表 3-2 所示。图中用粗线表示客户端主动和被动的服务器端

建立连接的正常过程：客户端的状态变迁用粗实线，服务器端的状态变迁用粗虚线。细线用于不常见的序列，如复位、同时打开、同时关闭等。图中的每条状态变换线上均标有“事件／动作”：事件是指用户执行了系统调用（ CONNECT 、 LISTEN 、 SEND 或 CLOSE ）、收到一个报文段（ SYN 、 FIN 、 ACK 或 RST ）、或者是出现了超过两倍最大的分组生命期的情况；动作是指发送一个报文段（ SYN 、 FIN 或 ACK ）或什么也没有（用“－”表示）。

每个连接均开始于 CLOSED 状态。当一方执行了被动的连接原语（ LISTEN ）或主动的连接原语（ CONNECT ）时，它便会脱离 CLOSED 状态。如果此时另一方执行了相对应的连接原语，连接便建立了，并且状态变为 ESTABLISHED 。任何一方均可以首先请求释放连接，当连接被释放后，状态又回到了 CLOSED 。

表 3-2 TCP 状态表  
状 态 描 述  
CLOSED  
关闭状态，没有连接活动或正在进行  
LISTEN  
监听状态，服务器正在等待连接进入  
SYN RCVD  
收到一个连接请求，尚未确认  
SYN SENT  
已经发出连接请求，等待确认  
ESTABLISHED
连接建立，正常数据传输状态  
FIN WAIT 1  
（主动关闭）已经发送关闭请求，等待确认  
FIN WAIT 2  
（主动关闭）收到对方关闭确认，等待对方关闭请求  
TIMED WAIT  
完成双向关闭，等待所有分组死掉  
CLOSING  
双方同时尝试关闭，等待对方确认  
CLOSE WAIT  
（被动关闭）收到对方关闭请求，已经确认  
LAST ACK  
（被动关闭）等待最后一个关闭确认，并等待所有分组死掉

1. 正常状态转换
   正常状态转换正常状态转换
   正常状态转换 我们用图 3-13 来显示在正常的 TCP 连接的建立与终止过程中，客户与服务器所经历
   的不同状态。读者可以对照图 3-12 来阅读，使用图 3-12 的状态图来跟踪图 3-13 的

状态变化过程，以便明白每个状态的变化：

?服务器端首先执行 LISTEN 原语进入被动打开状态（ LISTEN ），等待客户端连接；

?当客户端的一个应用程序发出 CONNECT 命令后，本地的 TCP 实体为其创建一个连接记录并标记为 SYN SENT 状态，然后给服务器发送一个 SYN 报文段；

?服务器收到一个 SYN 报文段，其 TCP 实体给客户端发送确认 ACK 报文段同时发送一个 SYN 信号，进入 SYN RCVD 状态；

?客户端收到 SYN + ACK 报文段，其 TCP 实体给服务器端发送出三次握手的最后一个 ACK 报文段，并转换为 ESTABLISHED 状态；

?服务器端收到确认的 ACK 报文段，完成了三次握手，于是也进入 ESTABLISHED 状态。 在此状态下，双方可以自由传输数据。当一个应用程序完成数据传输任务后，它需要关闭 TCP 连接。假设仍由客户端发起主动关闭连接。

?客户端执行 CLOSE 原语，本地的 TCP 实体发送一个 FIN 报文段并等待响应的确认（进入状态 FIN WAIT 1 ）；

?服务器收到一个 FIN 报文段，它确认客户端的请求发回一个 ACK 报文段，进入 CLOSE WAIT 状态；

?客户端收到确认 ACK 报文段，就转移到 FIN WAIT 2 状态，此时连接在一个方向上就断开了；

?在此之后假如一直没收到对端 FIN 报文段，则 FIN_WAIT_2 维持 2minute 后，自动发送一个[RST,ACK]报文到对端，并关闭此连接（不再有 TIME_WAIT 了，本连接直接就没了）。服务器端应用得到通告后，也执行 CLOSE 原语关闭另一个方向的连接，其本地 TCP 实体向客户端发送一个 FIN 报文段，并进入 LAST ACK 状态，等待最后一个 ACK 确认报文段；

?客户端收到 FIN 报文段并确认，进入 TIMED WAIT 状态，此时双方连接均已经断开，但 TCP 要等待一个 2 倍报文段最大生存时间 MSL （ Maximum Segment Lifetime ），确保该连接的所有分组全部消失，以防止出现确认丢失的情况。当定时器超时后， TCP 删除该连接记录，返回到初始状态（ CLOSED ）。

?服务器收到最后一个确认 ACK 报文段，其 TCP 实体便释放该连接，并删除连接记录，返回到初始状态（ CLOSED ）。
