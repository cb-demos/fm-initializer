declare global {
    namespace NodeJS {
        interface ProcessEnv {
            FM_TOKEN: string;
            USER_TOKEN: string;
            APP_NAME: string;
        }
    }
}

export {}
