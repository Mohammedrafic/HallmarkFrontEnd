export class SsoManagement {
  static setSsoInformation(domainHint: string, apiScope: string, redirectUrl?: string) {
    localStorage.setItem(SsoKeys.SSO_ENABLED, '1');
    localStorage.setItem(SsoKeys.DOMAIN_HINT, domainHint);
    localStorage.setItem(SsoKeys.API_SCOPE, apiScope);
    if (redirectUrl) {
      localStorage.setItem(SsoKeys.REDIRECT_URL, redirectUrl);
    }

    this.setWasSetup();
  }

  static getSsoInformation() {
    const enabled = localStorage.getItem(SsoKeys.SSO_ENABLED);
    const domainHint = localStorage.getItem(SsoKeys.DOMAIN_HINT);
    const apiScope = localStorage.getItem(SsoKeys.API_SCOPE);
    const redirectUrl = localStorage.getItem(SsoKeys.REDIRECT_URL);

    return {
      enabled: enabled === '1' ? true : false,
      domainHint,
      apiScope,
      redirectUrl,
    };
  }

  static isSsoAvailable(): boolean {
    const enabled = localStorage.getItem(SsoKeys.SSO_ENABLED) === '1' ? true : false;
    const domainHint = localStorage.getItem(SsoKeys.DOMAIN_HINT);
    const apiScope = localStorage.getItem(SsoKeys.API_SCOPE);
    return enabled && domainHint && apiScope ? true : false;
  }

  static clearSsoInformation() {
    localStorage.removeItem(SsoKeys.SSO_ENABLED);
    localStorage.removeItem(SsoKeys.DOMAIN_HINT);
    localStorage.removeItem(SsoKeys.API_SCOPE);
    localStorage.removeItem(SsoKeys.REDIRECT_URL);
    //Note that we don't clear the wasSetup flag here
  }

  static clearLocalStorageButPreserveSso() {
    const enabled = localStorage.getItem(SsoKeys.SSO_ENABLED);
    const domainHint = localStorage.getItem(SsoKeys.DOMAIN_HINT);
    const apiScope = localStorage.getItem(SsoKeys.API_SCOPE);
    const wasSetup = localStorage.getItem(SsoKeys.WAS_SETUP);

    localStorage.clear();

    if (enabled) {
      localStorage.setItem(SsoKeys.SSO_ENABLED, enabled);
    }

    if (domainHint) {
      localStorage.setItem(SsoKeys.DOMAIN_HINT, domainHint);
    }

    if (apiScope) {
      localStorage.setItem(SsoKeys.API_SCOPE, apiScope);
    }

    if (wasSetup) {
      localStorage.setItem(SsoKeys.WAS_SETUP, wasSetup);
    }
  }

  static clearRedirectUrl() {
    localStorage.removeItem(SsoKeys.REDIRECT_URL);
  }

  static setRedirectUrl(fullUrl: string) {
    const url = fullUrl.replace('/ui', '') || '/';
    const blacklistedPaths = ['/', '/login', '/logout', '/error', '/state', '/code', '/sso', '/admin/dashboard'];
    if (url !== null && url !== undefined) {
      if (!blacklistedPaths.includes(url)) {
        localStorage.setItem(SsoKeys.REDIRECT_URL, url);
      }
    }
  }

  static getRedirectUrl(): string | null | undefined {
    return localStorage.getItem(SsoKeys.REDIRECT_URL);
  }

  //For tracking so we know the application needs to be reloaded with sso turned off
  static wasSetup(): boolean {
    return localStorage.getItem(SsoKeys.WAS_SETUP) === '1' ? true : false;
  }

  static clearWasSetup() {
    localStorage.removeItem(SsoKeys.WAS_SETUP);
  }

  static setWasSetup() {
    localStorage.setItem(SsoKeys.WAS_SETUP, '1');
  }
}

export enum SsoKeys {
  REDIRECT_URL = 'sso.redirectUrl',
  SSO_ENABLED = 'sso.enabled',
  WAS_SETUP = 'sso.wasSetup',
  DOMAIN_HINT = 'sso.domainHint',
  API_SCOPE = 'sso.apiScope',
}
