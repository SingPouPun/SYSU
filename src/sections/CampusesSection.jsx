import SectionScaffold from './SectionScaffold.jsx'
import CampusFileGallery from '../components/campuses/CampusFileGallery.jsx'

export default function CampusesSection() {
  return (
    <SectionScaffold id="campuses" index="04" english="CAMPUSES" title="三校区五校园" day="3">
      <CampusFileGallery />
    </SectionScaffold>
  )
}
