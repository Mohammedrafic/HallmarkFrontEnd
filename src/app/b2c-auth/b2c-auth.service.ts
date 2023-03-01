import { Injectable, Inject } from '@angular/core';
import { filter, Observable, tap } from 'rxjs';

import { MsalBroadcastService, MsalGuardConfiguration, MsalService, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import {
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionStatus,
  InteractionType,
  PopupRequest,
  RedirectRequest,
} from '@azure/msal-browser';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class B2CAuthService {
  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router
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
      filter(
        (msg: EventMessage) =>
          msg.eventType === EventType.LOGIN_SUCCESS || msg.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
      )
    );
  }

  public interactionStatusNone(): Observable<InteractionStatus> {
    this.msalBroadcastService.msalSubject$
    .pipe(
      filter((msg: EventMessage) => msg.eventType === EventType.ACQUIRE_TOKEN_FAILURE))
      .subscribe((result: EventMessage) => {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/']);
      });
    return this.msalBroadcastService.inProgress$.pipe(
      filter((status: InteractionStatus) => status === InteractionStatus.None),
      tap(() => {
        this.checkAndSetActiveAccount();
      })
    );
  }

  public isLoggedIn(): boolean {
    return this.authService.instance.getActiveAccount() !== null;
  }

  public logout(): void {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      this.authService.logout();
    } else {
      this.authService.logoutRedirect();
    }
  }

  public checkAndSetActiveAccount(): void {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     */
    let activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }
}

