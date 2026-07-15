/**
 * Token Manager Service
 * Handles Okta access token management and provides utilities for authorization
 */

let currentAccessToken: string | null = null;
let currentIdToken: string | null = null;
let currentUserClaims: UserClaims | null = null;

/**
 * Update the current access token (called from App.tsx when authState changes)
 */
export const setAccessToken = (token: string | null): void => {
  currentAccessToken = token;
};

/**
 * Update the current ID token (called from App.tsx when authState changes)
 */
export const setIdToken = (token: string | null): void => {
  currentIdToken = token;
};

/**
 * Update the current user claims from the Okta ID token.
 */
export const setUserClaims = (claims: UserClaims | null): void => {
  currentUserClaims = claims;
};

/**
 * Get the current access token for API calls
 */
export const getAccessToken = (): string | null => {
  return currentAccessToken;
};

/**
 * Get the current ID token
 */
export const getIdToken = (): string | null => {
  return currentIdToken;
};

/**
 * Get the current user claims for display in the UI.
 */
export const getUserClaimsState = (): UserClaims | null => {
  return currentUserClaims;
};

/**
 * Check if token exists and is available
 */
export const hasAccessToken = (): boolean => {
  return currentAccessToken !== null && currentAccessToken !== '';
};

/**
 * Clear tokens (on logout)
 */
export const clearTokens = (): void => {
  currentAccessToken = null;
  currentIdToken = null;
  currentUserClaims = null;
};

/**
 * Extract user claims from ID token for display
 * This is called from App.tsx when authState is available
 */
export interface UserClaims {
  name?: string;
  email?: string;
  sub?: string;
  [key: string]: any;
}

export const getUserClaims = (idTokenClaims: any): UserClaims => {
  if (!idTokenClaims) return {};
  
  return {
    name: idTokenClaims.name || '',
    email: idTokenClaims.email || '',
    sub: idTokenClaims.sub || '',
    ...idTokenClaims,
  };
};

/**
 * Check if user has specific roles/groups
 */
export const hasRole = (userClaims: UserClaims, requiredRole: string): boolean => {
  if (!userClaims.groups || !Array.isArray(userClaims.groups)) {
    return false;
  }
  return userClaims.groups.includes(requiredRole);
};

/**
 * Check if user has any of the required roles
 */
export const hasAnyRole = (userClaims: UserClaims, roles: string[]): boolean => {
  if (!userClaims.groups || !Array.isArray(userClaims.groups)) {
    return false;
  }
  return roles.some((role) => userClaims.groups?.includes(role));
};
