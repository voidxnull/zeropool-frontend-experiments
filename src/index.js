import * as Comlink from 'comlink';
import * as zpSt from 'libzeropool-rs-wasm-web';
import * as zpMt from 'libzeropool-rs-wasm-web-mt';

let libSt;
let libMt;
let methods;

function setButton(id, inProgress) {
  const button = document.getElementById(id);
  button.disabled = inProgress;
  button.setAttribute('aria-busy', inProgress);
}

async function initSt() {
  await zpSt.default();
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
  await zpMt.default();
  const state = await zpMt.UserState.init('test');
  const account = new zpMt.UserAccount(new Uint8Array(32), state);

  document.getElementById("start-bench-mt")
    .addEventListener("click", benchProofMt);

  libMt = {
    methods,
    account,
  };
}

async function benchProofSt() {
  console.log('bench st');
  setButton('start-bench-st', true);
  const txData = await libSt.account.createDeposit({ amount: "1", fee: "0", outputs: [] });
  const time = await libSt.methods.benchProofSt(txData.public, txData.secret);
  document.getElementById("bench-time-st").innerText = `${time}ms`;
  setButton('start-bench-st', false);
}

async function benchProofMt() {
  console.log('bench mt');
  setButton('start-bench-mt', true);
  const txData = await libMt.account.createDeposit({ amount: "1", fee: "0", outputs: [] });
  const time = await libMt.methods.benchProofMt(txData.public, txData.secret);
  document.getElementById("bench-time-mt").innerText = `${time}ms`;
  setButton('start-bench-mt', false);
}

async function init() {
  console.log('Initializing worker...');
  const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  methods = Comlink.wrap(worker);
  await methods.init();
  console.log('Initialization complete.');

  console.log('Initializing wasm libraries');
  await initSt();
  await initMt();
  console.log('Initialization complete.');

  const buttons = document.querySelectorAll('.bench-button');
  buttons.forEach((button) => {
    setButton(button.id, false);
  });

}

init();
