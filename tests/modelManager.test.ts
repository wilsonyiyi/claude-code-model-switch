import { describe, it, expect, vi, beforeEach } from 'vitest';
import ModelManager from '../src/modelManager';

// Mock ConfigManager class
const mockGetConfig = vi.fn();
const mockSaveConfig = vi.fn();
const mockAddChange = vi.fn();
const mockGetDefaultModelConfig = vi.fn().mockResolvedValue({});
const mockEnsureConfigExists = vi.fn();

vi.mock('../src/configManager', () => {
  return {
    default: class {
      getConfig = mockGetConfig;
      saveConfig = mockSaveConfig;
      addChange = mockAddChange;
      getDefaultModelConfig = mockGetDefaultModelConfig;
      ensureConfigExists = mockEnsureConfigExists;
    }
  };
});

describe('ModelManager', () => {
  let modelManager: ModelManager;

  beforeEach(() => {
    vi.clearAllMocks();
    modelManager = new ModelManager();
  });

  describe('addModel', () => {
    it('should add a new model successfully', async () => {
      const mockConfig = { models: [], currentModel: null };
      mockGetConfig.mockResolvedValue(mockConfig);

      const result = await modelManager.addModel('gpt-4', 'sk-test', 'https://api.openai.com');

      expect(result).toMatchObject({
        name: 'gpt-4',
        token: 'sk-test',
        baseUrl: 'https://api.openai.com',
      });
      expect(mockConfig.models).toHaveLength(1);
      expect(mockSaveConfig).toHaveBeenCalledWith(mockConfig);
      expect(mockAddChange).toHaveBeenCalledWith('add', 'gpt-4', expect.any(String));
    });

    it('should throw error if model already exists', async () => {
      const existingModel = { name: 'gpt-4', token: 'sk-old', baseUrl: 'old' };
      const mockConfig = { models: [existingModel], currentModel: null };
      mockGetConfig.mockResolvedValue(mockConfig);

      await expect(modelManager.addModel('gpt-4', 'sk-new', 'new'))
        .rejects
        .toThrow('Model "gpt-4" already exists');
    });

    it('should throw error if required fields are missing', async () => {
      await expect(modelManager.addModel('', 'token', 'url'))
        .rejects
        .toThrow('Name, token, and baseUrl are required');
    });
  });

  describe('removeModel', () => {
    it('should remove an existing model', async () => {
      const modelToRemove = { name: 'gpt-4', token: 'sk-test', baseUrl: 'url' };
      const mockConfig = { models: [modelToRemove], currentModel: 'gpt-4' };
      mockGetConfig.mockResolvedValue(mockConfig);

      await modelManager.removeModel('gpt-4');

      expect(mockConfig.models).toHaveLength(0);
      expect(mockConfig.currentModel).toBeNull();
      expect(mockSaveConfig).toHaveBeenCalled();
      expect(mockAddChange).toHaveBeenCalledWith('remove', 'gpt-4', expect.any(String));
    });

    it('should throw error if model not found', async () => {
      const mockConfig = { models: [], currentModel: null };
      mockGetConfig.mockResolvedValue(mockConfig);

      await expect(modelManager.removeModel('non-existent'))
        .rejects
        .toThrow('Model "non-existent" not found');
    });
  });

  describe('switchModel', () => {
    it('should switch current model', async () => {
      const targetModel = { name: 'claude-3', lastUsed: null };
      const mockConfig = { models: [targetModel], currentModel: 'gpt-4' };
      mockGetConfig.mockResolvedValue(mockConfig);

      await modelManager.switchModel('claude-3');

      expect(mockConfig.currentModel).toBe('claude-3');
      expect(targetModel.lastUsed).not.toBeNull();
      expect(mockSaveConfig).toHaveBeenCalled();
      expect(mockAddChange).toHaveBeenCalledWith('switch', 'claude-3', expect.any(String));
    });

    it('should throw error if model not found', async () => {
      const mockConfig = { models: [], currentModel: null };
      mockGetConfig.mockResolvedValue(mockConfig);

      await expect(modelManager.switchModel('non-existent'))
        .rejects
        .toThrow('Model "non-existent" not found');
    });
  });
});
