import { useState } from 'react'

export default function StepDetails({ initial, onChange }) {
  const [name, setName] = useState(initial?.name || '')
  const [phone, setPhone] = useState(initial?.phone || '')

  function handle(field, value) {
    const updated = { name, phone, [field]: value }
    if (field === 'name') setName(value)
    else setPhone(value)
    onChange(updated.name.trim() && updated.phone.trim() ? updated : null)
  }

  return (
    <div className="step-content">
      <div className="step-header">
        <h2>Your Details</h2>
        <p>So we know who's coming</p>
      </div>
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          placeholder="e.g. Artur Petrosyan"
          value={name}
          onChange={e => handle('name', e.target.value)}
          autoComplete="name"
        />
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input
          type="tel"
          placeholder="+374 __ __ __ __"
          value={phone}
          onChange={e => handle('phone', e.target.value)}
          autoComplete="tel"
        />
      </div>
    </div>
  )
}
