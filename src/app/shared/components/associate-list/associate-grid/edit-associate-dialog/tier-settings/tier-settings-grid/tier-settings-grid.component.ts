import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { filter, Observable, takeUntil } from 'rxjs';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { ColDef } from '@ag-grid-community/core';

import { GridReadyEventModel } from '@shared/components/grid/models';
import { GRID_CONFIG } from '@shared/constants';
import { ShowSideDialog } from '../../../../../../../store/app.actions';
import { TierDetails } from '@shared/components/tiers-dialog/interfaces';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { UserState } from '../../../../../../../store/user.state';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import {
  TiersSettingsColumnsDefinition
} from '@shared/components/associate-list/associate-grid/edit-associate-dialog/tier-settings/tier-settings-grid/tier-settings-grid.contant';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import { TiersException } from '@shared/components/associate-list/store/associate.actions';
import { AssociateOrganizationsAgency } from '@shared/models/associate-organizations.model';
import { TierExceptionFilters, TierExceptionPage } from '@shared/components/associate-list/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tier-settings-grid',
  templateUrl: './tier-settings-grid.component.html',
  styleUrls: ['./tier-settings-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TierSettingsGridComponent extends DestroyableDirective implements OnInit {
  public columnDefinitions: ColDef[];
  public isLoading: boolean = false;
  public selectedOrganizationAgency: AssociateOrganizationsAgency;
  public isEdit: boolean = false;
  public selectedTier: TierDetails;
  public regionsStructure: OrganizationRegion[] = [];
  public isAgency: boolean;
  public filters: TierExceptionFilters = {
    pageNumber: GRID_CONFIG.initialPage,
    pageSize: GRID_CONFIG.initialRowsPerPage
  }

  @Select(AssociateListState.getTiersExceptionPage)
  public tiersExceptionPage$: Observable<TierExceptionPage>;
  @Select(UserState.tireOrganizationStructure)
  private organizationStructure$: Observable<OrganizationStructure>;
  @Select(AssociateListState.getSelectedOrganizationAgency)
  private selectedOrganizationAgency$: Observable<AssociateOrganizationsAgency>;

  constructor(
    private store: Store,
    private actions$: Actions,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isAgency = this.router.url.includes('agency');

    this.setColumnDefinition();
    this.watchForRegionStructure();
    this.watchForOrganizationId();
    this.watchForUpdatePage();
  }

  public addTier(): void {
    this.isEdit = false;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public handleSaveTier(tier: TierDTO): void {
    this.store.dispatch(new TiersException.SaveTierException({
      associateOrganizationId: this.selectedOrganizationAgency.id,
      ...tier
    }, this.isEdit));
  }

  public handleChangePage(pageNumber: number): void {
    if(pageNumber && this.filters.pageNumber !== pageNumber) {
      this.filters.pageNumber = pageNumber;
      this.getNewPage();
    }
  }
  public handleChangePageSize(pageSize: number): void {
    if(pageSize) {
      this.filters.pageSize = pageSize;
      this.selectedOrganizationAgency && this.getNewPage();
    }
  }

  public gridReady(grid: GridReadyEventModel): void {
    grid.api.sizeColumnsToFit();
    this.cd.detectChanges();
  }

  private watchForRegionStructure(): void {
    this.organizationStructure$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroy$)
      ).subscribe(
      (structure: OrganizationStructure) => {
        this.regionsStructure = structure.regions;
      });
  }

  private watchForOrganizationId(): void {
    this.selectedOrganizationAgency$.pipe(
      filter(Boolean),
      takeUntil(this.destroy$)
    ).subscribe((selectedOrgAgency: AssociateOrganizationsAgency) => {
      this.selectedOrganizationAgency = selectedOrgAgency;
      this.getNewPage();
    })
  }

  private getNewPage(): void {
    this.store.dispatch(new TiersException.GetTierExceptionByPage(
      this.selectedOrganizationAgency.id!,
      this.filters.pageNumber,
      this.filters.pageSize
    ));
  }

  private setColumnDefinition(): void {
    this.columnDefinitions = TiersSettingsColumnsDefinition(this.isAgency, (tier: TierDetails) => {
      this.isEdit = true;
      this.selectedTier = {...tier};
      this.store.dispatch(new ShowSideDialog(true));
    });
  }

  private watchForUpdatePage(): void {
    this.actions$.pipe(
      ofActionDispatched(TiersException.UpdateExceptionAfterSuccessAction),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.getNewPage();
    });
  }
}
