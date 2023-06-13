import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { DestroyDialog } from '@core/helpers';
import { WARNING_TITLE } from '@shared/constants';

@Component({
  selector: 'app-replacement-order-confirmation',
  templateUrl: './replacement-order-confirmation.component.html',
  styleUrls: ['./replacement-order-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplacementOrderConfirmationComponent extends DestroyDialog implements OnInit {
  @Input() text: string;
  @Output() confirm = new EventEmitter<boolean>();

  @Input() replaceChecked = false;
  @Output() replaceCheckedChange = new EventEmitter<boolean>();

  public warningTitle = WARNING_TITLE;

  ngOnInit(): void {
    this.watchForCloseStream();
  }

  public updateReplaceValue(): void {
    this.replaceCheckedChange.emit(this.replaceChecked);
  }

  public submit(): void {
    this.confirm.emit(true);
    this.closeDialog();
  }

  public cancel(): void {
    this.confirm.emit(false);
    this.closeDialog();
  }
}
