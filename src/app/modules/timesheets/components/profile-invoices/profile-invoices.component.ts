import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';

import { PdfViewerComponent } from '@syncfusion/ej2-angular-pdfviewer';
import { takeUntil } from 'rxjs';

import { Destroyable } from '@core/helpers';
import { TimesheetInvoice } from '../../interface';
import { TimesheetDetailsApiService } from '../../services/timesheet-details-api.service';

@Component({
  selector: 'app-profile-invoices',
  templateUrl: './profile-invoices.component.html',
  styleUrls: ['./profile-invoices.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInvoicesComponent extends Destroyable {
  public previewInvoice: TimesheetInvoice | null = null;

  public readonly serviceUrl = 'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';

  @ViewChild('pdfViewer')
  public pdfViewer: PdfViewerComponent;

  @Input()
  public invoices: TimesheetInvoice[] | null = [];

  constructor(
    private timesheetDetailsApiService: TimesheetDetailsApiService,
  ) {
    super();
  }

  public trackByName(_: number, item: TimesheetInvoice): string {
    return item.fileName;
  }

  public preview(invoice: TimesheetInvoice): void {
    this.previewInvoice = invoice;

    this.timesheetDetailsApiService.loadInvoiceBlob(invoice.url)
      .pipe(
        takeUntil(this.componentDestroy())
      )
      .subscribe((previewBlob: Blob) => {
        const reader = new FileReader();

        reader.readAsDataURL(previewBlob);
        reader.onloadend = () => {
          this.pdfViewer?.load('', '');
        }
      });
  }
}
