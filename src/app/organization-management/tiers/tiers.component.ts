import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

import { Actions, ofActionDispatched, Select, Store } from "@ngxs/store";
import { filter, Observable, Subject, switchMap, takeUntil } from 'rxjs';

import { OrganizationManagementState } from "@organization-management/store/organization-management.state";
import { Tiers } from '@organization-management/store/tiers.actions';
import { TierDetails } from '@shared/components/tiers-dialog/interfaces';
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { DATA_OVERRIDE_TEXT, DATA_OVERRIDE_TITLE } from '@shared/constants';
import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { SystemType } from "@shared/enums/system-type.enum";
import { AbstractPermission } from '@shared/helpers/permissions';
import { ButtonModel } from "@shared/models/buttons-group.model";
import { Organization, OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { ConfirmService } from '@shared/services/confirm.service';
import { AppState } from "src/app/store/app.state";
import { ShowSideDialog } from "../../store/app.actions";
import { GetOrgTierStructure } from '../../store/user.actions';
import { UserState } from '../../store/user.state';
import { TiersService } from "./services/tiers.service";
import { TiersGridComponent } from "./tiers-grid/tiers-grid.component";
import { SystemButtons } from "./tiers.constants";
import { TiersState } from '@organization-management/store/tiers.state';
import { MasterCommitmentsPage } from '@shared/models/commitment.model';

@Component({
  selector: 'app-tiers',
  templateUrl: './tiers.component.html',
  styleUrls: ['./tiers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiersComponent extends AbstractPermission implements OnInit, AfterViewInit {
  @ViewChild(TiersGridComponent) tiersGrid: TiersGridComponent;

  public regionsStructure: OrganizationRegion[] = [];
  public selectedTier: TierDetails;
  public isEdit = false;
  public showSystemButtons = false;
  public systemButtons: ButtonModel[] = SystemButtons;
  public selectedSystemType: SystemType = SystemType.VMS;
  public pageSize : number = 30;
  public pageNumber : number = 1;
  private tierFormState: TierDTO;
  private readonly isIrpFlagEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  private unsubscribe$: Subject<void> = new Subject();
  public workcommitments:any;
  @Select(UserState.tireOrganizationStructure)
  private organizationStructure$: Observable<OrganizationStructure>;

  @Select(OrganizationManagementState.organization)
  private readonly organization$: Observable<Organization>;

  @Select(TiersState.workCommitmentsPageforTier)
  public commitmentsPage$: Observable<MasterCommitmentsPage>;

  constructor(
    protected override store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
    private cd: ChangeDetectorRef,
    private tiersService: TiersService,
  ) {
    super(store);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.watchForRegionStructure();
    this.watchForOverrideTier();
    this.watchForOrganization();
    this.getWorkCommitment();
  }

  public getWorkCommitment():void {
    let payload = {pageSize : this.pageSize, pageNumber : this.pageNumber};
    this.store.dispatch(new Tiers.GetWorkCommitmentByPageforTiers(payload));   
    this.commitmentsPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((id) => {
      if(id){
        this.workcommitments = id.items;
        this.cd.markForCheck();
      }
    });
 
  }


  ngAfterViewInit(): void {
    this.getTiersPage(this.selectedSystemType);
  }

  public addTier(): void {
    this.isEdit = false;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public handleSaveTier(tier: TierDTO) {
    this.tierFormState = tier;
    if(this.tierFormState.Skills == 1){
      this.tierFormState.Skills = 1
    }else if(this.tierFormState.Skills == 2){
      this.tierFormState.Skills = 2
    }else if(this.tierFormState.Skills == 3){
      this.tierFormState.Skills = 3
    }
    this.store.dispatch(new Tiers.SaveTier({
      ...this.tierFormState,
      forceUpsert: false,
      includeInIRP: this.selectedSystemType === SystemType.IRP,
      includeInVMS: this.selectedSystemType === SystemType.VMS,
      systemType: this.selectedSystemType,
    }, this.isEdit));
  }

  public handleEditTier(tier: TierDetails): void {
    this.isEdit = true;
    this.selectedTier = {...tier};
    this.store.dispatch(new ShowSideDialog(true));
  }

  public changeSystem({ id }: ButtonModel): void {
    this.selectedSystemType = id;
    this.getTiersPage(id);
    this.getOrganizationStructure();
  }

  private getTiersPage(systemType: SystemType): void {
    this.tiersGrid?.getNewPage(systemType);
  }

  private getOrganizationStructure(): void {
    this.store.dispatch(new GetOrgTierStructure(null));
  }

  private watchForRegionStructure(): void {
    this.organizationStructure$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe(
        (structure: OrganizationStructure) => {
        this.regionsStructure = structure.regions;

        if (this.selectedSystemType === SystemType.IRP) {
          this.tiersService.filterIrpLocationsDepartments(this.regionsStructure);
        }
      });
  }

  private watchForOverrideTier(): void {
    this.actions$.pipe(
      ofActionDispatched(Tiers.ShowOverrideTierDialog),
      switchMap(() => {
        return this.confirmService
          .confirm(DATA_OVERRIDE_TEXT, {
            title: DATA_OVERRIDE_TITLE,
            okButtonLabel: 'Confirm',
            okButtonClass: '',
          });
      }),
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      ).subscribe(() => {
      this.store.dispatch(new Tiers.SaveTier({
        ...this.tierFormState,
        forceUpsert: true,
        includeInIRP: this.selectedSystemType === SystemType.IRP,
        includeInVMS: this.selectedSystemType === SystemType.VMS,
        systemType: this.selectedSystemType,
      }, this.isEdit));
      this.store.dispatch(new ShowSideDialog(false));
    });
  }

  private watchForOrganization(): void {
    this.organization$
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe((organization: Organization) => {
        const isMspUser = this.store.selectSnapshot(UserState.user)?.businessUnitType === BusinessUnitType.MSP;

        if (this.isIrpFlagEnabled && !isMspUser) {
          this.showSystemButtons = !!organization.preferences.isIRPEnabled && !!organization.preferences.isVMCEnabled;
          this.selectedSystemType = this.showSystemButtons || !!organization.preferences.isIRPEnabled
            ? SystemType.IRP
            : SystemType.VMS;
        } else {
          this.showSystemButtons = false;
          this.selectedSystemType = SystemType.VMS;
        }

        this.getTiersPage(this.selectedSystemType);
        this.getOrganizationStructure();
        this.cd.markForCheck();
    });
  }
}
