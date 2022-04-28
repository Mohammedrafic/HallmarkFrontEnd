import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { map, Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/internal/operators/tap';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from '../services/UserService';

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
    private router: Router
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
    window.localStorage.setItem("AuthKey", this.selectedUser.id);
    window.localStorage.setItem("UserData", this.selectedUser.businessUnitName + this.selectedUser.id);
    this.router.navigate(['./client/dashboard']);
  }

  public onLogout(){
    window.localStorage.removeItem("AuthKey");
    window.localStorage.removeItem("UserData");
  }

}
