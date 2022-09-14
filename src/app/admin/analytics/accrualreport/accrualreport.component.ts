import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-accrualreport',
  templateUrl: './accrualreport.component.html',
  styleUrls: ['./accrualreport.component.scss']
})
export class AccrualreportComponent implements OnInit {
  public title: string = "Accrual Report";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }))
}

  ngOnInit(): void {
  }

}
