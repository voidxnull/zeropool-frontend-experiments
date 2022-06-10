import * as Comlink from 'comlink';
import * as zpSt from 'libzeropool-rs-wasm-web';
import * as zpMt from 'libzeropool-rs-wasm-web-mt';
const wasmStUrl = new URL('npm:libzeropool-rs-wasm-web/libzeropool_rs_wasm_bg.wasm', import.meta.url);
const wasmMtUrl = new URL('npm:libzeropool-rs-wasm-web-mt/libzeropool_rs_wasm_bg.wasm', import.meta.url);
const workerStUrl = new URL('./workerSt.js', import.meta.url, { type: "module" });
const workerMtUrl = new URL('./workerMt.js', import.meta.url, { type: "module" });
const paramsUrl = new URL('../assets/transfer_params.bin', import.meta.url);

let libSt = {};
let libMt = {};

async function initSt() {
  console.log('Initializing singlethread worker...');
  const worker = new Worker(workerStUrl);
  const methods = Comlink.wrap(worker);
  await methods.init();
  console.log('Initialization complete.');

  await zpSt.default(wasmStUrl);
  const paramsBuf = await fetch(paramsUrl).then(r => r.arrayBuffer());
  const params = zpSt.Params.fromBinary(new Uint8Array(paramsBuf));
  const state = await zpSt.UserState.init('test');
  const account = new zpSt.UserAccount(new Uint8Array(32), state);

  document.getElementById("start-bench-st")
    .addEventListener("click", benchProofSt);

  libSt = {
    methods,
    params,
    state,
    account,
  };
}

async function initMt() {
  console.log('Initializing multithread worker...');
  const worker = new Worker(workerMtUrl);
  const methods = Comlink.wrap(worker);
  await methods.init();
  console.log('Initialization complete.');

  await zpMt.default(wasmMtUrl);
  const paramsBuf = await fetch(paramsUrl).then(r => r.arrayBuffer());
  const params = zpMt.Params.fromBinary(new Uint8Array(paramsBuf));
  const state = await zpMt.UserState.init('test');
  const account = new zpMt.UserAccount(new Uint8Array(32), state);

  document.getElementById("start-bench-mt")
    .addEventListener("click", benchProofMt);

  libMt = {
    methods,
    params,
    state,
    account,
  };
}

async function benchProofSt() {
  const txData = await libSt.account.createDeposit({ amount: "1", fee: "0" });
  const time = await libSt.methods.benchProof(txData.public, txData.secret);
  document.getElementById("bench-time-st").innerText = `${time}ms`;
}

async function benchProofMt() {
  const txData = await libMt.account.createDeposit({ amount: "1", fee: "0" });
  const time = await libMt.methods.benchProof(txData.public, txData.secret);
  document.getElementById("bench-time-mt").innerText = `${time}ms`;
}

async function init() {
  await initSt();
  await initMt();
}

init();
