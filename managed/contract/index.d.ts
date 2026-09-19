import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  candidateSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  scoreProofNonce(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  certificationRecordHash(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  candidateScoreProof(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  issuerSigningKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  issueCertificate(context: __compactRuntime.CircuitContext<PS>,
                   expectedSkillId_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  verifyCertificate(context: __compactRuntime.CircuitContext<PS>,
                    claimedCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  revokeCertificate(context: __compactRuntime.CircuitContext<PS>,
                    commitmentToRevoke_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  setIssuerCommitment(context: __compactRuntime.CircuitContext<PS>,
                      newThreshold_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  resetCertification(context: __compactRuntime.CircuitContext<PS>,
                     newSkillId_0: Uint8Array,
                     newThreshold_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  incrementSession(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  issueCertificate(context: __compactRuntime.CircuitContext<PS>,
                   expectedSkillId_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  verifyCertificate(context: __compactRuntime.CircuitContext<PS>,
                    claimedCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  revokeCertificate(context: __compactRuntime.CircuitContext<PS>,
                    commitmentToRevoke_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  setIssuerCommitment(context: __compactRuntime.CircuitContext<PS>,
                      newThreshold_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  resetCertification(context: __compactRuntime.CircuitContext<PS>,
                     newSkillId_0: Uint8Array,
                     newThreshold_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  incrementSession(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  issueCertificate(context: __compactRuntime.CircuitContext<PS>,
                   expectedSkillId_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  verifyCertificate(context: __compactRuntime.CircuitContext<PS>,
                    claimedCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  revokeCertificate(context: __compactRuntime.CircuitContext<PS>,
                    commitmentToRevoke_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  setIssuerCommitment(context: __compactRuntime.CircuitContext<PS>,
                      newThreshold_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  resetCertification(context: __compactRuntime.CircuitContext<PS>,
                     newSkillId_0: Uint8Array,
                     newThreshold_0: bigint): __compactRuntime.CircuitResults<PS, Uint8Array>;
  incrementSession(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly certificateCount: bigint;
  readonly revokedCount: bigint;
  readonly activeSession: bigint;
  readonly skillId: Uint8Array;
  readonly issuerCommitment: Uint8Array;
  readonly lastCertificationCommitment: Uint8Array;
  readonly lastRevokedCommitment: Uint8Array;
  readonly certificationThreshold: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               initialSkillId_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
