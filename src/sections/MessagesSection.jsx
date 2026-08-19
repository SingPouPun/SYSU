import SectionScaffold from './SectionScaffold.jsx'
import ChinaMessageMap from '../components/messages/ChinaMessageMap.jsx'

export default function MessagesSection({ active = false, user, onRequestLogin, onMessageSubmitted }) {
  return (
    <SectionScaffold id="messages" index="05" english="MESSAGES" title="中大寄语" day="3">
      <ChinaMessageMap
        active={active}
        user={user}
        onRequestLogin={onRequestLogin}
        onMessageSubmitted={onMessageSubmitted}
      />
    </SectionScaffold>
  )
}
