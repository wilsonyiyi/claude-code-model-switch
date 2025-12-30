/**
 * Predefined model provider configurations
 * Users select a provider and only need to provide their API key
 */

export const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com',
    description: 'Claude models (Opus, Sonnet, Haiku)',
    modelConfig: {
      defaultOpusModel: 'claude-opus-4-5-20251101',
      defaultSonnetModel: 'claude-sonnet-4-5-20250929',
      defaultHaikuModel: 'claude-haiku-4-5-20251001'
    }
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    description: 'Multiple model providers unified',
    modelConfig: {
      defaultOpusModel: 'anthropic/claude-3.5-sonnet',
      defaultSonnetModel: 'anthropic/claude-3.5-haiku',
      defaultHaikuModel: 'openai/gpt-4o-mini'
    }
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    description: 'GPT models',
    modelConfig: {
      defaultOpusModel: 'gpt-4o',
      defaultSonnetModel: 'gpt-4o-mini',
      defaultHaikuModel: 'gpt-3.5-turbo'
    }
  },
  xiaomi: {
    name: 'Xiaomi',
    baseUrl: 'https://api.xiaomimimo.com/anthropic',
    description: 'Xiaomi models',
    modelConfig: {
      defaultOpusModel: 'mimo-v2-flash',
      defaultSonnetModel: 'mimo-v2-flash',
      defaultHaikuModel: 'mimo-v2-flash'
    }
  },
  custom: {
    name: 'Custom',
    baseUrl: '',
    description: 'Enter your own configuration',
    modelConfig: {}
  }
};
