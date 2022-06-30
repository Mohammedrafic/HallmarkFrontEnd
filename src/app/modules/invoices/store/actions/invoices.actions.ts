import { GetInvoicesData } from "../../interfaces/get-invoices-data.model";

export namespace Invoices {
  export class Get {
    static readonly type = '[invoices] get';

    constructor(public readonly payload: GetInvoicesData) {}
  }
}
