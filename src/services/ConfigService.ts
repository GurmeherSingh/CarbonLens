// Configuration service for managing API keys and environment variables
export class ConfigService {
  private static instance: ConfigService;
  private config: Record<string, string> = {};

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  // Initialize configuration
  initialize(): void {
    // In React Native, we need to handle environment variables differently
    // For now, we'll use hardcoded values or fetch from a config endpoint
    
    // Try to get from environment variables (if available)
    this.config = {
      GOOGLE_CLOUD_VISION_API_KEY: process.env.GOOGLE_CLOUD_VISION_API_KEY || '',
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
      VIRO_API_KEY: process.env.VIRO_API_KEY || '',
      NODE_ENV: process.env.NODE_ENV || 'development',
      DEBUG: process.env.DEBUG || 'false',
    };

    console.log('Configuration initialized');
  }

  // Get configuration value
  get(key: string): string {
    return this.config[key] || '';
  }

  // Set configuration value
  set(key: string, value: string): void {
    this.config[key] = value;
  }

  // Check if API key is configured
  isApiKeyConfigured(service: string): boolean {
    const key = this.get(`${service}_API_KEY`);
    return key.length > 0;
  }

  // Get Google Cloud Vision API key
  getGoogleVisionApiKey(): string {
    return this.get('GOOGLE_CLOUD_VISION_API_KEY');
  }

  // Get Firebase configuration
  getFirebaseConfig() {
    return {
      apiKey: this.get('FIREBASE_API_KEY'),
      projectId: this.get('FIREBASE_PROJECT_ID'),
      authDomain: this.get('FIREBASE_AUTH_DOMAIN'),
      storageBucket: this.get('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: this.get('FIREBASE_MESSAGING_SENDER_ID'),
      appId: this.get('FIREBASE_APP_ID'),
    };
  }

  // Check if running in development mode
  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  // Check if debug mode is enabled
  isDebugEnabled(): boolean {
    return this.get('DEBUG') === 'true';
  }
}

export default ConfigService;
