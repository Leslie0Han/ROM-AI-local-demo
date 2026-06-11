const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || (await res.text()));
  }
  return res.json();
}

/* ---------- Types ---------- */
export type TeamMember = {
  id: string;
  project_id: string;
  member_id: string;
  member_type: 'human' | 'digital_employee';
  member_name: string;
  role: string;
  responsibilities: string;
  created_at: string;
};

export type TeamMemberCreatePayload = {
  member_id?: string;
  member_type?: 'human' | 'digital_employee';
  member_name: string;
  role: string;
  responsibilities?: string;
};

/* ---------- API Functions ---------- */
export function listTeamMembers(projectId: string) {
  return request<TeamMember[]>(`/api/projects/${projectId}/team`);
}

export function addTeamMember(projectId: string, payload: TeamMemberCreatePayload) {
  return request<TeamMember>(`/api/projects/${projectId}/team`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function removeTeamMember(memberId: string) {
  return request<{ ok: boolean }>(`/api/team/${memberId}`, { method: 'DELETE' });
}

export function updateTeamMember(memberId: string, payload: Partial<TeamMemberCreatePayload>) {
  return request<TeamMember>(`/api/team/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
