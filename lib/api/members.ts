'use server';

import { api } from './client';
import type { Member, MemberConsumption, MemberInput } from '@/types/members';

export async function findMembersByResidence(token: string, residenceId: number) {
  return api<Member[]>('/members?residenceId=' + residenceId, {
    method: 'GET',
    token,
  });
}

export async function findMemberConsumption(token: string) {
  return api<MemberConsumption[]>('/members/consumption', {
    method: 'GET',
    token,
  });
}

export async function createMember(token: string, member: MemberInput) {
  return api<Member>('/members', {
    method: 'POST',
    body: JSON.stringify(member),
    token,
  });
}

export async function deleteMember(token: string, id: number) {
  return api<void>('/members/' + id, {
    method: 'DELETE',
    token,
  });
}
