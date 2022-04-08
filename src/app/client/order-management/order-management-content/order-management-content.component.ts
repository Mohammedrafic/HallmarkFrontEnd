import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-order-management-content',
  templateUrl: './order-management-content.component.html',
  styleUrls: ['./order-management-content.component.scss']
})
export class OrderManagementContentComponent implements OnInit {
  
  public data: object[];

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({title: 'Order Management'}));
  }

  ngOnInit(): void {
  }

}
