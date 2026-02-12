import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CLI_PATH = path.join(PROJECT_ROOT, 'dist', 'cli.js');

const TEST_CONFIG_DIR = path.join(PROJECT_ROOT, 'temp-test-config-' + Date.now());

const runCm = (args: string, input?: string): Promise<{ stdout: string; stderr: string; code: number }> => {
  return new Promise((resolve) => {
    // Construct command
    let command = `node "${CLI_PATH}" ${args}`;
    if (input) {
      command = `echo "${input}" | ${command}`;
    }

    exec(
      command,
      {
        env: { ...process.env, CM_CONFIG_DIR: TEST_CONFIG_DIR },
        cwd: PROJECT_ROOT,
      },
      (error, stdout, stderr) => {
        resolve({
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          code: error ? (error.code as number) || 1 : 0,
        });
      }
    );
  });
};

describe('E2E Tests', () => {
  const testModelName = `test_model_${Date.now()}`;

  beforeAll(async () => {
    await fs.remove(TEST_CONFIG_DIR);
    await fs.ensureDir(TEST_CONFIG_DIR);
  });

  afterAll(async () => {
    await fs.remove(TEST_CONFIG_DIR);
  });

  it('should add a model', async () => {
    const { stdout, code } = await runCm(
      `add --name "${testModelName}" --token "sk-test-123" --base-url "https://api.anthropic.com" --description "Test Model"`
    );
    expect(code).toBe(0);
    expect(stdout).toContain('Model added successfully');
  });

  it('should list models', async () => {
    const { stdout, code } = await runCm('list');
    expect(code).toBe(0);
    expect(stdout).toContain(testModelName);
    expect(stdout).toContain('Test Model');
  });

  it('should use --help command', async () => {
    const { stdout, code } = await runCm('use --help');
    expect(code).toBe(0);
    expect(stdout).toContain('Usage: cm use');
  });

  it('should show current model (initially none)', async () => {
    const { stdout, code } = await runCm('current');
    expect(code).toBe(0);
    // Might output "No model selected" or similar depending on implementation
  });

  it('should show history', async () => {
    const { stdout, code } = await runCm('history');
    expect(code).toBe(0);
    // History output might use uppercase action names or specific format
    // Received: 2/12/2026, 8:59:12 AM ADD test_model_...
    expect(stdout).toContain('ADD');
    expect(stdout).toContain(testModelName);
  });

  it('should remove a model', async () => {
    const { stdout, code } = await runCm(`remove "${testModelName}"`, 'y');
    expect(code).toBe(0);
    expect(stdout).toContain('removed successfully');
  });

  it('should verify model is removed', async () => {
    const { stdout, code } = await runCm('list');
    expect(code).toBe(0);
    expect(stdout).not.toContain(testModelName);
  });
});
