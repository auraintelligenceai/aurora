import { resolveModel } from './src/agents/pi-embedded-runner/model.js';

console.log('Testing resolveModel with mistral');
try {
  const result = resolveModel('ollama', 'mistral');
  if (result.model) {
    console.log('✅ Success! Found model:', result.model.id, result.model.name);
    console.log('Model details:', JSON.stringify(result.model, null, 2));
  } else {
    console.error('❌ Error:', result.error);
  }
} catch (error) {
  console.error('❌ Exception:', error);
  console.error('Stack trace:', error.stack);
}
