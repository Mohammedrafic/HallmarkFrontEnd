import { Component, Input, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { GridComponent } from '@syncfusion/ej2-angular-grids';

import { AbstractGridConfigurationComponent } from 'src/app/shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { FeeExceptions } from 'src/app/shared/models/associate-organizations.model';

@Component({
  selector: 'app-fee-settings',
  templateUrl: './fee-settings.component.html',
  styleUrls: ['./fee-settings.component.scss']
})
export class FeeSettingsComponent extends AbstractGridConfigurationComponent {
  @Input() form: FormGroup;

  @ViewChild('grid') grid: GridComponent;

  get feeExceptions(): FeeExceptions[] {
    return this.form.get('feeExceptions')?.value || [];
  }

  constructor() {
    super()
   }

  public addNew(): void {
    
  }

  public onEdit(data: undefined): void {

  }

  public onRemove(data: undefined): void {

  }

  public dataBound(): void {
    this.grid.autoFitColumns();
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      baseFee: new FormControl(''),
      feeExceptions: new FormArray([])
    });
  }

  static createFeeExceptionsForm(): FormGroup {
    return new FormGroup({
      regionName: new FormControl(''),
      classification: new FormControl(''),
      skill: new FormControl(''),
      fee: new FormControl(''),
    })
  }
}
