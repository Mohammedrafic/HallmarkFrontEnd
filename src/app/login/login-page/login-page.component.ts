import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {  mergeMap, takeUntil,  tap } from 'rxjs';
import { Store } from '@ngxs/store';

import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { B2CAuthService } from 'src/app/b2c-auth/b2c-auth.service';
import { User } from 'src/app/shared/models/user.model';
import { SetCurrentUser } from 'src/app/store/user.actions';
import { UserService } from '../../shared/services/user.service';
import { createSpinner, showSpinner } from '@syncfusion/ej2-angular-popups';


interface IOptionField {
  id: string;
  businessUnitName: string;
}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent extends DestroyableDirective implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('spiner') spiner: ElementRef;

  public optionFields = {
    text: 'fullName',
    value: 'id',
  };

  public loginForm: FormGroup;

  public users: User[];
  public usersDropDownData: IOptionField[];

  constructor(
    private formBuilder: FormBuilder,
    private usersService: UserService,
    private router: Router,
    private store: Store,
    private b2CAuthService: B2CAuthService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      user: new FormControl(''),
    });

    // B2C Login
    this.b2CAuthService
      .onLoginSuccess()
      .pipe(
        takeUntil(this.destroy$),
        mergeMap(() => {
          showSpinner(this.spiner.nativeElement);
          return this.usersService.getUser()}),
        mergeMap((user) => this.store.dispatch(new SetCurrentUser(user))),
        tap(() => this.router.navigate(['/']))
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    createSpinner({
      target: this.spiner.nativeElement
    });
  }


  public loginWithSSO(): void {
    this.b2CAuthService.loginSSO();
  }
}
