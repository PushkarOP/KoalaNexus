import { defaultAPIEndpoint } from '@constants/auth';
import { EndpointAuth } from '@type/api';
import { ModelDefinition } from '@type/chat';
import { StoreSlice } from './store';
import { DEFAULT_MODEL_DEFS } from '@constants/model-defs';

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

export const createAuthSlice: StoreSlice<AuthSlice> = (set) => ({
  firstVisit: true,
  apiAuth: [{ endpoint: defaultAPIEndpoint, apiKey: '' }],
  modelDefs: DEFAULT_MODEL_DEFS,
  setApiKey: (apiKey: string) => {
    set((prev: AuthSlice) => ({
      ...prev,
      apiKey,
    }));
  },
  setFirstVisit: (firstVisit: boolean) => {
    set((prev: AuthSlice) => ({
      ...prev,
      firstVisit,
    }));
  },
  setApiAuth: (apiAuth: EndpointAuth[]) => {
    set((prev: AuthSlice) => ({
      ...prev,
      apiAuth,
    }));
  },
  setModelDefs: (_modelDefs: ModelDefinition[]) => {
    set((prev: AuthSlice) => ({
      ...prev,
      modelDefs: DEFAULT_MODEL_DEFS,
    }));
  },
});
