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

/* -------------------------------------------------------------------------- */
/* P3: Clean                                                                  */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* P4: Document Outline                                                       */
/* -------------------------------------------------------------------------- */

export const DocType = z.enum(['surat_resmi', 'laporan', 'notulen', 'proposal']);

export const DocOutlineReq = z.object({
  type: DocType,
  title: z.string().min(5).max(200),
  purpose: z.string().min(5).max(500),
  organization: z.string().max(100).optional(),
});

export const DocSection = z.object({
  heading: z.string().min(1),
  content: z.string().min(1),
});

export const DocOutlineRes = z.object({
  sections: z.array(DocSection).min(2),
  tips: z.array(z.string()).optional(),
});

export type DocumentType = z.infer<typeof DocType>;
export type DocOutlineRequest = z.infer<typeof DocOutlineReq>;
export type DocOutlineResponse = z.infer<typeof DocOutlineRes>;

/* -------------------------------------------------------------------------- */
/* P5: Slide Outline                                                          */
/* -------------------------------------------------------------------------- */

export const SlideOutlineReq = z.object({
  topic: z.string().min(5).max(200),
  audience: z.string().min(3).max(100),
  slides: z.coerce.number().min(5).max(20).default(10),
});

export const SlideEntry = z.object({
  no: z.number(),
  title: z.string().min(1),
  bullets: z.array(z.string()).min(1),
  visual: z.string().optional(),
});

export const SlideOutlineRes = z.object({
  slides: z.array(SlideEntry).min(5),
});

export type SlideOutlineRequest = z.infer<typeof SlideOutlineReq>;
export type SlideOutlineResponse = z.infer<typeof SlideOutlineRes>;

