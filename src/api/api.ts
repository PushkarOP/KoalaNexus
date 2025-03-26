import { ShareGPTSubmitBodyInterface } from '@type/api';
import { ConfigInterface, MessageInterface, ModelDefinition } from '@type/chat';
import { isAzureEndpoint, uuidv4 } from '@utils/api';

declare const grecaptcha: any;
//test
const executeRecaptcha = async (action: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha
        .execute('6Lc-XAArAAAAAAdrE5rqXwC0zD2EI8biFPBkJFFZ', { action })
        .then((token: string) => {
          resolve(token);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  });
};

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

  // Load the reCAPTCHA script and get the token
  const recaptchaToken = await executeRecaptcha('getChatCompletion');

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

  // Load the reCAPTCHA script and get the token
  const recaptchaToken = await executeRecaptcha('getChatCompletion');

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
