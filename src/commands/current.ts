import chalk from 'chalk';
import type ModelManager from '../modelManager.js';

export default async function currentCommand(modelManager: ModelManager): Promise<void> {
  try {
    const model = await modelManager.getCurrentModel();

    if (!model) {
      console.log(chalk.yellow('No model is currently selected.'));
      return;
    }

    console.log(chalk.green('\nCurrent Model:'));
    console.log(chalk.bold(`  Name: ${model.name}`));
    if (model.description) {
      console.log(`  Description: ${model.description}`);
    }
    console.log(`  Base URL: ${model.baseUrl}`);
    console.log(chalk.gray(`  Last used: ${model.lastUsed ? new Date(model.lastUsed).toLocaleString() : 'Never'}`));
    console.log('');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${message}`));
    process.exit(1);
  }
}
