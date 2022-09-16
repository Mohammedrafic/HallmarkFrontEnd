import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-client-finance-report',
  templateUrl: './client-finance-report.component.html',
  styleUrls: ['./client-finance-report.component.scss']
})
export class ClientFinanceReportComponent implements OnInit {
  public title: string = "Client Finance Report";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
