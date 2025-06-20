// Apple Sign-In TypeScript declarations
declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: AppleSignInConfig) => Promise<void>;
        signIn: () => Promise<AppleSignInResponse>;
      };
    };
  }
}

interface AppleSignInConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state: string;
  usePopup: boolean;
}

interface AppleSignInResponse {
  authorization: {
    id_token: string;
    code: string;
  };
  user?: {
    name?: {
      firstName: string;
      lastName: string;
    };
    email?: string;
  };
}

export {};