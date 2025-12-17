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
- ✅ 直接启动 claude（运行 `cm` 即可启动当前模型）
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
cm --version
```

## 高级模型配置

您可以选择为每个 Claude 模型层级指定默认模型：

```bash
cm add -n production \
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
   cm add -n my-config -t YOUR_TOKEN -b https://api.anthropic.com -d "我的配置"
   ```

2. **使用你的模型启动 claude：**

   ```bash
   cm
   ```

## 常用命令

| 命令 | 描述 | 示例 |
|---------|-------------|---------|
| `cm` | 使用当前模型启动 claude | `cm` |
| `cm add` | 添加新的模型配置 | `cm add -n dev -t sk-ant-xxx -b https://api.anthropic.com` |
| `cm update [name]` | 更新模型配置（无名称时进入交互模式） | `cm update dev -n "dev-new" -d "已更新"` |
| `cm list` | 列出所有模型 | `cm list` |
| `cm use [name]` | 切换模型并启动 Claude（无名称时进入交互模式） | `cm use` 或 `cm use dev` |
| `cm current` | 显示当前模型 | `cm current` |
| `cm history` | 显示变更历史 | `cm history -l 20` |
| `cm interactive` | 菜单驱动模式 | `cm interactive` |

## 使用示例

### 管理多个环境

```bash
# 添加不同环境
cm add -n dev -t sk-dev-xxx -b https://api.anthropic.com -d "开发环境"
cm add -n staging -t sk-staging-xxx -b https://api.anthropic.com -d "测试环境"
cm add -n production -t sk-prod-xxx -b https://api.anthropic.com -d "生产环境"

# 在它们之间切换
cm use dev
cm use production

# 更新模型
cm update dev -n staging -d "切换到测试环境"
```

### 交互式模式

要使用用户友好的菜单界面：
```bash
cm interactive
```

交互式模式现在支持在添加新模型时配置每个层级的默认模型。选择 "Add a new model"，您可以选择为 Opus、Sonnet 和 Haiku 设置默认模型。

除了添加，交互式模式还支持更新模型配置（Update a model），可以修改模型名称、描述、token、基准URL以及各模型层级的默认配置。


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
