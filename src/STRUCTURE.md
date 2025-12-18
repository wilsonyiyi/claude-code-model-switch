# 项目重构结构说明

## 目录结构

```
src/
├── cli.js                    # 主入口文件 (约45行)
│
├── commands/                 # 命令模块目录
│   ├── add.js               # 添加模型命令 (20行)
│   ├── list.js              # 列出模型命令 (18行)
│   ├── current.js           # 显示当前模型命令 (22行)
│   ├── remove.js            # 删除模型命令 (19行)
│   ├── use.js               # 切换并启动Claude命令 (32行)
│   ├── update.js            # 更新模型命令 (65行)
│   ├── history.js           # 历史记录命令 (22行)
│   ├── launch.js            # 自动启动Claude逻辑 (21行)
│   └── interactive.js       # 交互模式命令 (140行)
│
├── utils/                    # 工具函数目录
│   ├── claudeLauncher.js    # Claude启动器和显示工具 (44行)
│   └── interactiveHelpers.js # 交互提示辅助函数 (120行)
│
├── modelManager.js          # 业务逻辑层 (150行) - 保持不变
├── configManager.js         # 数据存储层 (122行) - 保持不变
└── index.js                 # 程序入口点
```

## 对比原结构

### 重构前
- **cli.js**: 886 行 - 所有逻辑混合在一起
  - 命令定义
  - 业务逻辑
  - 交互处理
  - Claude启动逻辑
  - 错误处理

### 重构后
- **cli.js**: 45 行 - 仅负责命令注册和路由
- **commands/**: 9个文件，共 ~380 行 - 每个命令独立
- **utils/**: 2个文件，共 ~160 行 - 复用的工具函数
- **modelManager.js**: 保持不变 (150行)
- **configManager.js**: 保持不变 (122行)

## 优势

1. **模块化**: 每个命令独立文件，便于维护和测试
2. **单一职责**:
   - CLI只负责路由
   - 命令模块处理业务逻辑
   - 工具模块提供复用函数
3. **可读性**: 主入口文件清晰简洁
4. **可扩展**: 新增命令只需在commands/下添加文件并注册
5. **复用性**: 交互和启动逻辑被提取到utils，避免重复

## 文件职责

### commands/ 目录
- **add.js**: 处理 `cm add` 命令
- **list.js**: 处理 `cm list` 命令
- **current.js**: 处理 `cm current` 命令
- **remove.js**: 处理 `cm remove` 命令 (含确认)
- **use.js**: 处理 `cm use` 命令 (切换+启动)
- **update.js**: 处理 `cm update` 命令 (交互+批量)
- **history.js**: 处理 `cm history` 命令
- **launch.js**: 处理 `cm` 无参数时的自动启动
- **interactive.js**: 处理 `cm interactive` 完整菜单系统

### utils/ 目录
- **claudeLauncher.js**:
  - `launchClaude()` - 执行claude命令
  - `displayModelInfo()` - 格式化显示模型信息
- **interactiveHelpers.js**:
  - `selectModel()` - 模型选择提示
  - `confirmAction()` - 确认提示
  - `promptNewModelDetails()` - 新模型信息收集
  - `promptModelUpdates()` - 更新信息收集
  - `filterUpdates()` - 过滤变更内容

## 依赖关系

```
cli.js
  ├── commands/*.js
  │     ├── modelManager (业务层)
  │     ├── utils/interactiveHelpers
  │     └── utils/claudeLauncher
  ├── utils/claudeLauncher
  └── modelManager.js
        └── configManager.js (存储层)
```

## 模块导入方式

```javascript
// 在 cli.js 中
const addCommand = require('./commands/add');
// 在命令模块中
const { selectModel } = require('../utils/interactiveHelpers');
const { launchClaude } = require('../utils/claudeLauncher');
```

## 维护建议

1. **添加新命令**: 在 `src/commands/` 创建文件，并在 `cli.js` 中注册
2. **修改交互**: 修改 `src/utils/interactiveHelpers.js`
3. **修改启动逻辑**: 修改 `src/utils/claudeLauncher.js`
4. **修改核心业务**: 修改 `src/modelManager.js`
5. **修改数据存储**: 修改 `src/configManager.js`
