import chalk from 'chalk';

export default async function listCommand(modelManager, options = {}) {
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
        console.log(modelManager.formatModelFull(model, isCurrent));
      } else {
        console.log(modelManager.formatModel(model, isCurrent));
      }
    });
    console.log('');
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
