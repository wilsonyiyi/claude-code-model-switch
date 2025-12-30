import chalk from 'chalk';

export default async function removeCommand(modelManager, name, inquirer) {
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
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
