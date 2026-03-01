export interface IncomePoint {
    date: string; // "YYYY-MM" format
    amount: number;
  }
  
  export interface ProfileInput {
    incomes: IncomePoint[];
    monthlyExpenses: number;
    currentBuffer: number;
    horizonMonths: number;
    simulations: number;
    applySmoothing?: boolean;
  }
  
  export interface Features {
    avgIncome: number;
    stdIncome: number;
    cv: number;
    minIncome: number;
    maxIncome: number;
    negativeMonthRate: number;
    runwayDays: number;
    volatilityScore: number;
  }
  
  export interface SimOutcomes {
    pShortfall: number;
    medianTrajectory: number[];
    p10Trajectory: number[];
    p90Trajectory: number[];
    endBufferMedian: number;
  }
  
  export interface Recommendation {
    bufferTargetMonths: number;
    targetBuffer: number;
    gap: number;
    routePct: number;
    routingRuleText: string;
  }
  
  export interface AnalysisOutput {
    features: Features;
    outcomes: SimOutcomes;
    recommendation: Recommendation;
    explanation: string[];
    allocationPlan: AllocationPlan;
    baselineShortfall: number;
  }

  //update 2

  export interface AllocationRow {
    month: string;
    income: number;
    toBuffer: number;
    fromBuffer: number;
    available: number;
    bufferAfter: number;
    action: "deposit" | "release" | "neutral";
  }
  
  export interface AllocationPlan {
    rows: AllocationRow[];
    totalDeposited: number;
    totalReleased: number;
    projectedBufferEnd: number;
  }

  //update 3

  export interface ExtendedProfileInput extends ProfileInput {
    label?: string;
    csvFile?: string;
  }