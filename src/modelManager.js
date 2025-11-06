const ConfigManager = require('./configManager');
const chalk = require('chalk');

class ModelManager {
  constructor() {
    this.configManager = new ConfigManager();
  }

  async addModel(name, token, baseUrl, description) {
    if (!name || !token || !baseUrl) {
      throw new Error('Name, token, and baseUrl are required');
    }

    const config = await this.configManager.getConfig();

    if (config.models.find(m => m.name === name)) {
      throw new Error(`Model "${name}" already exists`);
    }

    const model = {
      id: Date.now().toString(),
      name,
      token,
      baseUrl,
      description: description || '',
      createdAt: new Date().toISOString(),
      lastUsed: null
    };

    config.models.push(model);
    await this.configManager.saveConfig(config);
    await this.configManager.addChange('add', name, `Added new model: ${name}`);

    return model;
  }

  async listModels() {
    const config = await this.configManager.getConfig();
    return config.models;
  }

  async getModel(name) {
    const config = await this.configManager.getConfig();
    return config.models.find(m => m.name === name);
  }

  async removeModel(name) {
    const config = await this.configManager.getConfig();
    const index = config.models.findIndex(m => m.name === name);

    if (index === -1) {
      throw new Error(`Model "${name}" not found`);
    }

    const removed = config.models.splice(index, 1)[0];

    if (config.currentModel === name) {
      config.currentModel = null;
    }

    await this.configManager.saveConfig(config);
    await this.configManager.addChange('remove', name, `Removed model: ${name}`);

    return removed;
  }

  async switchModel(name) {
    const model = await this.getModel(name);

    if (!model) {
      throw new Error(`Model "${name}" not found`);
    }

    const config = await this.configManager.getConfig();
    config.currentModel = name;

    model.lastUsed = new Date().toISOString();

    await this.configManager.saveConfig(config);
    await this.configManager.addChange('switch', name, `Switched to model: ${name}`);

    return model;
  }

  async getCurrentModel() {
    const config = await this.configManager.getConfig();
    if (!config.currentModel) {
      return null;
    }
    return this.getModel(config.currentModel);
  }

  async updateModel(name, updates) {
    const config = await this.configManager.getConfig();
    const model = config.models.find(m => m.name === name);

    if (!model) {
      throw new Error(`Model "${name}" not found`);
    }

    const oldName = model.name;
    Object.assign(model, updates, { updatedAt: new Date().toISOString() });

    await this.configManager.saveConfig(config);

    if (updates.name && oldName !== updates.name) {
      const config2 = await this.configManager.getConfig();
      if (config2.currentModel === oldName) {
        config2.currentModel = updates.name;
        await this.configManager.saveConfig(config2);
      }
    }

    await this.configManager.addChange('update', name, `Updated model: ${oldName}`);

    return model;
  }

  formatModel(model, isCurrent = false) {
    const prefix = isCurrent ? chalk.green('▶ ') : '  ';
    const name = isCurrent ? chalk.bold(model.name) : model.name;
    const desc = model.description ? chalk.gray(` - ${model.description}`) : '';
    const lastUsed = model.lastUsed
      ? chalk.blue(`\n    Last used: ${new Date(model.lastUsed).toLocaleString()}`)
      : '';

    return `${prefix}${name}${desc}${lastUsed}`;
  }
}

module.exports = ModelManager;
