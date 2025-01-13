import React, { useEffect } from 'react';
import useStore from '@store/store';
import i18n from './i18n';

import Chat from '@components/Chat';
import Menu from '@components/Menu';

import useAddChat from '@hooks/useAddChat';
import useGoBack from '@hooks/useGoBack';
import useGoForward from '@hooks/useGoForward';
import useCopyCodeBlock from '@hooks/useCopyCodeBlock';
import useInitialiseNewChat from '@hooks/useInitialiseNewChat';
import useSubmit from '@hooks/useSubmit';
import { ChatInterface } from '@type/chat';
import Toast from '@components/Toast';
import isElectron, { isMac } from '@utils/electron';

function App() {
  const setChats = useStore((state) => state.setChats);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setCurrentChatIndex = useStore((state) => state.setCurrentChatIndex);
  const setHideSideMenu = useStore((state) => state.setHideSideMenu);
  const hideSideMenu = useStore((state) => state.hideSideMenu);
  const bottomMessageRef = useStore((state) => state.bottomMessageRef);
  const setApiAuth = useStore((state) => state.setApiAuth);
  const apiAuth = useStore((state) => state.apiAuth);
  const apiKey = useStore((state) => state.apiKey);
  const setApiKey = useStore((state) => state.setApiKey);
  const modelDefs = useStore((state) => state.modelDefs);
  const setModelDefs = useStore((state) => state.setModelDefs);

  const initialiseNewChat = useInitialiseNewChat();
  const addChat = useAddChat();
  const goBack = useGoBack();
  const goForward = useGoForward();
  const copyCodeBlock = useCopyCodeBlock();
  const { handleSubmit } = useSubmit();

  if (apiKey && !apiAuth[0].apiKey) {
    const old = apiAuth;
    old[0].apiKey = apiKey;
    setApiAuth(old);
    setApiKey('');
  }

  // migration from broken 2.1.0 release
  if (
    modelDefs.length >= 2 &&
    modelDefs[1].model &&
    modelDefs[1].model === 'gpt-4-turbo-preview' &&
    modelDefs[1].model_max_tokens == 128000
  ) {
    modelDefs[1].model_max_tokens = 4096;
    modelDefs[1].model_max_context = 128000;

    setModelDefs(modelDefs);
  }

  // apparantly the migration isn't gaurenteed, so here's some terrible code :)
  if (!modelDefs && !modelDefs[0]) {
    const defaultModelDefs = [
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
        prompt_cost_1000: 0.1,
        completion_cost_1000: 0.3,
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

    setModelDefs(defaultModelDefs);
  }

  const pasteSubmit = async () => {
    try {
      if (useStore.getState().generating) return;
      const updatedChats: ChatInterface[] = JSON.parse(
        JSON.stringify(useStore.getState().chats)
      );
      const updatedMessages = updatedChats[currentChatIndex].messages;

      const text = await navigator.clipboard.readText();
      if (!text) {
        return;
      }

      updatedMessages.push({ role: 'user', content: text });
      if (bottomMessageRef && bottomMessageRef.current) {
        bottomMessageRef.current.value = '';
      }

      setChats(updatedChats);
      handleSubmit();
    } catch (err) {
      console.error('Failed to read clipboard contents:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Put any general app-wide keybinds here:

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

      // ctrl+shift+tab + Previous chat
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
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
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
  };

  if (isElectron()) {
    window.electronAPI.setCloseToTray(useStore((state) => state.closeToTray));
  }

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
    });
  }, []);

  useEffect(() => {
    // legacy local storage
    const oldChats = localStorage.getItem('chats');

    if (oldChats) {
      // legacy local storage
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
      // existing local storage
      const chats = useStore.getState().chats;
      const currentChatIndex = useStore.getState().currentChatIndex;
      if (!chats || chats.length === 0) {
        initialiseNewChat();
      }
      if (
        chats &&
        !(currentChatIndex >= 0 && currentChatIndex < chats.length)
      ) {
        setCurrentChatIndex(0);
      }
    }
  }, []);

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
  }, []);

  return (
    <div
      tabIndex={0}
      className='overflow-hidden w-full h-full relative'
      onKeyDown={handleKeyDown}
      onMouseUp={handleMouseUp}
    >
      <Menu />
      <Chat />
      <Toast />
    </div>
  );
}

export default App;
