import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-job-event',
  templateUrl: './job-event.component.html',
  styleUrls: ['./job-event.component.scss']
})
export class JobEventComponent implements OnInit {

  public title: string = "Job Event";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
