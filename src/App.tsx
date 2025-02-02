import React, { useEffect, lazy, Suspense, useCallback } from 'react';
import useStore from '@store/store';
import i18n from './i18n';

// Lazy load components
const Chat = lazy(() => import('@components/Chat'));
const Menu = lazy(() => import('@components/Menu'));
const Toast = lazy(() => import('@components/Toast'));

import useAddChat from '@hooks/useAddChat';
import useGoBack from '@hooks/useGoBack';
import useGoForward from '@hooks/useGoForward';
import useCopyCodeBlock from '@hooks/useCopyCodeBlock';
import useInitialiseNewChat from '@hooks/useInitialiseNewChat';
import useSubmit from '@hooks/useSubmit';
import { ChatInterface } from '@type/chat';
import isElectron, { isMac } from '@utils/electron';

function App() {
  // Grouping all needed state selectors
  const {
    setChats,
    currentChatIndex,
    setCurrentChatIndex,
    hideSideMenu,
    setHideSideMenu,
    bottomMessageRef,
    setApiAuth,
    apiAuth,
    apiKey,
    setApiKey,
    modelDefs,
    setModelDefs,
    closeToTray,
  } = useStore((state) => ({
    setChats: state.setChats,
    currentChatIndex: state.currentChatIndex,
    setCurrentChatIndex: state.setCurrentChatIndex,
    hideSideMenu: state.hideSideMenu,
    setHideSideMenu: state.setHideSideMenu,
    bottomMessageRef: state.bottomMessageRef,
    setApiAuth: state.setApiAuth,
    apiAuth: state.apiAuth,
    apiKey: state.apiKey,
    setApiKey: state.setApiKey,
    modelDefs: state.modelDefs,
    setModelDefs: state.setModelDefs,
    closeToTray: state.closeToTray,
  }));

  const initialiseNewChat = useInitialiseNewChat();
  const addChat = useAddChat();
  const goBack = useGoBack();
  const goForward = useGoForward();
  const copyCodeBlock = useCopyCodeBlock();
  const { handleSubmit } = useSubmit();

  // Migrate apiKey to apiAuth (runs only when apiKey changes)
  useEffect(() => {
    if (apiKey && !apiAuth[0].apiKey) {
      const updatedApiAuth = [...apiAuth];
      updatedApiAuth[0] = { ...updatedApiAuth[0], apiKey };
      setApiAuth(updatedApiAuth);
      setApiKey('');
    }
  }, [apiKey, apiAuth, setApiAuth, setApiKey]);

  // Adjust model definitions if needed (runs when modelDefs change)
  useEffect(() => {
    if (
      modelDefs.length >= 2 &&
      modelDefs[1].model === 'gpt-4-turbo-preview' &&
      modelDefs[1].model_max_tokens === 128000
    ) {
      const updatedModelDefs = [...modelDefs];
      updatedModelDefs[1] = {
        ...updatedModelDefs[1],
        model_max_tokens: 4096,
        model_max_context: 128000,
      };
      setModelDefs(updatedModelDefs);
    }
  }, [modelDefs, setModelDefs]);

  // Fallback: Set default model definitions if not present
  useEffect(() => {
    if (!modelDefs?.[0]) {
      import('@constants/model-defs').then(({ DEFAULT_MODEL_DEFS }) => {
        setModelDefs(DEFAULT_MODEL_DEFS);
      });
    }
  }, [modelDefs, setModelDefs]);

  // Paste and submit clipboard text
  const pasteSubmit = useCallback(async () => {
    try {
      if (useStore.getState().generating) return;
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      const updatedMessages = updatedChats[currentChatIndex].messages;
      const text = await navigator.clipboard.readText();
      if (!text) return;
      updatedMessages.push({ role: 'user', content: text });
      if (bottomMessageRef && bottomMessageRef.current) {
        bottomMessageRef.current.value = '';
      }
      setChats(updatedChats);
      handleSubmit();
    } catch (err) {
      console.error('Failed to read clipboard contents:', err);
    }
  }, [bottomMessageRef, currentChatIndex, handleSubmit, setChats]);

  // Memoized keyboard event handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // ctrl+e - Toggle side menu
    if (e.ctrlKey && e.key === 'e') {
      e.preventDefault();
      setHideSideMenu(!hideSideMenu);
    }
    // ctrl+n - New chat
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault();
      addChat();
      bottomMessageRef?.current?.focus();
    }
    // ctrl+o - Copy code block
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      copyCodeBlock();
    }
    // ctrl+g - Focus textarea
    if (e.ctrlKey && e.key === 'g') {
      e.preventDefault();
      bottomMessageRef?.current?.focus();
    }
    // ctrl+p - New chat from clipboard (insta-generate)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      addChat();
      pasteSubmit();
    }
    if (isElectron()) {
      // ctrl+tab - Next chat
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        goForward();
      }
      // ctrl+shift+tab - Previous chat
      if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        goBack();
      }
    }
    if (isMac()) {
      // ctrl+left - Previous chat
      if (e.ctrlKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      }
      // ctrl+right - Next chat
      if (e.ctrlKey && e.key === 'ArrowRight') {
        e.preventDefault();
        goForward();
      }
      // cmd+t (desktop only) - New chat
      if (isElectron() && e.metaKey && e.key === 't') {
        e.preventDefault();
        addChat();
        bottomMessageRef?.current?.focus();
      }
    }
  }, [addChat, bottomMessageRef, copyCodeBlock, goBack, goForward, hideSideMenu, pasteSubmit, setHideSideMenu]);

  // Memoized mouse event handler
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Mouse button 3 (back)
    if (e.button === 3) {
      e.preventDefault();
      goBack();
    }
    // Mouse button 4 (forward)
    if (e.button === 4) {
      e.preventDefault();
      goForward();
    }
  }, [goBack, goForward]);

  useEffect(() => {
    if (isElectron()) {
      window.electronAPI.setCloseToTray(closeToTray);
    }
  }, [closeToTray]);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
  }, []);

  useEffect(() => {
    // Legacy local storage migration
    const oldChats = localStorage.getItem('chats');
    if (oldChats) {
      try {
        const chats: ChatInterface[] = JSON.parse(oldChats);
        if (chats.length > 0) {
          setChats(chats);
          setCurrentChatIndex(0);
        } else {
          initialiseNewChat();
        }
      } catch (e: unknown) {
        console.log(e);
        initialiseNewChat();
      }
      localStorage.removeItem('chats');
    } else {
      const chats = useStore.getState().chats;
      const currentChatIndex = useStore.getState().currentChatIndex;
      if (!chats || chats.length === 0) {
        initialiseNewChat();
      }
      if (chats && !(currentChatIndex >= 0 && currentChatIndex < chats.length)) {
        setCurrentChatIndex(0);
      }
    }
  }, [initialiseNewChat, setChats, setCurrentChatIndex]);

  useEffect(() => {
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (e.button === 3 || e.button === 4) {
        handleMouseUp(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleMouseUp]);

  return (
    <div
      tabIndex={0}
      className='overflow-hidden w-full h-full relative'
      onKeyDown={handleKeyDown}
      onMouseUp={handleMouseUp}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <Menu />
        <Chat />
        <Toast />
      </Suspense>
    </div>
  );
}

export default App;
