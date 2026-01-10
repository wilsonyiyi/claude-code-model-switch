import ConfigManager from './configManager.js';
import chalk from 'chalk';
import type { Model, ModelConfig, ModelUpdates, Config } from './types.js';

class ModelManager {
  configManager: ConfigManager;

  constructor() {
    this.configManager = new ConfigManager();
  }

  async addModel(
    name: string,
    token: string,
    baseUrl: string,
    description?: string,
    modelConfig: ModelConfig = {}
  ): Promise<Model> {
    if (!name || !token || !baseUrl) {
      throw new Error('Name, token, and baseUrl are required');
    }

    const config = await this.configManager.getConfig();

    if (config.models.find(m => m.name === name)) {
      throw new Error(`Model "${name}" already exists`);
    }

    const defaultModelConfig = await this.configManager.getDefaultModelConfig();

    const model: Model = {
      id: Date.now().toString(),
      name,
      token,
      baseUrl,
      description: description || '',
      createdAt: new Date().toISOString(),
      lastUsed: null,
      defaultOpusModel: modelConfig.defaultOpusModel || defaultModelConfig.ANTHROPIC_DEFAULT_OPUS_MODEL,
      defaultSonnetModel: modelConfig.defaultSonnetModel || defaultModelConfig.ANTHROPIC_DEFAULT_SONNET_MODEL,
      defaultHaikuModel: modelConfig.defaultHaikuModel || defaultModelConfig.ANTHROPIC_DEFAULT_HAIKU_MODEL
    };

    config.models.push(model);
    await this.configManager.saveConfig(config);
    await this.configManager.addChange('add', name, `Added new model: ${name}`);

    return model;
  }

  async listModels(): Promise<Model[]> {
    const config = await this.configManager.getConfig();
    return config.models;
  }

  async getModel(name: string): Promise<Model | undefined> {
    const config = await this.configManager.getConfig();
    return config.models.find(m => m.name === name);
  }

  async removeModel(name: string): Promise<Model> {
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

  async switchModel(name: string): Promise<Model> {
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

  async getCurrentModel(): Promise<Model | null> {
    const config = await this.configManager.getConfig();
    if (!config.currentModel) {
      return null;
    }
    return (await this.getModel(config.currentModel)) || null;
  }

  async updateModel(name: string, updates: ModelUpdates): Promise<Model> {
    const config = await this.configManager.getConfig();
    const model = config.models.find(m => m.name === name);

    if (!model) {
      throw new Error(`Model "${name}" not found`);
    }

    const oldName = model.name;
    Object.assign(model, updates, { updatedAt: new Date().toISOString() });

    // Handle name change - update currentModel if needed
    if (updates.name && oldName !== updates.name) {
      if (config.currentModel === oldName) {
        config.currentModel = updates.name;
      }
    }

    await this.configManager.saveConfig(config);
    await this.configManager.addChange('update', name, `Updated model: ${oldName}`);

    return model;
  }

  formatModel(model: Model, isCurrent: boolean = false): string {
    const prefix = isCurrent ? chalk.green('▶ ') : '  ';
    const name = isCurrent ? chalk.bold(model.name) : model.name;
    const desc = model.description ? chalk.gray(` - ${model.description}`) : '';
    const lastUsed = model.lastUsed
      ? chalk.blue(`\n    Last used: ${new Date(model.lastUsed).toLocaleString()}`)
      : '';

    let modelConfigs = '';
    if (model.defaultOpusModel || model.defaultSonnetModel || model.defaultHaikuModel) {
      modelConfigs = chalk.gray('\n    Model configs:');
      if (model.defaultOpusModel) {
        modelConfigs += chalk.gray(`\n      Opus: ${model.defaultOpusModel}`);
      }
      if (model.defaultSonnetModel) {
        modelConfigs += chalk.gray(`\n      Sonnet: ${model.defaultSonnetModel}`);
      }
      if (model.defaultHaikuModel) {
        modelConfigs += chalk.gray(`\n      Haiku: ${model.defaultHaikuModel}`);
      }
    }

    return `${prefix}${name}${desc}${modelConfigs}${lastUsed}`;
  }

  formatModelFull(model: Model, isCurrent: boolean = false): string {
    const prefix = isCurrent ? chalk.green('▶ ') : '  ';
    const name = isCurrent ? chalk.bold(model.name) : model.name;

    const lines = [
      `${prefix}${name}`,
      `  ID: ${chalk.gray(model.id)}`,
      `  Token: ${chalk.gray(model.token)}`,
      `  Base URL: ${chalk.gray(model.baseUrl)}`,
      `  Description: ${chalk.gray(model.description || 'N/A')}`,
      `  Created: ${chalk.gray(new Date(model.createdAt).toLocaleString())}`,
      `  Last Used: ${chalk.gray(model.lastUsed ? new Date(model.lastUsed).toLocaleString() : 'Never')}`,
      `  Updated: ${chalk.gray(model.updatedAt ? new Date(model.updatedAt).toLocaleString() : 'N/A')}`
    ];

    if (model.defaultOpusModel || model.defaultSonnetModel || model.defaultHaikuModel) {
      lines.push('  Model Configs:');
      if (model.defaultOpusModel) {
        lines.push(`    Opus: ${chalk.gray(model.defaultOpusModel)}`);
      }
      if (model.defaultSonnetModel) {
        lines.push(`    Sonnet: ${chalk.gray(model.defaultSonnetModel)}`);
      }
      if (model.defaultHaikuModel) {
        lines.push(`    Haiku: ${chalk.gray(model.defaultHaikuModel)}`);
      }
    }

    return lines.join('\n');
  }
}

export default ModelManager;
