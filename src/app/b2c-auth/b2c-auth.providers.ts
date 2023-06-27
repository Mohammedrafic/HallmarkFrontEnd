import { Provider, StaticProvider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import {
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalService,
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
} from '@azure/msal-angular';
import {
  BrowserCacheLocation,
  Configuration,
  InteractionType,
  IPublicClientApplication,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';

import { environment } from 'src/environments/environment';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

export const APP_SETTINGS_B2C_CONFIG_URL = (host: string) => `${host}/azuread`;

export type B2CClientConfig = {
  apiScope: string;
  authority: string;
  clientId: string;
  domain: string;
};

/**
 * Here we pass the configuration parameters to create an MSAL instance.
 * For more info, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/configuration.md
 */

export function MSALInstanceFactory(config: B2CClientConfig): () => IPublicClientApplication {
  /**
   * Configuration object to be passed to MSAL instance on creation.
   * For a full list of MSAL.js configuration parameters, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
   */
  const msalConfig: Configuration = {
    auth: {
      clientId: config.clientId, // This is the ONLY mandatory field that you need to supply.
      authority: config.authority, // Defaults to https://login.microsoftonline.com/common
      knownAuthorities: [config.domain], // Mark your B2C tenant's domain as trusted.
      redirectUri: environment.production ? '/ui' : '/', // Points to window.location.origin. You must register this URI on Azure portal/App Registration.
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage, // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
      storeAuthStateInCookie: isIE, // Set this to "true" if you are having issues on IE11 or Edge
    },
    system: {
      loggerOptions: {
        loggerCallback(logLevel: LogLevel, message: string) {
        },
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false,
      },
    },
  };
  return () => new PublicClientApplication(msalConfig);
}

/**
 * MSAL Angular will automatically retrieve tokens for resources
 * added to protectedResourceMap. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/initialization.md#get-tokens-for-web-api-calls
 */
export function MSALInterceptorConfigFactory(
  host: string,
  config: B2CClientConfig
): () => MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(host, [config.apiScope]);

  return () => ({
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  });
}

/**
 * Set your default interaction type for MSALGuard here. If you have any
 * additional scopes you want the user to consent upon login, add them here as well.
 */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  /**
   * Scopes you add here will be prompted for user consent during sign-in.
   * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
   * For more information about OIDC scopes, visit:
   * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
   */
  const loginRequest = {
    scopes: [],
  };

  return {
    interactionType: InteractionType.Redirect,
    authRequest: loginRequest,
  };
}

export const MSAL_STATIC_PROVIDERS = (host: string, config: B2CClientConfig): StaticProvider[] => [
  {
    provide: MSAL_INSTANCE,
    useFactory: MSALInstanceFactory(config),
  },
  {
    provide: MSAL_GUARD_CONFIG,
    useFactory: MSALGuardConfigFactory,
  },
  {
    provide: MSAL_INTERCEPTOR_CONFIG,
    useFactory: MSALInterceptorConfigFactory(host, config),
  },
];

export const MSAL_PROVIDERS: Provider[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: MsalInterceptor,
    multi: true,
  },
  MsalService,
  MsalGuard,
  MsalBroadcastService,
];

