import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from 'src/app/store/app.actions';

@Component({
  selector: 'app-candidates-content',
  templateUrl: './candidates-content.component.html',
  styleUrls: ['./candidates-content.component.scss']
})
export class CandidatesContentComponent implements OnInit {

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({title: 'Candidate List'}));
  }

  ngOnInit(): void {
  }

}
