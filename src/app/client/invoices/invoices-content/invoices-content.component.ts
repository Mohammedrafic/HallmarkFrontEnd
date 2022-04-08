import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-invoices-content',
  templateUrl: './invoices-content.component.html',
  styleUrls: ['./invoices-content.component.scss']
})
export class InvoicesContentComponent implements OnInit {

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({title: 'Invoices'}));
  }

  ngOnInit(): void {
  }

}
