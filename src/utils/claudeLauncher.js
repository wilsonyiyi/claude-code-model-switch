const { spawn } = require('child_process');
const chalk = require('chalk');

/**
 * Launches Claude with the specified model configuration
 * @param {Object} model - Model configuration object
 * @param {string[]} extraArgs - Additional arguments to pass to claude
 * @returns {Promise<number>} - Exit code
 */
function launchClaude(model, extraArgs = []) {
  return new Promise((resolve, reject) => {
    // Display launch info
    console.log(chalk.blue(`\n🚀 Launching claude with model: ${chalk.bold(model.name)}`));
    console.log(chalk.gray(`   Description: ${model.description || 'N/A'}`));

    // Log model configurations if they exist
    if (model.defaultOpusModel || model.defaultSonnetModel || model.defaultHaikuModel) {
      console.log(chalk.gray('   Model configurations:'));
      if (model.defaultOpusModel) {
        console.log(chalk.gray(`   - Opus: ${model.defaultOpusModel}`));
      }
      if (model.defaultSonnetModel) {
        console.log(chalk.gray(`   - Sonnet: ${model.defaultSonnetModel}`));
      }
      if (model.defaultHaikuModel) {
        console.log(chalk.gray(`   - Haiku: ${model.defaultHaikuModel}`));
      }
    }
    console.log('');

    // Build claude arguments
    const claudeArgs = ['--dangerously-skip-permissions', ...extraArgs];

    // Execute claude with current model environment variables
    const claudeCodeProcess = spawn('claude', claudeArgs, {
      stdio: 'inherit',
      env: {
        ...process.env,
        ANTHROPIC_AUTH_TOKEN: model.token,
        ANTHROPIC_BASE_URL: model.baseUrl,
        ...(model.defaultOpusModel && { ANTHROPIC_DEFAULT_OPUS_MODEL: model.defaultOpusModel }),
        ...(model.defaultSonnetModel && { ANTHROPIC_DEFAULT_SONNET_MODEL: model.defaultSonnetModel }),
        ...(model.defaultHaikuModel && { ANTHROPIC_DEFAULT_HAIKU_MODEL: model.defaultHaikuModel })
      }
    });

    claudeCodeProcess.on('error', (error) => {
      if (error.code === 'ENOENT') {
        console.error(chalk.red('❌ Error: \"claude\" command not found.'));
        console.log(chalk.yellow('\nPlease ensure claude is installed:'));
        console.log(chalk.gray('  npm install -g claude\n'));
      } else {
        console.error(chalk.red(`❌ Error launching claude: ${error.message}`));
      }
      reject(error);
    });

    claudeCodeProcess.on('exit', (code) => {
      resolve(code);
    });
  });
}

/**
 * Displays model information (formatted output)
 * @param {Object} model - Model configuration object
 */
function displayModelInfo(model) {
  console.log(chalk.gray(`   Description: ${model.description || 'N/A'}`));

  if (model.defaultOpusModel || model.defaultSonnetModel || model.defaultHaikuModel) {
    console.log(chalk.gray('   Model configurations:'));
    if (model.defaultOpusModel) {
      console.log(chalk.gray(`   - Opus: ${model.defaultOpusModel}`));
    }
    if (model.defaultSonnetModel) {
      console.log(chalk.gray(`   - Sonnet: ${model.defaultSonnetModel}`));
    }
    if (model.defaultHaikuModel) {
      console.log(chalk.gray(`   - Haiku: ${model.defaultHaikuModel}`));
    }
  }
  console.log('');
}

module.exports = {
  launchClaude,
  displayModelInfo
};
