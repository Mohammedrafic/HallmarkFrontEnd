import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-ytd-summary',
  templateUrl: './ytd-summary.component.html',
  styleUrls: ['./ytd-summary.component.scss']
})
export class YtdSummaryComponent implements OnInit {

  public title: string = "YTD Summary";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
