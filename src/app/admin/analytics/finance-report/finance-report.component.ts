import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-finance-report',
  templateUrl: './finance-report.component.html',
  styleUrls: ['./finance-report.component.scss']
})
export class FinanceReportComponent implements OnInit {
  public title: string = "Finance Report";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
