import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { TimesheetDetailsInvoice } from '../../interface';
import { TimesheetDetailsApiService } from '../../services/timesheet-details-api.service';
import { PdfViewerComponent } from '@syncfusion/ej2-angular-pdfviewer';

@Component({
  selector: 'app-profile-invoices',
  templateUrl: './profile-invoices.component.html',
  styleUrls: ['./profile-invoices.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInvoicesComponent {
  public previewInvoice: TimesheetDetailsInvoice | null = null;

  @ViewChild('pdfViewer')
  public pdfViewer: PdfViewerComponent;

  @Input()
  public invoices: TimesheetDetailsInvoice[] = [];

  constructor(
    private timesheetDetailsApiService: TimesheetDetailsApiService,
  ) {
  }

  public trackByName(_: number, item: TimesheetDetailsInvoice): string {
    return item.name;
  }

  public preview(invoice: TimesheetDetailsInvoice): void {
    this.previewInvoice = invoice;

    this.timesheetDetailsApiService.loadInvoiceBlob(invoice.url)
      .pipe(
        takeUntil(this.componentDestroy())
      )
      .subscribe((previewBlob) => {
        const reader = new FileReader();

        reader.readAsDataURL(previewBlob);
        reader.onloadend = () => {
          this.pdfViewer?.load('', '');
        }
      });
  }
}
