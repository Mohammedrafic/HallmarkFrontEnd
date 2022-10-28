export const ONLY_LETTERS = /^[a-zA-Z\s]*$/;
export const CHARS_HYPHEN_APOSTROPHE = /^[a-zA-Z`'-\s]*$/;
export const ONLY_NUMBER = /^[0-9]*$/;
export const ONLY_NUMBER_AND_DOT = /^[0-9\.]*$/;
export const ALPHANUMERIC = /^[a-zA-Z0-9_]+$/;
export const ALPHANUMERICS_AND_SYMBOLS = /^([\w\s-_,.;:`@!#$%^&*)(?\\\\/|"\[\]~}{'><]*]*)(?=(.*\w){1})(?=(.*[a-zA-Z]))[a-zA-Z0-9]{3,}([\w\s-_,.;:`@!#$%^&*)(?\\\\/|"\[\]~}{'><]*]*)$/;
