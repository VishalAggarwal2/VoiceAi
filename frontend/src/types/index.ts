export interface AnalysisReport {
  id: number;
  fileName: string;
  analysisType: "GENERAL" | "SALES";
  transcription: string;
  summary: string;
  rawAnalysisJson: string;
  overallScore: number;
  conversionProbability: number;
  customerSentiment: "positive" | "neutral" | "negative";
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  durationSeconds: number;
  audioFormat: string;
  createdAt: string;
}

export interface GeneralAnalysis {
  transcription: string;
  summary: string;
  keyTopics: string[];
  sentiment: string;
  actionItems: string[];
  speakerCount: number;
  languageDetected: string;
  overallScore: number;
  highlights: string[];
  durationEstimate: string;
}

export interface SalesAnalysis {
  transcription: string;
  summary: string;
  overallScore: number;
  executiveAnalysis: {
    name: string;
    communicationStyle: string;
    toneAndEnergy: string;
    listeningSkills: string;
    score: number;
    strengths: string[];
    improvements: string[];
    objectionHandling: {
      score: number;
      description: string;
      examples: string[];
    };
    productKnowledge: number;
    rapport: number;
    closing: number;
  };
  customerAnalysis: {
    sentiment: string;
    sentimentScore: number;
    engagementLevel: string;
    expectations: string[];
    questions: string[];
    painPoints: string[];
    objections: string[];
    buyingSignals: string[];
  };
  conversionAnalysis: {
    probability: number;
    confidence: string;
    urgency: string;
    timeline: string;
    keyFactors: {
      positive: string[];
      negative: string[];
    };
    followUpActions: string[];
    recommendedNextStep: string;
  };
  callMetrics: {
    talkRatio: { executive: number; customer: number };
    questionCount: number;
    objectionCount: number;
    silencePeriods: number;
    interruptions: number;
  };
  keyMoments: Array<{
    timestamp: string;
    type: string;
    description: string;
  }>;
}
