import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-candidate-agency-status-report',
  templateUrl: './candidate-agency-status-report.component.html',
  styleUrls: ['./candidate-agency-status-report.component.scss']
})
export class CandidateAgencyStatusReportComponent implements OnInit {
  public title: string = "Candidate Agency Status Report";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
