import { HttpErrorResponse } from "@angular/common/http";

export const getAllErrors = (error: HttpErrorResponse['error']): string =>
error['errors']
  ? Object.values(error['errors'])
      .flatMap((val) => val)
      .toString()
  : error.error.detail;