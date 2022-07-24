import { DIP20 } from '@/common-idls';
import { ActorAdapter } from '..';

export const createDIP20Actor = (
  canisterId: string
): Promise<DIP20.Factory> => {
  const actor = new ActorAdapter();
  return actor.createActor(canisterId, DIP20.factory);
};

export const createAnonDIP20Actor = (canisterId: string): DIP20.Factory => {
  return ActorAdapter.createAnonymousActor(canisterId, DIP20.factory);
};
