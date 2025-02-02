import { create, StoreApi } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSlice, createChatSlice } from './chat-slice';
import { createInputSlice, InputSlice } from './input-slice';
import { AuthSlice, createAuthSlice } from './auth-slice';
import { DEFAULT_MODEL_DEFS } from '@constants/model-defs';
import { ConfigSlice, createConfigSlice } from './config-slice';
import { createPromptSlice, PromptSlice } from './prompt-slice';
import { createToastSlice, ToastSlice } from './toast-slice';

export type StoreState = ChatSlice &
  InputSlice &
  AuthSlice &
  ConfigSlice &
  PromptSlice &
  ToastSlice;

export type StoreSlice<T> = (
  set: StoreApi<StoreState>['setState'],
  get: StoreApi<StoreState>['getState']
) => T;

export const createPartializedState = (state: StoreState) => ({
  chats: state.chats,
  currentChatIndex: state.currentChatIndex,
  apiAuth: state.apiAuth,
  modelDefs: state.modelDefs,
  theme: state.theme,
  autoTitle: false,
  closeToTray: state.closeToTray,
  advancedMode: state.advancedMode,
  prompts: state.prompts,
  defaultChatConfig: state.defaultChatConfig,
  defaultSystemMessage: state.defaultSystemMessage,
  hideMenuOptions: state.hideMenuOptions,
  firstVisit: state.firstVisit,
  hideSideMenu: state.hideSideMenu,
  folders: state.folders,
  enterToSubmit: state.enterToSubmit,
  confirmEditSubmission: state.confirmEditSubmission,
  inlineLatex: state.inlineLatex,
  markdownMode: state.markdownMode,
  totalTokenUsed: state.totalTokenUsed,
  countTotalTokens: state.countTotalTokens,
  costOfDeleted: state.costOfDeleted,
});

const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...createChatSlice(set, get),
      ...createInputSlice(set, get),
      ...createAuthSlice(set, get),
      ...createConfigSlice(set, get),
      ...createPromptSlice(set, get),
      ...createToastSlice(set, get),
    }),
    {
      name: 'free-chat-gpt',
      partialize: (state) => createPartializedState(state),
      version: 9,
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        setTimeout(() => {
          // Enforce DEFAULT_MODEL_DEFS on every rehydration.
          state.setModelDefs(DEFAULT_MODEL_DEFS);
        }, 0);
      },
      migrate: (persistedState, version) => {
        const stateObj = (persistedState as Record<string, unknown>) || {};
        return {
          ...createPartializedState({} as StoreState),
          ...stateObj,
          modelDefs: DEFAULT_MODEL_DEFS, // Override persisted modelDefs with defaults.
          autoTitle: false,
        };
      },
    }
  )
);

export default useStore;
