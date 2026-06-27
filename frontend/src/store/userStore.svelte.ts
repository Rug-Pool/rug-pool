export interface UserState {
  address: string | null;
  isFoundingMember: boolean;
  balance: number;
}

let user = $state<UserState>({
  address: null,
  isFoundingMember: false,
  balance: 0,
});

export function getUser() {
  return user;
}

export function setUser(update: Partial<UserState>) {
  user = { ...user, ...update };
}
