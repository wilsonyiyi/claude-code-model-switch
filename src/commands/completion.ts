// @ts-ignore
import omelette from 'omelette';
import ModelManager from '../modelManager.js';

export const setupCompletion = (modelManager: ModelManager) => {
  const completion = omelette('cm <action> <model>');

  completion.on('action', ({ reply }: { reply: (words: string[]) => void }) => {
    reply([
      'use', 
      'add', 
      'list', 
      'current', 
      'remove', 
      'history', 
      'update', 
      'provider', 
      'completion', 
      'interactive',
      'help'
    ]);
  });

  completion.on('model', async ({ action, reply }: { action: string, reply: (words: string[]) => void }) => {
    if (['use', 'remove', 'update'].includes(action)) {
      const models = await modelManager.listModels();
      const names = models.map((m) => m.name);
      reply(names);
    }
  });

  completion.init();

  return completion;
};

export const completionCommand = (completion: any) => {
  completion.setupShellInitFile();
};
