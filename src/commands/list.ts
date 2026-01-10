import chalk from 'chalk';
import type ModelManager from '../modelManager.js';
import type { ListCommandOptions } from '../types.js';

export default async function listCommand(modelManager: ModelManager, options: ListCommandOptions = {}): Promise<void> {
  try {
    const models = await modelManager.listModels();
    const currentModel = await modelManager.getCurrentModel();

    if (models.length === 0) {
      console.log(chalk.yellow('No models configured. Use "cm add" to add one.'));
      return;
    }

    console.log(chalk.blue('\nConfigured Models:'));
    models.forEach(model => {
      const isCurrent = currentModel && currentModel.name === model.name;
      if (options.full) {
        console.log(modelManager.formatModelFull(model, isCurrent || false));
      } else {
        console.log(modelManager.formatModel(model, isCurrent || false));
      }
    });
    console.log('');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${message}`));
    process.exit(1);
  }
}
