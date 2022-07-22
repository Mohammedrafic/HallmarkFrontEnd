import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, takeUntil, tap } from 'rxjs';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { B2CAuthService } from 'src/app/b2c-auth/b2c-auth.service';
import { createSpinner, showSpinner } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent extends DestroyableDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('spiner') spiner: ElementRef;

  constructor(
    private router: Router,
    private b2CAuthService: B2CAuthService
  ) {
    super();
  }

  ngOnInit(): void {
    // B2C Login
    combineLatest([
      this.b2CAuthService.onLoginSuccess().pipe(
        takeUntil(this.destroy$),
        tap(() => showSpinner(this.spiner.nativeElement)),
        tap(() => this.router.navigate(['/']))
      ),
      this.b2CAuthService.interactionStatusNone().pipe(
        tap(() => {
          if (!this.b2CAuthService.isLoggedIn()) {
            // this.loginWithSSO();
          }
        })
      ),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngAfterViewInit(): void {
    createSpinner({
      target: this.spiner.nativeElement,
    });
  }

  public loginWithSSO(): void {
    showSpinner(this.spiner.nativeElement);
    this.b2CAuthService.loginSSO();
  }
}

