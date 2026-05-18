export const SHOP = {
  name: 'BarberHub Yerevan',
  tagline: 'The grooming lounge on Saryan',
  address: 'Saryan 23, Yerevan',
  phone: '+374 11 000 000',
}

export const BARBERS = [
  { id: 1, name: 'Karen', fullName: 'Karen Arutyunyan', role: 'Master Barber · 12 yrs', speciality: 'Classic & Modern Cuts', rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'David', fullName: 'David Petrosyan', role: 'Fade Specialist · 8 yrs', speciality: 'Skin Fades & Beard Sculpting', rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Narek', fullName: 'Narek Sargsyan', role: 'Senior Stylist · 6 yrs', speciality: 'Textured & Kids Cuts', rating: 4.8,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Gor', fullName: 'Gor Hovhannisyan', role: 'Precision Cutter · 10 yrs', speciality: 'Scissor Work & Styling', rating: 5.0,
    photo: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=400&q=80' },
]

export const SERVICES = [
  { id: 1, name: 'Signature Haircut', tagline: 'Precision cut & styling',    duration: 30, price: 30, icon: '✂️', popular: true },
  { id: 2, name: 'Haircut + Beard',   tagline: 'The full grooming ritual',   duration: 50, price: 50, icon: '🪒', popular: false },
  { id: 3, name: 'Beard Sculpt',      tagline: 'Hot towel & detailing',      duration: 20, price: 20, icon: '🧔', popular: false },
  { id: 4, name: 'Young Gentleman',   tagline: 'Tailored for kids',          duration: 25, price: 25, icon: '👦', popular: false },
]

export const SCHEDULE = {
  // 0=Sun, 1=Mon, ... 6=Sat
  workDays: [1, 2, 3, 4, 5, 6],
  openHour: 10,
  closeHour: 19,
  slotInterval: 30, // minutes
}
