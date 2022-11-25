import { AfterViewChecked, ChangeDetectionStrategy, Component,
  EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Destroyable } from '@core/helpers';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { debounceTime, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-invoice-payment-details',
  templateUrl: './invoice-payment-details.component.html',
  styleUrls: ['./invoice-payment-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicePaymentDetailsComponent extends Destroyable implements AfterViewChecked, OnInit {
  @ViewChild('paymenDetailsDialog') paymenDetailsDialog: DialogComponent;

  @Output() destroyDialog: EventEmitter<void> = new EventEmitter();

  private readonly viewObserver: Subject<void> = new Subject();

  ngOnInit(): void {
    this.watchForCloseStream();
  }

  ngAfterViewChecked(): void {
    this.paymenDetailsDialog.show();
  }

  closeDetails(): void {
    this.paymenDetailsDialog.hide();
    this.viewObserver.next();
  }

  private watchForCloseStream(): void {
    this.viewObserver.asObservable()
    .pipe(
      debounceTime(200),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.destroyDialog.emit();
    });
  }
}
