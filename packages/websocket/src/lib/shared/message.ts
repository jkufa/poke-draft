import { ReceiverKey } from "../server/receivers";

export interface Message<T> {
  type: ReceiverKey;
  status: 'success' | 'error';
  message: string;
  data: T;
}