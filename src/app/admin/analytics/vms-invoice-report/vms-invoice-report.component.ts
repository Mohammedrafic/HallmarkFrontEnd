import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetHeaderState } from '../../../store/app.actions';

@Component({
  selector: 'app-vms-invoice-report',
  templateUrl: './vms-invoice-report.component.html',
  styleUrls: ['./vms-invoice-report.component.scss']
})
export class VmsInvoiceReportComponent implements OnInit {

  public title: string = "VMS Invoice Report";
  constructor(private store: Store) {
    this.store.dispatch(new SetHeaderState({ title: this.title, iconName: '' }));
  }

  ngOnInit(): void {
  }

}
