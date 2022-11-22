import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

import { Select } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { OPTION_FIELDS } from '@shared/components/associate-list/constant';
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
    }else {
      this.tierControl.reset();
    }
  }

  public optionFields: FieldSettingsModel = OPTION_FIELDS;
  public tierControl: FormControl = new FormControl();

  @Select(AssociateListState.getTiersList)
  public tierList$: Observable<TierList>;

  ngOnInit(): void {
    this.initTierData();
    this.watchForTier();
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
