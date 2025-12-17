# Claude Code 模型管理器

用于管理多个 Claude Code 模型配置并快速切换的命令行工具。

> **英文文档**: [README.md](./README.md) | **English Documentation**: [README.md](./README.md)

## 功能特性

- ✅ 多模型配置管理
- ✅ 快速模型切换
- ✅ 配置变更历史
- ✅ 跨平台支持（Windows、Mac、Linux）
- ✅ 本地数据存储
- ✅ 记录最后选择的模型
- ✅ 支持交互式模式
- ✅ 直接启动 claude（运行 `cc` 即可启动当前模型）
- ✅ 自动添加 `--dangerously-skip-permissions` 标志以实现无缝文件访问

## 安装

### 前置要求

- **Node.js** (v18 或更高版本) - [下载地址](https://nodejs.org/zh-cn/)
- **npm** (随 Node.js 一起提供)
- **claude** CLI 工具（可选，用于直接启动）- [安装指南](https://docs.anthropic.com/claude-cli)

### 全局安装（推荐）

```bash
npm install -g @wilson_janet/claude-code-model-switch

# 验证安装
cc --version
```

## 高级模型配置

您可以选择为每个 Claude 模型层级指定默认模型：

```bash
cc add -n production \
  -t sk-ant-xxx \
  -b https://api.anthropic.com \
  -d "生产环境" \
  --opus-model claude-opus-4-5-20251101 \
  --sonnet-model claude-sonnet-4-5-20250929 \
  --haiku-model claude-haiku-4-5-20251001
```

这些可选的模型配置将作为环境变量传递给 Claude Code：
- `ANTHROPIC_DEFAULT_OPUS_MODEL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_DEFAULT_HAIKU_MODEL`

如果未指定，Claude Code 将使用其官方默认值。

## 快速开始

1. **添加你的第一个模型配置：**

   ```bash
   cc add -n my-config -t YOUR_TOKEN -b https://api.anthropic.com -d "我的配置"
   ```

2. **使用你的模型启动 claude：**

   ```bash
   cc
   ```

## 常用命令

| 命令 | 描述 | 示例 |
|---------|-------------|---------|
| `cc` | 使用当前模型启动 claude | `cc` |
| `cc add` | 添加新的模型配置 | `cc add -n dev -t sk-ant-xxx -b https://api.anthropic.com` |
| `cc list` | 列出所有模型 | `cc list` |
| `cc switch [name]` | 切换模型（无名称时进入交互模式） | `cc switch` 或 `cc switch dev` |
| `cc current` | 显示当前模型 | `cc current` |
| `cc history` | 显示变更历史 | `cc history -l 20` |
| `cc interactive` | 菜单驱动模式 | `cc interactive` |

## 使用示例

### 管理多个环境

```bash
# 添加不同环境
cc add -n dev -t sk-dev-xxx -b https://api.anthropic.com -d "开发环境"
cc add -n staging -t sk-staging-xxx -b https://api.anthropic.com -d "测试环境"
cc add -n production -t sk-prod-xxx -b https://api.anthropic.com -d "生产环境"

# 在它们之间切换
cc switch dev
cc switch production
```

### 交互式模式

要使用用户友好的菜单界面：
```bash
cc interactive
```

交互式模式现在支持在添加新模型时配置每个层级的默认模型。选择 "Add a new model"，您可以选择为 Opus、Sonnet 和 Haiku 设置默认模型。


## 安全说明

- API 令牌以纯文本形式存储在本地配置文件中
- 配置存储在本地：
  - **macOS/Linux**: `~/.config/claude-model-manager/`
  - **Windows**: `%APPDATA%\claude-model-manager\`
- 请确保配置目录的安全性

## 开发

如需贡献代码或了解技术详情，请参阅 [DEVELOPMENT.md](./DEVELOPMENT.md)。

## 许可证

MIT
