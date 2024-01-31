import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { take, takeUntil } from 'rxjs';
import { createSpinner, hideSpinner, showSpinner } from '@syncfusion/ej2-angular-popups';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { B2CAuthService } from 'src/app/b2c-auth/b2c-auth.service';
import { UserState } from 'src/app/store/user.state';
import { SsoManagement } from '../sso-management';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent extends DestroyableDirective implements AfterViewInit {
  @ViewChild('spiner') spiner: ElementRef;

  constructor(private router: Router, private b2CAuthService: B2CAuthService, private store: Store) {
    super();
  }

  ngAfterViewInit(): void {
    createSpinner({
      target: this.spiner.nativeElement,
    });

    // B2C Login
    this.b2CAuthService
      .onLoginSuccess()
      .pipe(take(1),takeUntil(this.destroy$))
      .subscribe(() => this.navigateToDefaultPage());

    this.b2CAuthService
      .interactionStatusNone()
      .pipe(take(1),takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.b2CAuthService.isLoggedIn()) {
          this.loginWithSSO();
        } else {
          this.navigateToDefaultPage();
          SsoManagement.clearRedirectUrl();
        }
      });
  }

  public loginWithSSO(): void {
    this.showSpinner();
    this.b2CAuthService.loginSSO();
  }

  showSpinner(): void {
    showSpinner(this.spiner?.nativeElement);
  }

  hideSpinner(): void {
    hideSpinner(this.spiner?.nativeElement);
  }

  private navigateToDefaultPage(): void {
    this.hideSpinner();
    const isEmployee = this.store.selectSnapshot(UserState.user)?.isEmployee;

    if (isEmployee) {
      this.router.navigate(['/employee/scheduling']);
      return;
    } else {
      const redirect = SsoManagement.getRedirectUrl();
      if (redirect) {
        this.router.navigate([redirect]);
      } else {
        this.router.navigate(['/']);
      }
      return;
    }
  }
}
