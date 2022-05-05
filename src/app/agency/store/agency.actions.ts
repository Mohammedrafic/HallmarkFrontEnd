import { Agency } from 'src/app/shared/models/agency.model';

export class SaveAgency {
  static readonly type = '[agency] Save Agency';
  constructor(public payload: Agency) {}
}

export class SaveAgencySucceeded {
  static readonly type = '[agency] Save Agency Succeeded';
  constructor(public payload: Agency) {}
}

export class GetAgencyByPage {
  static readonly type = '[agency] Get Agency by Page';
  constructor(public pageNumber: number, public pageSize: number) { }
}

export class GetAgencyById {
  static readonly type = '[agency] Get Agency by ID';
  constructor(public payload: number) { }
}

export class GetAgencyByIdSucceeded {
  static readonly type = '[agency] Get Agency by ID Succeeded';
  constructor(public payload: Agency) { }
}
