import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    // O SEGREDO ESTÁ AQUI: Usamos o padding da página para empurrar o texto para baixo
    paddingTop: 260, // 👈 Ajusta este valor (+ ou -) para alinhar perfeitamente com a tua fita
    paddingHorizontal: 60,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1, // Garante que a imagem fica sempre por trás do texto
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#d11171',
    marginBottom: 15,
    textAlign: 'center',
  },
  studentName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 15,
    textAlign: 'center',
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333333',
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#666666',
    textAlign: 'center',
  }
});

export const CertificatePDF = ({ 
  studentName, 
  courseTitle, 
  hours, 
  startDate, 
  endDate, 
  backgroundUrl 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* Imagem de fundo fixa atrás de tudo */}
      {backgroundUrl && <Image src={backgroundUrl} style={styles.backgroundImage} />}
      
      {/* Container no fluxo normal da página (sem absolute) */}
      <View style={styles.contentContainer}>
        <Text style={styles.label}>Certificado de Presença</Text>
        <Text style={styles.studentName}>{studentName}</Text>
        <Text style={styles.subtitle}>completou a seguinte formação:</Text>
        <Text style={styles.courseTitle}>{courseTitle}</Text>
        <Text style={styles.paragraph}>
          Para os devidos efeitos declara-se que {studentName} realizou o programa de {'\n'}
          {courseTitle} com a duração de {hours} horas, {'\n'}
          organizado pela Sociedade Portuguesa de Meditação - Meditt, tendo decorrido de {'\n'}
          {startDate} a {endDate}.
        </Text>
      </View>

    </Page>
  </Document>
);