// BabyTrack Configuration
export const CONFIG = {
  /**
   * IMPORTANT: Do not use /dev URLs for the app as they trigger CORS/Auth errors.
   * Always use a separate /exec URL for your test environment.
   */
  GOOGLE_SHEETS_URL: import.meta.env.DEV
    ? 'https://script.google.com/macros/s/AKfycbz1y6n6CsfFOpC-olYTDzK_xePTBNCkNPaF5n78ygOaTo6Yai_105uEgV5jVdxZAVkG/exec' // Create a separate "Anyone" deployment for testing
    : 'https://script.google.com/macros/s/AKfycbwaFO3LlMb6fPCQa9gRNXr9RD7RvJ1h8NR1dDgLUMfPCD0tvPd7FPId-aVVwJliDGnT/exec',
};
