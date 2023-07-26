import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';

import { Actions, Store } from '@ngxs/store';
import { ColDef } from '@ag-grid-community/core';

import { AbstractImport } from '@shared/classes/abstract-import';
import { LocationsColumnsConfig, LocationsImportConfig, LocationsIrpColumnsConfig } from './location-grid.constants';
import { FieldsToHideInIrp, FieldsToHideInVms } from '../locations.constant';

@Component({
  selector: 'app-import-locations',
  templateUrl: './import-locations.component.html',
  styleUrls: ['./import-locations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportLocationsComponent extends AbstractImport implements OnChanges {
  @Input() irpFlagEnabled = false;

  @Input() orgIrpEnabled = true;

  @Input() orgVMSEnabled = true;

  public columnDefs: ColDef[] = LocationsColumnsConfig;

  public titleImport: string = 'Import Locations';

  constructor(
    protected override actions$: Actions,
    protected override store: Store,
    protected override cdr: ChangeDetectorRef,
  ) {
    super(actions$, store, LocationsImportConfig, cdr);
  }

  ngOnChanges(): void {
    if (this.irpFlagEnabled) {
      this.setIrpColumnsConfig();
    }
  }

  private setIrpColumnsConfig(): void {
    this.columnDefs = LocationsIrpColumnsConfig;
    
    if (!this.orgVMSEnabled) {
      this.columnDefs = this.columnDefs.filter((column) => !FieldsToHideInIrp.includes(column.field as string));
    }

    if (!(this.orgIrpEnabled && this.orgVMSEnabled)) {
      this.columnDefs = this.columnDefs.filter((column) => !FieldsToHideInVms.includes(column.field as string));
    }
  }
}
