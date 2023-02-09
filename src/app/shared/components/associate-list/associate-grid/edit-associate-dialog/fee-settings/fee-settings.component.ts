import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { filter, Observable, Subject } from 'rxjs';
import {
  AssociateOrganizationsAgency,
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
import { TiersException } from '@shared/components/associate-list/store/associate.actions';
import { AgencyStatus } from '@shared/enums/status';
import { Permission } from "@core/interface";
import { UserPermissions } from "@core/enums";

@Component({
  selector: 'app-fee-settings',
  templateUrl: './fee-settings.component.html',
  styleUrls: ['./fee-settings.component.scss'],
})
export class FeeSettingsComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit {
  @ViewChild('grid') grid: GridComponent;

  @Input() form: FormGroup;
  @Input() areAgencyActionsAllowed: boolean;
  @Input() editAgencyOrg: AssociateOrganizationsAgency;
  @Input() userPermission: Permission;

  public openAddNewFeeDialog = new Subject<number>();
  public readonly userPermissions = UserPermissions;
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
  public readonly agencyStatus = AgencyStatus;

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
  
  public addNew(Id:number): void {
    this.openAddNewFeeDialog.next(Id);
  }

  public onEdit(data: { index: string } & FeeExceptions, Id : number): void {
    this.openAddNewFeeDialog.next(Id);
    this.editFeeData.next(data);
  }


  public onRemove(data: { index: string } & FeeExceptions): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(filter(Boolean))
      .subscribe(() => {
        this.store.dispatch(new TiersException.RemoveFeeExceptionsById(data.id))
      });
  }

  public onGoToClick(event: any): void {
    if (event.currentPage || event.value) {
      this.store.dispatch(
        new TiersException.GetFeeSettingByOrganizationId(this.organizationAgencyId, this.currentPage, this.pageSize)
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
      baseFee: new FormControl(null),
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
      this.store.dispatch(new TiersException.GetFeeSettingByOrganizationId(organizationAgencyId, this.currentPage, this.pageSize));
    });
  }
}
