
export enum Category {
  SAFETY = 'Safety & Security',
  INDUSTRIAL = 'Industrial Automation',
  RETAIL = 'Logistics & Retail',
  HEALTH = 'Health & Environment'
}

export interface UseCase {
  id: string;
  category: Category;
  title: string;
  description: string;
  somaliDescription: string;
  benefit: string;
  image: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}
