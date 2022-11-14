import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Actions, ofActionDispatched, Select, Store } from "@ngxs/store";
import { filter, Observable, switchMap, takeUntil } from 'rxjs';

import { ShowSideDialog } from "../../store/app.actions";
import { GetOrganizationStructure } from '../../store/user.actions';
import { UserState } from '../../store/user.state';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Tiers } from '@organization-management/store/tiers.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { DATA_OVERRIDE_TEXT, DATA_OVERRIDE_TITLE } from '@shared/constants';
import { TierDTO } from '@shared/components/tiers-dialog/interfaces/tier-form.interface';
import { TierDetails } from '@shared/components/tiers-dialog/interfaces';

@Component({
  selector: 'app-tiers',
  templateUrl: './tiers.component.html',
  styleUrls: ['./tiers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiersComponent extends DestroyableDirective implements OnInit {
  @Select(UserState.organizationStructure)
  private organizationStructure$: Observable<OrganizationStructure>;

  public regionsStructure: OrganizationRegion[] = [];
  public selectedTier: TierDetails;
  public isEdit: boolean = false;

  private tierFormState: TierDTO;

  constructor(
    private store: Store,
    private actions$: Actions,
    private confirmService: ConfirmService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getOrganizationStructure();
    this.watchForRegionStructure();
    this.watchForOverrideTier();
  }

  public addTier(): void {
    this.isEdit = false;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public handleSaveTier(tier: TierDTO) {
    this.tierFormState = tier;
    this.store.dispatch(new Tiers.SaveTier({
      ...this.tierFormState,
      forceUpsert: false
    }, this.isEdit));
  }

  public handleEditTier(tier: TierDetails): void {
    this.isEdit = true;
    this.selectedTier = {...tier};
    this.store.dispatch(new ShowSideDialog(true));
  }

  private getOrganizationStructure(): void {
    this.store.dispatch(new GetOrganizationStructure());
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

  private watchForOverrideTier(): void {
    this.actions$.pipe(
      ofActionDispatched(Tiers.ShowOverrideTierDialog),
      switchMap(() => {
        return this.confirmService
          .confirm(DATA_OVERRIDE_TEXT, {
            title: DATA_OVERRIDE_TITLE,
            okButtonLabel: 'Confirm',
            okButtonClass: '',
          })
      }),
        filter(Boolean),
        takeUntil(this.destroy$),
      ).subscribe(() => {
      this.store.dispatch(new Tiers.SaveTier({
        ...this.tierFormState,
        forceUpsert: true
      }, this.isEdit));
      this.store.dispatch(new ShowSideDialog(false));
    });
  }
}
