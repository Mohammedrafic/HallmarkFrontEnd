import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Holiday, OrganizationHoliday, OrganizationHolidaysPage } from '@shared/models/holiday.model';
import { HolidaysService } from '@shared/services/holidays.service';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { catchError, Observable, of, tap } from "rxjs";

import { RECORD_ADDED, RECORD_MODIFIED } from "src/app/shared/constants/messages";
import { MessageTypes } from "src/app/shared/enums/message-types";
import { ShowToast } from "src/app/store/app.actions";
import { UserState } from 'src/app/store/user.state';
import { CheckIfExist, DeleteHoliday, DeleteHolidaySucceeded, EditHoliday, ExportHolidays, GetAllMasterHolidays, GetHolidayDataSources, GetHolidaysByPage, SaveHoliday, SaveHolidaySucceeded } from './holidays.actions';

export interface HolidaysStateModel {
  isHolidayLoading: boolean;
  holidaysPage: OrganizationHolidaysPage | null;
  masterHolidays: Holiday[];
  isExist: boolean;
  holidayDataSource: string[];
}

@State<HolidaysStateModel>({
  name: 'orgHolidays',
  defaults: {
    holidaysPage: null,
    isHolidayLoading: false,
    masterHolidays: [],
    isExist: false,
    holidayDataSource: [],
  },
})
@Injectable()
export class HolidaysState {

  @Selector()
  static holidaysPage(state: HolidaysStateModel): OrganizationHolidaysPage | null { return state.holidaysPage; }

  @Selector()
  static isHolidayLoading(state: HolidaysStateModel): boolean { return state.isHolidayLoading; }

  @Selector()
  static masterHolidays(state: HolidaysStateModel): Holiday[] { return state.masterHolidays; }

  @Selector()
  static holidayDataSource(state: HolidaysStateModel): string[] { return state.holidayDataSource; }

  constructor(private holidaysService: HolidaysService, private store: Store) { }

  @Action(GetHolidaysByPage)
  GetHolidaysByPage({ patchState }: StateContext<HolidaysStateModel>, { pageNumber, pageSize, orderBy, filter }: GetHolidaysByPage): Observable<OrganizationHolidaysPage> {
    patchState({ isHolidayLoading: true });
    return this.holidaysService.getOrganizationHolidays(pageNumber, pageSize, orderBy, filter).pipe(
      tap((payload) => {
        const organizationStructure = this.store.selectSnapshot(UserState.organizationStructure);
        payload.items.forEach(item => {
          if (item.organizationId) {
            const region = organizationStructure?.regions.find(region => region.id === item.regionId);
            const location = region?.locations?.find(location => location.id === item.locationId);
            item.locationName = item.locationId ? location?.name : "All";
            item.regionName =  item.regionId ? region?.name : "All";
          }
          item.foreignKey = item.id + '-' + item.masterHolidayId;
        });
        patchState({ isHolidayLoading: false, holidaysPage: payload });
        return payload;
      })
    );
  }

  @Action(GetAllMasterHolidays)
  GetAllMasterHolidays({ patchState }: StateContext<HolidaysStateModel>, { }: GetAllMasterHolidays): Observable<Holiday[]> {
    patchState({ isHolidayLoading: true });
    return this.holidaysService.getAllMasterHolidays().pipe(
      tap((payload) => {
        patchState({ isHolidayLoading: false, masterHolidays: payload });
        return payload;
      })
    );
  }

  @Action(SaveHoliday)
  SaveHoliday({ patchState, dispatch }: StateContext<HolidaysStateModel>, { payload }: SaveHoliday): Observable<OrganizationHoliday | void> {
    patchState({ isHolidayLoading: true });
    return this.holidaysService.saveUpdateOrganizationHoliday(payload).pipe(
      tap((payloadResponse) => {
        patchState({ isHolidayLoading: false });
        if (payload.id) {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else {
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SaveHolidaySucceeded(payloadResponse));
        return payloadResponse;
      }),
      catchError((error: any) => {
        return dispatch(new ShowToast(MessageTypes.Error, 'Record already exists, please update Dates'));
      })
    );
  }

  @Action(EditHoliday)
  EditHoliday({ patchState, dispatch }: StateContext<HolidaysStateModel>, { payload }: SaveHoliday): Observable<OrganizationHoliday | void> {
    patchState({ isHolidayLoading: true });
    return this.holidaysService.editOrganizationHoliday(payload).pipe(
      tap((payloadResponse) => {
        patchState({ isHolidayLoading: false });
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        dispatch(new SaveHolidaySucceeded(payloadResponse));
        return payloadResponse;
      }),
      catchError(() => {
        return dispatch(new ShowToast(MessageTypes.Error, 'Record already exists, please update Dates'))
      })
    );
  }

  @Action(DeleteHoliday)
  DeleteHoliday({ patchState, dispatch }: StateContext<HolidaysStateModel>, { payload }: DeleteHoliday): Observable<any> {
    patchState({ isHolidayLoading: true });
    return this.holidaysService.removeOrganizationHoliday(payload).pipe(tap((payload) => {
      patchState({ isHolidayLoading: false });
      dispatch(new DeleteHolidaySucceeded(payload));
      return payload;
    }),
      catchError((error: any) => of(dispatch(new ShowToast(MessageTypes.Error, 'Holiday cannot be deleted')))));
  }

  @Action(CheckIfExist)
  CheckIfExist({ patchState }: StateContext<HolidaysStateModel>, { payload }: CheckIfExist): Observable<any> {
    return this.holidaysService.checkIfExist(payload).pipe(tap((payload) => {
      patchState({ isExist: payload });
      return payload;
    }));
  }

  @Action(ExportHolidays)
  ExportHolidays({ }: StateContext<HolidaysStateModel>, { payload }: ExportHolidays): Observable<any> {
    return this.holidaysService.exportOrganizationHolidays(payload).pipe(tap(file => {
      const url = window.URL.createObjectURL(file);
      saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
    }));
  };

  @Action(GetHolidayDataSources)
  GetHolidayDataSources({ patchState }: StateContext<HolidaysStateModel>, { }: GetHolidayDataSources): Observable<string[]> {
    return this.holidaysService.getHolidaysDataSources().pipe(tap(dataSource => {
      patchState({ holidayDataSource: dataSource });
      return dataSource;
    }));
  };
}
