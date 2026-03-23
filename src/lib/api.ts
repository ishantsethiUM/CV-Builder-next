// ─────────────────────────────────────────────────────────────────────────────
// Central API client — all backend calls go through here
// Base domain:  https://cv-builder-backend-1023229424452.asia-south2.run.app
// Auth prefix:  /api/auth
// Other routes: /api/resumes  /api/ai  /api/tools
// ─────────────────────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_API_URL ?? "http://localhost:4000";
const AUTH = `${BASE}/api/auth`;
const API  = `${BASE}/api`;

// ── Token helpers ─────────────────────────────────────────────────────────────
export const token = {
  get: ()  => (typeof window !== "undefined" ? localStorage.getItem("folio_token") : null),
  set: (t: string) => localStorage.setItem("folio_token", t),
  del: ()  => localStorage.removeItem("folio_token"),
};

// ── Base fetch wrapper ────────────────────────────────────────────────────────
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const tk = token.get();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(tk ? { Authorization: `Bearer ${tk}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH  (POST /api/auth/...)
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    plan?: string;
    image?: string;
  };
}

/** POST /api/auth/login */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>(`${AUTH}/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  token.set(data.token);
  return data;
}

/** POST /api/auth/register */
export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>(`${AUTH}/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  token.set(data.token);
  return data;
}

/** POST /api/auth/google — send Google OAuth id_token */
export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>(`${AUTH}/google`, {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
  token.set(data.token);
  return data;
}

/** GET /api/auth/me */
export async function getMe(): Promise<AuthResponse["user"]> {
  return request<AuthResponse["user"]>(`${AUTH}/me`);
}

/** POST /api/auth/logout */
export async function logout(): Promise<void> {
  await request(`${AUTH}/logout`, { method: "POST" }).catch(() => null);
  token.del();
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUMES  (/api/resumes)
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumeItem {
  id: string | number;
  title: string;
  template: string;
  target?: string;
  atsScore?: number;
  downloads?: number;
  views?: number;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
  data?: Record<string, unknown>;
}

/** GET /api/resumes — list user's CVs */
export async function getResumes(): Promise<ResumeItem[]> {
  const data = await request<{ resumes?: ResumeItem[] } | ResumeItem[]>(`${API}/resumes`);
  return Array.isArray(data) ? data : (data.resumes ?? []);
}

/** GET /api/resumes/:id */
export async function getResume(id: string | number): Promise<ResumeItem> {
  return request<ResumeItem>(`${API}/resumes/${id}`);
}

/** POST /api/resumes — create */
export async function createResume(payload: Partial<ResumeItem>): Promise<ResumeItem> {
  return request<ResumeItem>(`${API}/resumes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** PUT /api/resumes/:id — update */
export async function updateResume(id: string | number, payload: Partial<ResumeItem>): Promise<ResumeItem> {
  return request<ResumeItem>(`${API}/resumes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/** DELETE /api/resumes/:id */
export async function deleteResume(id: string | number): Promise<void> {
  return request<void>(`${API}/resumes/${id}`, { method: "DELETE" });
}

/** POST /api/resumes/:id/share — generate public share link */
export async function shareResume(id: string | number): Promise<{ slug: string; url: string }> {
  return request<{ slug: string; url: string }>(`${API}/resumes/${id}/share`, { method: "POST" });
}

/** POST /api/resumes/upload — upload an existing PDF/DOCX and parse it into a resume */
export async function uploadResume(file: File): Promise<ResumeItem> {
  const tk = token.get();
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API}/resumes/upload`, {
    method: "POST",
    headers: tk ? { Authorization: `Bearer ${tk}` } : {},
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Upload failed: ${res.status}`);
  }

  return res.json() as Promise<ResumeItem>;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI  (/api/ai/...)
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/ai/bullets — improve a text into professional bullets */
export async function aiBullets(input: string): Promise<string[]> {
  const data = await request<{ suggestions?: string[]; bullets?: string[] }>(`${API}/ai/bullets`, {
    method: "POST",
    body: JSON.stringify({ input }),
  });
  return data.suggestions ?? data.bullets ?? [];
}

/** POST /api/ai/improve — general text improvement */
export async function aiImprove(input: string): Promise<string[]> {
  const data = await request<{ suggestions?: string[] }>(`${API}/ai/improve`, {
    method: "POST",
    body: JSON.stringify({ input }),
  });
  return data.suggestions ?? [];
}

/** POST /api/ai/ats — ATS score analysis */
export async function aiATS(cvText: string): Promise<{
  score: number;
  breakdown: Record<string, number>;
  suggestions: string[];
  strongPoints: string[];
}> {
  return request(`${API}/ai/ats`, {
    method: "POST",
    body: JSON.stringify({ cvText }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLS  (/api/tools/...)
// ─────────────────────────────────────────────────────────────────────────────

export interface RoastResult {
  score: number;
  verdict: string;
  roasts: { section: string; roast: string; fix: string }[];
  good: string[];
  advice: string;
  shareQuote: string;
}

/** POST /api/tools/roast */
export async function roastCV(cvText: string, level: string): Promise<RoastResult> {
  return request<RoastResult>(`${API}/resumes/tools/roast`, {
    method: "POST",
    body: JSON.stringify({ cvText, level }),
  });
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: number;
  tip: string;
  sample: string;
}

/** POST /api/tools/interview/questions */
export async function getInterviewQuestions(params: {
  role: string;
  company?: string;
  cvText?: string;
  count: number;
}): Promise<InterviewQuestion[]> {
  const data = await request<{ questions?: InterviewQuestion[] } | InterviewQuestion[]>(
    `${API}/tools/interview/questions`,
    { method: "POST", body: JSON.stringify(params) }
  );
  return Array.isArray(data) ? data : (data.questions ?? []);
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  improve: string[];
  better: string;
}

/** POST /api/tools/interview/feedback */
export async function getInterviewFeedback(params: {
  question: string;
  answer: string;
}): Promise<InterviewFeedback> {
  return request<InterviewFeedback>(`${API}/tools/interview/feedback`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export interface JobMatchResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  weakSections: { section: string; issue: string; fix: string }[];
  tailoredBullets: { original: string; improved: string }[];
  summary: string;
  quickWins: string[];
}

/** POST /api/tools/job-match */
export async function jobMatch(cvText: string, jobDesc: string): Promise<JobMatchResult> {
  return request<JobMatchResult>(`${API}/tools/job-match`, {
    method: "POST",
    body: JSON.stringify({ cvText, jobDesc }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CREDITS  (/api/credits)
// ─────────────────────────────────────────────────────────────────────────────

export interface UserCredits {
  cvCredits: number;
  exportCredits: number;
}

export interface CreditPlan {
  id: string;
  name: string;
  cvCredits: number;
  exportCredits: number;
  price: number;
  currency: string;
  popular?: boolean;
}

export const CREDIT_PLANS: CreditPlan[] = [
  { id: "starter", name: "Starter Pack",  cvCredits: 3,  exportCredits: 5,  price: 4.99,  currency: "GBP" },
  { id: "pro",     name: "Pro Pack",      cvCredits: 10, exportCredits: 20, price: 12.99, currency: "GBP", popular: true },
  { id: "max",     name: "Max Pack",      cvCredits: 25, exportCredits: 50, price: 24.99, currency: "GBP" },
];

/** GET /api/credits — fetch current user credit balance */
export async function getCredits(): Promise<UserCredits> {
  return request<UserCredits>(`${API}/credits`);
}

/** POST /api/credits/purchase — buy a credit pack */
export async function purchaseCredits(planId: string): Promise<UserCredits & { message: string }> {
  return request<UserCredits & { message: string }>(`${API}/credits/purchase`, {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}

/** POST /api/credits/track-export — deduct one export credit server-side */
export async function trackExport(resumeId?: string | number): Promise<UserCredits> {
  return request<UserCredits>(`${API}/credits/track-export`, {
    method: "POST",
    body: JSON.stringify({ resumeId }),
  });
}
