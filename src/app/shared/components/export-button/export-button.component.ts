import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemModel } from '@syncfusion/ej2-angular-navigations';
import { ExportType } from "../../../modules/timesheets/enums";

@Component({
  selector: 'app-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.scss']
})
export class ExportButtonComponent {
  @Input()
  public options: ItemModel[] = [
    { text: ExportType.Excel_file, id: '0' },
    { text: ExportType.CSV_file, id: '1' },
    { text: ExportType.Custom, id: '2' },
  ];

  @Output()
  public readonly optionSelected: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  public readonly csvExport: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public readonly excelExport: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  public readonly customExport: EventEmitter<void> = new EventEmitter<void>();

  public onExportOptionSelected({item}: {item: ItemModel}): void {
    this.optionSelected.emit(item);

    switch (item.text) {
      case ExportType.Excel_file:
        return this.excelExport.emit();
      case ExportType.CSV_file:
        return this.csvExport.emit();
      case ExportType.Custom:
        return this.customExport.emit();
      default:
        throw new Error(`Export type ${item.text} is not supported`);
    }
  }
}
