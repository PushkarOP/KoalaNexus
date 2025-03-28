import { StoreSlice } from './store';
import { Theme } from '@type/theme';
import { ConfigInterface, TotalTokenUsed } from '@type/chat';
import { _defaultChatConfig, _defaultSystemMessage } from '@constants/chat';

export interface ConfigSlice {
  openConfig: boolean;
  theme: Theme;
  autoTitle: boolean;
  closeToTray: boolean;
  hideMenuOptions: boolean;
  advancedMode: boolean;
  defaultChatConfig: ConfigInterface;
  defaultSystemMessage: string;
  hideSideMenu: boolean;
  enterToSubmit: boolean;
  confirmEditSubmission: boolean;
  inlineLatex: boolean;
  markdownMode: boolean;
  countTotalTokens: boolean;
  totalTokenUsed: TotalTokenUsed;
  costOfDeleted: number;
  setOpenConfig: (openConfig: boolean) => void;
  setTheme: (theme: Theme) => void;
  setAutoTitle: (autoTitle: boolean) => void;
  setCloseToTray: (closeToTray: boolean) => void;
  setAdvancedMode: (advancedMode: boolean) => void;
  setDefaultChatConfig: (defaultChatConfig: ConfigInterface) => void;
  setDefaultSystemMessage: (defaultSystemMessage: string) => void;
  setHideMenuOptions: (hideMenuOptions: boolean) => void;
  setHideSideMenu: (hideSideMenu: boolean) => void;
  setEnterToSubmit: (enterToSubmit: boolean) => void;
  setConfirmEditSubmission: (confirmEditSubmission: boolean) => void;
  setInlineLatex: (inlineLatex: boolean) => void;
  setMarkdownMode: (markdownMode: boolean) => void;
  setCountTotalTokens: (countTotalTokens: boolean) => void;
  setTotalTokenUsed: (totalTokenUsed: TotalTokenUsed) => void;
  setCostOfDeleted: (costOfDeleted: number) => void;
}

export const createConfigSlice: StoreSlice<ConfigSlice> = (set) => ({
  openConfig: false,
  theme: 'dark',
  hideMenuOptions: false,
  hideSideMenu: false,
  autoTitle: false,
  closeToTray: false,
  enterToSubmit: true,
  confirmEditSubmission: true,
  advancedMode: true,
  defaultChatConfig: _defaultChatConfig,
  defaultSystemMessage: _defaultSystemMessage,
  inlineLatex: true,
  markdownMode: true,
  countTotalTokens: false,
  totalTokenUsed: {},
  costOfDeleted: 0,
  setOpenConfig: (openConfig: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      openConfig: openConfig,
    }));
  },
  setTheme: (theme: Theme) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      theme: theme,
    }));
  },
  setAutoTitle: (autoTitle: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      autoTitle: autoTitle,
    }));
  },
  setCloseToTray: (closeToTray: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      closeToTray: closeToTray,
    }));
  },
  setAdvancedMode: (advancedMode: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      advancedMode: advancedMode,
    }));
  },
  setDefaultChatConfig: (defaultChatConfig: ConfigInterface) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      defaultChatConfig: defaultChatConfig,
    }));
  },
  setDefaultSystemMessage: (defaultSystemMessage: string) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      defaultSystemMessage: defaultSystemMessage,
    }));
  },
  setHideMenuOptions: (hideMenuOptions: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      hideMenuOptions: hideMenuOptions,
    }));
  },
  setHideSideMenu: (hideSideMenu: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      hideSideMenu: hideSideMenu,
    }));
  },
  setEnterToSubmit: (enterToSubmit: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      enterToSubmit: enterToSubmit,
    }));
  },
  setConfirmEditSubmission: (confirmEditSubmission: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      confirmEditSubmission: confirmEditSubmission,
    }));
  },
  setInlineLatex: (inlineLatex: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      inlineLatex: inlineLatex,
    }));
  },
  setMarkdownMode: (markdownMode: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      markdownMode: markdownMode,
    }));
  },
  setCountTotalTokens: (countTotalTokens: boolean) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      countTotalTokens: countTotalTokens,
    }));
  },
  setTotalTokenUsed: (totalTokenUsed: TotalTokenUsed) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      totalTokenUsed: totalTokenUsed,
    }));
  },
  setCostOfDeleted: (costOfDeleted: number) => {
    set((prev: ConfigSlice) => ({
      ...prev,
      costOfDeleted: costOfDeleted,
    }));
  },
});
