import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject } from 'rxjs';
import {
  FeeExceptions,
  FeeExceptionsPage,
  FeeSettingsClassification,
} from '@shared/models/associate-organizations.model';
import { Select, Store } from '@ngxs/store';
import PriceUtils from '@shared/utils/price.utils';
import { ConfirmService } from '@shared/services/confirm.service';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, GRID_CONFIG } from '@shared/constants';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import {
  GetFeeSettingByOrganizationId,
  RemoveFeeExceptionsById,
} from '@shared/components/associate-list/store/associate.actions';

@Component({
  selector: 'app-fee-settings',
  templateUrl: './fee-settings.component.html',
  styleUrls: ['./fee-settings.component.scss'],
})
export class FeeSettingsComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit {
  @Input() form: FormGroup;
  @ViewChild('grid') grid: GridComponent;

  public openAddNewFeeDialog = new Subject<number>();
  public editFeeData = new Subject<FeeExceptions>();
  public classificationValueAccess = (_: string, { classification }: FeeExceptions) => {
    return FeeSettingsClassification[classification];
  };

  get feeExceptions(): FeeExceptions[] {
    return this.form.get('feeExceptions')?.value || [];
  }

  @Select(AssociateListState.feeExceptionsPage)
  public feeExceptionsPage$: Observable<FeeExceptionsPage>;
  public priceUtils = PriceUtils;

  private organizationAgencyId: number;

  constructor(private store: Store, private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnIdChanges();
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  public addNew(): void {
    this.openAddNewFeeDialog.next(this.organizationAgencyId);
  }

  public onEdit(data: { index: string } & FeeExceptions): void {
    this.openAddNewFeeDialog.next(this.organizationAgencyId);
    this.editFeeData.next(data);
  }

  public onRemove(data: { index: string } & FeeExceptions): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => this.store.dispatch(new RemoveFeeExceptionsById(data.id)));
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.store.dispatch(
        new GetFeeSettingByOrganizationId(this.organizationAgencyId, this.currentPage, this.pageSize)
      );
    }
  }

  public onRowsDropDownChanged(): void {
    this.pageSize = parseInt(this.activeRowsPerPageDropDown);
    this.pageSettings = { ...this.pageSettings, pageSize: this.pageSize };
  }

  static createFormGroup(): FormGroup {
    return new FormGroup({
      id: new FormControl(null),
      baseFee: new FormControl(''),
      feeExceptions: new FormArray([]),
    });
  }

  static createFeeExceptionsForm(): FormGroup {
    return new FormGroup({
      id: new FormControl(''),
      regionName: new FormControl(''),
      regionId: new FormControl(''),
      classification: new FormControl(''),
      skillName: new FormControl(''),
      skillId: new FormControl(''),
      fee: new FormControl(''),
    });
  }

  private subscribeOnIdChanges(): void {
    this.form.get('id')?.valueChanges.subscribe((organizationAgencyId) => {
      this.organizationAgencyId = organizationAgencyId;
      this.store.dispatch(new GetFeeSettingByOrganizationId(organizationAgencyId, this.currentPage, this.pageSize));
    });
  }
}
