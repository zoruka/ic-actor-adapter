import { Actor, ActorSubclass, Agent, HttpAgent } from '@dfinity/agent';
import { IDL } from '@dfinity/candid';
import fetch from 'cross-fetch';

/**
 * Adapter responsible for creating actors.
 * It can receive a provider to identify the actor like a wallet provider (e.g. Plug).
 */
export class ActorAdapter {
  static DEFAULT_WHITELIST: string[] = [];

  static DEFAULT_HOST = 'https://ic0.app/';

  static DEFAULT_PROVIDER: ActorAdapter.Provider | undefined = undefined;

  static ENVIRONMENT = process.env.NODE_ENV ?? 'development';

  static readonly actors: ActorAdapter.Actors = {};

  static readonly anonymousActors: ActorAdapter.AnonymousActors = {};

  private options: ActorAdapter.Options;

  constructor(
    private provider = ActorAdapter.DEFAULT_PROVIDER,
    options: Partial<ActorAdapter.Options> = {}
  ) {
    this.options = {
      host: options.host ?? ActorAdapter.DEFAULT_HOST,
      whitelist: options.whitelist ?? ActorAdapter.DEFAULT_WHITELIST,
    };
  }

  /**
   * Creates a new actor or use from memory if is already created.
   * @param {string} canisterId The canister id of the actor
   * @param {IDL.InterfaceFactory} interfaceFactory The interface factory of the actor
   * @returns {Promise<ActorAdapter.Actor<T>>} The actor
   */
  async createActor<T>(
    canisterId: string,
    interfaceFactory: IDL.InterfaceFactory
  ): Promise<ActorAdapter.Actor<T>> {
    if (ActorAdapter.actors[canisterId]) {
      if (this.provider) {
        const currentAgent = Actor.agentOf(
          ActorAdapter.actors[canisterId].actor
        );
        const providerAgent = this.provider?.agent;

        if (JSON.stringify(currentAgent) === JSON.stringify(providerAgent)) {
          return ActorAdapter.actors[canisterId].actor;
        }
      } else {
        return ActorAdapter.actors[canisterId].actor;
      }
    }

    let actor: ActorSubclass<T>;

    if (!this.provider) {
      actor = await ActorAdapter.createAnonymousActor(
        canisterId,
        interfaceFactory,
        this.options.host
      );
    } else {
      await this.createAgent([canisterId]);
      actor = await this.provider.createActor<T>({
        canisterId,
        interfaceFactory,
      });
    }

    ActorAdapter.actors[canisterId] = { actor, adapter: this };
    return actor;
  }

  /**
   * Creates the agent from provider.
   * @param {string[]} extraWhitelist Extra whitelist to add to the default whitelist
   * @returns {Promise<void>}
   */
  private async createAgent(extraWhitelist: string[] = []): Promise<void> {
    if (this.provider) {
      const whitelistSet = new Set([
        ...this.options.whitelist,
        ...extraWhitelist,
        ...Object.keys(ActorAdapter.actors),
      ]);
      const agent = await this.provider.createAgent({
        whitelist: Array.from(whitelistSet),
        host: this.options.host,
      });

      if (ActorAdapter.ENVIRONMENT === 'development' && agent.fetchRootKey) {
        await agent.fetchRootKey();
      }
    }
  }

  /**
   * Gets the adapter from an actor.
   * @param {Actor} actor The actor
   * @returns {ActorAdapter | undefined} The adapter or undefined if is not existent
   */
  static adapterOf(actor: Actor): ActorAdapter | undefined {
    const canisterId = Actor.canisterIdOf(actor).toString();
    if (ActorAdapter.actors[canisterId]) {
      return ActorAdapter.actors[canisterId].adapter;
    }
  }

  /**
   * Create an anonymous actor.
   * @param {string} canisterId The canister id of the actor
   * @param {IDL.InterfaceFactory} interfaceFactory The interface factory of the actor
   * @param {string=ActorAdapter.DEFAULT_HOST} host The IC host to connect to
   * @returns {Promise<ActorAdapter.Actor<T>>} The anonymous actor
   */
  static async createAnonymousActor<T>(
    canisterId: string,
    interfaceFactory: IDL.InterfaceFactory,
    host = ActorAdapter.DEFAULT_HOST
  ): Promise<ActorAdapter.Actor<T>> {
    if (ActorAdapter.anonymousActors[canisterId]) {
      return ActorAdapter.anonymousActors[canisterId];
    }

    const agent = new HttpAgent({ host, fetch });

    if (this.ENVIRONMENT === 'development') {
      await agent.fetchRootKey();
    }

    const actor = Actor.createActor<T>(interfaceFactory, {
      agent,
      canisterId,
    });

    this.anonymousActors[canisterId] = actor;
    return actor;
  }
}

/**
 * Type definition for the ActorAdapter.
 */
export namespace ActorAdapter {
  /**
   * Agent provider interface.
   */
  export type Provider = {
    agent: Agent | null;
    createActor<T>(params: CreateActorParams<T>): Promise<ActorSubclass<T>>;
    createAgent(params: CreateAgentParams): Promise<Agent>;
  };

  /**
   * Options for the ActorAdapter.
   */
  export type Options = {
    whitelist: string[];
    host: string;
  };

  /**
   * Parameters for creating an actor using the provider.
   */
  export interface CreateActorParams<T> {
    agent?: HttpAgent;
    actor?: ActorSubclass<ActorSubclass<T>>;
    canisterId: string;
    interfaceFactory: IDL.InterfaceFactory;
  }

  /**
   * Parameters for creating an agent using the provider.
   */
  export interface CreateAgentParams {
    whitelist?: string[];
    host?: string;
  }

  /**
   * Parameters for creating an actor using the ActorAdapter.
   */
  export type ActorParams = {
    canisterId?: string;
    interfaceFactory: IDL.InterfaceFactory;
  };

  /**
   * Interface for static stored actors.
   */
  export type Actors = Record<
    string,
    { actor: ActorSubclass<any>; adapter: ActorAdapter }
  >;

  export type AnonymousActors = Record<string, ActorSubclass<any>>;

  /**
   * Return for the createActor function of the ActorAdapter.
   */
  export type Actor<T> = ActorSubclass<T>;
}
