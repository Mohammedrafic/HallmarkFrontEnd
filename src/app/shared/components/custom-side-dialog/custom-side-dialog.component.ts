import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { takeUntil } from 'rxjs';
import { ShowCustomSideDialog } from '../../../store/app.actions';
import { DestroyableDirective } from '../../directives/destroyable.directive';


@Component({
  selector: 'app-custom-side-dialog',
  templateUrl: './custom-side-dialog.component.html',
  styleUrls: ['./custom-side-dialog.component.scss']
})
export class CustomSideDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('customSideDialog') customSideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @Input() header: string | null;
  @Input() width: string = '1000px';

  constructor(private action$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowCustomSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isCustomDialogShown) {
        this.customSideDialog.show();
      } else {
        this.customSideDialog.hide();
      }
    });
  }
}


