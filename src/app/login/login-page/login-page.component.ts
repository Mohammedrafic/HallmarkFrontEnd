import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { map, Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/internal/operators/tap';
import { User } from 'src/app/shared/models/user.model';
import { SetCurrentUser } from 'src/app/store/user.actions';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  users: User[] = [];
  selectedUser: User;

  constructor(
    private usersService: UserService,
    private router: Router,
    private store: Store
    ) { 
  }

  ngOnInit(): void {
    this.usersService.getUsers(1, 100).pipe(map(response => response.items)).subscribe(users => {
      this.users = users;
    });
  }

  ngOnChanges(): void {
    console.log("data changed");
  }

  public changeUser(e: any){
    this.selectedUser = this.users.find(x=>x.id = e.target.value) as User;
  }

  public onLogin(){
    this.store.dispatch(new SetCurrentUser(this.selectedUser));
    this.router.navigate(['./']);
  }

  public onLogout(){
    window.localStorage.removeItem("AuthKey");
    window.localStorage.removeItem("UserData");
  }

}
