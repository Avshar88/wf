export const SHOP = {
  name: 'BarberHub Yerevan',
  tagline: 'Premium Grooming Experience',
  address: 'Yerevan, Armenia',
  phone: '+374 11 000 000',
}

export const BARBERS = [
  { id: 1, name: 'Arman', emoji: '✂️', speciality: 'Classic & Modern Cuts' },
  { id: 2, name: 'David', emoji: '✂️', speciality: 'Beard & Fade Specialist' },
  { id: 3, name: 'Narek', emoji: '✂️', speciality: 'Kids & Textured Hair' },
  { id: 4, name: 'Gor',   emoji: '✂️', speciality: 'Precision & Styling' },
]

export const SERVICES = [
  { id: 1, name: 'Haircut',          duration: 30, price: 30, icon: '💈' },
  { id: 2, name: 'Haircut + Beard',  duration: 50, price: 50, icon: '🪒' },
  { id: 3, name: 'Beard Trim',       duration: 20, price: 20, icon: '🧔' },
  { id: 4, name: 'Kids Cut',         duration: 25, price: 25, icon: '👦' },
]

export const SCHEDULE = {
  // 0=Sun, 1=Mon, ... 6=Sat
  workDays: [1, 2, 3, 4, 5, 6],
  openHour: 10,
  closeHour: 19,
  slotInterval: 30, // minutes
}
