/* eslint-disable @typescript-eslint/consistent-type-definitions */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
    }
  }
}

export {};
