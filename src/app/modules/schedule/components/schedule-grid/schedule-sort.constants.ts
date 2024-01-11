import { SortOrder } from "@shared/enums/sort-order-dropdown.enum";

export const ScheduleSortingCategory = [
    { id: 0, text: 'First Name', sortOrder: SortOrder.ASCENDING, tooltip:"A - Z",columnName: 'FirstName', },
    { id: 1, text: 'Last Name', sortOrder: SortOrder.ASCENDING, tooltip:"A - Z"  ,columnName: 'LastName'},
    { id: 2, text: 'Primary Skill', sortOrder: SortOrder.ASCENDING, tooltip:"Primary Skill on the top" , columnName: 'Skill',},
    { id: 3, text: 'Active', sortOrder: SortOrder.ASCENDING, tooltip:"Active on the top",columnName: 'IsOnHold' },
    { id: 4, text: 'Orientation', sortOrder: SortOrder.ASCENDING, tooltip:"Oriented on the top" ,columnName: 'IsOriented',},
    { id: 5, text: 'Onboarded To LTA' , sortOrder: SortOrder.ASCENDING, tooltip:"Onboarded to LTA on the top",columnName: 'IsLTA'},
    { id: 6, text: 'Scheduled Hours', sortOrder: SortOrder.ASCENDING, tooltip:"Ascending" ,columnName: 'ScheduleHrs',},
    { id: 7, text: 'Added Availability', sortOrder: SortOrder.DESCENDING, tooltip:SortOrder.DESCENDING,columnName: 'AvailabilityHrs', },
    { id: 8, text: 'Added UnAvailability',sortOrder: SortOrder.DESCENDING, tooltip:SortOrder.DESCENDING,columnName: 'UnAvailabilityHrs' },
   
  ];

  