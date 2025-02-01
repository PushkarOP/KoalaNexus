import { defaultAPIEndpoint } from '@constants/auth';
import { EndpointAuth } from '@type/api';
import { ModelDefinition } from '@type/chat';
import { StoreSlice } from './store';

export interface AuthSlice {
  apiKey?: string;
  firstVisit: boolean;
  apiAuth: EndpointAuth[];
  modelDefs: ModelDefinition[];
  setApiKey: (apiKey: string) => void;
  setFirstVisit: (firstVisit: boolean) => void;
  setApiAuth: (apiAuth: EndpointAuth[]) => void;
  setModelDefs: (modelDefs: ModelDefinition[]) => void;
}

// Store the default model definitions in a constant
export const DEFAULT_MODEL_DEFS: ModelDefinition[] = [
  {
    name: 'gpt-4o',
    model: 'gpt-4o',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'gpt-4o-mini',
    model: 'gpt-4o-mini',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'o3-mini',
    model: 'o3-mini',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.5,
    completion_cost_1000: 0.5,
    swap_visible: true,
  },
  {
    name: 'o1-preview',
    model: 'o1-preview',
    endpoint: 0,
    model_max_context: 16385,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.5,
    completion_cost_1000: 0.5,
    swap_visible: true,
  },
  {
    name: 'o1-mini',
    model: 'o1-mini',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.5,
    completion_cost_1000: 0.5,
    swap_visible: true,
  },
  {
    name: 'gpt-3.5-turbo',
    model: 'gpt-3.5-turbo',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'claude-3-5-sonnet',
    model: 'claude-3-5-sonnet-20241022',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'llama-3.3-70b',
    model: 'llama-3.3-70b',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'llama-3.2-90b',
    model: 'llama-3.2-90b',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'llama-3.1-405B',
    model: 'llama-3.1-405B',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'gemini-uncensored',
    model: 'gemini-unlocked',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'gemini-2.0-flash-exp',
    model: 'gemini-2.0-flash-exp',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'gemini-exp-1206',
    model: 'gemini-exp-1206',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'qwq-32b-preview',
    model: 'qwq-32b-preview',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'deepseek-chat',
    model: 'deepseek-chat',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'deepseek-r1',
    model: 'deepseek-reasoner',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'sonar-pro (web)',
    model: 'sonar-pro',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'codestral-latest',
    model: 'codestral-latest',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
  {
    name: 'mythomax-l2-13b',
    model: 'mythomax-l2-13b',
    endpoint: 0,
    model_max_context: 128000,
    model_max_tokens: 4096,
    prompt_cost_1000: 0.1,
    completion_cost_1000: 0.3,
    swap_visible: true,
  },
];

export const createAuthSlice: StoreSlice<AuthSlice> = (set) => ({
  firstVisit: true,
  apiAuth: [{ endpoint: defaultAPIEndpoint, apiKey: '' }],
  modelDefs: DEFAULT_MODEL_DEFS,
  setApiKey: (apiKey: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      apiKey: apiKey,
    }));
  },
  setFirstVisit: (firstVisit: boolean) => {
    set((prev: AuthSlice) => ({
      ...prev,
      firstVisit: firstVisit,
    }));
  },
  setApiAuth: (apiAuth: EndpointAuth[]) => {
    set((prev: AuthSlice) => ({
      ...prev,
      apiAuth,
    }));
  },
  setModelDefs: (modelDefs: ModelDefinition[]) => {
    // Compare the current modelDefs with DEFAULT_MODEL_DEFS
    const needsUpdate =
      JSON.stringify(modelDefs) !== JSON.stringify(DEFAULT_MODEL_DEFS);

    set((prev: AuthSlice) => ({
      ...prev,
      // If models need updating, use DEFAULT_MODEL_DEFS, otherwise keep existing
      modelDefs: needsUpdate ? DEFAULT_MODEL_DEFS : modelDefs,
    }));
  },
});
