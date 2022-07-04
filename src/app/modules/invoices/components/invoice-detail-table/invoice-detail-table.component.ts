import { Component, Input } from '@angular/core';
import { InvoiceItem } from '../../interfaces';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ProfileTimesheetTableConfig } from '../../../timesheets/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-detail-table',
  templateUrl: './invoice-detail-table.component.html',
  styleUrls: ['./invoice-detail-table.component.scss']
})
export class InvoiceDetailTableComponent extends AbstractGridConfigurationComponent {
  @Input() invoice: InvoiceItem | any;

  public initialSort = {
    columns: [
      { field: 'timeIn', direction: 'Ascending' },
    ],
  };
  public readonly tableHeight = 220;
  public readonly tableConfig = ProfileTimesheetTableConfig;
  public isAgency = false;

  constructor(private router: Router) {
    super();

    this.isAgency = this.router.url.includes('agency');
  }

  public get createRange(): string {
    return this.invoice.minRate === this.invoice.maxRate ?
      `${this.invoice.minRate}`
      : `${ this.invoice.minRate } - ${ this.invoice.maxRate }`;
  }

  public deleteTableItem(data: any): void {

  }

  private setInitTime(time: Date) {
    const clonedDate = new Date(time.getTime());
    clonedDate.setHours(8, 0, 0);
    return clonedDate;
  }

  private setEndOfday(time: Date) {
    const clonedDate = new Date(time.getTime());
    clonedDate.setHours(17, 0,  0);
    return clonedDate;
  }
}
