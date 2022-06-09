import { Component, OnInit, Output, ViewChild, EventEmitter, Input } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-widget-list',
  templateUrl: './widget-list.component.html',
  styleUrls: ['./widget-list.component.scss'],
})
export class WidgetListComponent implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @Input() availableWidgets: any[]
  @Output() formCancelClicked = new EventEmitter();

  public readonly targetElement: HTMLElement = document.body;

  constructor(private action$: Actions) {}

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowSideDialog)).subscribe((payload) => {
      if (payload.isDialogShown) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  closeWidgetModal(): void {
    this.formCancelClicked.emit();
  }

  selectWidgetId(event: any) {
    console.log(event);
    
  }

  clearWidgetId() {}
}

