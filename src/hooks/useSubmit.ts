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

    updatedChats[currentChatIndex].messages.push({
      role: 'assistant',
      content: '',
    });

    setChats(updatedChats);
    setGenerating(true);

    const config = chats[currentChatIndex].config;

    try {
      let stream;
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

      // javascript is an abomination
      delete (config as any).max_context;
      (config as any).model = modelDef.model;

      // no api key (free)
      if (!apiKey || apiKey.length === 0) {
        // official endpoint
        if (apiEndpoint === officialAPIEndpoint) {
          throw new Error(t('noApiKeyWarning') as string);
        }

        // other endpoints
        stream = await getChatCompletionStream(
          apiEndpoint,
          messages,
          config,
          modelDef
        );
      } else if (apiKey) {
        // own apikey
        stream = await getChatCompletionStream(
          apiEndpoint,
          messages,
          config,
          modelDef,
          apiKey
        );
      }
      
      if (stream) {
        if (stream.locked) {
          throw new Error('Oops, the stream is locked right now. Please try again');
        }
        const reader = stream.getReader();
        let reading = true;
        let buffer = '';
        // Create a single TextDecoder instance for streaming decoding.
        const decoder = new TextDecoder('utf-8');

        while (reading && useStore.getState().generating) {
          const { done, value } = await reader.read();
          
          if (done) {
            reading = false;
            break;
          }

          // Decode the incoming chunk with streaming enabled.
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete events from buffer
          const result = parseEventSource(buffer);
          
          if (result === '[DONE]') {
            reading = false;
          } else {
            let accumulatedContent = '';
            let lastIncompleteChunk = '';
            
            for (const item of result) {
              if (typeof item === 'string') {
                // Store incomplete chunk for next iteration
                lastIncompleteChunk = item;
                console.debug('Incomplete chunk:', lastIncompleteChunk);
              } else if (item.choices?.[0]?.delta?.content) {
                const chunk = item.choices[0].delta.content;
                console.debug('Received chunk:', chunk);
                accumulatedContent += chunk;
              }
            }

            // Update buffer to only contain the incomplete chunk
            buffer = lastIncompleteChunk;

            if (accumulatedContent) {
              const updatedChats: ChatInterface[] = JSON.parse(
                JSON.stringify(useStore.getState().chats)
              );
              const updatedMessages = updatedChats[currentChatIndex].messages;
              updatedMessages[updatedMessages.length - 1].content += accumulatedContent;
              setChats(updatedChats);
            }
          }
        }

        // Flush any remains from the decoder
        const flush = decoder.decode();
        if (flush) {
          buffer += flush;
        }

        // Handle any remaining content in buffer
        if (buffer) {
          const result = parseEventSource(buffer);
          if (Array.isArray(result)) {
            const remainingContent = result
              .filter(item => typeof item !== 'string' && item.choices?.[0]?.delta?.content)
              .map(item => (item as any).choices[0].delta.content)
              .join('');

            if (remainingContent) {
              const updatedChats: ChatInterface[] = JSON.parse(
                JSON.stringify(useStore.getState().chats)
              );
              const updatedMessages = updatedChats[currentChatIndex].messages;
              updatedMessages[updatedMessages.length - 1].content += remainingContent;
              setChats(updatedChats);
            }
          }
        }

        if (useStore.getState().generating) {
          reader.cancel('Cancelled by user');
        } else {
          reader.cancel('Generation completed');
        }
        reader.releaseLock();
        stream.cancel();
      }

      // update tokens used in chatting
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

      // generate title for new chats
      if (
        useStore.getState().autoTitle &&
        currChats &&
        !currChats[currentChatIndex]?.titleSet
      ) {
        const messages_length = currChats[currentChatIndex].messages.length;

        // only first 800 chars of each message
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

        // update tokens used for generating title
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