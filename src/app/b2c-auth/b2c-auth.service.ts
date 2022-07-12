import { Injectable, Inject } from '@angular/core';
import { filter, Observable } from 'rxjs';

import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import {
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionType,
  PopupRequest,
  RedirectRequest,
} from '@azure/msal-browser';

@Injectable({
  providedIn: 'root',
})
export class B2CAuthService {
  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {}

  public loginSSO(userFlowRequest?: RedirectRequest | PopupRequest) {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (this.msalGuardConfig.authRequest) {
        this.authService
          .loginPopup({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this.authService.instance.setActiveAccount(response.account);
          });
      } else {
        this.authService.loginPopup(userFlowRequest).subscribe((response: AuthenticationResult) => {
          this.authService.instance.setActiveAccount(response.account);
        });
      }
    } else {
      if (this.msalGuardConfig.authRequest) {
        this.authService.loginRedirect({ ...this.msalGuardConfig.authRequest, ...userFlowRequest } as RedirectRequest);
      } else {
        this.authService.loginRedirect(userFlowRequest);
      }
    }
  }

  public onLoginSuccess(): Observable<EventMessage> {
    return this.msalBroadcastService.msalSubject$.pipe(
      filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS)
    );
  }

  public isLoggedIn(): boolean {
    console.log(this.authService.instance.getActiveAccount());
    return this.authService.instance.getActiveAccount() !== null;
  }

  public logout(): void {
    this.authService.logout();
  }
}

