const chalk = require('chalk');

async function listCommand(modelManager) {
  try {
    const models = await modelManager.listModels();
    const currentModel = await modelManager.getCurrentModel();

    if (models.length === 0) {
      console.log(chalk.yellow('No models configured. Use "cm add" to add one.'));
      return;
    }

    console.log(chalk.blue('\nConfigured Models:'));
    models.forEach(model => {
      console.log(modelManager.formatModel(model, currentModel && currentModel.name === model.name));
    });
    console.log('');
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = listCommand;
