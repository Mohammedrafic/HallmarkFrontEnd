import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-job-compliance',
  templateUrl: './job-compliance.component.html',
  styleUrls: ['./job-compliance.component.scss']
})
export class JobComplianceComponent implements OnInit {

  public title: string = "Job Compliance";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
