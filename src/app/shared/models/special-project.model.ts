import { PageOfCollections } from '@shared/models/page.model';

export class SpecialProject {
    id: number;
    name: string;
    organizationId:number;
    projectTypeId? :number;
    regionId:number;
    regionName:String;
    locationId:number;
    locationName :string;
    departmentId:number;
    departmentName :string;
    skillId:number;
    projectBudget : number;
    startDate :Date;
    endDate: Date;
    isDeleted :boolean;
    specialProjectCategory? : string ;
}

export type SpecialProjectPage = PageOfCollections<SpecialProject>;

