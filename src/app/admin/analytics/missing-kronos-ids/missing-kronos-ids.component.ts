import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-missing-kronos-ids',
  templateUrl: './missing-kronos-ids.component.html',
  styleUrls: ['./missing-kronos-ids.component.scss']
})
export class MissingKronosIdsComponent implements OnInit {

  public title: string = "Missing Kronos Ids";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }
  ngOnInit(): void {
  }

}
