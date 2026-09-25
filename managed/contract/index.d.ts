export interface LedgerState {
  certificateCount: bigint;
  revokedCount: bigint;
  activeSession: bigint;
  skillId: Uint8Array;
  issuerCommitment: Uint8Array;
  lastCertificationCommitment: Uint8Array;
  lastRevokedCommitment: Uint8Array;
  certificationThreshold: bigint;
}

export interface Witnesses {
  candidateSecretKey: (ctx: any) => [any, Uint8Array] | Uint8Array;
  scoreProofNonce: (ctx: any) => [any, Uint8Array] | Uint8Array;
  certificationRecordHash: (ctx: any) => [any, Uint8Array] | Uint8Array;
  candidateScoreProof: (ctx: any) => [any, bigint] | bigint;
  issuerSigningKey: (ctx: any) => [any, Uint8Array] | Uint8Array;
}

export declare class Contract<T = any> {
  witnesses: Witnesses;
  constructor(witnesses: Witnesses);
  circuits: {
    issueCertificate: (ctx: any, expectedSkillId: Uint8Array) => { result: Uint8Array; context: any };
    verifyCertificate: (ctx: any, claimedCommitment: Uint8Array) => { result: boolean; context: any };
    revokeCertificate: (ctx: any, commitmentToRevoke: Uint8Array) => { result: Uint8Array; context: any };
    setIssuerCommitment: (ctx: any, newThreshold: number | bigint) => { result: Uint8Array; context: any };
    resetCertification: (ctx: any, newSkillId: Uint8Array, newThreshold: number | bigint) => { result: Uint8Array; context: any };
    incrementSession: (ctx: any) => { result: any[]; context: any };
  };
  impureCircuits: Record<string, Function>;
  provableCircuits: Record<string, Function>;
  initialState(ctx?: any): any;
}

export declare function ledger(state: any): LedgerState;
export declare const pureCircuits: Record<string, any>;
export declare const contractReferenceLocations: Record<string, any>;

export type Ledger = LedgerState;
