const G = '#D9C28E'

export function IconScissors({ size = 20, color = G }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/>
    </svg>
  )
}

export function IconRazor({ size = 20, color = G }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18"/>
    </svg>
  )
}

export function IconBeard({ size = 20, color = G }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11c0-5 2-8 9-8s9 3 9 8c0 3-1 5-3 6.5l-2 1-2 1.5-2-1.5-2-1C4 16 3 14 3 11z"/>
      <path d="M9 17.5c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5"/>
      <path d="M12 13v4"/>
    </svg>
  )
}

export function IconKid({ size = 20, color = G }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M6 20v-2a6 6 0 0112 0v2"/>
      <path d="M9 7c0-1 .5-2 1.5-2.5"/>
    </svg>
  )
}

export function IconArrowLeft({ size = 18, color = G, strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  )
}

export function IconArrowRight({ size = 17, color = '#1A1006', strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}

export function IconCheck({ size = 16, color = G, strokeWidth = 2.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )
}

export function IconStar({ size = 11, color = '#D9C28E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
    </svg>
  )
}

export function IconClock({ size = 11, color = 'rgba(232,216,184,0.62)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  )
}

export function IconCalendar({ size = 14, color = G }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}

export function IconPin({ size = 12, color = 'rgba(232,216,184,0.62)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

export function IconUser({ size = 18, color = G }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

export function IconPhone({ size = 18, color = G }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  )
}

export function IconNote({ size = 18, color = G }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h11l4 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"/>
      <path d="M16 4v4h4M8 13h8M8 17h5"/>
    </svg>
  )
}

export function IconBell({ size = 18, color = '#F5EEDC', strokeWidth = 1.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 1112 0c0 7 3 8 3 9H3s3-2 3-9zM10 21a2 2 0 004 0"/>
    </svg>
  )
}

export function IconCard({ size = 18, color = '#A5BD7E' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
    </svg>
  )
}

export function IconChevron({ size = 15, color = 'rgba(232,216,184,0.34)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}

export function BrandMark({ size = 22 }) {
  const color = '#D9C28E'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <svg width={size} height={size * 1.15} viewBox="0 0 24 28" fill="none">
        <circle cx="12" cy="3" r="2" fill={color}/>
        <rect x="7.5" y="5.5" width="9" height="17" rx="1.5" stroke={color} strokeWidth="1.3" fill="rgba(0,0,0,0.4)"/>
        <path d="M7.5 8l9 3.5M7.5 12l9 3.5M7.5 16l9 3.5" stroke={color} strokeWidth="1.1" strokeLinecap="round" opacity="0.75"/>
        <circle cx="12" cy="25" r="2" fill={color}/>
      </svg>
      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: size * 0.72, fontWeight: 600, letterSpacing: '0.3px', color: '#F5EEDC' }}>
        Barber<span style={{ color }}>Hub</span>
      </span>
    </div>
  )
}

export function serviceIcon(serviceId, size = 22, color = G) {
  if (serviceId === 1) return <IconScissors size={size} color={color}/>
  if (serviceId === 2) return <IconRazor size={size} color={color}/>
  if (serviceId === 3) return <IconBeard size={size} color={color}/>
  return <IconKid size={size} color={color}/>
}
