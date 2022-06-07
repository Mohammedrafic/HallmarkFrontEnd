export class GetIncompleteOrders {
  static readonly type = '[order management] Get Incomplete Orders';
  constructor(public payload: any) { }
}

export class GetOrders {
  static readonly type = '[order management] Get Orders';
  constructor(public orderBy: string, public pageNumber: number, public pageSize: number) { }
}
