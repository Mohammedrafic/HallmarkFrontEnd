export interface GetWorkCommitment {
    id: number
    name: string
}

export interface NursingWidget {
    targetUtilization: number, 
    todayDate : Date , 
    workCommitmentIds : string , 
    skillIDs : string 
}

export interface GetNursingWidgetData {
    monthlyTotalHoursSchedule : number,
    noOfPerdiemNursing : number,
    perdayTotalHoursSchedule : number,
    targetPerdiemNursingHours : number
}