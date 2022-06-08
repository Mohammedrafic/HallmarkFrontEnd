export class GetAgencyOrdersPage {
  static readonly type = '[agency order management] Get Agency Orders Page';
  constructor(public pageNumber: number, public pageSize: number) {}
}
