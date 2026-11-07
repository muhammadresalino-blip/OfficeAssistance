import { z } from 'zod';

export const FormulaReq = z.object({
  request: z.string().min(5).max(500),
  separator: z.enum([',', ';']).default(';'),
  range: z.string().max(60).optional(),
});

export const FormulaRes = z.object({
  formula: z.string(),
  explanation: z.array(z.string()).min(1),
  example: z.object({ input: z.string(), output: z.string() }),
  minVersion: z.string().optional(),
  clarification: z.string().optional(),
});

export type FormulaRequest = z.infer<typeof FormulaReq>;
export type FormulaResponse = z.infer<typeof FormulaRes>;

export const DictionaryQuery = z.object({
  q: z.string().optional(),
  app: z.enum(['excel', 'word', 'powerpoint']).optional(),
  type: z.enum(['rumus', 'shortcut', 'tips']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type DictionaryQueryInput = z.infer<typeof DictionaryQuery>;

export const FeedbackReq = z.object({
  feature: z.enum(['formula', 'dictionary', 'cleaner', 'document', 'slide']),
  requestId: z.string().optional(),
  rating: z.enum(['up', 'down']),
});

export type FeedbackRequest = z.infer<typeof FeedbackReq>;

export const CleanIssue = z.enum([
  'duplicate',
  'extra_space',
  'merged_column',
  'mixed_date',
  'uneven_columns',
]);

export const CleanSuggestReq = z.object({
  sample: z.array(z.array(z.string().max(300)).max(60)).min(1).max(20),
  issues: z.array(CleanIssue).min(1).max(5),
});

export const CleanFormula = z.object({
  purpose: z.string().min(1),
  formula: z.string().min(1),
});

export const CleanSuggestRes = z.object({
  steps: z.array(z.string().min(1)).min(1).max(10),
  formulas: z.array(CleanFormula).max(10).default([]),
});

export type CleanIssueCode = z.infer<typeof CleanIssue>;
export type CleanSuggestRequest = z.infer<typeof CleanSuggestReq>;
export type CleanSuggestResponse = z.infer<typeof CleanSuggestRes>;
