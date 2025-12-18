#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const ModelManager = require('./modelManager');
const pkg = require('../package.json');

// Import command modules
const addCommand = require('./commands/add');
const listCommand = require('./commands/list');
const currentCommand = require('./commands/current');
const historyCommand = require('./commands/history');
const removeCommand = require('./commands/remove');
const updateCommand = require('./commands/update');
const useCommand = require('./commands/use');
const { interactiveCommand } = require('./commands/interactive');
const { autoLaunchClaude } = require('./commands/launch');

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
    const result = await autoLaunchClaude(modelManager, process.argv);
    if (result.shouldExit) {
      if (result.exitCode === 1) {
        // Show help for error cases
        program.help();
      }
      process.exit(result.exitCode || 0);
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
    .action((options) => addCommand(modelManager, options));

  // List command
  program
    .command('list')
    .description('List all model configurations')
    .action(() => listCommand(modelManager));

  // Use command
  program
    .command('use')
    .description('Switch to a model configuration and launch Claude')
    .argument('[name]', 'Model name (interactive mode if not specified)')
    .action((name) => useCommand(modelManager, name, inquirer, process.argv));

  // Current command
  program
    .command('current')
    .description('Show current model configuration')
    .action(() => currentCommand(modelManager));

  // Remove command
  program
    .command('remove')
    .description('Remove a model configuration')
    .argument('<name>', 'Model name')
    .action((name) => removeCommand(modelManager, name, inquirer));

  // History command
  program
    .command('history')
    .description('Show configuration change history')
    .option('-l, --limit <number>', 'Number of records to show', '20')
    .action((options) => historyCommand(options));

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
    .action((name, options) => updateCommand(modelManager, name, options, inquirer));

  // Interactive mode
  program
    .command('interactive')
    .alias('i')
    .description('Interactive mode for managing models')
    .action(() => interactiveCommand(modelManager, inquirer));

  // Parse arguments
  const argv = program.parse(process.argv);
})();
