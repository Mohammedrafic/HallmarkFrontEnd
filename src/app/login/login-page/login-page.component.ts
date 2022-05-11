import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { map, Subject, takeUntil } from 'rxjs';
import { tap } from 'rxjs/internal/operators/tap';
import { User } from 'src/app/shared/models/user.model';
import { SetCurrentUser } from 'src/app/store/user.actions';
import { UserService } from '../../shared/services/user.service';

interface IOptionField {
  id: string;
  businessUnitName: string;
}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {

  public optionFields = {
    text: 'businessUnitName',
    value: 'id'
  };

  public loginForm: FormGroup;

  public users: User[];
  public usersDropDownData: IOptionField[];

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private formBuilder: FormBuilder,
    private usersService: UserService,
    private router: Router,
    private store: Store
  ) {
    this.loginForm = this.formBuilder.group({
      user: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.usersService.getUsers(1, 100).pipe(
      takeUntil(this.unsubscribe$),
      map(response => response.items),
      tap(users => {
        this.users = users;
        this.usersDropDownData = users.map(user => {
          const { id, businessUnitName } = user;
          return { id, businessUnitName };
        });
        this.loginForm.controls['user'].setValue(users[0].id);
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onLogin(): void {
    const selectedUserId: string = this.loginForm.controls['user'].value;
    const index = this.users.findIndex(u => u.id === selectedUserId);

    if (index >= 0) {
      const selectedUser = this.users[index];
      this.store.dispatch(new SetCurrentUser(selectedUser));
      this.router.navigate(['/']);
    }
  }

}
