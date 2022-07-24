/* eslint-disable @typescript-eslint/no-var-requires */
const { Principal } = require('@dfinity/principal');
const { ActorAdapter } = require('ic-actor-adapter');
const { TokenIDL } = require('./token.js');

const WICP_CANISTER_ID = 'utozz-siaaa-aaaam-qaaxq-cai';
const WALLET_PRINCIPAL = Principal.fromText(
  'lkqmh-5vihe-t5x5j-smuot-vitei-tgfyx-losfh-bbud4-fp2rq-353dj-yqe'
);

// Create WICP anonymous actor
const actor = ActorAdapter.createAnonymousActor(
  WICP_CANISTER_ID,
  TokenIDL.factory
);

// Get Principal balance and print it
actor.balanceOf(WALLET_PRINCIPAL).then(console.log);
