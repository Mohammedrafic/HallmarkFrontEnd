import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-vendor-scorecard',
  templateUrl: './vendor-scorecard.component.html',
  styleUrls: ['./vendor-scorecard.component.scss']
})
export class VendorScorecardComponent implements OnInit {

  public title: string = "Vendor Scorecard";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
