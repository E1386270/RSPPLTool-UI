import { OktaAuth } from '@okta/okta-auth-js';
import { oktaConfig } from './config/environment';

const oktaConfigSettings = {
  clientId: oktaConfig.clientId,
  issuer: oktaConfig.issuer,
  redirectUri: oktaConfig.redirectUri,
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
  tokenManager: {
    storage: 'localStorage' as const,
  },
};

export const oktaAuth = new OktaAuth(oktaConfigSettings);

export default oktaConfigSettings;
