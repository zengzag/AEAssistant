# AEAssistant

## 简介
AEAssistant 是一个用于 After Effects 的辅助工具，借助大语言模型，帮助用户更高效地使用 After Effects 软件。
| 对话模式 | 生成模式 |
| ---- | ---- |
| <img src="assets/chat.gif" alt="对话模式" width="100%"> | <img src="assets/generate.gif" alt="生成模式" width="100%"> |

## 主要功能
1. **AI 问题解答**：用户在使用 After Effects 过程中遇到问题，可以向工具提问，获取专业、简洁的解决方案。
2. **AI 脚本操作**：用户可以输入需求，工具会调用 AI 生成符合 ECMAScript 3 标准的 ExtendScript 代码并运行，可实现用语言操作工程。


## 安装与使用
你可以选择自己重新编译，或者直接下载已编译好的装包：release/com.zag.aeassistant.zxp
### 编译
克隆仓库并安装依赖：
```bash
git clone <仓库地址>
cd AEAssistant
npm install
```
编译项目：
```bash
npm run build
npm run sign
```
### 安装
编译完成后，您可以在 `release` 目录下找到安装包。以下为您提供两种安装方法：

#### 方法一：使用 ZXPInstaller
1. 下载安装 [ZXPInstaller](https://zxpinstaller.com/) 。
2. 将安装包拖拽到ZXPInstaller界面进行安装。

#### 方法二：手动解压安装
1. 将 `.zxp` 文件重命名为 `.zip` 。
2. 解压文件到 AE 插件目录：
    - **Windows 系统**：`C:\Users\[ USER ]\AppData\Roaming\Adobe\CEP\extensions\`
    - **Mac 系统**：`/Library/Application Support/Adobe/CEP/extensions/`

## WIP
持续更新中...