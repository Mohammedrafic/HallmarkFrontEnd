import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-predicted-contract-labor-spent',
  templateUrl: './predicted-contract-labor-spent.component.html',
  styleUrls: ['./predicted-contract-labor-spent.component.scss']
})
export class PredictedContractLaborSpentComponent implements OnInit {

  public title: string = "Predicted Contract Labor Spent";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
