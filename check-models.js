import { discoverAuthStorage, discoverModels } from '@mariozechner/pi-coding-agent';
import { join } from 'path';

// Path to the Aura agent directory (hardcoded)
const agentDir = join(process.env.HOME || process.env.USERPROFILE, '.aura', 'agents', 'main', 'agent');
console.log('Agent directory:', agentDir);

const authStorage = discoverAuthStorage(agentDir);
console.log('Auth storage:', authStorage);

const modelRegistry = discoverModels(authStorage, agentDir);
console.log('Model registry:', modelRegistry);

const allModels = modelRegistry.getAll();
console.log('All models:', allModels.length);
console.log('Model IDs:', allModels.map(m => m.id));

const ollamaModels = allModels.filter(m => m.provider === 'ollama');
console.log('Ollama models in registry:', ollamaModels.length);
if (ollamaModels.length > 0) {
  console.log('Ollama model details:', ollamaModels);
}
