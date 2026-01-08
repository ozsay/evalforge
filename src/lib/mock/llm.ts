import { sleep } from "@lib/utils";
import type { ModelConfig, TokenUsage } from "@lib/types";

// Sample code generation responses
const CODE_RESPONSES = [
  `\`\`\`typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\``,
  `\`\`\`typescript
const quickSort = <T>(arr: T[]): T[] => {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
};
\`\`\``,
  `\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

class UserService {
  private users: Map<string, User> = new Map();
  
  create(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }
  
  findById(id: string): User | undefined {
    return this.users.get(id);
  }
}
\`\`\``,
  `\`\`\`typescript
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw lastError;
}
\`\`\``,
  `\`\`\`typescript
const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};
\`\`\``,
];

// Error responses for testing
const ERROR_RESPONSES = [
  "I apologize, but I'm unable to generate that code due to safety constraints.",
  "The request appears to be malformed. Please provide more context.",
  "I don't have enough information to complete this task accurately.",
];

interface LLMResponse {
  content: string;
  tokenUsage: TokenUsage;
  latencyMs: number;
  success: boolean;
}

interface LLMCallOptions {
  systemPrompt: string;
  userMessage: string;
  model: ModelConfig;
  simulateError?: boolean;
  errorRate?: number;
}

// Estimate tokens (rough approximation)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Mock LLM call with realistic behavior
export async function mockLLMCall(options: LLMCallOptions): Promise<LLMResponse> {
  const { systemPrompt, userMessage, model, simulateError, errorRate = 0.1 } = options;
  
  // Simulate network latency based on model
  const baseLatency = getModelLatency(model);
  const variance = baseLatency * 0.3;
  const latency = baseLatency + Math.random() * variance - variance / 2;
  
  await sleep(latency);
  
  // Check for simulated errors
  if (simulateError || Math.random() < errorRate) {
    const errorResponse = ERROR_RESPONSES[Math.floor(Math.random() * ERROR_RESPONSES.length)];
    return {
      content: errorResponse,
      tokenUsage: {
        prompt: estimateTokens(systemPrompt + userMessage),
        completion: estimateTokens(errorResponse),
        total: estimateTokens(systemPrompt + userMessage + errorResponse),
      },
      latencyMs: latency,
      success: false,
    };
  }
  
  // Generate successful response
  const response = CODE_RESPONSES[Math.floor(Math.random() * CODE_RESPONSES.length)];
  const promptTokens = estimateTokens(systemPrompt + userMessage);
  const completionTokens = estimateTokens(response);
  
  return {
    content: response,
    tokenUsage: {
      prompt: promptTokens,
      completion: completionTokens,
      total: promptTokens + completionTokens,
    },
    latencyMs: latency,
    success: true,
  };
}

// Get base latency for different models
function getModelLatency(model: ModelConfig): number {
  const latencies: Record<string, number> = {
    // OpenAI
    "gpt-4-turbo": 1500,
    "gpt-4": 2000,
    "gpt-3.5-turbo": 800,
    // Anthropic
    "claude-3-opus": 2500,
    "claude-3-sonnet": 1200,
    "claude-3-haiku": 600,
    // Google
    "gemini-pro": 1000,
    "gemini-ultra": 1800,
    // Local
    "llama-3": 500,
    "mistral-7b": 400,
    "codellama-34b": 700,
  };
  
  return latencies[model.model] || 1000;
}

// Estimate cost for a model call
export function estimateCost(tokenUsage: TokenUsage, model: ModelConfig): number {
  const costPer1kTokens: Record<string, { prompt: number; completion: number }> = {
    "gpt-4-turbo": { prompt: 0.01, completion: 0.03 },
    "gpt-4": { prompt: 0.03, completion: 0.06 },
    "gpt-3.5-turbo": { prompt: 0.0005, completion: 0.0015 },
    "claude-3-opus": { prompt: 0.015, completion: 0.075 },
    "claude-3-sonnet": { prompt: 0.003, completion: 0.015 },
    "claude-3-haiku": { prompt: 0.00025, completion: 0.00125 },
    "gemini-pro": { prompt: 0.00025, completion: 0.0005 },
    "gemini-ultra": { prompt: 0.00125, completion: 0.00375 },
  };
  
  const costs = costPer1kTokens[model.model] || { prompt: 0.001, completion: 0.002 };
  
  return (
    (tokenUsage.prompt / 1000) * costs.prompt +
    (tokenUsage.completion / 1000) * costs.completion
  );
}

// Run batch evaluation
export async function runBatchEvaluation(
  inputs: string[],
  systemPrompt: string,
  model: ModelConfig,
  onProgress: (index: number, result: LLMResponse) => void
): Promise<LLMResponse[]> {
  const results: LLMResponse[] = [];
  
  for (let i = 0; i < inputs.length; i++) {
    const result = await mockLLMCall({
      systemPrompt,
      userMessage: inputs[i],
      model,
      errorRate: 0.15, // 15% error rate for testing
    });
    
    results.push(result);
    onProgress(i, result);
  }
  
  return results;
}

