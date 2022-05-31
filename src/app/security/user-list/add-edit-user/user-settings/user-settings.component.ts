import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { BUSSINES_DATA_FIELDS, UNIT_FIELDS } from "../../user-list.constants";
import { BusinessUnitType } from "@shared/enums/business-unit-type";
import { Select, Store } from "@ngxs/store";
import { SecurityState } from "../../../store/security.state";
import { filter, merge, Observable, Subject, takeWhile } from "rxjs";
import { BusinessUnit } from "@shared/models/business-unit.model";
import { GetNewRoleBusinessByUnitType, GetRolePerUser } from "../../../store/security.actions";
import { AdminState } from "@admin/store/admin.state";
import { ChangeEventArgs } from "@syncfusion/ej2-angular-dropdowns";
import { CanadaStates, Country, UsaStates } from "@shared/enums/states";
import { mustMatch } from "@shared/validators/must-match.validators";
import { RolesPerUser } from "@shared/models/user-managment-page.model";
import { INACTIVE_USER_TEXT, INACTIVE_USER_TITLE } from "@shared/constants";
import { ConfirmService } from "@shared/services/confirm.service";
import { SwitchComponent } from "@syncfusion/ej2-angular-buttons";

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() businessUnits: { text: string | BusinessUnitType, id: number }[];

  @ViewChild('swithActive')
  public switcher: SwitchComponent;

  @Select(SecurityState.newRoleBussinesData)
  public newRoleBussinesData$: Observable<BusinessUnit[]>;

  @Select(AdminState.countries)
  countries$: Observable<string[]>;

  @Select(AdminState.statesGeneral)
  statesGeneral$: Observable<string[]>;

  @Select(SecurityState.rolesPerUsers)
  rolesPerUsers$: Observable<RolesPerUser>;

  public countryState$ = new Subject();
  public unitFields = UNIT_FIELDS;
  public bussinesDataFields = BUSSINES_DATA_FIELDS;
  public roleFields = {
    text: 'name',
    value: 'id',
  };
  public countries = [
    { id: Country.USA, text: Country[0] },
    { id: Country.Canada, text: Country[1] },
  ];

  get businessUnitControl(): AbstractControl | null {
    return this.form.get('businessUnitType');
  }

  get businessUnitIdControl(): AbstractControl | null {
    return this.form.get('businessUnitId');
  }

  private isAlive = true;

  constructor(
    private store: Store,
    private confirmService: ConfirmService
  ) { }

  ngOnInit(): void {
    this.onBusinessUnitControlChanged();
    this.subscribeOnBusinessUnits();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public toggleActive(): void {
    const activeControl = this.form.get('isDeleted');

    if(activeControl?.value) {
      this.switcher.toggle();

      this.confirmService
        .confirm(INACTIVE_USER_TEXT, {
          title: INACTIVE_USER_TITLE,
          okButtonLabel: 'Inactivate',
          okButtonClass: 'delete-button',
        })
        .subscribe((confirm) => {
          if (confirm && !!activeControl?.value) {
            activeControl?.patchValue(false);
            this.switcher.toggle();
          } else {
            this.switcher.toggle();
          }
        });
      }else {
          activeControl?.patchValue(false);
    }
  }

  public onCountryChange(event: ChangeEventArgs): void {
    this.countryState$.next(event.value === Country.USA ? UsaStates : CanadaStates);
  }

  private onBusinessUnitControlChanged(): void {
    this.businessUnitControl?.valueChanges
      .pipe(
        filter((value) => !!value),
        takeWhile(() => this.isAlive)
      )
      .subscribe((value) => {
        this.store.dispatch(new GetNewRoleBusinessByUnitType(value));
      });
  }

  private subscribeOnBusinessUnits(): void {
    merge(
      (this.businessUnitControl as AbstractControl).valueChanges,
      (this.businessUnitIdControl as AbstractControl).valueChanges
    )
      .pipe(filter((value) => !!value),takeWhile(() => this.isAlive))
      .subscribe(() => {
        this.store.dispatch(new GetRolePerUser(this.businessUnitIdControl?.value || '',this.businessUnitControl?.value || ''));
      });
  }

  static createForm(): FormGroup {
    return new FormGroup({
        id: new FormControl(),
      businessUnitType: new FormControl('', [Validators.required]),
      businessUnitId: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      roles: new FormControl('', [Validators.required]),
        isDeleted: new FormControl(true),
      address1: new FormControl('',[Validators.maxLength(100)]),
      address2: new FormControl('',[Validators.maxLength(100)]),
      country: new FormControl(''),
      state: new FormControl(''),
      city: new FormControl('', [Validators.maxLength(20)]),
      zip: new FormControl('', [Validators.maxLength(5)]),
      email: new FormControl('', [Validators.required, Validators.email,Validators.maxLength(100), Validators.pattern(/\S+@\S+\.com/) ]),
        emailConfirmation: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      phoneNumber: new FormControl('', [Validators.maxLength(10)]),
      fax: new FormControl('', [Validators.maxLength(10)]),
    },
      mustMatch('email', 'emailConfirmation')
    );
  }
}
