declare global{
   namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    GEMINI_API_KEY: string;
  }
}
}
 

export {}