import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-agency-list',
  templateUrl: './agency-list.component.html',
  styleUrls: ['./agency-list.component.scss']
})
export class AgencyListComponent {

  constructor(private store: Store, private router: Router, private route: ActivatedRoute) {
    store.dispatch(new SetHeaderState({ title: 'Agency', iconName: 'clock' }));
  }

  public navigateToAgencyForm(): void {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }
}
