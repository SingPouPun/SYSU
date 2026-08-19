import SectionScaffold from './SectionScaffold.jsx'
import DisciplineStarMap from '../components/disciplines/DisciplineStarMap.jsx'

export default function DisciplinesSection() {
  return (
    <SectionScaffold id="disciplines" index="03" english="DISCIPLINES" title="学科图谱" day="3">
      <DisciplineStarMap />
    </SectionScaffold>
  )
}
