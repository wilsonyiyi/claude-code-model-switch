import type inquirer from 'inquirer';

/**
 * Model configuration stored in config
 */
export interface Model {
  id: string;
  name: string;
  token: string;
  baseUrl: string;
  description: string;
  createdAt: string;
  lastUsed: string | null;
  updatedAt?: string;
  defaultOpusModel?: string;
  defaultSonnetModel?: string;
  defaultHaikuModel?: string;
}

/**
 * Application configuration
 */
export interface Config {
  models: Model[];
  currentModel: string | null;
  createdAt: string;
}

/**
 * History change entry
 */
export interface HistoryChange {
  id: number;
  timestamp: string;
  action: 'add' | 'remove' | 'switch' | 'update';
  modelName: string;
  details: string;
}

/**
 * History storage
 */
export interface History {
  changes: HistoryChange[];
}

/**
 * Model configuration options
 */
export interface ModelConfig {
  defaultOpusModel?: string;
  defaultSonnetModel?: string;
  defaultHaikuModel?: string;
}

/**
 * Provider preset configuration
 */
export interface Provider {
  name: string;
  baseUrl: string;
  description: string;
  modelConfig: ModelConfig;
}

/**
 * Provider presets map
 */
export interface Providers {
  [key: string]: Provider;
}

/**
 * Model updates for update command
 */
export interface ModelUpdates {
  name?: string;
  token?: string;
  baseUrl?: string;
  description?: string;
  defaultOpusModel?: string | null;
  defaultSonnetModel?: string | null;
  defaultHaikuModel?: string | null;
}

/**
 * CLI command options
 */
export interface AddCommandOptions {
  name: string;
  token: string;
  baseUrl: string;
  description?: string;
  opusModel?: string;
  sonnetModel?: string;
  haikuModel?: string;
}

export interface UpdateCommandOptions {
  newName?: string;
  token?: string;
  baseUrl?: string;
  description?: string;
  opusModel?: string;
  sonnetModel?: string;
  haikuModel?: string;
}

export interface ListCommandOptions {
  full?: boolean;
}

export interface HistoryCommandOptions {
  limit?: string;
}

/**
 * Launch result
 */
export interface LaunchResult {
  shouldExit: boolean;
  exitCode?: number;
}

/**
 * New model prompt answers
 */
export interface NewModelAnswers {
  name: string;
  token: string;
  baseUrl: string;
  description: string;
  configureModels: boolean;
  defaultOpusModel?: string;
  defaultSonnetModel?: string;
  defaultHaikuModel?: string;
}

/**
 * Provider selection answers
 */
export interface ProviderAnswers {
  name: string;
  token: string;
  baseUrl: string;
  description: string;
  modelConfig: ModelConfig;
}

// Re-export Inquirer type for use in commands
export type InquirerType = typeof inquirer;
