export interface Metadata {
  userId: string;
  subscriptions: Set<string>;
}

export interface ConnectionMetadata extends Metadata {
  clientId: string;
}