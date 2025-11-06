# Claude Code 模型管理器

用于管理多个 Claude Code 模型配置并快速切换的命令行工具。

> **English Documentation**: [README.md](./README.md) | **英文文档**: [README.md](./README.md)

## 功能特性

- ✅ 多模型配置管理
- ✅ 快速模型切换
- ✅ 配置变更历史
- ✅ 跨平台支持（Windows、Mac、Linux）
- ✅ 本地数据存储
- ✅ 记录最后选择的模型
- ✅ 支持交互式模式
- ✅ 直接启动 claude（运行 `claude-model` 即可启动当前模型）
- ✅ 自动添加 `--dangerously-skip-permissions` 标志以实现无缝文件访问

## 安装

```bash
npm install -g .
```

或本地安装：

```bash
npm install .
```

## 使用示例

### 快速启动 - 直接运行 claude

```bash
# 直接运行 claude-model - 它将使用当前模型配置启动 claude
claude-model
```

当你直接运行 `claude-model`（不带任何参数）时：
- ✅ 如果已配置模型且已选择当前模型 → 使用该模型配置启动 `claude`
- ✅ 自动设置 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_BASE_URL` 环境变量
- ✅ 自动添加 `--dangerously-skip-permissions` 标志以实现无缝文件访问
- ✅ 如果没有配置模型或未选择模型会显示有用的错误信息

### 添加新的模型配置

```bash
# 命令行模式
claude-model add --name my-config --token sk-ant-xxxxx --base-url https://api.anthropic.com --description "我的 Claude 配置"

# 交互式模式（提示输入）
claude-model interactive
```

### 列出所有配置

```bash
claude-model list
```

### 切换到指定配置

```bash
# 切换到特定模型
claude-model switch my-config

# 交互式选择（显示列表供选择）
claude-model switch
```

### 显示当前配置

```bash
claude-model current
```

### 删除配置

```bash
claude-model remove my-config
```

### 显示变更历史

```bash
# 显示最近 20 条记录（默认）
claude-model history

# 显示最近 50 条记录
claude-model history --limit 50
```

## 命令参考

| 命令 | 描述 | 选项 |
|---------|-------------|---------|
| `add` | 添加新的模型配置 | `-n, --name`, `-t, --token`, `-b, --base-url`, `-d, --description` |
| `list` | 列出所有配置 | - |
| `switch` | 切换模型配置 | `[name]`（可选，开启交互模式） |
| `current` | 显示当前配置 | - |
| `remove` | 删除配置 | `<name>`（必需） |
| `history` | 显示配置变更历史 | `-l, --limit <number>` |
| `interactive` / `i` | 交互式模式菜单 | - |

## 配置文件结构

你的模型配置以 JSON 格式存储：

**config.json:**

```json
{
  "models": [
    {
      "id": "1640995200000",
      "name": "my-config",
      "token": "sk-ant-xxxxx",
      "baseUrl": "https://api.anthropic.com",
      "description": "我的 Claude 配置",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastUsed": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "currentModel": "my-config",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**history.json:**

```json
{
  "changes": [
    {
      "id": 1640995200000,
      "timestamp": "2024-01-01T12:00:00.000Z",
      "action": "switch",
      "modelName": "my-config",
      "details": "切换到模型: my-config"
    }
  ]
}
```

## 交互式模式

启动交互式模式获得引导式体验：

```bash
claude-model interactive
# 或
claude-model i
```

交互式模式提供：

- 菜单驱动界面
- 简单的模型切换
- 安全的删除操作（含确认提示）

## 数据存储位置

配置存储在本地：

- **macOS/Linux**: `~/.config/claude-model-manager/`
- **Windows**: `%APPDATA%\claude-model-manager\`

## 使用场景

### 管理多个环境

```bash
# 开发环境
claude-model add --name dev --token sk-dev-xxx --base-url https://api.anthropic.com --description "开发环境"

# 测试环境
claude-model add --name staging --token sk-staging-xxx --base-url https://api.anthropic.com --description "测试环境"

# 生产环境
claude-model add --name production --token sk-prod-xxx --base-url https://api.anthropic.com --description "生产环境"

# 在环境间轻松切换
claude-model switch dev
claude-model switch staging
claude-model switch production
```

### 使用不同 API 端点

```bash
# 主要 Anthropic API
claude-model add --name claude-pro --token sk-ant-xxx --base-url https://api.anthropic.com

# 自定义端点（如果适用）
claude-model add --name custom --token sk-ant-xxx --base-url https://custom.endpoint.com
```

## 安全说明

- API 令牌以纯文本形式存储在本地配置文件中
- 确保你的设备设置了适当的文件权限
- 保持配置目录的安全性
- 在共享环境中考虑使用环境变量存储敏感令牌

## 故障排除

### 未找到配置文件

工具会在首次运行时自动创建配置目录和文件。

### 权限错误

确保你有写入主目录和配置位置的权限。

### 模型未找到

使用 `claude-model list` 查看所有可用配置。

## 许可证

MIT
