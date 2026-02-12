import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConfigManager from '../src/configManager';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    ensureDir: vi.fn(),
    pathExists: vi.fn(),
    writeJson: vi.fn(),
    readJson: vi.fn(),
  }
}));

// Mock os
vi.mock('os', () => {
  return {
    default: {
      platform: vi.fn(),
      homedir: vi.fn(),
    },
    platform: vi.fn(),
    homedir: vi.fn(),
  };
});

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  const mockHomeDir = '/mock/home';
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    (os.homedir as any).mockReturnValue(mockHomeDir);
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getConfigDir', () => {
    it('should return correct path for Windows', () => {
      (os.platform as any).mockReturnValue('win32');
      process.env.APPDATA = 'C:\\Users\\Test\\AppData\\Roaming';
      
      configManager = new ConfigManager();
      expect(configManager.getConfigDir()).toBe(path.join('C:\\Users\\Test\\AppData\\Roaming', 'claude-model-manager'));
    });

    it('should return correct path for non-Windows', () => {
      (os.platform as any).mockReturnValue('linux');
      
      configManager = new ConfigManager();
      expect(configManager.getConfigDir()).toBe(path.join(mockHomeDir, '.config', 'claude-model-manager'));
    });
  });

  describe('ensureConfigExists', () => {
    beforeEach(() => {
        (os.platform as any).mockReturnValue('linux');
        configManager = new ConfigManager();
    });

    it('should create config dir and files if they do not exist', async () => {
      (fs.pathExists as any).mockResolvedValue(false); // Files don't exist

      await configManager.ensureConfigExists();

      expect(fs.ensureDir).toHaveBeenCalledWith(configManager.configDir);
      
      // Check first write (Config)
      expect(fs.writeJson).toHaveBeenCalledWith(
        configManager.configFile,
        expect.objectContaining({ models: [], currentModel: null }),
        expect.any(Object)
      );
    });

    it('should not overwrite existing files', async () => {
      // Setup mock to return true for ANY call
      (fs.pathExists as any).mockImplementation(() => Promise.resolve(true));
      
      // Clear mocks
      vi.clearAllMocks();
      
      // Create NEW instance to ensure constructor logic runs with NEW mock
      // Note: we need to ensure the mock is active during constructor execution
      const cm = new ConfigManager();
      // Wait for async ensureConfigExists inside constructor? 
      // Wait, constructor is synchronous, but ensureConfigExists is async and called in constructor.
      // But it's NOT awaited in constructor!
      // In ConfigManager.ts: 
      // constructor() { ... this.ensureConfigExists(); }
      // This means it fires and forgets.
      
      // We need to wait for the promise to settle.
      // But we don't have the promise handle from the constructor.
      // We can call ensureConfigExists() explicitly and await it.
      // But the one from constructor is still running/racing.
      
      // Ah! That's the problem. The constructor triggers an unawaited async call.
      // In the previous test, I awaited `configManager.ensureConfigExists()`.
      // But the constructor's call might still be pending or have finished?
      
      // Let's create a new instance but mock ensureConfigExists to do nothing in constructor?
      // No, we want to test ensureConfigExists.
      
      // Since we can't await the constructor's call, we should just call the method directly on a static-like instance or just await the method on the existing instance.
      // But the existing instance ran in beforeEach.
      
      // Let's reuse the existing instance from beforeEach.
      // But beforeEach runs `new ConfigManager()`.
      // Which triggers `ensureConfigExists` (async).
      // That call might be finishing *after* we set the mock in the test?
      // No, `new ConfigManager` is synchronous. It starts the async operation.
      // The async op goes to microtask queue.
      // We set mock.
      // Then we await... what?
      
      // If we reuse `configManager` from beforeEach:
      // The constructor called `ensureConfigExists`. `fs.pathExists` was default (undefined).
      // So it queued a write.
      // We set mock to true.
      // We clear mocks.
      // But the queued write from constructor might execute now?
      // No, `await fs.pathExists` would resolve with `undefined` (from when it was called).
      
      // Solution:
      // 1. Mock pathExists globally to true in beforeEach? No, other tests need false.
      // 2. Wait for pending promises?
      
      // Better: Don't let constructor run the logic we are testing, OR accept that constructor runs it.
      // The class design `constructor() { this.ensureConfigExists(); }` is bad for testing because it's unawaited side effect.
      
      // We can mock `ensureConfigExists` on the prototype before instantiating?
      // Or just ignore the constructor's side effect by clearing mocks, THEN awaiting a manual call.
      
      // The problem is the constructor's call is *already* in flight.
      // And it used the *old* mock value (undefined).
      
      // Let's try to wait for all pending promises?
      await new Promise(resolve => setTimeout(resolve, 0));
      vi.clearAllMocks();
      
      (fs.pathExists as any).mockImplementation(() => Promise.resolve(true));
      
      await configManager.ensureConfigExists();

      expect(fs.ensureDir).toHaveBeenCalled();
      expect(fs.writeJson).not.toHaveBeenCalled();
    });
  });

  describe('Data Operations', () => {
    beforeEach(() => {
        (os.platform as any).mockReturnValue('linux');
        configManager = new ConfigManager();
    });

    it('getConfig should return config object', async () => {
        const mockConfig = { models: [], currentModel: 'test' };
        (fs.readJson as any).mockResolvedValue(mockConfig);
        (fs.pathExists as any).mockResolvedValue(true); 

        const result = await configManager.getConfig();
        expect(result).toEqual(mockConfig);
    });

    it('saveConfig should write config object', async () => {
        const mockConfig: any = { models: [], currentModel: 'test' };
        await configManager.saveConfig(mockConfig);
        expect(fs.writeJson).toHaveBeenCalledWith(configManager.configFile, mockConfig, expect.any(Object));
    });
  });
});
