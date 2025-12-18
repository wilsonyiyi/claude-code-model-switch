const chalk = require('chalk');
const ConfigManager = require('../configManager');

async function historyCommand(options) {
  try {
    const configManager = new ConfigManager();
    const manager = configManager;
    const history = await manager.getHistory();

    if (history.changes.length === 0) {
      console.log(chalk.yellow('No change history available.'));
      return;
    }

    console.log(chalk.blue('\nChange History:'));
    const limit = parseInt(options.limit) || 20;
    history.changes.slice(0, limit).forEach(change => {
      const timestamp = new Date(change.timestamp).toLocaleString();
      const action = change.action.toUpperCase();
      const color = change.action === 'add' ? chalk.green : change.action === 'remove' ? chalk.red : chalk.yellow;
      console.log(`  ${chalk.gray(timestamp)} ${color(action)} ${change.modelName} ${chalk.gray(`- ${change.details}`)}`);
    });
    console.log('');
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = historyCommand;
