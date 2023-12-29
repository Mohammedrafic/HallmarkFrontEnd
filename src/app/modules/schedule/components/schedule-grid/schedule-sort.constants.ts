import { SortOrder } from "@shared/enums/sort-order-dropdown.enum";

export const ScheduleSortingCategory = [
    { id: 0, text: 'First Name', sortOrder: SortOrder.ASCENDING, tooltip:"A - Z",columnName: 'FirstName', },
    { id: 1, text: 'Last Name', sortOrder: SortOrder.ASCENDING, tooltip:"A - Z"  ,columnName: 'LastName'},
    { id: 2, text: 'Primary Skill', sortOrder: SortOrder.ASCENDING, tooltip:"Primary Skill on the top" , columnName: 'Skill',},
    { id: 3, text: 'Active', sortOrder: SortOrder.ASCENDING, tooltip:"Active on the top",columnName: 'IsOnHold' },
    { id: 4, text: 'Orientation', sortOrder: SortOrder.ASCENDING, tooltip:"Oriented on the top" ,columnName: 'IsOriented',},
    { id: 5, text: 'Onboarded To LTA' , sortOrder: SortOrder.ASCENDING, tooltip:"Onboarded to LTA on the top",columnName: 'IsLTA'},
    { id: 6, text: 'Scheduled Hours', sortOrder: SortOrder.ASCENDING, tooltip:"Ascending" ,columnName: 'Scheduled Hours',},
    { id: 7, text: 'Added Availability', sortOrder: SortOrder.ASCENDING, tooltip:"Ascending",columnName: 'Added Availability', },
    { id: 8, text: 'Added UnAvailability',sortOrder: SortOrder.ASCENDING, tooltip:"Ascending",columnName: 'Added UnAvailability' },
   
  ];

  export const WorkCommitments =[
    { id: 0, name: 'Work Commitment 1' },
    { id: 1, name: 'Work Commitment 2' },
    { id: 2, name: 'Work Commitment 3' },
    { id: 3, name: 'Work Commitment 4' },
    { id: 4, name: 'Work Commitment 5' },
    { id: 5, name: 'Work Commitment 6' },
  ]
  