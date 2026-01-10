import chalk from 'chalk';
import { launchClaude } from '../utils/claudeLauncher.js';
import type ModelManager from '../modelManager.js';
import type { LaunchResult } from '../types.js';

/**
 * Handles the automatic launch when no arguments are provided
 */
export async function autoLaunchClaude(modelManager: ModelManager, processArgv: string[]): Promise<LaunchResult> {
  try {
    const currentModel = await modelManager.getCurrentModel();
    const models = await modelManager.listModels();

    if (models.length === 0) {
      console.log(chalk.yellow('No models configured. Use "cm add" to add one.'));
      return { shouldExit: true };
    }

    if (!currentModel) {
      console.log(chalk.yellow('No model currently selected. Use "cm use <name>" to select one.'));
      return { shouldExit: true };
    }

    // Execute claude with current model environment variables
    const claudeArgs = processArgv.slice(2);
    const exitCode = await launchClaude(currentModel, claudeArgs);

    return { shouldExit: true, exitCode };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${message}`));
    return { shouldExit: true, exitCode: 1 };
  }
}
