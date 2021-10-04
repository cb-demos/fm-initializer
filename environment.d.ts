declare global {
  namespace NodeJS {
    interface ProcessEnv {
      USER_TOKEN: string;
      APP_NAME: string;
      CD_PROJECT: string;
      CD_USER: string;
      CD_TOKEN: string;
      CD_BASE_URL: string;
    }
  }
}

export {};
