export interface Member {
  id: number;
  name: string;
  email: string;
  photoUrl: string | null;
  residenceId: number;
  createdAt: string;
}

export type MemberInput = Pick<Member, 'name' | 'email' | 'photoUrl' | 'residenceId'>;
