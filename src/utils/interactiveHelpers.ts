import inquirer from 'inquirer';
import chalk from 'chalk';
import { PROVIDERS } from '../providers.js';
import type { Model, ModelConfig, NewModelAnswers, ProviderAnswers, ModelUpdates, InquirerType } from '../types.js';

interface ModelChoice {
  name: string;
  value: string;
}

interface PromptUpdates {
  name?: string;
  token?: string;
  baseUrl?: string;
  description?: string;
  configureModels?: boolean;
  defaultOpusModel?: string;
  defaultSonnetModel?: string;
  defaultHaikuModel?: string;
}

/**
 * Prompts user to select a model from the list
 */
export async function selectModel(models: Model[], message: string = 'Select a model:'): Promise<string> {
  if (models.length === 0) {
    throw new Error('No models available');
  }

  const choices: ModelChoice[] = models.map(m => ({
    name: `${m.name}${m.description ? ` - ${m.description}` : ''}`,
    value: m.name
  }));

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'model',
      message,
      choices
    }
  ]);

  return answer.model;
}

/**
 * Prompts for confirmation
 */
export async function confirmAction(message: string, defaultAnswer: boolean = false): Promise<boolean> {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message,
      default: defaultAnswer
    }
  ]);
  return answer.confirm;
}

/**
 * Prompts for model creation details
 */
export async function promptNewModelDetails(): Promise<NewModelAnswers> {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Model name:' },
    { type: 'password', name: 'token', message: 'API Token:' },
    { type: 'input', name: 'baseUrl', message: 'Base URL:', default: 'https://api.anthropic.com' },
    { type: 'input', name: 'description', message: 'Description (optional):' },
    {
      type: 'confirm',
      name: 'configureModels',
      message: 'Configure default models for Opus, Sonnet, and Haiku?',
      default: false
    }
  ]);

  if (answers.configureModels) {
    const modelAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'defaultOpusModel',
        message: 'Default Opus model (e.g., claude-opus-4-5-20251101):',
        default: 'claude-opus-4-5-20251101',
        when: () => answers.configureModels
      },
      {
        type: 'input',
        name: 'defaultSonnetModel',
        message: 'Default Sonnet model (e.g., claude-sonnet-4-5-20250929):',
        default: 'claude-sonnet-4-5-20250929',
        when: () => answers.configureModels
      },
      {
        type: 'input',
        name: 'defaultHaikuModel',
        message: 'Default Haiku model (e.g., claude-haiku-4-5-20251001):',
        default: 'claude-haiku-4-5-20251001',
        when: () => answers.configureModels
      }
    ]);
    Object.assign(answers, modelAnswers);
  }

  return answers as NewModelAnswers;
}

/**
 * Prompts for model update details
 */
export async function promptModelUpdates(currentModel: Model): Promise<PromptUpdates> {
  console.log(chalk.blue('\nCurrent model configuration:'));
  console.log(chalk.gray(`  Name: ${currentModel.name}`));
  console.log(chalk.gray(`  Description: ${currentModel.description || 'N/A'}`));
  console.log(chalk.gray(`  Base URL: ${currentModel.baseUrl}`));
  console.log(chalk.gray(`  Token: ${currentModel.token.slice(0, 10)}...${currentModel.token.slice(-5)}`));
  if (currentModel.defaultOpusModel || currentModel.defaultSonnetModel || currentModel.defaultHaikuModel) {
    console.log(chalk.gray('  Model configurations:'));
    if (currentModel.defaultOpusModel) console.log(chalk.gray(`    Opus: ${currentModel.defaultOpusModel}`));
    if (currentModel.defaultSonnetModel) console.log(chalk.gray(`    Sonnet: ${currentModel.defaultSonnetModel}`));
    if (currentModel.defaultHaikuModel) console.log(chalk.gray(`    Haiku: ${currentModel.defaultHaikuModel}`));
  }
  console.log('');

  const updates = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'New name (leave blank to keep current):',
      default: currentModel.name
    },
    {
      type: 'password',
      name: 'token',
      message: 'New token (leave blank to keep current):',
      default: currentModel.token
    },
    {
      type: 'input',
      name: 'baseUrl',
      message: 'New base URL (leave blank to keep current):',
      default: currentModel.baseUrl
    },
    {
      type: 'input',
      name: 'description',
      message: 'New description (leave blank to keep current):',
      default: currentModel.description
    },
    {
      type: 'confirm',
      name: 'configureModels',
      message: 'Configure default models for Opus, Sonnet, and Haiku?',
      default: false
    }
  ]);

  if (updates.configureModels) {
    const modelAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'defaultOpusModel',
        message: 'Default Opus model (leave blank to keep current/remove):',
        default: currentModel.defaultOpusModel || ''
      },
      {
        type: 'input',
        name: 'defaultSonnetModel',
        message: 'Default Sonnet model (leave blank to keep current/remove):',
        default: currentModel.defaultSonnetModel || ''
      },
      {
        type: 'input',
        name: 'defaultHaikuModel',
        message: 'Default Haiku model (leave blank to keep current/remove):',
        default: currentModel.defaultHaikuModel || ''
      }
    ]);
    Object.assign(updates, modelAnswers);
  }

  return updates as PromptUpdates;
}

/**
 * Filters update object to only include changed values
 */
export function filterUpdates(updates: PromptUpdates, currentModel: Model): ModelUpdates {
  const filteredUpdates: ModelUpdates = {};

  if (updates.name && updates.name !== currentModel.name) filteredUpdates.name = updates.name;
  if (updates.token && updates.token !== currentModel.token) filteredUpdates.token = updates.token;
  if (updates.baseUrl && updates.baseUrl !== currentModel.baseUrl) filteredUpdates.baseUrl = updates.baseUrl;
  if (updates.description !== undefined && updates.description !== currentModel.description) {
    filteredUpdates.description = updates.description;
  }

  if (updates.configureModels) {
    if (updates.defaultOpusModel !== undefined) {
      filteredUpdates.defaultOpusModel = updates.defaultOpusModel || null;
    }
    if (updates.defaultSonnetModel !== undefined) {
      filteredUpdates.defaultSonnetModel = updates.defaultSonnetModel || null;
    }
    if (updates.defaultHaikuModel !== undefined) {
      filteredUpdates.defaultHaikuModel = updates.defaultHaikuModel || null;
    }
  }

  return filteredUpdates;
}

/**
 * Prompts for model selection from provider presets
 */
export async function promptModelFromProvider(inquirerInstance: InquirerType): Promise<ProviderAnswers> {
  const { provider } = await inquirerInstance.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select a model provider:',
      choices: Object.entries(PROVIDERS).map(([key, p]) => ({
        name: `${p.name} - ${p.description}`,
        value: key
      }))
    }
  ]);

  const selectedProvider = PROVIDERS[provider];

  // Basic information
  const answers: Partial<ProviderAnswers> = await inquirerInstance.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Name for this configuration:'
    },
    {
      type: 'password',
      name: 'token',
      message: 'API Key / Token:'
    }
  ]);

  // Custom provider needs additional info
  if (provider === 'custom') {
    const customAnswers = await inquirerInstance.prompt([
      {
        type: 'input',
        name: 'baseUrl',
        message: 'Base URL:'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):'
      }
    ]);
    Object.assign(answers, customAnswers);
    answers.modelConfig = {};
  } else {
    answers.baseUrl = selectedProvider.baseUrl;
    answers.description = `${selectedProvider.name} configuration`;

    // Confirm using preset model configurations
    const { useModels } = await inquirerInstance.prompt([
      {
        type: 'confirm',
        name: 'useModels',
        message: `Use default ${selectedProvider.name} model configurations?`,
        default: true
      }
    ]);

    if (useModels) {
      answers.modelConfig = selectedProvider.modelConfig;
    } else {
      answers.modelConfig = {};
    }
  }

  return answers as ProviderAnswers;
}
