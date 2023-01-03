import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CustomFormGroup } from '@core/interface';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { filter, Observable, takeUntil } from 'rxjs';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';

import { ShowSideDialog } from '../../../../store/app.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ConfirmService } from '@shared/services/confirm.service';
import { CANCEL_CONFIRM_TEXT, datepickerMask, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { WorkCommitmentService } from '../../services/work-commitment.service';
import {
  CommitmentDialogConfig,
  CommitmentsInputConfig,
  Option,
  RegionsDTO,
  WorkCommitmentDetails,
  WorkCommitmentDTO,
  WorkCommitmentForm,
  WorkCommitmentGrid,
} from '../../interfaces';
import { CommitmentsDialogConfig, OPTION_FIELDS } from '../../constants/work-commitment-dialog.constant';
import { FieldType } from '@core/enums';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import { mapperSelectedItems, setDataSourceValue } from '../../helpers';
import { OrganizationLocation, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { UserState } from '../../../../store/user.state';
import { findSelectedItems } from '@core/helpers/functions.helper';
import { GetOrganizationStructure } from '../../../../store/user.actions';
import { WorkCommitmentAdapter } from '../../adapters/work-commitment.adapter';

@Component({
  selector: 'app-work-commitment-dialog',
  templateUrl: './work-commitment-dialog.component.html',
  styleUrls: ['./work-commitment-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkCommitmentDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Input() selectedCommitment: WorkCommitmentGrid;
  @Input() permission: boolean;
  @Input() set isEditDialog(value: boolean) {
    this.dialogConfig = CommitmentsDialogConfig();
    this.setDialogTitle(value);
  }

  @Output() saveCommitment = new EventEmitter<WorkCommitmentDTO>();

  public title: string = '';
  public commitmentForm: CustomFormGroup<WorkCommitmentForm> | null;
  public dialogConfig: CommitmentDialogConfig;
  public readonly FieldTypes = FieldType;
  public optionFields: FieldSettingsModel = OPTION_FIELDS;
  public buttonType = ButtonTypeEnum;
  public datepickerMask = datepickerMask;
  public allSkillsLength: number;

  @Select(UserState.organizationStructure)
  private organizationStructure$: Observable<OrganizationStructure>;

  private selectedRegions: OrganizationRegion[] = []; //TODO use when edit functionality will be provided
  private regions: OrganizationRegion[];
  private regionsDTO: RegionsDTO[];

  constructor(
    private store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private commitmentService: WorkCommitmentService,
    private changeDetection: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.watchForShowDialog();
    this.watchForCloseDialog();
    this.createForm();
    this.getAllDataSource();
  }

  public closeDialog() {
    if (this.commitmentForm?.dirty) {
      this.confirmService
        .confirm(CANCEL_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter(Boolean), takeUntil(this.destroy$))
        .subscribe(() => {
          this.hideDialog();
        });
    } else {
      this.hideDialog();
    }
  }

  public saveWorkCommitment(): void {
    if (this.commitmentForm?.valid) {
      this.saveCommitment.emit(
        WorkCommitmentAdapter.prepareToSave(this.regionsDTO, this.allSkillsLength, this.commitmentForm!)
      );
    } else {
      this.commitmentForm?.markAllAsTouched();
    }
  }

  public trackByIndex(index: number, config: CommitmentsInputConfig): string {
    return index + config.field;
  }

  private watchForShowDialog(): void {
    this.actions$.pipe(ofActionDispatched(ShowSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isDialogShown) {
        this.sideDialog.show();
      } else {
        this.sideDialog.hide();
      }
    });
  }

  private hideDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
    this.commitmentForm?.reset();
  }

  private createForm(): void {
    this.commitmentForm = this.commitmentService.createCommitmentForm();
  }

  private setDialogTitle(value: boolean): void {
    this.title = value ? this.dialogConfig.editTitle : this.dialogConfig.title;
  }

  private getAllDataSource(): void {
    this.commitmentService.getAllDataSource();
    this.watchForNames();
    this.watchForHolidays();
    this.watchForRegionStructure();
    this.watchForRegionsChanges();
    this.watchForSkills();
    this.watchForLocations();
  }

  private watchForNames(): void {
    this.commitmentService.masterCommitmentNames
      .getStream()
      .pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe((data) => {
        setDataSourceValue(this.dialogConfig.fields, 'masterWorkCommitmentId', data);
        this.changeDetection.markForCheck();
      });
  }

  private watchForHolidays(): void {
    this.commitmentService.holidays
      .getStream()
      .pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe((holidays) => {
        setDataSourceValue(this.dialogConfig.fields, 'holiday', holidays);
        this.changeDetection.markForCheck();
      });
  }

  private watchForRegionStructure(): void {
    this.organizationStructure$.pipe(takeUntil(this.destroy$)).subscribe((structure: OrganizationStructure) => {
      if (!structure) {
        this.store.dispatch(new GetOrganizationStructure());
      } else {
        this.regions = structure.regions;
        const regionsDataSource = structure.regions;
        setDataSourceValue(this.dialogConfig.fields, 'regions', regionsDataSource);
        this.changeDetection.markForCheck();
      }
    });
  }

  private watchForRegionsChanges(): void {
    this.commitmentForm
      ?.get('regions')
      ?.valueChanges.pipe(
        filter((value: number[]) => !!value?.length),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.selectedRegions = findSelectedItems(value, this.regions);
        const selectedLocation: OrganizationLocation[] = mapperSelectedItems(this.selectedRegions, 'locations');
        setDataSourceValue(this.dialogConfig.fields, 'locations', selectedLocation);
        this.changeDetection.markForCheck();
      });
  }

  private watchForLocations(): void {
    this.commitmentForm
      ?.get('locations')
      ?.valueChanges.pipe(
        filter((value: number[]) => !!value?.length),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.regionsDTO = [];
        this.selectedRegions.map((item) => {
          const locationArr: number[] = [];
          value.forEach((locationId) => {
            item.locations!.filter((location: any) => {
              if (location.id === locationId) {
                locationArr.push(location.id);
              }
            });
          });
          this.regionsDTO.push({ id: item.id!, locations: locationArr });
        });
      });
  }

  private watchForSkills(): void {
    this.commitmentService.skills
      .getStream()
      .pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe((skills) => {
        setDataSourceValue(this.dialogConfig.fields, 'skills', skills);
        this.allSkillsLength = skills.length;
        this.changeDetection.markForCheck();
      });
  }

  private watchForCloseDialog(): void {
    this.actions$
      .pipe(
        ofActionDispatched(ShowSideDialog),
        filter(({ isDialogShown }) => !isDialogShown),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.commitmentForm?.reset();
      });
  }
}
