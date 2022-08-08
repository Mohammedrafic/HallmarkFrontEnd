import {
  AbstractGridConfigurationComponent
} from "@shared/components/abstract-grid-configuration/abstract-grid-configuration.component";
import { GridComponent, SelectionSettingsModel } from "@syncfusion/ej2-angular-grids";
import { TextWrapSettingsModel } from "@syncfusion/ej2-grids/src/grid/base/grid-model";
import { Directive, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PageOfCollections } from "@shared/models/page.model";
import { InvoicesTableConfig } from "./invoices-table.model";
import { ChangeEventArgs } from "@syncfusion/ej2-angular-dropdowns";

/**
 * TODO: move to helpers
 */
@Directive()
export class InvoicesTable<T> extends AbstractGridConfigurationComponent {
  @ViewChild('grid')
  public grid: GridComponent;

  @Input()
  public tableData: PageOfCollections<T> | null;

  @Input()
  public config: InvoicesTableConfig;

  public override selectionSettings: SelectionSettingsModel = {
    type: 'Single',
    mode: 'Row',
    checkboxMode: 'Default',
  };

  public readonly wrapSettings: TextWrapSettingsModel = {
    wrapMode: 'Content'
  };

  public readonly rowSelect: EventEmitter<any> = new EventEmitter<any>();
  public isLockMenuButtonsShown: boolean = false;

  public override rowSelected(event: any): void {
    if (!event.isInteracted) {
      this.rowSelect.emit(event.rowIndex);
    }

    super.rowSelected(event, this.grid);
  }

  public updatePageSize({value}: ChangeEventArgs): void {
    this.config.onPageSizeChange(this.pageSize = parseInt(value.toString()));
    this.grid.pageSettings.pageSize = this.pageSize;
  }

  public updateCurrentPage({currentPage}: { currentPage?: number }): void {
    if (currentPage) {
      this.config.onPageChange(this.currentPage = currentPage);
      this.grid.pageSettings.currentPage = this.currentPage;
    }
  }

  public goToPage({value}: {value: number}): void {
    this.updateCurrentPage({currentPage: value});
  }
}
