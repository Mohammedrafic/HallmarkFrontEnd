import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { Store } from "@ngxs/store";

import { UserState } from "../../store/user.state";

@Component({
  selector: 'app-profile',
  template: '',
})
export class ProfileComponent implements OnInit {

  constructor(
    private store: Store,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.store.selectSnapshot(UserState.user);
    this.router.navigate([`agency/agency-list/edit/${user?.businessUnitId}`]);
  }
}
