import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import type { Config, History, HistoryChange } from './types.js';

interface DefaultModelConfig {
  ANTHROPIC_DEFAULT_OPUS_MODEL?: string;
  ANTHROPIC_DEFAULT_SONNET_MODEL?: string;
  ANTHROPIC_DEFAULT_HAIKU_MODEL?: string;
}

class ConfigManager {
  static CLAUDE_DEFAULT_MODELS: DefaultModelConfig = {
    ANTHROPIC_DEFAULT_OPUS_MODEL: 'claude-opus-4-5-20251101',
    ANTHROPIC_DEFAULT_SONNET_MODEL: 'claude-sonnet-4-5-20250929',
    ANTHROPIC_DEFAULT_HAIKU_MODEL: 'claude-haiku-4-5-20251001'
  };

  configDir: string;
  configFile: string;
  historyFile: string;

  constructor() {
    this.configDir = this.getConfigDir();
    this.configFile = path.join(this.configDir, 'config.json');
    this.historyFile = path.join(this.configDir, 'history.json');
    this.ensureConfigExists();
  }

  getConfigDir(): string {
    const platform = os.platform();

    if (platform === 'win32') {
      return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'claude-model-manager');
    } else {
      return path.join(os.homedir(), '.config', 'claude-model-manager');
    }
  }

  async ensureConfigExists(): Promise<void> {
    try {
      await fs.ensureDir(this.configDir);

      if (!(await fs.pathExists(this.configFile))) {
        await fs.writeJson(this.configFile, {
          models: [],
          currentModel: null,
          createdAt: new Date().toISOString()
        } as Config, { spaces: 2 });
      }

      if (!(await fs.pathExists(this.historyFile))) {
        await fs.writeJson(this.historyFile, {
          changes: []
        } as History, { spaces: 2 });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize config: ${message}`);
    }
  }

  async getConfig(): Promise<Config> {
    try {
      await this.ensureConfigExists();
      return await fs.readJson(this.configFile) as Config;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read config: ${message}`);
    }
  }

  async saveConfig(config: Config): Promise<void> {
    try {
      await fs.writeJson(this.configFile, config, { spaces: 2 });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save config: ${message}`);
    }
  }

  async getHistory(): Promise<History> {
    try {
      return await fs.readJson(this.historyFile) as History;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to read history: ${message}`);
    }
  }

  async saveHistory(history: History): Promise<void> {
    try {
      await fs.writeJson(this.historyFile, history, { spaces: 2 });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save history: ${message}`);
    }
  }

  async getDefaultModelConfig(): Promise<DefaultModelConfig> {
    const envConfig: DefaultModelConfig = {};

    // Check environment variables for model overrides
    if (process.env.ANTHROPIC_DEFAULT_OPUS_MODEL) {
      envConfig.ANTHROPIC_DEFAULT_OPUS_MODEL = process.env.ANTHROPIC_DEFAULT_OPUS_MODEL;
    }
    if (process.env.ANTHROPIC_DEFAULT_SONNET_MODEL) {
      envConfig.ANTHROPIC_DEFAULT_SONNET_MODEL = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL;
    }
    if (process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL) {
      envConfig.ANTHROPIC_DEFAULT_HAIKU_MODEL = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL;
    }

    return envConfig;
  }

  async addChange(action: HistoryChange['action'], modelName: string, details: string): Promise<HistoryChange> {
    const history = await this.getHistory();
    const change: HistoryChange = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      modelName,
      details
    };
    history.changes.unshift(change);

    if (history.changes.length > 100) {
      history.changes = history.changes.slice(0, 100);
    }

    await this.saveHistory(history);
    return change;
  }
}

export default ConfigManager;
