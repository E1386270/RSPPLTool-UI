/**
 * Environment Configuration
 * Centralized configuration based on deployment environment
 */

interface EnvironmentConfig {
  okta: {
    clientId: string;
    issuer: string;
    redirectUri: string;
    postLogoutRedirectUri: string;
    redirectSuffix?: string; // Optional suffix for redirect URI if needed
  };
  api: {
    baseUrl: string;
  };
  environment: 'local' | 'development' | 'staging' | 'production';
  isDev: boolean;
  isProd: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // Get environment variables from Vite
  const oktaClientId = import.meta.env.VITE_OKTA_CLIENT_ID;
  const oktaIssuer = import.meta.env.VITE_OKTA_ISSUER;
  const oktaRedirectUri = import.meta.env.VITE_OKTA_REDIRECT_URI;
  const oktaPostLogoutRedirectUri = import.meta.env.VITE_OKTA_POST_LOGOUT_REDIRECT_URI;
  const oktaRedirectSuffix = import.meta.env.VITE_OKTA_REDIRECT_SUFFIX;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const environment = (import.meta.env.VITE_ENVIRONMENT || 'local') as EnvironmentConfig['environment'];

  // Validate required environment variables
  if (!oktaClientId) {
    console.warn('Warning: VITE_OKTA_CLIENT_ID not set');
  }
  if (!oktaIssuer) {
    console.warn('Warning: VITE_OKTA_ISSUER not set');
  }
  if (!oktaRedirectUri) {
    console.warn('Warning: VITE_OKTA_REDIRECT_URI not set');
  }
  const redirectSuffix = oktaRedirectSuffix || '/signin/callback';
  const baseRedirectUri = oktaRedirectUri || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');
  const fullRedirectUri = baseRedirectUri.endsWith(redirectSuffix)
    ? baseRedirectUri
    : `${baseRedirectUri}${redirectSuffix.startsWith('/') ? redirectSuffix : `/${redirectSuffix}`}`;

  const fallbackPostLogoutRedirectUri = fullRedirectUri.endsWith(redirectSuffix)
    ? fullRedirectUri.slice(0, fullRedirectUri.length - redirectSuffix.length) || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173')
    : fullRedirectUri;

  const config: EnvironmentConfig = {
    okta: {
      clientId: oktaClientId || '',
      issuer: oktaIssuer || 'https://emerson.okta.com/',
      redirectUri: fullRedirectUri,
      postLogoutRedirectUri: oktaPostLogoutRedirectUri || fallbackPostLogoutRedirectUri,
      redirectSuffix: redirectSuffix,
    },
    api: {
      baseUrl: apiBaseUrl || 'https://alphafx.emrsn.org:4000',
    },
    environment,
    isDev: environment === 'local' || environment === 'development',
    isProd: environment === 'production',
  };

  return config;
};

export const envConfig = getEnvironmentConfig();

// Export individual configs for convenience
export const oktaConfig = envConfig.okta;
export const apiConfig = envConfig.api;
export const { environment, isDev, isProd } = envConfig;
