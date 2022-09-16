import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-missing-credentials',
  templateUrl: './missing-credentials.component.html',
  styleUrls: ['./missing-credentials.component.scss']
})
export class MissingCredentialsComponent implements OnInit {

  public title: string = "Missing Credentials";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
