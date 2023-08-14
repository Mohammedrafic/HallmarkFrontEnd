import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Store } from '@ngxs/store';

import { SetHeaderState } from 'src/app/store/app.actions';
import { UserState } from 'src/app/store/user.state';

import { EmployeeProfileSectionLinks } from './constants';
import { EmployeeSectionLink } from './interfaces';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeProfileComponent {

  readonly employeeName = this.store.selectSnapshot(UserState.user)?.fullName;
  readonly sectionLinks: EmployeeSectionLink[]  = EmployeeProfileSectionLinks;

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({ title: 'My Profile' }));
  }

  trackByLinkRoute(index: number, item: EmployeeSectionLink): string {
    return item.route;
  }
}
