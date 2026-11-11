export interface Member {
  id: number;
  name: string;
  email: string;
  photoUrl: string | null;
  residenceId: number;
  createdAt: string;
}

export type MemberInput = Pick<Member, 'name' | 'email' | 'photoUrl' | 'residenceId'>;

// Consumo mensal atribuído a um membro (GET /members/consumption).
export interface MemberConsumption {
  memberId: number;
  name: string;
  photoUrl: string | null;
  residenceId: number;
  kwh: number;
  cost: number;
}
