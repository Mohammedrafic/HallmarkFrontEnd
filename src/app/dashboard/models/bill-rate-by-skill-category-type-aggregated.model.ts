import { SkillCategoryTypeEnum } from '../enums/skill-category-type.enum';
import { PositionByTypeDataModel } from './positions-by-type-aggregated.model';

export type BillRateBySkillCategoryTypeAggregatedModel = Record<SkillCategoryTypeEnum, PositionByTypeDataModel[]>;