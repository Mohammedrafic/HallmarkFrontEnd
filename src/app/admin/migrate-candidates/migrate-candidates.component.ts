import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { CONFIRM_CANDIDATES_MIGRATION, CANDIDATES_MIGRATION_SUCCESS } from '@shared/constants/messages';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { ConfirmService } from '@shared/services/confirm.service';
import {  Observable } from 'rxjs';

import { SetHeaderState } from 'src/app/store/app.actions';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { GetBusinessUnitIdDetails } from '@shared/models/user-managment-page.model';
import { BUSINESS_UNITS_VALUES_USERS_ROLES } from '@shared/constants/business-unit-type-list';
import { OPRION_FIELDS } from '../../security/roles-and-permissions/roles-and-permissions.constants';
import { UserState } from '../../store/user.state';
import { UserAgencyOrganization } from '../../shared/models/user-agency-organization.model';
import { GetUserAgencies } from '../../store/user.actions';
import { SecurityState } from '../../security/store/security.state';
import { Agency } from '../../shared/models/visibility-settings.model';
import { GetAgencyList, MigrateCandidates } from '../../security/store/security.actions';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

@Component({
  selector: 'app-migrate-candidates',
  templateUrl: './migrate-candidates.component.html',
  styleUrls: ['./migrate-candidates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MigrateCandidatesComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
 
  @Select(SecurityState.agencies)
  agencies$: Observable<Agency[]>;

  //@Select(SecurityState.businessIdDetails)
  //public businessUnitIdDetails$: Observable<GetBusinessUnitIdDetails>;

  public migrateCandidatesForm: FormGroup;
  private isAlive = true;
  public agencyData = BUSINESS_UNITS_VALUES_USERS_ROLES;
  agencyFields: FieldSettingsModel = { text: 'name', value: 'id' };

  constructor(protected override store: Store,) {
    super(store);
    this.store.dispatch(new SetHeaderState({ title: 'Migrate Candidates', iconName: 'file-text' }));
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(new GetUserAgencies());
    this.store.dispatch(new GetAgencyList());
    this.migrateCandidatesForm = this.generateMigrateCandidatesForm();
    
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public migrateCandidates(): void {
    this.store.dispatch(new MigrateCandidates(this.migrateCandidatesForm?.controls['agency'].value));
  }

  private generateMigrateCandidatesForm(): FormGroup {
    return new FormGroup({
      agency: new FormControl(),
    });
  }
}
