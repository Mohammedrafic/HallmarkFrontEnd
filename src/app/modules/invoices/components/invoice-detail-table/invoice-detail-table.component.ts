import { Component, Input, OnChanges } from '@angular/core';
import { InvoiceItem } from '../../interfaces';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { ProfileTimesheetTableConfig } from '../../../timesheets/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-detail-table',
  templateUrl: './invoice-detail-table.component.html',
  styleUrls: ['./invoice-detail-table.component.scss']
})
export class InvoiceDetailTableComponent extends AbstractGridConfigurationComponent implements OnChanges {
  @Input() invoice: InvoiceItem | any;

  public initialSort = {
    columns: [
      { field: 'timeIn', direction: 'Ascending' },
    ],
  };
  public readonly tableHeight = 220;
  public readonly tableConfig = ProfileTimesheetTableConfig;
  public tempData: any[] = [];
  public isAgency = false;

  constructor(private router: Router) {
    super();

    this.isAgency = this.router.url.includes('agency');
  }

  ngOnChanges() {
    this.createTableData();
  }

  public get createRange(): string {
    return this.invoice.minRate === this.invoice.maxRate ?
      `${this.invoice.minRate}`
      : `${ this.invoice.minRate } - ${ this.invoice.maxRate }`;
  }

  public deleteTableItem(data: any): void {

  }

  /**
   * Todo remove after demo
   */
  private createTableData(): void {
    let initDate: Date = new Date(this.invoice.startDate);
    for (let i = 0; i < 5; i++) {
      const tableItem = {
        id: 500 + i,
        day: new Date(initDate),
        timeIn: this.setInitTime(new Date(initDate)),
        timeOut: this.setEndOfday(new Date(initDate)),
        costCenter: 'AB group',
        category: 'Regular',
        hours: 8,
        rate: this.invoice.rate,
        total: this.invoice.rate * 8,
      };

      this.tempData.push(tableItem);
      initDate = new Date(initDate.setDate(initDate.getDate() + 1));
    }
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
