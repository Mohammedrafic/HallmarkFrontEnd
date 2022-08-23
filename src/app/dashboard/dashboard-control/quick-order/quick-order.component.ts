import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-quick-order',
  templateUrl: './quick-order.component.html',
  styleUrls: ['./quick-order.component.scss'],
})
export class QuickOrderComponent extends DestroyableDirective implements OnInit {
  @Input() openEvent: Subject<boolean>;

  @ViewChild('sideDialog', { static: true }) sideDialog: DialogComponent;

  public readonly targetElement: HTMLElement = document.body;

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.onOpenEvent();
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.destroy$)).subscribe((isOpen) => {
      if (isOpen) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  public onCloseDialog(): void {
    this.openEvent.next(false);
  }
}
