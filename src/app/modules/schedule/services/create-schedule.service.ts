import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { EMPTY, Observable, of, Subject } from 'rxjs';

import { FilteredItem } from '@shared/models/filter.model';
import { getTime } from '@shared/utils/date-time.utils';
import { DateTimeHelper } from '@core/helpers';
import { CustomFormGroup, DropdownOption, Permission } from '@core/interface';
import { ScheduleItemType } from 'src/app/modules/schedule/constants';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { getAllErrors } from '@shared/utils/error.utils';
import { UserState } from 'src/app/store/user.state';
import { CreateScheduleItem } from '../components/schedule-items/schedule-items.interface';
import * as ScheduleInt from '../interface';
import {
  EmployeeBookingDay,
  ScheduleBookingErrors,
  ScheduleCandidate,
  ScheduleDay,
  ScheduleFiltersData,
  ScheduleFilterStructure,
  ScheduleForm,
  ScheduleFormConfig,
  ScheduleFormFieldConfig,
  ScheduleSelectedSlots,
  ScheduleTypeRadioButton,
  ShiftDropDownsData,
} from '../interface';
import { ScheduleFiltersService } from './schedule-filters.service';
import { ScheduleClassesList, ScheduleCustomClassesList, ToggleControls } from '../components/create-schedule';
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { ScheduleType } from '../enums';
import { BookingsOverlapsResponse } from '../components/replacement-order-dialog/replacement-order.interface';

@Injectable()
export class CreateScheduleService {
  public closeSideBarEvent: Subject<boolean> = new Subject<boolean>();

  private scheduleModels: ScheduleInt.ScheduleModel[] = [];

  set scheduleData(data: ScheduleInt.ScheduleModel[]) {
    this.scheduleModels = [...data];
  }

  get scheduleData(): ScheduleInt.ScheduleModel[] {
    return [...this.scheduleModels];
  }

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private scheduleFiltersService:  ScheduleFiltersService,
  ) {}

  createUnavailabilityForm(): CustomFormGroup<ScheduleInt.ScheduleForm> {
    return this.fb.group({
      unavailabilityReasonId: [null, Validators.required],
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  createAvailabilityForm(): CustomFormGroup<ScheduleInt.ScheduleForm> {
    return this.fb.group({
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  createBookForm(): CustomFormGroup<ScheduleInt.ScheduleForm> {
    return this.fb.group({
      shiftId: [null, Validators.required],
      startTime: [null, Validators.required],
      endTime: [null, Validators.required],
      hours: [null],
      orientated: [false],
      critical: [false],
      onCall: [false],
      charge: [false],
      preceptor: [false],
      regionId: [null],
      locationId: [null],
      departmentId: [null],
      skillId: [null],
    }) as CustomFormGroup<ScheduleInt.ScheduleForm>;
  }

  handleError(error: HttpErrorResponse): Observable<never> {
    this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error) || error.error.detail));

    return EMPTY;
  }

  handleErrorMessage(error: HttpErrorResponse): Observable<ScheduleBookingErrors[]>{
    const bookErrors = error.error.errors.CreateBookingsCommand;

    if(bookErrors) {
      return of(JSON.parse(bookErrors));
    } else {
      this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      return EMPTY;
    }
  }

  createAvailabilityUnavailability(
    scheduleForm: FormGroup,
    scheduleItems: CreateScheduleItem[],
    scheduleType: number,
    customShiftId: number
  ): ScheduleInt.Schedule {
    const { shiftId, startTime, endTime, unavailabilityReasonId = null } = scheduleForm.getRawValue();
    return  {
      employeeScheduledDays: this.getEmployeeScheduledDays(scheduleItems),
      scheduleType,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      unavailabilityReasonId,
      shiftId: shiftId !== customShiftId ? shiftId : null,
    };
  }

  createBooking(
    scheduleForm: FormGroup,
    scheduleItems: CreateScheduleItem[],
    customShiftId: number
  ): ScheduleInt.ScheduleBook {
    const {
      departmentId,
      skillId,
      shiftId,
      startTime,
      endTime,
      orientated,
      critical,
      onCall,
      charge ,
      preceptor,
    } = scheduleForm.getRawValue();

    return  {
      employeeBookedDays: this.getEmployeeBookedDays(scheduleItems),
      departmentId: departmentId,
      skillId: skillId,
      shiftId: shiftId !== customShiftId ? shiftId : null,
      startTime: getTime(startTime),
      endTime: getTime(endTime),
      createOrder: false,
      orientated: orientated || false,
      critical: critical || false,
      onCall: onCall || false,
      charge: charge || false,
      preceptor: preceptor || false,
    };
  }

  getEmployeeScheduledDays(scheduleItems: CreateScheduleItem[]): ScheduleInt.EmployeeScheduledDay[] {
    return scheduleItems.map((item: CreateScheduleItem) => {
      const dates: string[] = item.selectedDates
        .map((date: Date) => DateTimeHelper.toUtcFormat(DateTimeHelper.setInitDateHours(date)));

      return {
        employeeId: item.candidateId,
        dates,
      };
    });
  }

  getEmployeeBookedDays(scheduleItems: CreateScheduleItem[]): EmployeeBookingDay[] {
    return scheduleItems.map((item: CreateScheduleItem) => {
      const bookedDays = item.selectedDates.map((date: Date) => {
        const initDate = new Date(date.setHours(0, 0, 0));

        return DateTimeHelper.toUtcFormat(initDate);
      });

      return {
        employeeId: item.candidateId,
        bookedDays,
      };
    });
  }

  public hideToggleControls(config: ScheduleFormConfig, value: boolean): void {
    config.formFields
      .filter((configField: ScheduleFormFieldConfig) => {
        return ToggleControls.includes(configField.field);
      }).forEach((configField: ScheduleFormFieldConfig) => {
        configField.show = value;
    });
  }

  public setOrientationControlValue(
    selectedSlots: ScheduleSelectedSlots,
    form: CustomFormGroup<ScheduleForm>,
  ): void {
    const candidates = selectedSlots.candidates;
    const control = form?.get('orientated') as AbstractControl;

    if(candidates.length === 1 && form) {
      this.orientationForSingleCandidate(control,candidates);
    } else if(candidates.length > 1){
      this.orientationForMultiCandidates(control,candidates);
    }
  }

  public setOnCallControlValue(
    form: CustomFormGroup<ScheduleForm>,
    shiftId: number,
    shiftsList: ScheduleShift[]
  ): void {
    const onCallControl = form.get('onCall');

    if(onCallControl) {
      const selectedShift = shiftsList.find((shift: ScheduleShift) => shift.id === shiftId);

      onCallControl.patchValue(selectedShift ? selectedShift.onCall : false);
    }
  }

  getDaySchedules(candidateId: number, dateString: string): ScheduleInt.ScheduleItem[] {
    const dateStringLength = 10;
    const formattedDateSting = dateString.substring(0, dateStringLength);
    const candidateData: ScheduleInt.ScheduleModel = this.scheduleData
      .find((data: ScheduleInt.ScheduleModel) => data.candidate.id === candidateId) as ScheduleInt.ScheduleModel;

    if (candidateData.schedule.length) {
      const dateSchedule: ScheduleInt.ScheduleDateItem | undefined = candidateData.schedule
        .find((scheduleItem: ScheduleInt.ScheduleDateItem) =>
          scheduleItem.date.substring(0, dateStringLength) === formattedDateSting
        );

      if (dateSchedule) {
        return dateSchedule.daySchedules;
      }
    }

    return [];
  }

  // TODO: replace with helper function from schedule.helper.ts
  mapToDropdownOptions(items: { name: string; id: number }[]): DropdownOption[] {
    return items.map(item => {
      return {
        text: item.name,
        value: item.id,
      };
    });
  }

  getScheduleTypesWithPermissions(
    scheduleTypes:ReadonlyArray<ScheduleTypeRadioButton>,
    userPermission: Permission
  ): ReadonlyArray<ScheduleTypeRadioButton> {
    let types = scheduleTypes.map((item: ScheduleTypeRadioButton) => {
      return {
        ...item,
        disabled: !userPermission[item.permission],
      };
    });

    if (this.store.selectSnapshot(UserState.user)?.isEmployee) {
      types = types.filter((type: ScheduleTypeRadioButton) => type.value !== ScheduleItemType.Book);
    }

    return types;
  }

  getFirstAllowedScheduleType(scheduleTypes:ReadonlyArray<ScheduleTypeRadioButton>): ScheduleItemType {
    return (scheduleTypes.find((item: ScheduleTypeRadioButton) => !item.disabled) as ScheduleTypeRadioButton)?.value;
  }

  updateScheduleFormClass(scheduleType: ScheduleItemType, isCustom: boolean): string {
    let className = ScheduleClassesList[ScheduleItemType.Book];

    if (scheduleType === ScheduleItemType.Book) {
      className = isCustom
        ? ScheduleCustomClassesList[ScheduleItemType.Book]
        : ScheduleClassesList[ScheduleItemType.Book];
    }

    if (scheduleType === ScheduleItemType.Availability) {
      className = isCustom
        ? ScheduleCustomClassesList[ScheduleItemType.Availability]
        : ScheduleClassesList[ScheduleItemType.Availability];
    }

    if (scheduleType === ScheduleItemType.Unavailability){
      className = isCustom
        ? ScheduleCustomClassesList[ScheduleItemType.Unavailability]
        : ScheduleClassesList[ScheduleItemType.Unavailability];
    }

    return className;
  }

  getShiftDropDownsData(scheduleFilterStructure: ScheduleFilterStructure): ShiftDropDownsData {
    const scheduleFiltersData: ScheduleFiltersData = this.scheduleFiltersService.getScheduleFiltersData();

    if (scheduleFiltersData?.filters?.departmentsIds?.length === 1) {
      return {
        filtered: true,
        selectedSkillId: scheduleFiltersData.filters?.skillIds?.length ? scheduleFiltersData.filters.skillIds[0] : null,
        regionsDataSource: this.getDataSourceFromFilteredItems('regionIds', scheduleFiltersData.filteredItems),
        locationsDataSource: this.getDataSourceFromFilteredItems('locationIds', scheduleFiltersData.filteredItems),
        departmentsDataSource: this.getDataSourceFromFilteredItems('departmentsIds', scheduleFiltersData.filteredItems),
        skillsDataSource: this.getDataSourceFromFilteredItems('skillIds', scheduleFiltersData.filteredItems),
      };
    } else {
      const data: ShiftDropDownsData = {} as ShiftDropDownsData;

      data.filtered = false;
      data.selectedSkillId = null;
      data.locationsDataSource = this.scheduleFiltersService
        .getSelectedLocatinOptions(scheduleFilterStructure, [scheduleFilterStructure.regions[0].id as number]);
      data.departmentsDataSource = this.scheduleFiltersService
        .getSelectedDepartmentOptions(scheduleFilterStructure, [data.locationsDataSource[0].value as number]);

      return data;
    }
  }

  getCandidateOrientation(candidate: ScheduleCandidate): boolean {
    return candidate.dates.every((date: string) => {
      if(candidate.orientationDate) {
        return DateTimeHelper.convertDateToUtc(date) >= DateTimeHelper.convertDateToUtc(candidate.orientationDate);
      } else {
        return false;
      }
    });
  }

  hasBookingDate(candidates: ScheduleCandidate[]): boolean {
    return candidates.map((candidate: ScheduleCandidate) => {
        return candidate.days?.some((day: ScheduleDay) => {
          return day.scheduleType === ScheduleType.Book;
        });
      }).some((isBookingDate: boolean) => isBookingDate);
  }

  prepareCandidateReplacementDates(candidates: ScheduleCandidate[]): BookingsOverlapsResponse[] {
    return candidates.filter((candidate: ScheduleCandidate) => {
      return candidate.days?.length;
    }).map((candidate: ScheduleCandidate) => {
      return {
        bookings: this.getDaysWithBooking(candidate.days),
        employeeId: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
      } as BookingsOverlapsResponse;
    });
  }

  resetScheduleControls(scheduleForm: FormGroup, controlsList: string[]): void {
    controlsList.forEach((control: string) => {
      scheduleForm.get(control)?.reset();
    });
  }

  getIdsRemovedDates(candidates: ScheduleCandidate[]): number[] {
    return candidates.filter((candidate: ScheduleCandidate) => candidate.days?.length)
      .map((candidate: ScheduleCandidate) => {
        return candidate.days.map((day: ScheduleDay) => {
          return day.id;
        });
      }).flat();
  }

  hasSelectedSlotsWithDate(candidates: ScheduleCandidate[]): boolean {
    return candidates.some((candidate: ScheduleCandidate) => {
      return candidate.days?.length;
    });
  }

  private getDataSourceFromFilteredItems(column: string, filteredItems: FilteredItem[]): DropdownOption[] {
    const filteredItem = filteredItems.find((item: FilteredItem) => item.column === column);

    if (!filteredItem) {
      return [];
    }

    return [{
      text: filteredItem.text,
      value: filteredItem.value,
    }];
  }

  private orientationForMultiCandidates(control: AbstractControl, candidates: ScheduleCandidate[]): void {
    const isCandidatesOriented = candidates.map((candidate: ScheduleCandidate) => {
      return this.getCandidateOrientation(candidate);
    }).every((orientation: boolean) => orientation);

    if(!isCandidatesOriented) {
      control?.patchValue(true);
      control?.disable();
    } else {
      control?.enable();
      control?.patchValue(false);
    }
  }

  private getDaysWithBooking(days: ScheduleDay[]): ScheduleDay[] {
    return days.filter((day: ScheduleDay) => day.scheduleType === ScheduleType.Book);
  }

  private orientationForSingleCandidate(control: AbstractControl, candidates: ScheduleCandidate[]): void {
    const isCandidateOriented = this.getCandidateOrientation(candidates[0]);

    control?.patchValue(!isCandidateOriented);

    if(!isCandidateOriented) {
      control?.disable();
    } else {
      control?.enable();
    }
  }
}
