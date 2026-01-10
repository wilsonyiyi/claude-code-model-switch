import chalk from 'chalk';
import type ModelManager from '../modelManager.js';
import type { InquirerType } from '../types.js';

export default async function removeCommand(modelManager: ModelManager, name: string, inquirer: InquirerType): Promise<void> {
  try {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to remove model "${name}"?`,
        default: false
      }
    ]);

    if (!confirm) {
      console.log('Cancelled.');
      return;
    }

    await modelManager.removeModel(name);
    console.log(chalk.green(`✓ Model "${name}" removed successfully!`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${message}`));
    process.exit(1);
  }
}
