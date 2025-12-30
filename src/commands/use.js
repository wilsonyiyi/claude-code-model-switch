import chalk from 'chalk';
import { selectModel } from '../utils/interactiveHelpers.js';
import { launchClaude } from '../utils/claudeLauncher.js';

export default async function useCommand(modelManager, name, inquirer, processArgv) {
  try {
    let modelName = name;

    if (!modelName) {
      const models = await modelManager.listModels();

      if (models.length === 0) {
        console.log(chalk.yellow('No models configured. Use "cm add" to add one.'));
        return;
      }

      modelName = await selectModel(models, 'Select a model to switch to:');
    }

    const selectedModel = await modelManager.switchModel(modelName);
    console.log(chalk.green(`✓ Switched to model: ${modelName}`));

    // Launch Claude with the selected model
    // Skip 'use' command and model name from argv
    const claudeArgs = processArgv.slice(3);
    await launchClaude(selectedModel, claudeArgs);
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
