import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-agency-department-spent-hours',
  templateUrl: './agency-department-spent-hours.component.html',
  styleUrls: ['./agency-department-spent-hours.component.scss']
})
export class AgencyDepartmentSpentHoursComponent implements OnInit {
  public title: string = "Agency Department Spent Hours";

  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
