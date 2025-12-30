import chalk from 'chalk';
import { selectModel, promptModelUpdates, filterUpdates } from '../utils/interactiveHelpers.js';

export default async function updateCommand(modelManager, name, options, inquirer) {
  try {
    let modelName = name;

    // Interactive mode if no name provided
    if (!modelName) {
      const models = await modelManager.listModels();

      if (models.length === 0) {
        console.log(chalk.yellow('No models configured. Use "cm add" to add one.'));
        return;
      }

      modelName = await selectModel(models, 'Select a model to update:');
    }

    const model = await modelManager.getModel(modelName);

    if (!model) {
      console.error(chalk.red(`Model "${modelName}" not found.`));
      process.exit(1);
    }

    // Check if any update options were provided
    const hasUpdates = options.newName || options.token || options.baseUrl ||
                      options.description || options.opusModel ||
                      options.sonnetModel || options.haikuModel;

    if (!hasUpdates) {
      // Interactive updates
      const updates = await promptModelUpdates(model);
      const filteredUpdates = filterUpdates(updates, model);

      if (Object.keys(filteredUpdates).length === 0) {
        console.log(chalk.yellow('No changes made.'));
        return;
      }

      await modelManager.updateModel(modelName, filteredUpdates);
      console.log(chalk.green('✓ Model updated successfully!'));

      // Show what was changed
      console.log(chalk.gray('\nChanges made:'));
      Object.entries(filteredUpdates).forEach(([key, value]) => {
        console.log(chalk.gray(`  ${key}: ${value}`));
      });
      console.log('');

    } else {
      // Command-line updates
      const updates = {};
      if (options.newName) updates.name = options.newName;
      if (options.token) updates.token = options.token;
      if (options.baseUrl) updates.baseUrl = options.baseUrl;
      if (options.description !== undefined) updates.description = options.description;
      if (options.opusModel) updates.defaultOpusModel = options.opusModel;
      if (options.sonnetModel) updates.defaultSonnetModel = options.sonnetModel;
      if (options.haikuModel) updates.defaultHaikuModel = options.haikuModel;

      await modelManager.updateModel(modelName, updates);
      console.log(chalk.green('✓ Model updated successfully!'));
      console.log(chalk.gray(`  Name: ${options.newName || modelName}`));
    }

  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
