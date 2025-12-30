import chalk from 'chalk';

export default async function currentCommand(modelManager) {
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
    console.log(chalk.gray(`  Last used: ${new Date(model.lastUsed).toLocaleString()}`));
    console.log('');
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
