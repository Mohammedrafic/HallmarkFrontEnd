import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-organization-invoice',
  templateUrl: './organization-invoice.component.html',
  styleUrls: ['./organization-invoice.component.scss']
})
export class OrganizationInvoiceComponent implements OnInit {

  public title: string = "Organization Invoice";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }
  ngOnInit(): void {
  }

}
