import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';

@Component({
  selector: 'app-records',
  templateUrl: './records.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsComponent {
  @Input() dataSource: any;
  @Input() fields: FieldSettingsModel;

  @Output() createdEmitter: EventEmitter<void> = new EventEmitter<void>();
  @Output() changeEmitter: EventEmitter<void> = new EventEmitter<void>();

  public selectionSettings: SelectionSettingsModel = { mode: 'Single' };
}
