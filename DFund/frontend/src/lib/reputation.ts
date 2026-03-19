export interface CreatorStats {
  address: string;
  totalCampaignsDeployed: number;
  successfulCampaigns: number;
  failedCampaigns: number;
  totalStxRaised: number;
}

export type ReputationBadge = 'Trusted Creator' | 'Emerging Creator' | 'High Risk';
export type RiskLevel = 'Low Risk' | 'Medium Risk' | 'High Risk';

/**
 * Computes a normalized 0-100 reputation score.
 * Formula: (Success Rate * 0.70) + (Normalized Volume * 0.30)
 */
export function calculateCreatorScore(stats: CreatorStats | undefined): number {
  if (!stats || stats.totalCampaignsDeployed === 0) return 50; // Neutral starting score for new creators

  const successRate = (stats.successfulCampaigns / stats.totalCampaignsDeployed) * 100;
  
  // Normalize volume up to 50,000 STX max scale for scoring (cap at 100)
  const MAX_VOLUME_SCALE = 50000;
  const volumeScore = Math.min((stats.totalStxRaised / MAX_VOLUME_SCALE) * 100, 100);

  const reputationScore = (successRate * 0.70) + (volumeScore * 0.30);
  return Math.round(reputationScore);
}

export function getReputationBadge(score: number): { badge: ReputationBadge; colorClass: string; textClass: string } {
  if (score >= 80) return { badge: 'Trusted Creator', colorClass: 'bg-green-400', textClass: 'text-green-800' };
  if (score >= 50) return { badge: 'Emerging Creator', colorClass: 'bg-yellow-400', textClass: 'text-yellow-800' };
  return { badge: 'High Risk', colorClass: 'bg-red-400', textClass: 'text-red-800' };
}

/**
 * Computes the risk level of an active campaign based on creator logic and funding velocity.
 */
export function calculateCampaignRisk(
  score: number, 
  currentAmount: number, 
  goalAmount: number, 
  startedAtBlock: number, 
  deadlineBlock: number, 
  currentBlock: number
): { risk: RiskLevel; colorClass: string } {
  if (score >= 80) return { risk: 'Low Risk', colorClass: 'bg-green-400' };
  if (score < 50) return { risk: 'High Risk', colorClass: 'bg-red-400' };

  // For Emerging Creators (50-79), factor in funding velocity
  const totalDuration = deadlineBlock - startedAtBlock;
  const elapsed = currentBlock - startedAtBlock;
  
  if (totalDuration <= 0 || elapsed <= 0) return { risk: 'Medium Risk', colorClass: 'bg-yellow-400' };

  const timeProgress = (elapsed / totalDuration) * 100;
  const fundingProgress = (currentAmount / goalAmount) * 100;

  // If time elapsed is > 70% and funding is < 20%, raise the risk.
  if (timeProgress > 70 && fundingProgress < 20) {
    return { risk: 'High Risk', colorClass: 'bg-red-400' };
  }

  return { risk: 'Medium Risk', colorClass: 'bg-yellow-400' };
}
