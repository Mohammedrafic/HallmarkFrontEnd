import { valuesOnly } from "@shared/utils/enum.utils";

enum Classification {
  Alumni = 0,
  International = 1,
  Interns = 2,
  Locums = 3,
  Students = 4,
  Volunteers = 5,
}

export const Classifications = Object.values(Classification)
  .filter(valuesOnly)
  .map((text, id) => ({ text, id }));

export const SkillFields = {
  text: 'name',
  value: 'id',
};

export const DefaultOptionFields = {
  text: 'text',
  value: 'id',
};
