declare namespace NodeJS {
  interface ProcessEnv {
    // Redis Configuration
    REDIS_URL: string;
    REDIS_TOKEN?: string;

    // Application Environment
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_APP_URL: string;

    // Simulation Configuration (optional)
    WORKER_UPDATE_INTERVAL?: string;
    MAX_DELAY_MINUTES?: string;
    DELAY_PROBABILITY?: string;
  }
}
