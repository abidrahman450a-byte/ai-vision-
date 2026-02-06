
import { UseCase, Category } from './types';

export const USE_CASES: UseCase[] = [
  {
    id: 'CAM-01',
    category: Category.RETAIL,
    title: 'Camera 01: Entry/Exit',
    description: 'Crowd Analysis, Face recognition, and customer flow monitoring.',
    somaliDescription: 'Kormeerka albaabada, tirinta dadka, iyo aqoonsiga wejiyada.',
    benefit: 'Optimizes entry flow and security monitoring.',
    image: 'https://images.unsplash.com/photo-1557597774-9d2739f85a94?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'CAM-02',
    category: Category.INDUSTRIAL,
    title: 'Camera 02: Production Line',
    description: 'Analog gauges monitoring and defect detection on the assembly line.',
    somaliDescription: 'Akhrinta qalabka mishiinnada iyo hubinta tayada alaabta.',
    benefit: 'Predictive maintenance and quality assurance.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'CAM-03',
    category: Category.RETAIL,
    title: 'Camera 03: Warehouse',
    description: 'Automated box counting and stock level monitoring (restock detection).',
    somaliDescription: 'Tirinta sanduuqyada iyo hubinta haddii alaabtu dhammaatay.',
    benefit: 'Inventory accuracy and logistical efficiency.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'CAM-04',
    category: Category.SAFETY,
    title: 'Camera 04: Hazard Zone',
    description: 'Safety PPE monitoring and intrusion detection in restricted areas.',
    somaliDescription: 'Hubinta badbaadada (PPE) iyo ka hortagga dadka aan loo ogolayn aagga.',
    benefit: 'Zero-accident policy enforcement and perimeter security.',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800'
  }
];

export const TECH_PARTNERS = [
  { name: 'AI Vision Sentinel', color: 'text-orange-500' },
  { name: 'Neural Link', color: 'text-zinc-500' },
  { name: 'Core Vision', color: 'text-blue-500' },
  { name: 'Edge Compute', color: 'text-green-500' },
  { name: 'Vision AI', color: 'text-purple-500' }
];

export const VISION_VALUE_PROPOSITION = {
  speed: "AUTONOMY: AI Vision acts instantly without human intervention.",
  objectivity: "PRECISION: High-fidelity object detection with 99.9% accuracy.",
  continuity: "UPTIME: 24/7/365 active monitoring across all nodes."
};
