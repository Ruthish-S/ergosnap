export interface Reference {
  id: string;
  authors: string;
  year: number;
  title: string;
  source: string;
  doi?: string;
  url?: string;
  accessedDate?: string;
  type: 'journal' | 'standard' | 'software' | 'documentation';
}

export const REFERENCES: Reference[] = [
  {
    id: 'mcatamney-1993',
    authors: 'McAtamney, L., & Corlett, E. N.',
    year: 1993,
    title: 'RULA: a survey method for the investigation of work-related upper limb disorders',
    source: 'Applied Ergonomics, 24(2), 91–99',
    doi: '10.1016/0003-6870(93)90080-S',
    type: 'journal',
  },
  {
    id: 'iso-11226-2000',
    authors: 'International Organization for Standardization',
    year: 2000,
    title: 'ISO 11226:2000 — Ergonomics: Evaluation of static working postures',
    source: 'ISO Standard Catalogue',
    url: 'https://www.iso.org/standard/25573.html',
    type: 'standard',
  },
  {
    id: 'autocv-rula-2021',
    authors: 'Plantard, P., Shum, H. P. H., Le Pierres, A. S., & Multon, F.',
    year: 2021,
    title: 'Development of a fully automated RULA assessment system based on computer vision',
    source: 'International Journal of Industrial Ergonomics, 86, 103218',
    doi: '10.1016/j.ergon.2021.103218',
    type: 'journal',
  },
  {
    id: 'mediapipe-pose-2023',
    authors: 'Google AI Edge Team',
    year: 2023,
    title: 'MediaPipe Pose Landmarker for Web (Tasks Vision)',
    source: 'Google AI Edge Documentation',
    url: 'https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js',
    type: 'documentation',
  },
  {
    id: 'jspdf-autotable',
    authors: 'Bengtsson, S., & Contributors',
    year: 2024,
    title: 'jsPDF-AutoTable: Table plugin for jsPDF',
    source: 'GitHub Open Source Repository',
    url: 'https://github.com/simonbengtsson/jsPDF-AutoTable',
    type: 'software',
  },
  {
    id: 'vite-gh-pages',
    authors: 'Vite Core Team',
    year: 2024,
    title: 'Deploying a Static Site — GitHub Pages',
    source: 'Vite Documentation',
    url: 'https://vite.dev/guide/static-deploy',
    type: 'documentation',
  },
  {
    id: 'cohen-kappa-1968',
    authors: 'Cohen, J.',
    year: 1968,
    title: 'Weighted kappa: Nominal scale agreement with provision for scaled disagreement or partial credit',
    source: 'Psychological Bulletin, 70(4), 213–220',
    doi: '10.1037/h0026256',
    type: 'journal',
  },
];
