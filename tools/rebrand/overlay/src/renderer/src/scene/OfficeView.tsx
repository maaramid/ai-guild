// Which office to show: the light 2D guild hall (default) or the 3D office.
// The 3D office (Three.js) is loaded only when the owner switches it on in
// Settings → General → Features, so a default install never pays for WebGL.
import { lazy, Suspense } from 'react';
import { useFeatures } from '@/lib/useFeatures';
import { featureOn } from '@shared/features';
import { GuildHallView } from './guild2d/GuildHallView';

const OfficeFloor3D = lazy(() => import('./office3d/OfficeFloor3D').then((m) => ({ default: m.OfficeFloor3D })));

export function OfficeView() {
  const features = useFeatures();
  if (featureOn(features, 'office3d')) {
    return (
      <Suspense fallback={null}>
        <OfficeFloor3D />
      </Suspense>
    );
  }
  return <GuildHallView />;
}
