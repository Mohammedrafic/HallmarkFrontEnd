export class FilteredDataByOrganizationId {
  public organizationId: number | null;
  public regionIds: number[];
  public locationIds: number[];
  public departmentsIds: number[];

  constructor(organizationId: number | null) {
    this.organizationId = organizationId;
    this.regionIds = [];
    this.locationIds = [];
    this.departmentsIds = [];
  }
}
