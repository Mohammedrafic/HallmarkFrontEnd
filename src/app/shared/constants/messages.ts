export const RECORD_ADDED = 'Record has been added';
export const RECORD_MODIFIED = 'Record has been modified';
export const RECORD_SAVED = 'Record has been saved';
export const RECORD_DELETE = 'Record has been deleted';
export const RECORD_CANNOT_BE_DELETED = 'Record cannot be deleted';
export const RECORD_CANNOT_BE_SAVED = 'Record cannot be saved';
export const RECORD_ALREADY_EXISTS = 'Record already exists';
export const RECORD_CANNOT_BE_UPDATED = 'Record cannot be updated';
export const DELETE_RECORD_TEXT = 'Are you sure you want to delete?';
export const DELETE_RECORD_TITLE = 'Delete Record';
export const DELETE_CONFIRM_TEXT = 'Are you sure you want to leave this page without saving?';
export const DELETE_CONFIRM_TITLE = 'Unsaved Progress';
export const CANCEL_COFIRM_TEXT = 'Are you sure you want to cancel? All data will be deleted.';
export const DATA_OVERRIDE_TITLE = 'Data Override';
export const DATA_OVERRIDE_TEXT = 'Are you sure want to override existing data?';
export const INACTIVE_USER_TITLE = 'Inactivate the User';
export const INACTIVE_USER_TEXT = 'Are you sure to inactivate the User?';
export const AGENCY_ADDED = "Agency details saved successfully";
export const ORDER_EDITS = "The recent changes may affect the data previously defined for this order." +
  "Please make sure that Workflows, Credentials, and Bill Rates are correct";
export const CANCEL_REJECTION_REASON = "Are you sure you want to cancel? All data will be deleted"
export const CANCEL_ORDER_CONFIRM_TEXT = 'Are you sure you want to cancel this order? This order will be deleted';
export const CANCEL_ORDER_CONFIRM_TITLE = 'Cancel Order';

export const usedByOrderErrorMessage = (val: string, entities: string) => `${val} cannot be deleted. This ${val} was used in ${entities}.`;
