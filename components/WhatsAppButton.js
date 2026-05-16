import { FaWhatsapp } from 'react-icons/fa'; // Instale react-icons

const WhatsAppButton = () => {
  const phone = "5511999999999"; // Seu número com DDD
  const message = encodeURIComponent("Olá! Gostaria de mais informações.");
  const url = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#25d366',
        color: '#fff',
        borderRadius: '50px',
        padding: '10px 15px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0px 4px 10px rgba(0,0,0,0.3)'
      }}
    >
      <FaWhatsapp size={25} />
      <span>Fale conosco</span>
    </a>
  );
};

export default WhatsAppButton;