import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';
import { Store } from '@ngxs/store';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { map, mergeMap, Subject, takeUntil } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
import { B2CAuthService } from 'src/app/b2c-auth/b2c-auth.service';
import { User } from 'src/app/shared/models/user.model';
import { SetIsFirstLoadState, ToggleSidebarState } from 'src/app/store/app.actions';
import { SetCurrentUser } from 'src/app/store/user.actions';
import { UserService } from '../../shared/services/user.service';

interface IOptionField {
  id: string;
  businessUnitName: string;
}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent extends DestroyableDirective implements OnInit, OnDestroy {
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

    this.usersService
      .getUsers(1, 100)
      .pipe(
        takeUntil(this.destroy$),
        map((response) => response.items),
        tap((users) => {
          this.users = users;
          this.usersDropDownData = users.map((user) => {
            const { id, businessUnitName, firstName, lastName } = user;
            return { id, businessUnitName, fullName: `${firstName} ${lastName} - ${businessUnitName}` };
          });
          this.loginForm.controls['user'].setValue(users[0].id);
        })
      )
      .subscribe();

    // B2C Login
    this.b2CAuthService
      .onLoginSuccess()
      .pipe(
        takeUntil(this.destroy$),
        // mergeMap(() => this.usersService.getUser()),
        // mergeMap((user) => this.store.dispatch(new SetCurrentUser(user))),
        // tap(() => this.router.navigate(['/']))
      )
      .subscribe();
  }

  public onLogin(): void {
    // Reset sidebar settings on relogin
    this.store.dispatch([new SetIsFirstLoadState(true), new ToggleSidebarState(false)]);

    const selectedUserId: string = this.loginForm.controls['user'].value;
    const index = this.users.findIndex((u) => u.id === selectedUserId);

    if (index >= 0) {
      const selectedUser = this.users[index];
      this.store.dispatch(new SetCurrentUser(selectedUser));
      this.router.navigate(['/']);
    }
  }

  public loginWithSSO(): void {
    this.b2CAuthService.loginSSO();
  }
}
