export interface PreservedFiltersByPage<Type> {
  state: Type;
  isNotPreserved: boolean;
  dispatch: boolean;
}