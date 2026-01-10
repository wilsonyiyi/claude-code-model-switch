import chalk from 'chalk';
import ConfigManager from '../configManager.js';
import type { HistoryCommandOptions } from '../types.js';

export default async function historyCommand(options: HistoryCommandOptions): Promise<void> {
  try {
    const configManager = new ConfigManager();
    const history = await configManager.getHistory();

    if (history.changes.length === 0) {
      console.log(chalk.yellow('No change history available.'));
      return;
    }

    console.log(chalk.blue('\nChange History:'));
    const limit = parseInt(options.limit || '20') || 20;
    history.changes.slice(0, limit).forEach(change => {
      const timestamp = new Date(change.timestamp).toLocaleString();
      const action = change.action.toUpperCase();
      const color = change.action === 'add' ? chalk.green : change.action === 'remove' ? chalk.red : chalk.yellow;
      console.log(`  ${chalk.gray(timestamp)} ${color(action)} ${change.modelName} ${chalk.gray(`- ${change.details}`)}`);
    });
    console.log('');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${message}`));
    process.exit(1);
  }
}
