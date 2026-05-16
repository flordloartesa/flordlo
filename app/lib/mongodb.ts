import { MongoClient, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

// Configurações otimizadas para evitar timeouts e excesso de ligações na Vercel
const options: MongoClientOptions = {
  connectTimeoutMS: 10000, // Desiste após 10s se não conseguir ligar
  socketTimeoutMS: 45000,  // Mantém o socket aberto por 45s
  maxPoolSize: 1,          // Crucial para Serverless: evita abrir múltiplas ligações desnecessárias
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Em desenvolvimento, usamos uma variável global para que o valor 
  // seja preservado entre reloads do Hot Module Replacement (HMR).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Em produção, a ligação é criada e exportada diretamente
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Exportação utilizada pelo NextAuth e outras API Routes
export { clientPromise };