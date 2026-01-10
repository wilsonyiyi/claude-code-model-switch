import chalk from 'chalk';
import type ModelManager from '../modelManager.js';
import type { AddCommandOptions, ModelConfig } from '../types.js';

export default async function addCommand(modelManager: ModelManager, options: AddCommandOptions): Promise<void> {
  try {
    const modelConfig: ModelConfig = {};
    if (options.opusModel) modelConfig.defaultOpusModel = options.opusModel;
    if (options.sonnetModel) modelConfig.defaultSonnetModel = options.sonnetModel;
    if (options.haikuModel) modelConfig.defaultHaikuModel = options.haikuModel;

    await modelManager.addModel(options.name, options.token, options.baseUrl, options.description, modelConfig);
    console.log(chalk.green('✓ Model added successfully!'));
    console.log(chalk.gray(`  Name: ${options.name}`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Error: ${message}`));
    process.exit(1);
  }
}
