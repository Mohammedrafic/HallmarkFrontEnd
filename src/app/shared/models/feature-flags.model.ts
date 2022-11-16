export type FeatureFlagsNames = 'IRP';

export type FeatureFlagsModel = {
  [key in FeatureFlagsNames]: boolean;
}
