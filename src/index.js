import * as Comlink from 'comlink';
import * as zpSt from 'libzeropool-rs-wasm-web';
import * as zpMt from 'libzeropool-rs-wasm-web-mt';
import * as zpMtZkBob from 'libzeropool-rs-wasm-web-mt-zkbob';

const workerUrl = new URL('./worker.js', import.meta.url);

let libSt;
let libMt;
let libMtZkBob;
let methods;

async function initSt() {
  await zpSt.default(wasmStUrl);
  const state = await zpSt.UserState.init('test');
  const account = new zpSt.UserAccount(new Uint8Array(32), state);

  document.getElementById("start-bench-st")
    .addEventListener("click", benchProofSt);

  libSt = {
    methods,
    account,
  };
}

async function initMt() {
  await zpMt.default(wasmMtUrl);
  const state = await zpMt.UserState.init('test');
  const account = new zpMt.UserAccount(new Uint8Array(32), state);

  document.getElementById("start-bench-mt")
    .addEventListener("click", benchProofMt);

  libMt = {
    methods,
    account,
  };
}

async function initMtZkBob() {
  await zpMtZkBob.default(wasmMtUrl);
  const state = await zpMtZkBob.UserState.init('test');
  const account = new zpMtZkBob.UserAccount(new Uint8Array(32), state);

  document.getElementById("start-bench-mt-zkbob")
    .addEventListener("click", benchProofMtZkBob);

  libMtZkBob = {
    methods,
    account,
  };
}

async function benchProofSt() {
  const txData = await libSt.account.createDeposit({ amount: "1", fee: "0" });
  const time = await libSt.methods.benchProofSt(txData.public, txData.secret);
  document.getElementById("bench-time-st").innerText = `${time}ms`;
}

async function benchProofMt() {
  const txData = await libMt.account.createDeposit({ amount: "1", fee: "0" });
  const time = await libMt.methods.benchProofMt(txData.public, txData.secret);
  document.getElementById("bench-time-mt").innerText = `${time}ms`;
}

async function benchProofMtZkBob() {
  const txData = await libMtZkBob.account.createDeposit({ amount: "1", fee: "0" });
  const time = await methods.benchProofMtZkBob(txData.public, txData.secret);
  document.getElementById("bench-time-mt-zkbob").innerText = `${time}ms`;
}

async function init() {
  console.log('Initializing worker...');
  const worker = new Worker(workerUrl);
  methods = Comlink.wrap(worker);
  await methods.init();
  console.log('Initialization complete.');

  await initSt();
  await initMt();
  await initMtZkBob();
}

init();
