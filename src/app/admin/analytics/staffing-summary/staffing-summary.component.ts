import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-staffing-summary',
  templateUrl: './staffing-summary.component.html',
  styleUrls: ['./staffing-summary.component.scss']
})
export class StaffingSummaryComponent implements OnInit {

  public title: string = "Staffing Summary";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
