import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-benchmarking-rate-by-state',
  templateUrl: './benchmarking-rate-by-state.component.html',
  styleUrls: ['./benchmarking-rate-by-state.component.scss']
})
export class BenchmarkingRateByStateComponent implements OnInit {
  public title: string = "Benchmarking Rate By State";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
