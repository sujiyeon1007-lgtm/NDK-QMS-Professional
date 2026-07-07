/**
 * Control Room — LOT Timeline Summary Panel (Blueprint ② · Read Only)
 */
export default function ControlRoomLotTimelinePanel({ lotNo, events = [] }) {
  return (
    <aside className="control-room-lot-timeline" aria-label="LOT Timeline Summary">
      <div className="control-room-lot-timeline__head">
        <h3>Timeline Summary</h3>
        {lotNo ? <span className="control-room-lot-timeline__lot">{lotNo}</span> : null}
      </div>

      {!lotNo ? (
        <p className="control-room-lot-timeline__empty">LOT를 선택하면 Timeline Summary가 표시됩니다.</p>
      ) : events.length === 0 ? (
        <p className="control-room-lot-timeline__empty">등록된 Timeline 이벤트가 없습니다.</p>
      ) : (
        <ul className="control-room-lot-timeline__list">
          {events.map((event) => (
            <li key={event.id}>
              <time>{event.time}</time>
              <strong>{event.title}</strong>
              <span>{event.detail}</span>
              <em>{event.user}</em>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
