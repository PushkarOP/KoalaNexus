import useStore from '@store/store';
import { useTranslation } from 'react-i18next';
import { ChatInterface, MessageInterface } from '@type/chat';
import { getChatCompletion, getChatCompletionStream } from '@api/api';
import { parseEventSource } from '@api/helper';
import {
  limitMessageTokens,
  useUpdateTotalTokenUsed,
} from '@utils/messageUtils';
import { _defaultChatConfig } from '@constants/chat';
import { officialAPIEndpoint } from '@constants/auth';

const useSubmit = () => {
  const { t, i18n } = useTranslation('api');
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);
  const setGenerating = useStore((state) => state.setGenerating);
  const generating = useStore((state) => state.generating);
  const currentChatIndex = useStore((state) => state.currentChatIndex);
  const setChats = useStore((state) => state.setChats);
  const modelDefs = useStore((state) => state.modelDefs);
  const apiAuth = useStore((state) => state.apiAuth);
  const updateTotalTokenUsed = useUpdateTotalTokenUsed();

  const generateTitle = async (
    message: MessageInterface[],
    apiKey: string,
    apiEndpoint: string
  ): Promise<string> => {
    let data;

    const config = _defaultChatConfig;
    const modelDef = modelDefs[0];

    (config as any).model = modelDef.model;
    try {
      if (!apiKey || apiKey.length === 0) {
        // official endpoint
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }

        // other endpoints
        data = await getChatCompletion(apiEndpoint, message, config, modelDef);
      } else if (apiKey) {
        // own apikey
        data = await getChatCompletion(
          apiEndpoint,
          message,
          config,
          modelDef,
          apiKey,
          undefined
        );
      }
    } catch (error: unknown) {
      throw new Error(`Error generating title!\n${(error as Error).message}`);
    }
    return data.choices[0].message.content;
  };

  const handleSubmit = async () => {
    const chats = useStore.getState().chats;
    if (generating || !chats) return;

    const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(chats));
    updatedChats[currentChatIndex].messages.push({ role: 'assistant', content: '' });
    setChats(updatedChats);
    setGenerating(true);

    const config = chats[currentChatIndex].config;
    try {
      if (chats[currentChatIndex].messages.length === 0) {
        throw new Error('No messages submitted!');
      }

      const modelDef = modelDefs[config.model_selection];
      const auth = apiAuth[modelDef.endpoint];
      const apiKey = auth.apiKey;
      const apiEndpoint = auth.endpoint;

      const messages = limitMessageTokens(
        chats[currentChatIndex].messages,
        modelDef.model,
        modelDef.model_max_context,
        config.max_tokens
      );
      if (messages.length === 0) throw new Error('Message exceeds max token!');
      delete (config as any).max_context;
      (config as any).model = modelDef.model;

      let stream;
      if (!apiKey || apiKey.length === 0) {
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }
        stream = await getChatCompletionStream(apiEndpoint, messages, config, modelDef);
      } else {
        stream = await getChatCompletionStream(apiEndpoint, messages, config, modelDef, apiKey);
      }

      if (stream) {
        let accumulatedChunk = "";
        let throttlingTimer: number | null = null;

        const updateAssistantMessage = () => {
          const updatedChats: ChatInterface[] = JSON.parse(JSON.stringify(useStore.getState().chats));
          const updatedMessages = updatedChats[currentChatIndex].messages;
          updatedMessages[updatedMessages.length - 1].content += accumulatedChunk;
          accumulatedChunk = "";
          setChats(updatedChats);
          throttlingTimer = null;
        };

        async function* streamGenerator(
          stream: ReadableStream<Uint8Array>
        ): AsyncGenerator<string> {
          const reader = stream.getReader();
          const decoder = new TextDecoder();
          let partial = '';
          try {
            while (useStore.getState().generating) {
              const { done, value } = await reader.read();
              if (done) break;
              partial += decoder.decode(value, { stream: true });
              const results = parseEventSource(partial);
              partial = '';
              if (typeof results === 'string') {
                if (results === '[DONE]') break;
                yield results;
              } else if (Array.isArray(results)) {
                for (const res of results) {
                  if (typeof res === 'string') {
                    if (res === '[DONE]') continue;
                    yield res;
                  } else if (res.choices && res.choices[0].delta.content) {
                    yield res.choices[0].delta.content;
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }

        for await (const chunk of streamGenerator(stream)) {
          accumulatedChunk += chunk;
          if (!throttlingTimer) {
            throttlingTimer = window.setTimeout(() => {
              updateAssistantMessage();
            }, 50);
          }
        }
        if (accumulatedChunk) {
          updateAssistantMessage();
        }
        stream.cancel();
      }

      const currChats = useStore.getState().chats;
      const countTotalTokens = useStore.getState().countTotalTokens;

      if (currChats && countTotalTokens) {
        const model = currChats[currentChatIndex].config.model_selection;
        const messages = currChats[currentChatIndex].messages;
        updateTotalTokenUsed(
          model,
          messages.slice(0, -1),
          messages[messages.length - 1]
        );
      }

      if (
        useStore.getState().autoTitle &&
        currChats &&
        !currChats[currentChatIndex]?.titleSet
      ) {
        const messages_length = currChats[currentChatIndex].messages.length;

        const assistant_message = currChats[currentChatIndex].messages[
          messages_length - 1
        ].content.slice(0, 800);
        const user_message = currChats[currentChatIndex].messages[
          messages_length - 2
        ].content.slice(0, 800);

        const message: MessageInterface = {
          role: 'user',
          content: `Generate a title in less than 6 words for the following message (language: ${i18n.language}):\n"""\nUser: ${user_message}\nAssistant: ${assistant_message}\n"""`,
        };

        let title = (
          await generateTitle([message], apiKey, apiEndpoint)
        ).trim();
        if (title.startsWith('"') && title.endsWith('"')) {
          title = title.slice(1, -1);
        }
        const updatedChats: ChatInterface[] = JSON.parse(
          JSON.stringify(useStore.getState().chats)
        );
        updatedChats[currentChatIndex].title = title;
        updatedChats[currentChatIndex].titleSet = true;
        setChats(updatedChats);

        if (countTotalTokens) {
          updateTotalTokenUsed(0, [message], {
            role: 'assistant',
            content: title,
          });
        }
      }
    } catch (e: unknown) {
      setError((e as Error).message);
      setGenerating(false);
      throw e;
    }
    setGenerating(false);
  };

  return { handleSubmit, error };
};

export default useSubmit;
