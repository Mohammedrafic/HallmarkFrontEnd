import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-head-count',
  templateUrl: './head-count.component.html',
  styleUrls: ['./head-count.component.scss']
})
export class HeadCountComponent implements OnInit {

  public title: string = "Head Count";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
