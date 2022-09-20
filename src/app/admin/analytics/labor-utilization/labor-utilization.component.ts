import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-labor-utilization',
  templateUrl: './labor-utilization.component.html',
  styleUrls: ['./labor-utilization.component.scss']
})
export class LaborUtilizationComponent implements OnInit {

  public title: string = "Labor Utilization";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
