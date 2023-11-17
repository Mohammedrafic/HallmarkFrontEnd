import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ScheduleShift } from '@shared/models/schedule-shift.model';
import { formatDate } from '@angular/common';

@Injectable()
export class ShiftsService {

  constructor(private fb: FormBuilder) {}

  public getShiftForm(): FormGroup {
    return this.fb.group({
      id: new FormControl(0, [ Validators.required ]),
      name: new FormControl(null, [ Validators.required ]),
      startTime: new FormControl(null, [ Validators.required ]),
      endTime: new FormControl(null, [ Validators.required ]),
      onCall: new FormControl(false),
      inactiveDate:new FormControl('')
    });
  }
  public getactiveshiftsbyJobDates(shifts:ScheduleShift[],jobStartDates:string[]):ScheduleShift[]{
   let resultSet:ScheduleShift[]=[];
    jobStartDates.forEach((element)=>{
      let filteredlist:ScheduleShift[]=[];
      filteredlist=shifts.filter((shift)=>shift.inactiveDate!=null ? formatDate(shift.inactiveDate!,'yyyy-MM-dd','en_US') > formatDate(element,'yyyy-MM-dd','en_US'):shift.inactiveDate === null)
      if(filteredlist || filteredlist!=null){
        resultSet = resultSet.concat(filteredlist);
        filteredlist = [];
      }
    });
    resultSet = [...new Map(resultSet.map((m) => [m.id, m])).values()];
    return resultSet;
  }
  public getactiveshifts(shifts:ScheduleShift[],jobStartDates:string):ScheduleShift[]{
     return shifts.filter((shift)=>shift.inactiveDate!=null ? formatDate(shift.inactiveDate!,'yyyy-MM-dd','en_US') > formatDate(jobStartDates,'yyyy-MM-dd','en_US'):shift.inactiveDate === null)
  }
  public getshiftsbyStartDateAndEndDate(shifts:ScheduleShift[],shiftId:Number,startDate:string,endDate:string):ScheduleShift | undefined{
    return shifts.find((shift)=>shift.id == shiftId && shift.inactiveDate!=null && 
    new Date(startDate) <=new Date(shift.inactiveDate) 
     && new Date(endDate) >=new Date(shift.inactiveDate))
  }
  public getInactiveshift(shifts:ScheduleShift[],shiftId:Number):ScheduleShift | undefined{
    return shifts.find((shift)=>shift.id == shiftId && shift.inactiveDate!=null)
  }
}
