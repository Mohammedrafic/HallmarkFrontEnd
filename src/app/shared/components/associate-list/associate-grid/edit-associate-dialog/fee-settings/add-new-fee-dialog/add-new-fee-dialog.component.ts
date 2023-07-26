import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { filter, Observable, Subject, take, takeUntil } from 'rxjs';
import {
  FeeExceptions,
  FeeExceptionsInitialData,
  FeeSettingsClassification,
} from '@shared/models/associate-organizations.model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import PriceUtils from '@shared/utils/price.utils';
import { valuesOnly } from '@shared/utils/enum.utils';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { TiersException } from '@shared/components/associate-list/store/associate.actions';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import {
  MASTER_SKILLS_FIELDS,
} from '@shared/components/associate-list/associate-grid/edit-associate-dialog/fee-settings/add-new-fee-dialog/fee-dialog.constant';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { OPTION_FIELDS } from '@shared/components/associate-list/constant';

@Component({
  selector: 'app-add-new-fee-dialog',
  templateUrl: './add-new-fee-dialog.component.html',
  styleUrls: ['./add-new-fee-dialog.component.scss'],
})
export class AddNewFeeDialogComponent extends DestroyableDirective implements OnInit {
  @Input() openEvent: Subject<number>;
  @Input() openEditEvent: Subject<FeeExceptions>;
  @Input() disableSaveButton: boolean = false;

  @ViewChild('addFeeSideDialog') sideDialog: DialogComponent;

  @Select(AssociateListState.feeExceptionsInitialData)
  public feeExceptionsInitialData$: Observable<FeeExceptionsInitialData>;

  public targetElement: HTMLElement = document.body;
  public editMode = false;
  public feeFormGroup: FormGroup = this.generateNewForm();
  public optionFields = OPTION_FIELDS;
  public masterSkillsFields = MASTER_SKILLS_FIELDS;
  public priceUtils = PriceUtils;
  public classification = Object.values(FeeSettingsClassification)
    .filter(valuesOnly)
    .map((name, id) => ({ name, id }));

  get title(): string {
    return `${this.editMode ? 'Edit' : 'Add'} Fee Exception`;
  }

  private organizationId: number;

  constructor(private store: Store, private actions$: Actions, private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.onOpenEvent();
    this.onOpenEditEvent();
    this.subscribeOnSaveFeeExceptions();
  }

  public onCancel(): void {
    if (this.feeFormGroup.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(
          filter((confirm) => !!confirm),
          take(1)
        ).subscribe(() => {
          this.editMode = false;
          this.sideDialog.hide();
        });
    } else {
      this.editMode = false;
      this.sideDialog.hide();
    }
  }

  public onAdd(): void {
    this.feeFormGroup.markAllAsTouched();
    if (this.feeFormGroup.valid) {
      const value = this.feeFormGroup.getRawValue();
      this.store.dispatch(new TiersException.SaveFeeExceptions({ ...value, associateOrganizationId: this.organizationId }));
    }
  }

  private onOpenEvent(): void {
    this.openEvent.pipe(
      takeUntil(this.destroy$)
    ).subscribe((id: number) => {
      if (id) {
        this.organizationId = id;
        this.feeFormGroup.reset();
        this.sideDialog.show();
      }
    });
  }

  private onOpenEditEvent(): void {
    this.openEditEvent.pipe(
      takeUntil(this.destroy$)
    ).subscribe((feeData: FeeExceptions) => {
      if (feeData) {
        this.editMode = true;
        this.feeFormGroup.patchValue({
          regionIds: [feeData.regionId],
          classifications: [feeData.classification],
          masterSkillIds: [feeData.skillId],
          fee: PriceUtils.formatNumbers(feeData.fee),
        });
      }
    });
  }

  private generateNewForm(): FormGroup {
    return new FormGroup({
      regionIds: new FormControl([], [Validators.required]),
      classifications: new FormControl([], [Validators.required]),
      masterSkillIds: new FormControl([], [Validators.required]),
      fee: new FormControl(null, [Validators.required]),
    });
  }

  private subscribeOnSaveFeeExceptions(): void {
    this.actions$
      .pipe(ofActionSuccessful(TiersException.SaveFeeExceptionsSucceeded))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.sideDialog.hide();
      });
  }
}
