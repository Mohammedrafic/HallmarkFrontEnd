import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { CHANGES_SAVED } from '@shared/constants';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { MessageTypes } from '@shared/enums/message-types';
import { ExportPayload } from '@shared/models/export.model';
import { endDateValidator, startDateValidator } from '@shared/validators/date.validator';
import { BehaviorSubject, Observable,Subject,tap } from 'rxjs';
import { ShowToast } from 'src/app/store/app.actions';
import { HistoricalOrientationConfigurationDTO, OrientationConfiguration, OrientationConfigurationDTO, OrientationConfigurationFilters, OrientationConfigurationPage, OrientationSetting } from '../models/orientation.model';

@Injectable()
export class OrientationService {
  public filterColumns = {
    orientationIDs: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'text',
      valueId: 'id',
    },
    regionIds: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'name',
      valueId: 'id',
    },
    locationIds: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'name',
      valueId: 'id',
    },
    departmentsIds: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'name',
      valueId: 'id',
    },
    skillCategoryIds: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'name',
      valueId: 'id',
    },
    skillIds: {
      type: ControlTypes.Multiselect,
      valueType: ValueType.Id,
      dataSource: [],
      valueField: 'skillDescription',
      valueId: 'id',
    },
  };

  private isSettingsOff$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  
  constructor(
    private store: Store,
    private http: HttpClient,
  ) {}

  public checkIfSettingOff(): Observable<boolean> {
    return this.isSettingsOff$.asObservable();
  }

  public setSettingState(state: boolean): void {
    this.isSettingsOff$.next(state);
  }

  public getOrientationConfigs(filters: OrientationConfigurationFilters): Observable<OrientationConfigurationPage> {
    return this.http.post<OrientationConfigurationPage>('/api/OrientationSettings/configurations/list', filters)
  }

  public getHistoricalOrientationConfigs(filters: OrientationConfigurationFilters): Observable<OrientationConfigurationPage> {
    if(filters.regionIds || filters.skillCategoryIds || filters.orientationIDs){
      return this.http.post<OrientationConfigurationPage>('/api/OrientationSettings/historical/filter', filters)
    }
    return this.http.post<OrientationConfigurationPage>('/api/OrientationSettings/historical/configurations/list', filters)  
  }

  public getExport(filters: ExportPayload): Observable<Blob> {
    if (filters) {
      return this.http.post(`/api/OrientationSettings/export`, filters, { responseType: 'blob' });
    }
    return this.http.post(`/api/OrientationSettings/export`, filters, { responseType: 'blob' });
  }
  

  
  public saveOrientationConfiguration(params: OrientationConfigurationDTO): Observable<void> {
    if (params.orientationConfigurationId) {
      return this.http.put<void>('/api/OrientationSettings/configurations/' + params.orientationConfigurationId, params);
    } else {
      params.orientationConfigurationId = undefined;
      return this.http.post<void>('/api/OrientationSettings/configurations', params);
    }
  }

  public reactivateOrientationConfiguration(params: HistoricalOrientationConfigurationDTO): Observable<void> {
    return this.http.post<void>('/api/OrientationSettings/historical/configurations/reactivate', params);
  }

  public getOrientationSetting(): Observable<OrientationSetting> {
    return this.http.get<OrientationSetting>('/api/OrientationSettings');
  }

  public saveOrientationSetting(setting: OrientationSetting): Observable<void> {
    return this.http.post<void>('/api/OrientationSettings', setting).pipe(tap(() => {
      this.store.dispatch(new ShowToast(MessageTypes.Success, CHANGES_SAVED));
    }));
  }

  public removeOrientationConfiguration(params: OrientationConfiguration): Observable<void> {
    return this.http.delete<void>('/api/OrientationSettings/configurations/' + params.id);
  }

  public generateConfigurationSetupForm(): FormGroup {
    const form = new FormGroup({
      orientationConfigurationId: new FormControl(0),
      regionIds: new FormControl(null, [Validators.required]),
      locationIds: new FormControl(null, [Validators.required]),
      departmentIds: new FormControl(null, [Validators.required]),
      skillIds: new FormControl(null, [Validators.required]),
      skillCategory: new FormControl(null, [Validators.required]),
      completedOrientation: new FormControl(null, [Validators.required]),
      removeOrientation: new FormControl(null),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null),
    });

    const startTimeField = form.get('startDate') as AbstractControl;
    startTimeField.addValidators(startDateValidator(form, 'endDate'));
    startTimeField.valueChanges.subscribe(() => endTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false }));

    const endTimeField = form.get('endDate') as AbstractControl;
    endTimeField.addValidators(endDateValidator(form, 'startDate'));
    endTimeField.valueChanges.subscribe(() => startTimeField.updateValueAndValidity({ onlySelf: true, emitEvent: false }));

    return form;
  }

  public generateHistoricalDataForm(): FormGroup {
    const form = new FormGroup({
      ids: new FormControl([]),
      endDate: new FormControl(null),
    });

    return form;
  }

  public generateConfigurationFilterForm(): FormGroup {
    return new FormGroup({
      orientationIDs: new FormControl(null),
      regionIds: new FormControl(null),
      locationIds: new FormControl(null),
      departmentsIds: new FormControl(null),
      skillIds: new FormControl(null),
      skillCategoryIds: new FormControl(null),
    });
  }

  public refreshFilterForm(form: FormGroup, filters: OrientationConfigurationFilters): void {
    form.setValue({
      orientationIDs: filters.orientationIDs || null,
      regionIds: filters.regionIds || null,
      locationIds: filters.locationIds || null,
      departmentsIds: filters.departmentsIds || null,
      skillIds: filters.skillIds || null,
      skillCategoryIds: filters.skillCategoryIds || null,
    });
  }
}