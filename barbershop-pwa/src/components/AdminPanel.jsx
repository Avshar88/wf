import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { BARBERS, SERVICES } from '../data/config'
import { BrandMark, IconArrowLeft } from './Icons'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmt(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${MONTH_SHORT[m-1]} ${d}, ${y}`
}

export default function AdminPanel({ onBack }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('bookings') // bookings | finance
  const [filterBarber, setFilterBarber] = useState('all')
  const [filterDate, setFilterDate]     = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: true })
    setBookings(data || [])
    setLoading(false)
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this booking?')) return
    await supabase.from('bookings').delete().eq('id', id)
    load()
  }

  const filtered = bookings.filter(b => {
    if (filterBarber !== 'all' && b.barber_id !== Number(filterBarber)) return false
    if (filterDate && b.date !== filterDate) return false
    return true
  })

  // ── Finance ──
  const totalRevenue   = bookings.reduce((s, b) => s + b.price, 0)
  const totalBookings  = bookings.length

  const byBarber = BARBERS.map(br => ({
    ...br,
    count:   bookings.filter(b => b.barber_id === br.id).length,
    revenue: bookings.filter(b => b.barber_id === br.id).reduce((s, b) => s + b.price, 0),
  })).sort((a, b) => b.revenue - a.revenue)

  const byService = SERVICES.map(sv => ({
    ...sv,
    count:   bookings.filter(b => b.service_id === sv.id).length,
    revenue: bookings.filter(b => b.service_id === sv.id).reduce((s, b) => s + b.price, 0),
  })).sort((a, b) => b.revenue - a.revenue)

  // monthly
  const monthly = {}
  bookings.forEach(b => {
    const key = b.date.slice(0, 7)
    monthly[key] = (monthly[key] || 0) + b.price
  })
  const monthlyArr = Object.entries(monthly).sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div className="admin">
      <div className="topbar">
        <button className="back-btn" onClick={onBack}>
          <IconArrowLeft size={16} color="var(--bh-gold)" /> Back
        </button>
        <BrandMark size={20} />
        <span style={{ width: 60 }} />
      </div>

      <div className="admin-tabs">
        <button className={`adm-tab ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>📅 Bookings</button>
        <button className={`adm-tab ${tab === 'finance'  ? 'active' : ''}`} onClick={() => setTab('finance')}>💰 Finance</button>
      </div>

      {tab === 'bookings' && (
        <div className="admin-content">
          <div className="adm-filters">
            <select value={filterBarber} onChange={e => setFilterBarber(e.target.value)} className="adm-select">
              <option value="all">All Barbers</option>
              {BARBERS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="adm-select"
            />
            {filterDate && <button className="adm-clear" onClick={() => setFilterDate('')}>✕</button>}
          </div>

          <div className="adm-count">{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</div>

          {loading ? <p className="adm-loading">Loading...</p> : (
            <div className="adm-list">
              {filtered.length === 0 && <p className="no-slots">No bookings found.</p>}
              {filtered.map(b => {
                const service = SERVICES.find(s => s.id === b.service_id)
                const barber  = BARBERS.find(br => br.id === b.barber_id)
                return (
                  <div key={b.id} className="adm-row">
                    <div className="adm-row-left">
                      <div className="adm-datetime">
                        <span className="adm-date">{fmt(b.date)}</span>
                        <span className="adm-time">{b.time}</span>
                      </div>
                      <div className="adm-service">{service?.icon} {service?.name}</div>
                      <div className="adm-customer">{b.name} · {b.phone}</div>
                      <div className="adm-barber-tag">{barber?.name}</div>
                    </div>
                    <div className="adm-row-right">
                      <span className="adm-price">${b.price}</span>
                      <button className="adm-cancel-btn" onClick={() => handleCancel(b.id)}>✕</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'finance' && (
        <div className="admin-content">
          <div className="fin-summary">
            <div className="fin-card big">
              <span className="fin-label">Total Revenue</span>
              <span className="fin-value gold">${totalRevenue}</span>
            </div>
            <div className="fin-card">
              <span className="fin-label">Total Bookings</span>
              <span className="fin-value">{totalBookings}</span>
            </div>
            <div className="fin-card">
              <span className="fin-label">Avg per Booking</span>
              <span className="fin-value">${totalBookings ? (totalRevenue / totalBookings).toFixed(0) : 0}</span>
            </div>
          </div>

          <h3 className="fin-section-title">By Barber</h3>
          <div className="fin-table">
            {byBarber.map(b => (
              <div key={b.id} className="fin-row">
                <div className={`barber-avatar-sm avatar-${b.id}`}>{b.name[0]}</div>
                <span className="fin-name">{b.name}</span>
                <span className="fin-count">{b.count} bookings</span>
                <span className="fin-amount">${b.revenue}</span>
              </div>
            ))}
          </div>

          <h3 className="fin-section-title">By Service</h3>
          <div className="fin-table">
            {byService.map(s => (
              <div key={s.id} className="fin-row">
                <span className="fin-icon">{s.icon}</span>
                <span className="fin-name">{s.name}</span>
                <span className="fin-count">{s.count} bookings</span>
                <span className="fin-amount">${s.revenue}</span>
              </div>
            ))}
          </div>

          {monthlyArr.length > 0 && (
            <>
              <h3 className="fin-section-title">By Month</h3>
              <div className="fin-table">
                {monthlyArr.map(([month, rev]) => (
                  <div key={month} className="fin-row">
                    <span className="fin-name">{month}</span>
                    <span className="fin-amount">${rev}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
