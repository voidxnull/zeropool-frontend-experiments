import * as Comlink from 'comlink';
import { default as initWasm, Params, UserState, UserAccount } from 'libzeropool-rs-wasm-web';
const wasmUrl = new URL('npm:libzeropool-rs-wasm-web/libzeropool_rs_wasm_bg.wasm', import.meta.url);
const paramsUrl = new URL('../assets/transfer_params.bin', import.meta.url);
const workerUrl = new URL('./worker.js', import.meta.url, { type: "module" });

let methods, params, state, account;

async function init() {
  console.log('Initializing worker...');
  const worker = new Worker(workerUrl);
  methods = Comlink.wrap(worker);
  await methods.init();
  console.log('Initialization complete.');

  await initWasm(wasmUrl);
  const paramsBuf = await fetch(paramsUrl).then(r => r.arrayBuffer());
  params = Params.fromBinary(new Uint8Array(paramsBuf));
  state = await UserState.init('test');
  account = new UserAccount(new Uint8Array(32), state);

  document.getElementById("start-bench")
    .addEventListener("click", benchProof);
}

async function benchProof() {
  const txData = await account.createDeposit({ amount: "1", fee: "0" });
  const time = await methods.benchProofMulticore(txData.public, txData.secret);
  document.getElementById("bench-time").innerText = `${time}ms`;
}

init();
