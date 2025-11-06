#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ModelManager = require('./modelManager');
const { spawn } = require('child_process');

// Dynamic import for inquirer to avoid ESM/CJS conflict
(async () => {
  const inquirerModule = await import('inquirer');
  const inquirer = inquirerModule.default;

  const program = new Command();
  const modelManager = new ModelManager();

  program
    .name('claude-model')
    .description('Claude Code model configuration manager')
    .version('1.0.0');

  // Check if no arguments provided - if so, try to launch claude
  const args = process.argv.slice(2);
  if (args.length === 0) {
    try {
      const currentModel = await modelManager.getCurrentModel();
      const models = await modelManager.listModels();

      if (models.length === 0) {
        console.log(chalk.yellow('No models configured. Use "claude-model add" to add one.'));
        program.help();
        process.exit(0);
      }

      if (!currentModel) {
        console.log(chalk.yellow('No model currently selected. Use "claude-model switch <name>" to select one.'));
        program.help();
        process.exit(0);
      }

      console.log(chalk.blue(`\n🚀 Launching claude with model: ${chalk.bold(currentModel.name)}`));
      console.log(chalk.gray(`   Description: ${currentModel.description || 'N/A'}\n`));

      // Execute claude with current model environment variables
      const claudeCodeProcess = spawn('claude', process.argv.slice(2), {
        stdio: 'inherit',
        env: {
          ...process.env,
          ANTHROPIC_AUTH_TOKEN: currentModel.token,
          ANTHROPIC_BASE_URL: currentModel.baseUrl
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
    .action(async (options) => {
      try {
        await modelManager.addModel(options.name, options.token, options.baseUrl, options.description);
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
          console.log(chalk.yellow('No models configured. Use "claude-model add" to add one.'));
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

  // Switch command
  program
    .command('switch')
    .description('Switch to a model configuration')
    .argument('[name]', 'Model name (interactive mode if not specified)')
    .action(async (name) => {
      try {
        let modelName = name;

        if (!modelName) {
          const models = await modelManager.listModels();

          if (models.length === 0) {
            console.log(chalk.yellow('No models configured. Use "claude-model add" to add one.'));
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

        await modelManager.switchModel(modelName);
        console.log(chalk.green(`✓ Switched to model: ${modelName}`));
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
            { name: 'List all models', value: 'list' },
            { name: 'Switch to a model', value: 'switch' },
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
          { type: 'input', name: 'description', message: 'Description (optional):' }
        ]);

        try {
          await modelManager.addModel(answers.name, answers.token, answers.baseUrl, answers.description);
          console.log(chalk.green('\n✓ Model added successfully!'));
        } catch (error) {
          console.error(chalk.red(`\nError: ${error.message}`));
        }
        break;
      }

      case 'switch': {
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
          await modelManager.switchModel(answer.model);
          console.log(chalk.green(`\n✓ Switched to model: ${answer.model}`));
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

      case 'history': {
        const configManager = require('./configManager');
        const manager = new configManager();
        const history = await manager.getHistory();

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

  // Parse arguments
  const argv = program.parse(process.argv);
})();
