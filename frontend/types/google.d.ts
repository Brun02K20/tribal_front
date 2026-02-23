export type GoogleCredentialResponse = { credential: string };

export type GoogleButtonOptions = {
  theme?: string;
  size?: string;
  text?: string;
  shape?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (params: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
        };
      };
    };
  }
}

export {};
