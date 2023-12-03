import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { filter, takeUntil, tap } from 'rxjs';
import { createSpinner, showSpinner } from '@syncfusion/ej2-angular-popups';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { B2CAuthService } from 'src/app/b2c-auth/b2c-auth.service';
import { UserState } from 'src/app/store/user.state';
import { SsoManagement } from '../sso-management';
import { InteractionType } from '@azure/msal-browser';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent extends DestroyableDirective implements AfterViewInit {
  @ViewChild('spiner') spiner: ElementRef;

  constructor(private router: Router,
              private b2CAuthService: B2CAuthService,
              private store: Store) {
    super();
  }

  ngAfterViewInit(): void {
    createSpinner({
      target: this.spiner.nativeElement,
    });
    // B2C Login
    this.b2CAuthService.onLoginSuccess().pipe(
      takeUntil(this.destroy$),
      tap(() => showSpinner(this.spiner.nativeElement)),
      filter((response) => (
        response.interactionType === InteractionType.Redirect ||
        response.interactionType === InteractionType.Popup)),
      tap(() => this.navigateToDefaultPage())
    ).subscribe();

    this.b2CAuthService.interactionStatusNone().pipe(
      takeUntil(this.destroy$),
      filter(() => (!this.b2CAuthService.isLoggedIn())),
      tap(() => this.loginWithSSO())
    ).subscribe();
  }

  public loginWithSSO(): void {
    showSpinner(this.spiner.nativeElement);
    this.b2CAuthService.loginSSO();
  }

  private navigateToDefaultPage(): void {
    const isEmployee = this.store.selectSnapshot(UserState.user)?.isEmployee;

    if (isEmployee) {
      this.router.navigate(['/employee/scheduling']);
      return;
    } else {
      const redirect = SsoManagement.getRedirectUrl();
      if (redirect) {
        SsoManagement.clearRedirectUrl();
        this.router.navigate([redirect]);
      } else {
        this.router.navigate(['/']);
      }
      return;
    }
  }
}

