import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-job-fill-ratio',
  templateUrl: './job-fill-ratio.component.html',
  styleUrls: ['./job-fill-ratio.component.scss']
})
export class JobFillRatioComponent implements OnInit {

  public title: string = "Job Fill Ratio";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
