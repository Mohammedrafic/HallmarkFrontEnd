import { ColDef, ValueGetterParams } from '@ag-grid-community/core';

export interface TypedValueGetterParams<T> extends ValueGetterParams {
  data: T;
}

interface TypedValueGetterFunc<T> {
  (params: TypedValueGetterParams<T>): unknown;
}

export interface TypedColDef<T> extends ColDef {
  field?: (keyof T & string) | string;
  valueGetter?: string | TypedValueGetterFunc<T>;
}
