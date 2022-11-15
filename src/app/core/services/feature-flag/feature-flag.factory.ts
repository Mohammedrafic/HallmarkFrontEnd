import { FeatureFlagService } from './feature-flag.service';

export function featureFlagProviderFactory(provider: FeatureFlagService): () => Promise<void> {
  return () => provider.getFeatureFlag();
}
