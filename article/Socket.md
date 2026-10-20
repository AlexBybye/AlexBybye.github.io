---
title: "Socket 网络通信实践"
date: 2025-12-17
category: 网络编程
tags: [网络编程, Socket]
description: "记录 Socket 服务端与客户端通信的基本流程，以及连接和调试时的实践步骤。"
---
### 1. 启动服务端

首先，在一个命令提示符或PowerShell窗口中启动FTP服务端：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

powershell

```
PS D:\weblab\lab_5> .\server.exe
```

服务端启动后，您应该会看到类似以下输出：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
========================================
FTP Server running, listening on port 21...
Multithreaded mode enabled.
========================================
[INFO] Main thread waiting for new client connection...
```

服务端现在正在监听21端口，等待客户端连接。

### 2. 启动客户端

在另一个命令提示符或PowerShell窗口中启动FTP客户端：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

powershell

```
PS D:\weblab\lab_5> .\client.exe
```

客户端启动后，您应该会看到以下提示：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
Enter FTP server IP: 
```

### 3. 连接到服务器

在客户端窗口中输入服务器的IP地址。由于您是在本地测试，可以输入`127.0.0.1`（本地回环地址）：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
Enter FTP server IP: 127.0.0.1
```

客户端会尝试连接到服务器，成功后您会看到服务器的欢迎消息：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
Server: 220 FTP Service ready.
```

### 4. 登录服务器

接下来，客户端会提示您输入用户名和密码：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
Enter username: anonymous
Enter password: 
```

由于服务端支持匿名登录，您可以使用用户名`anonymous`和空密码进行登录。登录成功后，您会看到：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
Server: 331 User name okay, need password.
Server: 230 User logged in.
```

现在您已经成功登录到FTP服务器，可以开始使用FTP命令了。

### 5. 测试文件列表获取

使用`ls`或`list`命令获取服务器上的文件列表：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
ftp> ls
```

客户端会发送PASV和LIST命令，然后显示服务器上的文件列表：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
Server: 227 Entering Passive Mode (127,0,0,1,xxx,xxx).
Server: 150 Opening data connection for directory listing.
Directory listing:
-         1 user group       340 Jan 01 00:00 client.cpp
-         1 user group      5542 Jan 01 00:00 client_handler.cpp
-         1 user group      1754 Jan 01 00:00 main.cpp
-         1 user group      1892 Jan 01 00:00 server.h
-         1 user group     49152 Jan 01 00:00 server.exe
-         1 user group     45056 Jan 01 00:00 client.exe
Server: 226 Directory listing successful.
```

### 6. 测试文件上传

使用`put`或`stor`命令上传一个文件到服务器。首先，确保您的测试目录中有一个要上传的文件，比如`test.txt`。然后在客户端中输入：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
ftp> put test.txt
```

客户端会发送PASV和STOR命令，然后上传文件：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
Server: 227 Entering Passive Mode (127,0,0,1,xxx,xxx).
Server: 150 Opening BINARY mode data connection for file upload.
Server: 226 Transfer complete.
File uploaded successfully: test.txt
```

您可以再次使用`ls`命令验证文件是否已经上传成功。

### 7. 测试文件下载

使用`get`或`retr`命令从服务器下载一个文件：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
ftp> get server.h
```

客户端会发送PASV和RETR命令，然后下载文件：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
Server: 227 Entering Passive Mode (127,0,0,1,xxx,xxx).
Server: 150 Opening BINARY mode data connection for file transfer.
Server: 226 Transfer complete.
File downloaded successfully: server.h
```

您可以在客户端的当前目录中验证文件是否已经下载成功。

### 8. 测试退出连接

使用`quit`命令退出FTP客户端：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
ftp> quit
```

客户端会发送QUIT命令，然后关闭连接：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
Server: 221 Goodbye.
```

### 9. 验证服务端状态

在服务端窗口中，您应该会看到客户端连接和断开的日志信息：

![](https://file+.vscode-resource.vscode-cdn.net/c%3A/Users/24441/.vscode/extensions/marscode.marscode-extension-1.4.18/resource/images/languageIcon/plaintext.svg)

plainText

```
[INFO] Client connected from: 127.0.0.1:xxxx
[INFO] Thread xxxxx started processing client.
[RCV] Thread xxxxx: USER anonymous
[SND] Thread xxxxx: 331 User name okay, need password.
[RCV] Thread xxxxx: PASS 
[SND] Thread xxxxx: 230 User logged in.
[RCV] Thread xxxxx: LIST
[SND] Thread xxxxx: 150 Opening data connection for directory listing.
[SND] Thread xxxxx: 226 Directory listing successful.
[RCV] Thread xxxxx: QUIT
[SND] Thread xxxxx: 221 Goodbye.
[INFO] Thread xxxxx: Client disconnected.
```

### 测试多客户端并发访问

您可以同时启动多个客户端实例，连接到同一个服务端，测试多客户端并发访问功能。服务端会为每个客户端创建一个新的线程来处理请求。