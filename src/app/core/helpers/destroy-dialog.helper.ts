import { AfterViewChecked, Directive, EventEmitter, Input, Output, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { debounceTime, Subject, takeUntil } from 'rxjs';

import { Destroyable } from './destroyable.helper';

/**
 * This helper is for destroying Syncfusion dialog from DOM,
 * please make sure you are using correct dialog ref, and using
 * watchForCloseStream in component class OnInit method. Also
 * please use dialogAnimationTime for dialog animation option.
 */
@Directive()
export class DestroyDialog extends Destroyable implements AfterViewChecked {
  @ViewChild('destroyableDialog') destroyableDialog: DialogComponent;

  @Input() dialogAnimationTime = 400;

  @Output() destroyDialog: EventEmitter<void> = new EventEmitter();

  public animationSettings: Object = { effect: 'Zoom', duration: 400, delay: 0 };

  private readonly viewObserver: Subject<void> = new Subject();

  ngAfterViewChecked(): void {
    this.destroyableDialog.show();
  }

  closeDialog(): void {
    this.destroyableDialog.hide();
    this.viewObserver.next();
  }

   /**
   * This method not used here in OnInit/Constructor to prevent
   * overriding OnInit/constructor in component class.
   */
  protected watchForCloseStream(): void {
    this.viewObserver.asObservable()
    .pipe(
      debounceTime(this.dialogAnimationTime),
      takeUntil(this.componentDestroy()),
    )
    .subscribe(() => {
      this.destroyDialog.emit();
    });
  }
}
