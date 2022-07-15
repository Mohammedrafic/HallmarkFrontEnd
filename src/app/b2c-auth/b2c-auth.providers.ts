import { Injector, Provider, StaticProvider } from '@angular/core';
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
import { InteractionType, IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';

import { msalConfig, loginRequest, protectedResources } from './auth-config';

/**
 * Here we pass the configuration parameters to create an MSAL instance.
 * For more info, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/configuration.md
 */

export function MSALInstanceFactory(config: any): () => IPublicClientApplication {
  console.warn(config)
  return () =>  new PublicClientApplication(msalConfig);
}

/**
 * MSAL Angular will automatically retrieve tokens for resources
 * added to protectedResourceMap. For more info, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-angular/docs/v2-docs/initialization.md#get-tokens-for-web-api-calls
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(protectedResources.dev.endpoint, protectedResources.dev.scopes);
  protectedResourceMap.set(protectedResources.qa.endpoint, protectedResources.qa.scopes);

  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap,
  };
}

/**
 * Set your default interaction type for MSALGuard here. If you have any
 * additional scopes you want the user to consent upon login, add them here as well.
 */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Popup,
    authRequest: loginRequest,
  };
}

export const MSAL_STATIC_PROVIDERS = (config: any): StaticProvider[] => [
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
    useFactory: MSALInterceptorConfigFactory
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

