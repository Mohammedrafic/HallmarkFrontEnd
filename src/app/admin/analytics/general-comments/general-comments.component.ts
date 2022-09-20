import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-general-comments',
  templateUrl: './general-comments.component.html',
  styleUrls: ['./general-comments.component.scss']
})
export class GeneralCommentsComponent implements OnInit {
  public title: string = "General Comments";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
