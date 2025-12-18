const chalk = require('chalk');

async function addCommand(modelManager, options) {
  try {
    const modelConfig = {};
    if (options.opusModel) modelConfig.defaultOpusModel = options.opusModel;
    if (options.sonnetModel) modelConfig.defaultSonnetModel = options.sonnetModel;
    if (options.haikuModel) modelConfig.defaultHaikuModel = options.haikuModel;

    await modelManager.addModel(options.name, options.token, options.baseUrl, options.description, modelConfig);
    console.log(chalk.green('✓ Model added successfully!'));
    console.log(chalk.gray(`  Name: ${options.name}`));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

module.exports = addCommand;
