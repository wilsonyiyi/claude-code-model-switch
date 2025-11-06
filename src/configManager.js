const os = require('os');
const path = require('path');
const fs = require('fs-extra');

class ConfigManager {
  constructor() {
    this.configDir = this.getConfigDir();
    this.configFile = path.join(this.configDir, 'config.json');
    this.historyFile = path.join(this.configDir, 'history.json');
    this.ensureConfigExists();
  }

  getConfigDir() {
    const platform = os.platform();

    if (platform === 'win32') {
      return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'claude-model-manager');
    } else {
      return path.join(os.homedir(), '.config', 'claude-model-manager');
    }
  }

  async ensureConfigExists() {
    try {
      await fs.ensureDir(this.configDir);

      if (!(await fs.pathExists(this.configFile))) {
        await fs.writeJson(this.configFile, {
          models: [],
          currentModel: null,
          createdAt: new Date().toISOString()
        }, { spaces: 2 });
      }

      if (!(await fs.pathExists(this.historyFile))) {
        await fs.writeJson(this.historyFile, {
          changes: []
        }, { spaces: 2 });
      }
    } catch (error) {
      throw new Error(`Failed to initialize config: ${error.message}`);
    }
  }

  async getConfig() {
    try {
      await this.ensureConfigExists();
      return await fs.readJson(this.configFile);
    } catch (error) {
      throw new Error(`Failed to read config: ${error.message}`);
    }
  }

  async saveConfig(config) {
    try {
      await fs.writeJson(this.configFile, config, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to save config: ${error.message}`);
    }
  }

  async getHistory() {
    try {
      return await fs.readJson(this.historyFile);
    } catch (error) {
      throw new Error(`Failed to read history: ${error.message}`);
    }
  }

  async saveHistory(history) {
    try {
      await fs.writeJson(this.historyFile, history, { spaces: 2 });
    } catch (error) {
      throw new Error(`Failed to save history: ${error.message}`);
    }
  }

  async addChange(action, modelName, details) {
    const history = await this.getHistory();
    const change = {
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

module.exports = ConfigManager;
