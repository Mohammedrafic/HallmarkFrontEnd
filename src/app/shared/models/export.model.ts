import { RowNode } from '@ag-grid-community/core';
import { ExportedFileType } from '@shared/enums/exported-file-type';

export class ExportColumn {
  text: string;
  column: string;
}

export class ExportOptions {
  columns: ExportColumn[];
  fileName: string;
  fileType: ExportedFileType;
}

export class ExportPayload {
  exportFileType: ExportedFileType;
  filterQuery?: any;
  properties?: string[];
  ids?: number[];
  filename?: string;
  offset?: number;

  constructor(
    exportedFileType: ExportedFileType,
    filterQuery?: any,
    properties?: string[],
    ids?: any[] | null,
    fileName?: string,
    offset?: number | null
  ) {
    this.exportFileType = exportedFileType;
    if (filterQuery) {
      this.filterQuery = filterQuery;
    }
    if (properties) {
      this.properties = properties;
    }
    if (ids) {
      this.ids = ids;
    }
    if (fileName) {
      this.filename = fileName;
    }
    if (offset) {
      this.offset = offset;
    }
  }  
}
export class ExportDataModel {
  items: RowNode[]
}
