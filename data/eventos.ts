export interface Evento {
  id: string;
  titulo: string;
  autor: string;
  data: string;
  local: string;
  preco: number;
  imagem: string;
  link: string;
}

export const eventos: Evento[] = [
  {
    id: 'growing-up-mindful',
    titulo: 'Growing Up Mindful',
    autor: 'Christopher Willard, Psy. D.',
    data: '19th - 21st September',
    local: 'Barcelos - Portugal',
    preco: 340,
    // Coloca o URL externo aqui! Exemplo:
    imagem: 'https://images.unsplash.com/photo-1508185140592-283327020902?q=80&w=800', 
    link: '/eventos/growing-up-mindful'
  },
  // ... outros eventos
];