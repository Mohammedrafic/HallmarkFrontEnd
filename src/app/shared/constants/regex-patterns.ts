export const ONLY_LETTERS = /^[a-zA-Z\s]*$/;
export const CHARS_HYPHEN_APOSTROPHE = /^[a-zA-Z`'-\s]*$/;
export const ONLY_NUMBER = /^[0-9]*$/;
export const ONLY_NUMBER_AND_DOT = /^[0-9\.]*$/;
export const NUMBER_AND_ONE_DECIMAL = /^(\d)*(\.)?([0-9]{1})?$/;
export const ALPHANUMERIC = /^[a-zA-Z0-9]+$/;
/**
 * TODO: test and think if it is needed.
 */
export const ALPHANUMERICS_AND_SYMBOLS = /^([\w\s-_,.;:`@!#$%^&*)(?\\\\/|"\[\]~}{'><]*]*)(?=(.*\w){1})(?=(.*[a-zA-Z]))[a-zA-Z0-9]{3,}([\w\s-_,.;:`@!#$%^&*)(?\\\\/|"\[\]~}{'><]*]*)$/;
