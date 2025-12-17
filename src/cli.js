#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ModelManager = require('./modelManager');
const { spawn } = require('child_process');
const pkg = require('../package.json');

// Dynamic import for inquirer to avoid ESM/CJS conflict
(async () => {
  const inquirerModule = await import('inquirer');
  const inquirer = inquirerModule.default;

  const program = new Command();
  const modelManager = new ModelManager();

  program
    .name('cm')
    .description('Claude Code model configuration manager')
    .version(pkg.version);

  // Check if no arguments provided - if so, try to launch claude
  const args = process.argv.slice(2);
  if (args.length === 0) {
    try {
      const currentModel = await modelManager.getCurrentModel();
      const models = await modelManager.listModels();

      if (models.length === 0) {
        console.log(chalk.yellow('No models configured. Use "cm add" to add one.'));
        program.help();
        process.exit(0);
      }

      if (!currentModel) {
        console.log(chalk.yellow('No model currently selected. Use "cm use <name>" to select one.'));
        program.help();
        process.exit(0);
      }

      console.log(chalk.blue(`\n🚀 Launching claude with model: ${chalk.bold(currentModel.name)}`));
      console.log(chalk.gray(`   Description: ${currentModel.description || 'N/A'}`));

      // Log model configurations if they exist
      if (currentModel.defaultOpusModel || currentModel.defaultSonnetModel || currentModel.defaultHaikuModel) {
        console.log(chalk.gray('   Model configurations:'));
        if (currentModel.defaultOpusModel) {
          console.log(chalk.gray(`   - Opus: ${currentModel.defaultOpusModel}`));
        }
        if (currentModel.defaultSonnetModel) {
          console.log(chalk.gray(`   - Sonnet: ${currentModel.defaultSonnetModel}`));
        }
        if (currentModel.defaultHaikuModel) {
          console.log(chalk.gray(`   - Haiku: ${currentModel.defaultHaikuModel}`));
        }
      }
      console.log('');

      // Execute claude with current model environment variables
      // Add --dangerously-skip-permissions by default to bypass file permission checks
      const claudeArgs = ['--dangerously-skip-permissions', ...process.argv.slice(2)];
      const claudeCodeProcess = spawn('claude', claudeArgs, {
        stdio: 'inherit',
        env: {
          ...process.env,
          ANTHROPIC_AUTH_TOKEN: currentModel.token,
          ANTHROPIC_BASE_URL: currentModel.baseUrl,
          ...(currentModel.defaultOpusModel && { ANTHROPIC_DEFAULT_OPUS_MODEL: currentModel.defaultOpusModel }),
          ...(currentModel.defaultSonnetModel && { ANTHROPIC_DEFAULT_SONNET_MODEL: currentModel.defaultSonnetModel }),
          ...(currentModel.defaultHaikuModel && { ANTHROPIC_DEFAULT_HAIKU_MODEL: currentModel.defaultHaikuModel })
        }
      });

      claudeCodeProcess.on('error', (error) => {
        if (error.code === 'ENOENT') {
          console.error(chalk.red('❌ Error: "claude" command not found.'));
          console.log(chalk.yellow('\nPlease ensure claude is installed:'));
          console.log(chalk.gray('  npm install -g claude\n'));
        } else {
          console.error(chalk.red(`❌ Error launching claude: ${error.message}`));
        }
        process.exit(1);
      });

      claudeCodeProcess.on('exit', (code) => {
        process.exit(code);
      });

      return; // Don't continue with command parsing
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  }

  // Add command
  program
    .command('add')
    .description('Add a new model configuration')
    .requiredOption('-n, --name <name>', 'Model name')
    .requiredOption('-t, --token <token>', 'Anthropic API token')
    .requiredOption('-b, --base-url <url>', 'Anthropic base URL')
    .option('-d, --description <description>', 'Model description')
    .option('--opus-model <model>', 'Default Opus model (optional)')
    .option('--sonnet-model <model>', 'Default Sonnet model (optional)')
    .option('--haiku-model <model>', 'Default Haiku model (optional)')
    .action(async (options) => {
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
    });

  // List command
  program
    .command('list')
    .description('List all model configurations')
    .action(async () => {
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
    });

  // Use command
  program
    .command('use')
    .description('Switch to a model configuration and launch Claude')
    .argument('[name]', 'Model name (interactive mode if not specified)')
    .action(async (name) => {
      try {
        let modelName = name;

        if (!modelName) {
          const models = await modelManager.listModels();

          if (models.length === 0) {
            console.log(chalk.yellow('No models configured. Use "cm add" to add one.'));
            return;
          }

          const choices = models.map(m => ({
            name: `${m.name}${m.description ? ` - ${m.description}` : ''}`,
            value: m.name
          }));

          const answer = await inquirer.prompt([
            {
              type: 'list',
              name: 'model',
              message: 'Select a model to switch to:',
              choices
            }
          ]);

          modelName = answer.model;
        }

        const selectedModel = await modelManager.switchModel(modelName);
        console.log(chalk.green(`✓ Switched to model: ${modelName}`));

        // Launch Claude with the selected model
        console.log(chalk.blue(`\n🚀 Launching claude with model: ${chalk.bold(selectedModel.name)}`));
        console.log(chalk.gray(`   Description: ${selectedModel.description || 'N/A'}`));

        // Log model configurations if they exist
        if (selectedModel.defaultOpusModel || selectedModel.defaultSonnetModel || selectedModel.defaultHaikuModel) {
          console.log(chalk.gray('   Model configurations:'));
          if (selectedModel.defaultOpusModel) {
            console.log(chalk.gray(`   - Opus: ${selectedModel.defaultOpusModel}`));
          }
          if (selectedModel.defaultSonnetModel) {
            console.log(chalk.gray(`   - Sonnet: ${selectedModel.defaultSonnetModel}`));
          }
          if (selectedModel.defaultHaikuModel) {
            console.log(chalk.gray(`   - Haiku: ${selectedModel.defaultHaikuModel}`));
          }
        }
        console.log('');

        // Execute claude with current model environment variables
        // Add --dangerously-skip-permissions by default to bypass file permission checks
        const claudeArgs = ['--dangerously-skip-permissions', ...process.argv.slice(3)]; // Skip 'use' command and model name
        const claudeCodeProcess = spawn('claude', claudeArgs, {
          stdio: 'inherit',
          env: {
            ...process.env,
            ANTHROPIC_AUTH_TOKEN: selectedModel.token,
            ANTHROPIC_BASE_URL: selectedModel.baseUrl,
            ...(selectedModel.defaultOpusModel && { ANTHROPIC_DEFAULT_OPUS_MODEL: selectedModel.defaultOpusModel }),
            ...(selectedModel.defaultSonnetModel && { ANTHROPIC_DEFAULT_SONNET_MODEL: selectedModel.defaultSonnetModel }),
            ...(selectedModel.defaultHaikuModel && { ANTHROPIC_DEFAULT_HAIKU_MODEL: selectedModel.defaultHaikuModel })
          }
        });

        claudeCodeProcess.on('error', (error) => {
          if (error.code === 'ENOENT') {
            console.error(chalk.red('❌ Error: "claude" command not found.'));
            console.log(chalk.yellow('\nPlease ensure claude is installed:'));
            console.log(chalk.gray('  npm install -g claude\\n'));
          } else {
            console.error(chalk.red(`Error launching claude: ${error.message}`));
          }
          process.exit(1);
        });

        claudeCodeProcess.on('exit', (code) => {
          process.exit(code);
        });
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  // Current command
  program
    .command('current')
    .description('Show current model configuration')
    .action(async () => {
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
    });

  // Remove command
  program
    .command('remove')
    .description('Remove a model configuration')
    .argument('<name>', 'Model name')
    .action(async (name) => {
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
    });

  // History command
  program
    .command('history')
    .description('Show configuration change history')
    .option('-l, --limit <number>', 'Number of records to show', '20')
    .action(async (options) => {
      try {
        const configManager = require('./configManager');
        const manager = new configManager();
        const history = await manager.getHistory();

        if (history.changes.length === 0) {
          console.log(chalk.yellow('No change history available.'));
          return;
        }

        console.log(chalk.blue('\nChange History:'));
        const limit = parseInt(options.limit) || 20;
        history.changes.slice(0, limit).forEach(change => {
          const timestamp = new Date(change.timestamp).toLocaleString();
          const action = change.action.toUpperCase();
          const color = change.action === 'add' ? chalk.green : change.action === 'remove' ? chalk.red : chalk.yellow;
          console.log(`  ${chalk.gray(timestamp)} ${color(action)} ${change.modelName} ${chalk.gray(`- ${change.details}`)}`);
        });
        console.log('');
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  // Update command
  program
    .command('update')
    .description('Update a model configuration')
    .argument('[name]', 'Model name to update (interactive if not specified)')
    .option('-n, --new-name <name>', 'New name for the model')
    .option('-t, --token <token>', 'New API token')
    .option('-b, --base-url <url>', 'New base URL')
    .option('-d, --description <description>', 'New description')
    .option('--opus-model <model>', 'Default Opus model')
    .option('--sonnet-model <model>', 'Default Sonnet model')
    .option('--haiku-model <model>', 'Default Haiku model')
    .action(async (name, options) => {
      try {
        let modelName = name;

        // Interactive mode if no name provided
        if (!modelName) {
          const models = await modelManager.listModels();

          if (models.length === 0) {
            console.log(chalk.yellow('No models configured. Use "cm add" to add one.'));
            return;
          }

          const choices = models.map(m => ({
            name: `${m.name}${m.description ? ` - ${m.description}` : ''}`,
            value: m.name
          }));

          const answer = await inquirer.prompt([
            {
              type: 'list',
              name: 'model',
              message: 'Select a model to update:',
              choices
            }
          ]);

          modelName = answer.model;
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
          console.log(chalk.blue('\nCurrent model configuration:'));
          console.log(chalk.gray(`  Name: ${model.name}`));
          console.log(chalk.gray(`  Description: ${model.description || 'N/A'}`));
          console.log(chalk.gray(`  Base URL: ${model.baseUrl}`));
          console.log(chalk.gray(`  Token: ${model.token.slice(0, 10)}...${model.token.slice(-5)}`));
          if (model.defaultOpusModel || model.defaultSonnetModel || model.defaultHaikuModel) {
            console.log(chalk.gray('  Model configurations:'));
            if (model.defaultOpusModel) console.log(chalk.gray(`    Opus: ${model.defaultOpusModel}`));
            if (model.defaultSonnetModel) console.log(chalk.gray(`    Sonnet: ${model.defaultSonnetModel}`));
            if (model.defaultHaikuModel) console.log(chalk.gray(`    Haiku: ${model.defaultHaikuModel}`));
          }
          console.log('');

          const updates = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'New name (leave blank to keep current):',
              default: model.name
            },
            {
              type: 'password',
              name: 'token',
              message: 'New token (leave blank to keep current):',
              default: model.token
            },
            {
              type: 'input',
              name: 'baseUrl',
              message: 'New base URL (leave blank to keep current):',
              default: model.baseUrl
            },
            {
              type: 'input',
              name: 'description',
              message: 'New description (leave blank to keep current):',
              default: model.description
            },
            {
              type: 'confirm',
              name: 'configureModels',
              message: 'Configure default models for Opus, Sonnet, and Haiku?',
              default: false
            }
          ]);

          if (updates.configureModels) {
            const modelAnswers = await inquirer.prompt([
              {
                type: 'input',
                name: 'defaultOpusModel',
                message: 'Default Opus model (leave blank to keep current/remove):',
                default: model.defaultOpusModel || ''
              },
              {
                type: 'input',
                name: 'defaultSonnetModel',
                message: 'Default Sonnet model (leave blank to keep current/remove):',
                default: model.defaultSonnetModel || ''
              },
              {
                type: 'input',
                name: 'defaultHaikuModel',
                message: 'Default Haiku model (leave blank to keep current/remove):',
                default: model.defaultHaikuModel || ''
              }
            ]);
            Object.assign(updates, modelAnswers);
          }

          // Filter out empty values and unchanged values
          const filteredUpdates = {};
          if (updates.name && updates.name !== model.name) filteredUpdates.name = updates.name;
          if (updates.token && updates.token !== model.token) filteredUpdates.token = updates.token;
          if (updates.baseUrl && updates.baseUrl !== model.baseUrl) filteredUpdates.baseUrl = updates.baseUrl;
          if (updates.description !== undefined && updates.description !== model.description) {
            filteredUpdates.description = updates.description;
          }
          if (updates.configureModels) {
            if (updates.defaultOpusModel !== undefined) {
              filteredUpdates.defaultOpusModel = updates.defaultOpusModel || null;
            }
            if (updates.defaultSonnetModel !== undefined) {
              filteredUpdates.defaultSonnetModel = updates.defaultSonnetModel || null;
            }
            if (updates.defaultHaikuModel !== undefined) {
              filteredUpdates.defaultHaikuModel = updates.defaultHaikuModel || null;
            }
          }

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
    });

  // Interactive mode
  program
    .command('interactive')
    .alias('i')
    .description('Interactive mode for managing models')
    .action(async () => {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: 'Add a new model', value: 'add' },
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

      await handleInteractiveAction(action);
    });

  async function handleInteractiveAction(action) {
    const models = await modelManager.listModels();

    switch (action) {
      case 'add': {
        const answers = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Model name:' },
          { type: 'password', name: 'token', message: 'API Token:' },
          { type: 'input', name: 'baseUrl', message: 'Base URL:', default: 'https://api.anthropic.com' },
          { type: 'input', name: 'description', message: 'Description (optional):' },
          {
            type: 'confirm',
            name: 'configureModels',
            message: 'Configure default models for Opus, Sonnet, and Haiku?',
            default: false
          }
        ]);

        if (answers.configureModels) {
          const modelAnswers = await inquirer.prompt([
            {
              type: 'input',
              name: 'defaultOpusModel',
              message: 'Default Opus model (e.g., claude-opus-4-5-20251101):',
              default: 'claude-opus-4-5-20251101',
              when: () => answers.configureModels
            },
            {
              type: 'input',
              name: 'defaultSonnetModel',
              message: 'Default Sonnet model (e.g., claude-sonnet-4-5-20250929):',
              default: 'claude-sonnet-4-5-20250929',
              when: () => answers.configureModels
            },
            {
              type: 'input',
              name: 'defaultHaikuModel',
              message: 'Default Haiku model (e.g., claude-haiku-4-5-20251001):',
              default: 'claude-haiku-4-5-20251001',
              when: () => answers.configureModels
            }
          ]);
          Object.assign(answers, modelAnswers);
        }

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

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'model',
            message: 'Select a model:',
            choices: models.map(m => m.name)
          }
        ]);

        try {
          const selectedModel = await modelManager.switchModel(answer.model);
          console.log(chalk.green(`\n✓ Switched to model: ${answer.model}`));

          // Launch Claude
          console.log(chalk.blue(`\n🚀 Launching claude with model: ${chalk.bold(selectedModel.name)}`));
          console.log(chalk.gray(`   Description: ${selectedModel.description || 'N/A'}`));

          if (selectedModel.defaultOpusModel || selectedModel.defaultSonnetModel || selectedModel.defaultHaikuModel) {
            console.log(chalk.gray('   Model configurations:'));
            if (selectedModel.defaultOpusModel) {
              console.log(chalk.gray(`   - Opus: ${selectedModel.defaultOpusModel}`));
            }
            if (selectedModel.defaultSonnetModel) {
              console.log(chalk.gray(`   - Sonnet: ${selectedModel.defaultSonnetModel}`));
            }
            if (selectedModel.defaultHaikuModel) {
              console.log(chalk.gray(`   - Haiku: ${selectedModel.defaultHaikuModel}`));
            }
          }
          console.log('');

          // Execute claude
          const claudeArgs = ['--dangerously-skip-permissions'];
          const claudeCodeProcess = spawn('claude', claudeArgs, {
            stdio: 'inherit',
            env: {
              ...process.env,
              ANTHROPIC_AUTH_TOKEN: selectedModel.token,
              ANTHROPIC_BASE_URL: selectedModel.baseUrl,
              ...(selectedModel.defaultOpusModel && { ANTHROPIC_DEFAULT_OPUS_MODEL: selectedModel.defaultOpusModel }),
              ...(selectedModel.defaultSonnetModel && { ANTHROPIC_DEFAULT_SONNET_MODEL: selectedModel.defaultSonnetModel }),
              ...(selectedModel.defaultHaikuModel && { ANTHROPIC_DEFAULT_HAIKU_MODEL: selectedModel.defaultHaikuModel })
            }
          });

          claudeCodeProcess.on('error', (error) => {
            if (error.code === 'ENOENT') {
              console.error(chalk.red('❌ Error: "claude" command not found.'));
              console.log(chalk.yellow('\nPlease ensure claude is installed:'));
              console.log(chalk.gray('  npm install -g claude\\n'));
            } else {
              console.error(chalk.red(`Error launching claude: ${error.message}`));
            }
            process.exit(1);
          });

          claudeCodeProcess.on('exit', (code) => {
            process.exit(code);
          });
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

        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'model',
            message: 'Select a model to remove:',
            choices: models.map(m => m.name)
          },
          {
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure?'
          }
        ]);

        if (answer.confirm) {
          try {
            await modelManager.removeModel(answer.model);
            console.log(chalk.green(`\n✓ Model "${answer.model}" removed!`));
          } catch (error) {
            console.error(chalk.red(`\nError: ${error.message}`));
          }
        }
        break;
      }

      case 'update': {
        if (models.length === 0) {
          console.log(chalk.yellow('\\nNo models to update. Add one first!'));
          break;
        }

        const selectAnswer = await inquirer.prompt([
          {
            type: 'list',
            name: 'model',
            message: 'Select a model to update:',
            choices: models.map(m => m.name)
          }
        ]);

        const selectedModel = await modelManager.getModel(selectAnswer.model);

        console.log(chalk.blue('\\nCurrent model configuration:'));
        console.log(chalk.gray(`  Name: ${selectedModel.name}`));
        console.log(chalk.gray(`  Description: ${selectedModel.description || 'N/A'}`));
        console.log(chalk.gray(`  Base URL: ${selectedModel.baseUrl}`));
        console.log(chalk.gray(`  Token: ${selectedModel.token.slice(0, 10)}...${selectedModel.token.slice(-5)}`));
        if (selectedModel.defaultOpusModel || selectedModel.defaultSonnetModel || selectedModel.defaultHaikuModel) {
          console.log(chalk.gray('  Model configurations:'));
          if (selectedModel.defaultOpusModel) console.log(chalk.gray(`    Opus: ${selectedModel.defaultOpusModel}`));
          if (selectedModel.defaultSonnetModel) console.log(chalk.gray(`    Sonnet: ${selectedModel.defaultSonnetModel}`));
          if (selectedModel.defaultHaikuModel) console.log(chalk.gray(`    Haiku: ${selectedModel.defaultHaikuModel}`));
        }
        console.log('');

        const updates = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'New name (leave blank to keep current):',
            default: selectedModel.name
          },
          {
            type: 'password',
            name: 'token',
            message: 'New token (leave blank to keep current):',
            default: selectedModel.token
          },
          {
            type: 'input',
            name: 'baseUrl',
            message: 'New base URL (leave blank to keep current):',
            default: selectedModel.baseUrl
          },
          {
            type: 'input',
            name: 'description',
            message: 'New description (leave blank to keep current):',
            default: selectedModel.description
          },
          {
            type: 'confirm',
            name: 'configureModels',
            message: 'Configure default models for Opus, Sonnet, and Haiku?',
            default: false
          }
        ]);

        if (updates.configureModels) {
          const modelAnswers = await inquirer.prompt([
            {
              type: 'input',
              name: 'defaultOpusModel',
              message: 'Default Opus model (leave blank to keep current/remove):',
              default: selectedModel.defaultOpusModel || ''
            },
            {
              type: 'input',
              name: 'defaultSonnetModel',
              message: 'Default Sonnet model (leave blank to keep current/remove):',
              default: selectedModel.defaultSonnetModel || ''
            },
            {
              type: 'input',
              name: 'defaultHaikuModel',
              message: 'Default Haiku model (leave blank to keep current/remove):',
              default: selectedModel.defaultHaikuModel || ''
            }
          ]);
          Object.assign(updates, modelAnswers);
        }

        // Filter out empty values and unchanged values
        const filteredUpdates = {};
        if (updates.name && updates.name !== selectedModel.name) filteredUpdates.name = updates.name;
        if (updates.token && updates.token !== selectedModel.token) filteredUpdates.token = updates.token;
        if (updates.baseUrl && updates.baseUrl !== selectedModel.baseUrl) filteredUpdates.baseUrl = updates.baseUrl;
        if (updates.description !== undefined && updates.description !== selectedModel.description) {
          filteredUpdates.description = updates.description;
        }
        if (updates.configureModels) {
          if (updates.defaultOpusModel !== undefined) {
            filteredUpdates.defaultOpusModel = updates.defaultOpusModel || null;
          }
          if (updates.defaultSonnetModel !== undefined) {
            filteredUpdates.defaultSonnetModel = updates.defaultSonnetModel || null;
          }
          if (updates.defaultHaikuModel !== undefined) {
            filteredUpdates.defaultHaikuModel = updates.defaultHaikuModel || null;
          }
        }

        if (Object.keys(filteredUpdates).length === 0) {
          console.log(chalk.yellow('\\nNo changes made.'));
          break;
        }

        try {
          await modelManager.updateModel(selectAnswer.model, filteredUpdates);
          console.log(chalk.green('\\n✓ Model updated successfully!'));

          // Show what was changed
          console.log(chalk.gray('\\nChanges made:'));
          Object.entries(filteredUpdates).forEach(([key, value]) => {
            console.log(chalk.gray(`  ${key}: ${value}`));
          });
          console.log('');
        } catch (error) {
          console.error(chalk.red(`\\nError: ${error.message}`));
        }
        break;
      }

      case 'history': {
        const configManager = require('./configManager');
        const manager = new configManager();
        const history = await manager.getHistory();

        console.log(chalk.blue('\\nChange History:'));
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

  // Parse arguments
  const argv = program.parse(process.argv);
})();
