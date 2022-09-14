import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-credential-expiry',
  templateUrl: './credential-expiry.component.html',
  styleUrls: ['./credential-expiry.component.scss']
})
export class CredentialExpiryComponent implements OnInit {
  public title: string = "Credentia Expiry";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
