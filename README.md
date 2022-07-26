<h1 align="center">IC Actor Adapter</h1>

<h3 align="center">A code snippet to handle agents and actors for Internet Computer</h3>

# Install

```bash
# with npm
npm i ic-actor-adapter @dfinity/agent @dfinity/candid

# with yarn
yarn add ic-actor-adapter @dfinity/agent @dfinity/candid
```

# Usage

## Agent and Actor

To talk with Internet Computer we need to create `actors` that communicate with canisters. To create `actors` we need to first setup an `agent` that indicates who and how the communication to the Internet Computer netowkr is going to be realized. This library provides some functions that help to establish communication with Swap Canister and DIP20 token canisters by abstracting away `actors` creation.

### Actor Adapter

The class `ActorAdapter` provides an abstraction of [@dfinity/agent](https://www.npmjs.com/package/@dfinity/agent) that helps to instantiate new actors and reuse them.

The class constructor has params to configure how you want to use the adapter:

- `provider`: This param receives an object that is used to create `agent` and `actors`. The object needs to follow the interface `ActorAdapter.Provider`. We highly recommended using [@psychedelic/plug-inpage-provider](https://github.com/Psychedelic/plug-inpage-provider/packages/884575) if you want to instantiate actors linked to a user:

```ts
const adapter = new ActorAdapter(window.ic.plug);
```

- `options`: This param is used for selecting some settings of network host and whitelisting canister ids. It follows the interface `ActorAdapter.Options`:

```ts
const adapter = new ActorAdapter(window.ic.plug, {
  host: 'https://boundary.ic0.app/',
  whitelist: ['3xwpq-ziaaa-aaaah-qcn4a-cai'],
});
```

You can also use default parameters and no provider:

```ts
const adapter = new ActorAdapter();
```

### Create Actor

After instantiating one adapter you can create different actors, but only one instance for each canister id will be stored. In case of identity changing, a new instance of the actor will overwrite the previous one. If no identity provider is given, all the actors will be anonymous.

```ts
const adapter = new ActorAdapter();
const actor = await adapter.createActor<ActorInterface>(
  canisterId,
  interfaceFactory
);
```

### Anonymous Actor

In some situations is not required to have the identity attached to your request (e.g. data querying). In these cases you can use anonymous actors avoiding the request of user permissions.

```ts
const actor = await ActorAdapter.createAnonymousActor(
  canisterId,
  interfaceFactory
);
```

## Default Parameters

The `ActorAdapter` class provides some static variables to customize the default parameters used for Actor creation. These parameters can be set at initial files of your application following:

```ts
import { ActorAdapter } from 'ic-actor-adapter';

ActorAdapter.DEFAULT_WHITELIST = [
  'fterm-bydaq-aaaaa-aaaaa-cai',
  'xhtzz-gijaq-aaaaa-aaaaa-cai',
];

ActorAdapter.DEFAULT_HOST = 'https://localhost:8000';

ActorAdapter.ENVIRONMENT = 'development';

ActorAdapter.DEFAULT_PROVIDER = window.ic?.plug;
```

### The `ENVIRONMENT` parameter

The `ActorAdapter.ENVIRONMENT` is used for determinate instructions that fixes the development in a local replica. For default it takes the value of `process.env.NODE_ENV`. If NODE_ENV is not present, the default value is going to be `development`. Is highly recommended to change it to something else (e.g. `production`) when your application is not under development mode.

## Common IDLs and Factories

The most used IDLs through the IC projects will be added on [common-idls](/src/common-idls/) folder. Code snippets for using those IDLs on Actors will be added on [factory](/src/factory) folder. Those pieces of code are added to reduce the amount of code created on your app and speed up the development.
