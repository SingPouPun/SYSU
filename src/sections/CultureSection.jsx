import { lazy, Suspense } from 'react'
import SectionScaffold from './SectionScaffold.jsx'

const CultureImmersiveStage = lazy(() => import('../components/culture/CultureImmersiveStage.jsx'))

export default function CultureSection() {
  return (
    <SectionScaffold id="culture" index="02" english="CULTURE" title="中大文化" day="3">
      <Suspense fallback={<div className="culture-stage-loading">CULTURE SCENE LOADING…</div>}>
        <CultureImmersiveStage />
      </Suspense>
    </SectionScaffold>
  )
}
