import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { BUSSINES_DATA_FIELDS, UNIT_FIELDS } from '../../user-list.constants';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { Select, Store } from '@ngxs/store';
import { SecurityState } from '../../../store/security.state';
import {
  combineLatest,
  filter,
  map,
  Observable,
  Subject,
  takeWhile,
} from 'rxjs';
import { BusinessUnit } from '@shared/models/business-unit.model';
import {
  ChangeBusinessUnit,
  GetNewRoleBusinessByUnitType,
  GetRolePerUser,
  GetUSCanadaTimeZoneIds,
} from '../../../store/security.actions';
import { AdminState } from '@admin/store/admin.state';
import { CanadaStates, Country, UsaStates } from '@shared/enums/states';
import { mustMatch } from '@shared/validators/must-match.validators';
import { RolesPerUser, User } from '@shared/models/user-managment-page.model';
import { SwitchComponent } from '@syncfusion/ej2-angular-buttons';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { AgencyStatus } from '@shared/enums/status';
import { COUNTRIES } from '@shared/constants/countries-list';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() businessUnits: { text: string | BusinessUnitType; id: number }[];

  @Output() changeBusinessUnitId = new EventEmitter();
  @ViewChild('swithActive')
  public switcher: SwitchComponent;

  @Select(AdminState.statesGeneral)
  statesGeneral$: Observable<string[]>;

  @Select(SecurityState.rolesPerUsers)
  rolesPerUsers$: Observable<RolesPerUser>;

  public countryState$ = new Subject();

  @Select(SecurityState.newBusinessDataPerUser)
  public newBusinessDataPerUser$: Observable<(type: number) => BusinessUnit[]>;

  @Select(SecurityState.timeZones)
  timeZoneIds$: Observable<GetUSCanadaTimeZoneIds>;
  timeZoneOptionFields: FieldSettingsModel = { text: 'systemTimeZoneName', value: 'timeZoneId' };

  public businessValue: BusinessUnit[];
  public unitFields = UNIT_FIELDS;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public roleFields = {
    text: 'name',
    value: 'id',
  };
  public countries = COUNTRIES;

  get businessUnitControl(): AbstractControl | null {
    return this.form.get('businessUnitType');
  }

  get businessUnitIdControl(): AbstractControl | null {
    return this.form.get('businessUnitId');
  }

  private isAlive = true;
  private firstLoadModal = true;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.onCountryChange();
    this.onBusinessUnitControlChanged();
    this.subscribeOnBusinessUnits();
    this.updateBusinessDataPerUser();
    this.subOnBusinessUnitControlChange();
    this.store.dispatch(new GetUSCanadaTimeZoneIds());
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  private updateBusinessDataPerUser(): void {
    this.newBusinessDataPerUser$
      .pipe(
        map((fn) => fn(this.businessUnitControl?.value)),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value) => {
        this.businessValue = value;
          if(this.businessUnitControl?.value === BusinessUnitType.Hallmark && this.firstLoadModal && value && value.length > 0) {
            this.businessUnitIdControl?.setValue(value[0].id);
          }
        });
  }

  public toggleActive(): void {
    const activeControl = this.form.get('isActive');
    activeControl?.patchValue(!activeControl.value);
  }

  public onCountryChange(): void {
    this.form
      .get('country')
      ?.valueChanges.pipe(takeWhile(() => this.isAlive))
      .subscribe((value) => {
        const statesValue = value === Country.USA ? UsaStates : CanadaStates;
        this.countryState$.next(statesValue);
      });
  }

  private onBusinessUnitControlChanged(): void {
    this.businessUnitControl?.valueChanges
      .pipe(
        filter((value) => !!value),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value) => {
        const user = this.store.selectSnapshot(UserState.user) as User;
        if(user?.businessUnitType != BusinessUnitType.Organization){
          if(!this.firstLoadModal) {
            this.businessUnitIdControl?.reset();
          }
        }
       
        this.firstLoadModal = false;
          this.store.dispatch(new GetNewRoleBusinessByUnitType(value,value == BusinessUnitType.Employee?true:false));
      });
  }

  private subscribeOnBusinessUnits(): void {
    combineLatest([
      (this.businessUnitControl as AbstractControl).valueChanges,
      (this.businessUnitIdControl as AbstractControl).valueChanges,
    ]).pipe(
        filter((valueList: number[]) => {
          return valueList.every((value: number) => value !== null);
        }),
        takeWhile(() => this.isAlive)
      )
      .subscribe(() => {
        this.form.get('roles')?.reset();
        this.store.dispatch(
          new GetRolePerUser(
            this.businessUnitControl?.value || 0,
            this.businessUnitIdControl?.value ? [this.businessUnitIdControl?.value] : []
          )
        );

      });
  }

  private subOnBusinessUnitControlChange(): void {
    this.businessUnitIdControl?.valueChanges
      .pipe(
        filter((value) => !!value),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value: number) => {
        if (this.businessUnitControl?.value === BusinessUnitType.Agency) {
          const selectedRole = this.businessValue.find((role) => role.id === value);
          const isAgencyDisable =
            selectedRole?.agencyStatus === AgencyStatus.Inactive ||
            selectedRole?.agencyStatus === AgencyStatus.Terminated;
          this.store.dispatch(new ChangeBusinessUnit(isAgencyDisable));
        } else {
          this.store.dispatch(new ChangeBusinessUnit(false));
        }
        this.changeBusinessUnitId.emit();
      });
  }

  static createForm(): FormGroup {
    return new FormGroup(
      {
        id: new FormControl(),
        businessUnitType: new FormControl('', [Validators.required]),
        businessUnitId: new FormControl('', [Validators.required]),
        firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
        roles: new FormControl('', [Validators.required]),
        isDeleted: new FormControl(true),
        address1: new FormControl('', [Validators.maxLength(100)]),
        address2: new FormControl('', [Validators.maxLength(100)]),
        country: new FormControl(''),
        state: new FormControl(''),
        city: new FormControl('', [Validators.maxLength(20)]),
        zip: new FormControl('', [Validators.maxLength(5), Validators.minLength(5)]),
        email: new FormControl('', [
          Validators.required,
          Validators.email,
          Validators.maxLength(100),
        ]),
        emailConfirmation: new FormControl('', [Validators.required, Validators.maxLength(100)]),
        phoneNumber: new FormControl('', [Validators.maxLength(10), Validators.minLength(10)]),
        fax: new FormControl('', [Validators.maxLength(10), Validators.minLength(10)]),
        timeZone: new FormControl(''),
      },
      mustMatch('email', 'emailConfirmation')
    );
  }
}
