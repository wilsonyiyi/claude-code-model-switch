import chalk from 'chalk';
import { selectModel, confirmAction, promptNewModelDetails, promptModelUpdates, filterUpdates, promptModelFromProvider } from '../utils/interactiveHelpers.js';
import { launchClaude } from '../utils/claudeLauncher.js';
import ConfigManager from '../configManager.js';

export async function interactiveCommand(modelManager, inquirer) {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Add from provider (recommended)', value: 'provider' },
        { name: 'Add a new model (manual)', value: 'add' },
        { name: 'Update a model', value: 'update' },
        { name: 'List all models', value: 'list' },
        { name: 'Use a model (switch + launch)', value: 'use' },
        { name: 'Show current model', value: 'current' },
        { name: 'Remove a model', value: 'remove' },
        { name: 'View change history', value: 'history' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  if (action === 'exit') {
    console.log(chalk.blue('Goodbye!'));
    process.exit(0);
  }

  await handleInteractiveAction(action, modelManager, inquirer);
}

export async function handleInteractiveAction(action, modelManager, inquirer) {
  const models = await modelManager.listModels();

  switch (action) {
    case 'provider': {
      try {
        const answers = await promptModelFromProvider(inquirer);

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

        // Ask if user wants to use it
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
          await launchClaude(selectedModel, []);
        }
      } catch (error) {
        console.error(chalk.red(`\nError: ${error.message}`));
      }
      break;
    }

    case 'add': {
      const answers = await promptNewModelDetails();

      try {
        const modelConfig = {};
        if (answers.defaultOpusModel) modelConfig.defaultOpusModel = answers.defaultOpusModel;
        if (answers.defaultSonnetModel) modelConfig.defaultSonnetModel = answers.defaultSonnetModel;
        if (answers.defaultHaikuModel) modelConfig.defaultHaikuModel = answers.defaultHaikuModel;

        await modelManager.addModel(answers.name, answers.token, answers.baseUrl, answers.description, modelConfig);
        console.log(chalk.green('\n✓ Model added successfully!'));
        if (answers.configureModels) {
          console.log(chalk.gray('\nModel configurations set:'));
          if (answers.defaultOpusModel) console.log(chalk.gray(`  Opus: ${answers.defaultOpusModel}`));
          if (answers.defaultSonnetModel) console.log(chalk.gray(`  Sonnet: ${answers.defaultSonnetModel}`));
          if (answers.defaultHaikuModel) console.log(chalk.gray(`  Haiku: ${answers.defaultHaikuModel}`));
        }
      } catch (error) {
        console.error(chalk.red(`\nError: ${error.message}`));
      }
      break;
    }

    case 'use': {
      if (models.length === 0) {
        console.log(chalk.yellow('\nNo models configured. Add one first!'));
        break;
      }

      const modelName = await selectModel(models, 'Select a model:');

      try {
        const selectedModel = await modelManager.switchModel(modelName);
        console.log(chalk.green(`\n✓ Switched to model: ${modelName}`));

        // Launch Claude
        await launchClaude(selectedModel, []);
      } catch (error) {
        console.error(chalk.red(`\nError: ${error.message}`));
      }
      break;
    }

    case 'list': {
      const currentModel = await modelManager.getCurrentModel();
      console.log(chalk.blue('\nConfigured Models:'));
      models.forEach(model => {
        console.log(modelManager.formatModel(model, currentModel && currentModel.name === model.name));
      });
      console.log('');
      break;
    }

    case 'current': {
      const model = await modelManager.getCurrentModel();
      if (model) {
        console.log(chalk.green('\nCurrent Model:'));
        console.log(chalk.bold(`  ${model.name}`));
        if (model.description) {
          console.log(`  ${model.description}`);
        }
        if (model.defaultOpusModel || model.defaultSonnetModel || model.defaultHaikuModel) {
          console.log(chalk.gray('\n  Model configurations:'));
          if (model.defaultOpusModel) console.log(chalk.gray(`    Opus: ${model.defaultOpusModel}`));
          if (model.defaultSonnetModel) console.log(chalk.gray(`    Sonnet: ${model.defaultSonnetModel}`));
          if (model.defaultHaikuModel) console.log(chalk.gray(`    Haiku: ${model.defaultHaikuModel}`));
        }
      } else {
        console.log(chalk.yellow('\nNo model is currently selected.'));
      }
      break;
    }

    case 'remove': {
      if (models.length === 0) {
        console.log(chalk.yellow('\nNo models to remove.'));
        break;
      }

      const modelName = await selectModel(models, 'Select a model to remove:');
      const confirm = await confirmAction('Are you sure?', false);

      if (confirm) {
        try {
          await modelManager.removeModel(modelName);
          console.log(chalk.green(`\n✓ Model "${modelName}" removed!`));
        } catch (error) {
          console.error(chalk.red(`\nError: ${error.message}`));
        }
      }
      break;
    }

    case 'update': {
      if (models.length === 0) {
        console.log(chalk.yellow('\nNo models to update. Add one first!'));
        break;
      }

      const modelName = await selectModel(models, 'Select a model to update:');
      const selectedModel = await modelManager.getModel(modelName);

      const updates = await promptModelUpdates(selectedModel);
      const filteredUpdates = filterUpdates(updates, selectedModel);

      if (Object.keys(filteredUpdates).length === 0) {
        console.log(chalk.yellow('\nNo changes made.'));
        break;
      }

      try {
        await modelManager.updateModel(modelName, filteredUpdates);
        console.log(chalk.green('\n✓ Model updated successfully!'));

        // Show what was changed
        console.log(chalk.gray('\nChanges made:'));
        Object.entries(filteredUpdates).forEach(([key, value]) => {
          console.log(chalk.gray(`  ${key}: ${value}`));
        });
        console.log('');
      } catch (error) {
        console.error(chalk.red(`\nError: ${error.message}`));
      }
      break;
    }

    case 'history': {
      const configManager = new ConfigManager();
      const history = await configManager.getHistory();

      console.log(chalk.blue('\nChange History:'));
      history.changes.slice(0, 20).forEach(change => {
        const timestamp = new Date(change.timestamp).toLocaleString();
        const action = change.action.toUpperCase();
        const color = change.action === 'add' ? chalk.green : change.action === 'remove' ? chalk.red : chalk.yellow;
        console.log(`  ${chalk.gray(timestamp)} ${color(action)} ${change.modelName}`);
      });
      console.log('');
      break;
    }
  }
}
