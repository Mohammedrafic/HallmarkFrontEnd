import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Select } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { NotAssignedListOption, OPTION_FIELDS } from '@shared/components/associate-list/constant';
import { AssociateListState } from '@shared/components/associate-list/store/associate.state';
import { TierList } from '@shared/components/associate-list/interfaces';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { AssociateOrganizationsAgency } from '@shared/models/associate-organizations.model';

@Component({
  selector: 'app-tier-settings',
  templateUrl: './tier-settings.component.html',
  styleUrls: ['./tier-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TierSettingsComponent extends DestroyableDirective implements OnInit {
  @Output() public changeTierControl: EventEmitter<FormControl> = new EventEmitter<FormControl>();

  @Input() public set editAgencyOrg(org: AssociateOrganizationsAgency) {
    if(org?.tierId) {
      this.tierControl.patchValue(org?.tierId);
    } else {
      this.tierControl.reset();
      this.tierControl.patchValue(NotAssignedListOption.id);
    }
  }

  public optionFields: FieldSettingsModel = OPTION_FIELDS;
  public tierControl: FormControl = new FormControl();
  public tiersList: TierList[];

  @Select(AssociateListState.getGeneralTiersList)
  public tierList$: Observable<TierList[]>;

  ngOnInit(): void {
    this.initTierData();
    this.watchForTier();
    this.watchForTierList();
  }

  private watchForTierList(): void {
    this.tierList$.pipe(
      filter(Boolean),
      takeUntil(this.destroy$)
    ).subscribe((tiers: TierList[]) => {
      this.tiersList = [
        NotAssignedListOption,
        ...tiers,
      ] as TierList[];
    });
  }

  private initTierData(): void {
    this.changeTierControl.emit(this.tierControl);
  }

  private watchForTier(): void {
    this.tierControl.valueChanges.pipe(
      filter(Boolean),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.changeTierControl.emit(this.tierControl);
    });
  }
}
