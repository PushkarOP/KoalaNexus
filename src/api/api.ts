import { ShareGPTSubmitBodyInterface } from '@type/api';
import { ConfigInterface, MessageInterface, ModelDefinition } from '@type/chat';
import { isAzureEndpoint, uuidv4 } from '@utils/api';

// Existing getSessionCookie function
const getSessionCookie = (): string | undefined => {
  const name = 'session_id=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return undefined;
};

// Add this new function to handle reCAPTCHA manually
const executeRecaptcha = async (): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window.grecaptcha === 'undefined') {
      // Add reCAPTCHA script if it's not already loaded
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=6Len-6kqAAAAABOogjdRl_UTTtLJQa4BowBi4lup';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute('6Len-6kqAAAAABOogjdRl_UTTtLJQa4BowBi4lup', { action: 'submit' })
            .then((token: string) => resolve(token));
        });
      };
    } else {
      // If reCAPTCHA is already loaded, execute directly
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute('6Len-6kqAAAAABOogjdRl_UTTtLJQa4BowBi4lup', { action: 'submit' })
          .then((token: string) => resolve(token));
      });
    }
  });
};

export const getChatCompletion = async (
  endpoint: string,
  messages: MessageInterface[],
  config: ConfigInterface,
  modelDef: ModelDefinition,
  apiKey?: string,
  customHeaders?: Record<string, string>
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  const sessionCookie = getSessionCookie();
  headers.Authorization = `Bearer NexusAI`;

  config.user = uuidv4();

  delete (config as any).model_selection;

  // Replace recaptcha implementation
  const recaptchaToken = await executeRecaptcha();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      ...config,
      session: sessionCookie,
      recaptcha_token: recaptchaToken,
    }),
  });
  if (!response.ok) throw new Error(await response.text());

  const data = await response.json();
  return data;
};

export const getChatCompletionStream = async (
  endpoint: string,
  messages: MessageInterface[],
  config: ConfigInterface,
  modelDef: ModelDefinition,
  apiKey?: string,
  customHeaders?: Record<string, string>
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  const sessionCookie = getSessionCookie();
  headers.Authorization = `Bearer NexusAI`;
  // todo: option in config
  config.user = uuidv4();

  delete (config as any).model_selection;

  // Replace recaptcha implementation
  const recaptchaToken = await executeRecaptcha();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      ...config,
      stream: true,
      session: sessionCookie,
      recaptcha_token: recaptchaToken,
    }),
  });
  if (response.status === 404 || response.status === 405) {
    const text = await response.text();
    if (text.includes('model_not_found')) {
      throw new Error(
        text +
          '\nMessage from KoalaClient:\nPlease ensure that you have access to the GPT-4 API!'
      );
    } else {
      throw new Error(
        'Message from KoalaClient:\nInvalid API endpoint! We recommend you to check your free API endpoint.'
      );
    }
  }

  if (response.status === 429 || !response.ok) {
    const text = await response.text();
    let error = text;
    if (text.includes('insufficient_quota')) {
      error +=
        '\nMessage from KoalaClient:\nWe recommend changing your API endpoint or API key';
    } else if (response.status === 429) {
      error += '\nRate limited!';
    }
    throw new Error(error);
  }

  const stream = response.body;
  return stream;
};

export const submitShareGPT = async (body: ShareGPTSubmitBodyInterface) => {
  const request = await fetch('https://sharegpt.com/api/conversations', {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const response = await request.json();
  const { id } = response;
  const url = `https://shareg.pt/${id}`;
  window.open(url, '_blank');
};
