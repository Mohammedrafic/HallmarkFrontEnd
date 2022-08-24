import { Component, EventEmitter } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-associate-list',
  templateUrl: './associate-list.component.html',
  styleUrls: ['./associate-list.component.scss'],
})
export class AssociateListComponent {
  public isAgency = false;
  public associateEvent = new EventEmitter<boolean>();

  get getTitle(): string {
    return this.isAgency ? 'Organizations' : 'Agencies';
  }

  get buttonText(): string {
    return `Associate New ${this.isAgency ? 'Agency' : 'Organization'}`;
  }

  constructor(private store: Store, private router: Router) {
    this.setHeaderName();
  }

  public addNew(): void {
    this.associateEvent.emit(true);
  }

  private setHeaderName(): void {
    this.isAgency = this.router.url.includes('agency');
    this.store.dispatch(
      new SetHeaderState({ title: `Associated ${this.isAgency ? 'Organizations' : 'Agencies'}`, iconName: 'clock' })
    );
  }
}
