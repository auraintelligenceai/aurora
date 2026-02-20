import { discoverAuthStorage, discoverModels } from '@mariozechner/pi-coding-agent';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const agentDir = join(process.cwd(), '.aura', 'agents', 'main', 'agent');
console.log('Agent directory:', agentDir);

const authStorage = discoverAuthStorage(agentDir);
console.log('Auth storage:', authStorage);

const modelRegistry = discoverModels(authStorage, agentDir);
console.log('Model registry:', modelRegistry);

const allModels = modelRegistry.getAll();
console.log('All models in registry:', allModels);

const ollamaModels = allModels.filter(m => m.provider.toLowerCase() === 'ollama');
console.log('Ollama models in registry:', ollamaModels);
