import chalk from 'chalk';
import { promptModelFromProvider } from '../utils/interactiveHelpers.js';
import { launchClaude } from '../utils/claudeLauncher.js';

export default async function providerCommand(modelManager, inquirer, processArgv = []) {
  try {
    // Get model configuration from provider selection
    const answers = await promptModelFromProvider(inquirer);

    // Add the model
    await modelManager.addModel(
      answers.name,
      answers.token,
      answers.baseUrl,
      answers.description,
      answers.modelConfig
    );

    console.log(chalk.green('\n✓ Model added successfully!'));
    console.log(chalk.gray(`  Name: ${answers.name}`));
    console.log(chalk.gray(`  Provider: ${answers.description}`));
    console.log(chalk.gray(`  Base URL: ${answers.baseUrl}`));

    // Ask if user wants to use this model immediately
    const { shouldUse } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldUse',
        message: 'Switch to this model and launch Claude?',
        default: false
      }
    ]);

    if (shouldUse) {
      const selectedModel = await modelManager.switchModel(answers.name);
      console.log(chalk.green(`\n✓ Switched to model: ${answers.name}`));

      // Launch Claude with the selected model
      await launchClaude(selectedModel, processArgv.slice(3));
    }

  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}
