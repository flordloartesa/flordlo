// app/lib/mockData.ts

export interface Session {
  id: string;
  title: string;
  category: 'Meditação' | 'Sono' | 'Curso' | 'Coaching';
  duration: string;
  rating: number;
  instructor: string;
  image: string;
  isLocked?: boolean;
}

export const categories = [
  { name: 'Meditar', slug: 'meditar', icon: '🧘' },
  { name: 'Sono', slug: 'sono', icon: '🌙' },
  { name: 'Programas', slug: 'programas', icon: '🎓' },
  { name: 'Mini', slug: 'mini', icon: '⚡' },
];

export const sessions: Session[] = [
  {
    id: '1',
    title: 'Deixando ir para dormir',
    category: 'Sono',
    duration: '25 min',
    rating: 4.8,
    instructor: "Melli O'Brien",
    image: "https://images.unsplash.com/photo-1511296933631-18b512b555e3?w=800&q=80",
    isLocked: true
  },
  {
    id: '2',
    title: 'Despertando do Piloto Automático',
    category: 'Meditação',
    duration: '10 min',
    rating: 4.6,
    instructor: "Melli O'Brien",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"
  },
  {
    id: '3',
    title: 'Cultivando Gratidão',
    category: 'Meditação',
    duration: '15 min',
    rating: 4.9,
    instructor: "Cory Muscara",
    image: "https://images.unsplash.com/photo-1490750967868-58cb75069ed6?w=800&q=80"
  },
  {
    id: '4',
    title: 'Foco no Trabalho',
    category: 'Coaching',
    duration: '5 min',
    rating: 4.7,
    instructor: "Cory Muscara",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
  }
];