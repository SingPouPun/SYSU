import SectionScaffold from './SectionScaffold.jsx'
import HistoryCardOrbit from '../components/history/HistoryCardOrbit.jsx'

export default function HistorySection() {
  return (
    <SectionScaffold id="history" index="01" english="HISTORY" title="百年校史" day="3">
      <HistoryCardOrbit />
    </SectionScaffold>
  )
}
