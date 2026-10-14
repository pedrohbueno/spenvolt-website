export interface User {
  id: number;
  name: string;
  email: string;
  photoUrl: string | null;
  active: boolean;
  createdAt: string;
}