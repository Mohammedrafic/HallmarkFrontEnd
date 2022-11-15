import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { filter, takeUntil } from 'rxjs';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { FieldType } from '@core/enums';
import { OPTION_FIELDS, TIER_DIALOG_TYPE, TiersDialogConfig } from '@shared/components/tiers-dialog/constants';
import { TierDetails, TierDialogConfig, TiersInputConfig } from '@shared/components/tiers-dialog/interfaces';
import { Tiers } from '@shared/enums/tiers.enum';
import { CustomFormGroup } from '@core/interface';
import { TierService } from '@shared/components/tiers-dialog/services';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { findSelectedItems } from '@core/helpers/functions.helper';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ShowSideDialog } from '../../../store/app.actions';
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { mapperSelectedItems, setDataSourceValue } from '@shared/components/tiers-dialog/helper';

@Component({
  selector: 'app-tiers-dialog',
  templateUrl: './tiers-dialog.component.html',
  styleUrls: ['./tiers-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiersDialogComponent extends DestroyableDirective implements OnInit {
  @Output() saveTier = new EventEmitter<TierDTO>();

  @Input() set regionsStructure(regions: OrganizationRegion[]) {
    this.regions = regions;
    this.dialogConfig = TiersDialogConfig(regions)[this.dialogType];
  };

  @Input() set selectedTier(tier: TierDetails) {
    if(tier) {
      this.tierForm?.patchValue(this.tierService.mapStructureForForms(this.dialogType, tier));
    }
  };

  @Input() set isEditDialog(value: boolean) {
    this.setDialogTitle(value);
  };

  public dialogConfig: TierDialogConfig;
  public title: string = '';
  public regions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public tierForm: CustomFormGroup<TierDTO> | null;
  public readonly FieldTypes = FieldType;
  public optionFields: FieldSettingsModel = OPTION_FIELDS;

  constructor(
    @Inject(TIER_DIALOG_TYPE) protected readonly dialogType: Tiers,
    private tierService: TierService,
    private changeDetection: ChangeDetectorRef,
    private confirmService: ConfirmService,
    private store: Store,
    private actions$: Actions
  ) {
    super();
  }

  ngOnInit(): void {
    this.createForm();
    this.watchForRegions();
    this.watchForLocation();
    this.watchForCloseDialog();
  }

  public saveTiers(): void {
   if (this.tierForm?.valid) {
      this.saveTier.emit(this.tierForm.value);
    } else {
      this.tierForm?.markAllAsTouched();
    }
  }

  public closeDialog(): void {
    if (this.tierForm?.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        }).pipe(
          filter(Boolean),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.hideDialog();
        });
    } else {
      this.hideDialog();
    }
  }

  public trackByIndex(index: number, config: TiersInputConfig): string {
    return index + config.field;
  }

  private hideDialog(): void{
    this.store.dispatch(new ShowSideDialog(false));
    this.tierForm?.reset();
  }

  private createForm(): void {
    this.tierForm = this.tierService.createTierForm(this.dialogType);
  }

  private watchForRegions(): void {
    this.tierForm?.get('regionIds')?.valueChanges
      .pipe(
        filter((value: number[]) => !!value?.length),
        takeUntil(this.destroy$)
      )
      .subscribe((value: number[]) => {
        const selectedRegions: OrganizationRegion[] = findSelectedItems(value, this.regions);
        const selectedLocation: OrganizationLocation[] = mapperSelectedItems(selectedRegions,'locations');
        this.locations = selectedLocation;
        setDataSourceValue(this.dialogConfig.fields, 'locationIds', selectedLocation);
        this.changeDetection.markForCheck();
      });
  }

  private watchForLocation(): void {
    this.tierForm?.get('locationIds')?.valueChanges.pipe(
      filter((value: number[]) => !!value?.length),
      takeUntil(this.destroy$)
      )
      .subscribe((value: number[]) => {
          const selectedLocation: OrganizationLocation[] = findSelectedItems(value, this.locations);
          const selectedDepartment: OrganizationDepartment[] = mapperSelectedItems(selectedLocation,'departments');
          setDataSourceValue(this.dialogConfig.fields, 'departmentIds', selectedDepartment)
          this.changeDetection.markForCheck();
      })
  }

  private setDialogTitle(value: boolean): void {
    this.title = value ? this.dialogConfig.editTitle : this.dialogConfig.title;
  }

  private watchForCloseDialog(): void {
    this.actions$.pipe(
      ofActionDispatched(ShowSideDialog),
      filter(({isDialogShown})=> !isDialogShown),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.tierForm?.reset();
    });
  }
}
