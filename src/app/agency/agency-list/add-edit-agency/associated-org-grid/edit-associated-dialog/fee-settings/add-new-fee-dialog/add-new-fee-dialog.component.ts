import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Select, Store } from '@ngxs/store';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { AgencyState } from 'src/app/agency/store/agency.state';
import { FeeExceptionsInitialData, FeeSettingsClassification } from 'src/app/shared/models/associate-organizations.model';
import { valuesOnly } from 'src/app/shared/utils/enum.utils';

type AddNewFeeExceptionFormValue = {
  region: number[];
  classification: number[];
  skill: number[];
  fee: number;
};

@Component({
  selector: 'app-add-new-fee-dialog',
  templateUrl: './add-new-fee-dialog.component.html',
  styleUrls: ['./add-new-fee-dialog.component.scss'],
})
export class AddNewFeeDialogComponent implements OnInit {
  @Input() openEvent: Subject<boolean>;

  @ViewChild('addFeeSideDialog') sideDialog: DialogComponent;

  @Select(AgencyState.feeExceptionsInitialData)
  public feeExceptionsInitialData$: Observable<FeeExceptionsInitialData>;

  public targetElement: HTMLElement = document.body;
  public feeFormGroup: FormGroup = this.generateNewForm();
  public optionFields = {
    text: 'name',
    value: 'id',
  };
  public masterSkillsFields = {
    text: 'skillAbbr',
    value: 'id',
  };
  public classification = Object.values(FeeSettingsClassification)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.onOpenEvent();
  }

  public onCancel(): void {
    this.sideDialog.hide();
  }

  public onAdd(): void {
    this.feeFormGroup.markAllAsTouched();
    if (this.feeFormGroup.valid) {
      const value = this.feeFormGroup.getRawValue();
    }
  }

  private onOpenEvent(): void {
    this.openEvent.subscribe((open) => {
      if (open) {
        this.feeFormGroup.reset();
        this.sideDialog.show();
      }
    });
  }

  private generateNewForm(): FormGroup {
    return new FormGroup({
      region: new FormControl([], [Validators.required]),
      classification: new FormControl([], [Validators.required]),
      skill: new FormControl([], [Validators.required]),
      fee: new FormControl(null, [Validators.required]),
    });
  }
}
