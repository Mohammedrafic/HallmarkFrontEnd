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
export const DELETE_FOLDER_TEXT = 'Are you sure you want to delete folder?';
export const DELETE_FOLDER_TITLE = 'Delete Folder';
export const ADD_CONFIRM_TEXT = 'Are you sure you want to add Bill rate for Onboarded Candidate? This may lead to recalculating values and generating new invoice records.';
export const EDIT_CONFIRM_TEXT = 'Are you sure you want to edit the Bill rate for Onboarded Candidate? This may lead to recalculating values and generating new invoice records.';
export const DELETE_CONFIRM_TITLE = 'Unsaved Progress';
export const UNSAVED_TABS_TEXT = 'Are you sure you want to leave this tab without saving?';
export const CANCEL_CONFIRM_TEXT = 'Are you sure you want to cancel? All data will be deleted.';
export const DATA_OVERRIDE_TITLE = 'Data Override';
export const DATA_OVERRIDE_TEXT = 'Are you sure want to override existing data?';
export const INACTIVE_USER_TITLE = 'Inactivate the User';
export const INACTIVE_USER_TEXT = 'Are you sure to inactivate the User?';
export const AGENCY_ADDED = 'Agency details saved successfully';
export const ORDER_EDITS =
  'The recent changes may affect the data previously defined for this order.' +
  'Please make sure that Credentials and Bill Rates are correct';
export const ORDER_PER_DIEM_EDITS =
  'The recent changes may affect the data previously defined for this order.' +
  'Please make sure that Credentials are correct';
export const CANCEL_REJECTION_REASON = 'Are you sure you want to cancel? All data will be deleted';
export const CANCEL_ORDER_CONFIRM_TEXT = 'Are you sure you want to cancel this order? This order will be deleted';
export const CANCEL_ORDER_CONFIRM_TITLE = 'Cancel Order';
export const SET_READONLY_STATUS = "You don't have permissions for setting this status";
export const IMPORT_CONFIRM_TEXT = 'Only those data that do not contain errors will be imported';
export const IMPORT_CONFIRM_TITLE = 'Import';
export const ORDER_WITHOUT_CREDENTIALS =
  'Added order doesn’t contain the Credentials. Please edit the order to onboard candidates successfully';
export const ORDER_WITHOUT_BILLRATES =
  'Added order doesn’t contain the Bill Rates. Please edit the order to onboard candidates successfully';
export const ORDER_WITHOUT_CRED_BILLRATES =
  'Added order doesn’t contain the Credentials and Bill Rates. Please edit the order to onboard candidates successfully';
export const UNSAVE_CHANGES_TEXT = 'Do you want to save changes?';
export const REQUIRED_PERMISSIONS = 'Separate permission right is required';

export const updateCandidateJobMessage = (dates: string[]) =>
  `For this candidate job timesheets will be recalculated for the next start dates: ${dates.join(', ')}`;
export const usedByOrderErrorMessage = (val: string, entities: string) =>
  `${val} cannot be deleted. This ${val} was used in ${entities}.`;
export const usedInMappingMessage = (mappingName: string) =>
  `This change has been affected ${mappingName} Mapping, please update it on the ${mappingName} Mapping tab`;
  export const SEND_EMAIL = 'Sent email';
  export const SEND_EMAIL_REQUIRED = 'Required';
