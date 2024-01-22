import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { CONFIRM_CANDIDATES_MIGRATION, CANDIDATES_MIGRATION_SUCCESS } from '@shared/constants/messages';
import { ConfirmService } from '@shared/services/confirm.service';
import { Observable, filter, take } from 'rxjs';
import { SetHeaderState } from 'src/app/store/app.actions';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { BUSINESS_UNITS_VALUES_USERS_ROLES } from '@shared/constants/business-unit-type-list';
import { SecurityState } from '../../security/store/security.state';
import { Agency } from '../../shared/models/visibility-settings.model';
import { GetAgencyList, MigrateCandidates, RemaningCandidatesForMigration } from '../../security/store/security.actions';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-migrate-candidates',
  templateUrl: './migrate-candidates.component.html',
  styleUrls: ['./migrate-candidates.component.scss'],
  animations: [
    trigger('waveAnimation', [
      transition('* <=> *',
        [
          style({ transform: 'scale(1)' }),
          animate('0.5s ease-out', style({ transform: 'scale(1.2)' })),
          animate('0.5s ease-in', style({ transform: 'scale(1)' })),
        ]
      ),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MigrateCandidatesComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {

  @Select(SecurityState.agencies)
  agencies$: Observable<Agency[]>;

  @Select(SecurityState.remainingCandidates)
  remaningCandidates$: Observable<number | null>;

  public migrateCandidatesForm: FormGroup;
  private isAlive = true;
  public agencyData = BUSINESS_UNITS_VALUES_USERS_ROLES;
  agencyFields: FieldSettingsModel = { text: 'name', value: 'id' };
  public control = new FormControl('');
  private interval: any;

  constructor(protected override store: Store,
    private confirmService: ConfirmService,) {
    super(store);
    this.store.dispatch(new SetHeaderState({ title: 'Migrate Candidates', iconName: 'file-text' }));
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.store.dispatch(new GetAgencyList());
    this.migrateCandidatesForm = this.generateMigrateCandidatesForm();
    this.interval = setInterval(() => { this.remaningCandidates() }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  public migrateCandidates(): void {
    var agencyIdValue = this.migrateCandidatesForm?.controls['agency'].value;
    if (agencyIdValue == null) {
      agencyIdValue = 0;
    }

    this.confirmService
      .confirm(CONFIRM_CANDIDATES_MIGRATION, {
        title: "Migrate Candidates",
        okButtonLabel: 'Migrate',
        okButtonClass: 'save-button',
      })
      .pipe(
        filter((confirm: any) => !!confirm),
        take(1)
      ).subscribe(() => {
        this.store.dispatch(new MigrateCandidates(agencyIdValue));
      });
  }

  public remaningCandidates(): void {
    var agencyIdValue = this.migrateCandidatesForm?.controls['agency'].value;
    if (agencyIdValue == null) {
      agencyIdValue = 0;
    }
    this.store.dispatch(new RemaningCandidatesForMigration(agencyIdValue));
  }

  private generateMigrateCandidatesForm(): FormGroup {
    return new FormGroup({
      agency: new FormControl(),
    });
  }
}
