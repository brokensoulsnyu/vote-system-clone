export interface SessionToken {
  token: string;
  createdAt: Date;
  expiresAt: Date;
  ipHash: string; // Hashed IP address for anonymity
}

export interface Vote {
  sessionToken: string;
  option: string;
  votedAt: Date;
  ipHash: string;
}
export interface VoteCount {
  option: string;
  count: number;
}
