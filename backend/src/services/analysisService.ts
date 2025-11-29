import prisma from '../config/db';
import logger from '../utils/logger';

interface NormalizedObservation {
  date: Date;
  category: string;
  intensity: number;
  tags: string[];
  hour: number;
}

/**
 * Moteur d'analyse principal
 */
export const runAnalysisForChild = async (childId: string): Promise<any> => {
  logger.info(`Démarrage de l'analyse pour l'enfant ${childId}`);

  // 1. Agrégation : Récupérer les observations des 30 derniers jours
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const observations = await prisma.observation.findMany({
    where: {
      childId,
      observedAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: { observedAt: 'asc' },
  });

  if (observations.length === 0) {
    return {
      message: "Pas assez de données pour une analyse pertinente.",
    };
  }

  // 2. Normalisation
  const normalizedData: NormalizedObservation[] = observations.map(obs => ({
    date: obs.observedAt,
    category: obs.category,
    intensity: obs.intensity,
    tags: obs.tags,
    hour: obs.observedAt.getHours(),
  }));

  // 3. Détection de patterns
  const patterns = detectPatterns(normalizedData);

  // 4. Génération de synthèse (IA simulée)
  const summary = generateSummary(patterns, normalizedData.length);

  // 5. Suggestions douces
  const suggestions = generateSuggestions(patterns);

  // Sauvegarder le résultat
  const analytic = await prisma.analytic.create({
    data: {
      childId,
      type: 'SUMMARY',
      content: JSON.stringify(patterns),
      summary,
      suggestions,
      periodStart: thirtyDaysAgo,
      periodEnd: new Date(),
    },
  });

  return analytic;
};

/**
 * Algorithme de détection de patterns
 */
const detectPatterns = (data: NormalizedObservation[]) => {
  const tagCounts: Record<string, number> = {};
  const intensityByHour: Record<number, number[]> = {};
  let highIntensityCount = 0;

  data.forEach(obs => {
    // Compter les tags
    obs.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Intensité par heure
    if (!intensityByHour[obs.hour]) {
      intensityByHour[obs.hour] = [];
    }
    intensityByHour[obs.hour].push(obs.intensity);

    if (obs.intensity >= 4) {
      highIntensityCount++;
    }
  });

  // Identifier les tags récurrents
  const recurringTags = Object.entries(tagCounts)
    .filter(([_, count]) => count >= 3)
    .map(([tag]) => tag);

  // Identifier les heures difficiles (moyenne intensité > 3)
  const difficultHours = Object.entries(intensityByHour)
    .filter(([_, intensities]) => {
      const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
      return avg > 3;
    })
    .map(([hour]) => parseInt(hour));

  return {
    recurringTags,
    difficultHours,
    highIntensityCount,
    totalObservations: data.length,
  };
};

/**
 * Générateur de synthèse (Simulé / IA Text Module)
 */
const generateSummary = (patterns: any, totalObs: number): string => {
  let summary = `Sur les ${totalObs} observations analysées, `;

  if (patterns.recurringTags.length > 0) {
    summary += `les thèmes suivants reviennent régulièrement : ${patterns.recurringTags.join(', ')}. `;
  } else {
    summary += `aucun thème dominant n'a été identifié. `;
  }

  if (patterns.difficultHours.length > 0) {
    const hours = patterns.difficultHours.map((h: number) => `${h}h`).join(' et ');
    summary += `Les moments nécessitant une attention particulière semblent se situer vers ${hours}. `;
  }

  if (patterns.highIntensityCount > 2) {
    summary += `Quelques épisodes d'intensité marquée ont été notés. `;
  } else {
    summary += `L'ensemble reste globalement stable. `;
  }

  return summary;
};

/**
 * Générateur de suggestions (Non prescriptif)
 */
const generateSuggestions = (patterns: any): string[] => {
  const suggestions = [];

  if (patterns.difficultHours.length > 0) {
    suggestions.push("Envisager des temps calmes ou de transition avant les horaires identifiés comme sensibles.");
  }

  if (patterns.recurringTags.includes('fatigue')) {
    suggestions.push("Vérifier si le rythme de sommeil ou les temps de repos sont suffisants.");
  }

  if (patterns.recurringTags.includes('colère') || patterns.recurringTags.includes('frustration')) {
    suggestions.push("Observer les déclencheurs potentiels précédant ces émotions.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Continuer l'observation régulière pour affiner l'analyse.");
  }

  return suggestions;
};
