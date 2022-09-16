import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-job-details-summary',
  templateUrl: './job-details-summary.component.html',
  styleUrls: ['./job-details-summary.component.scss']
})
export class JobDetailsSummaryComponent implements OnInit {

  public title: string = "Job Details Summary";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
