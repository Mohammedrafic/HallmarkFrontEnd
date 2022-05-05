import { Component, OnInit } from '@angular/core';

import { Store } from "@ngxs/store";

import { SetHeaderState } from "src/app/store/app.actions";

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss']
})
export class CandidatesComponent implements OnInit {

  constructor(private store: Store) {
    store.dispatch(new SetHeaderState({ title: 'Agency', iconName: 'clock' }));
  }

  ngOnInit(): void {
  }

}
