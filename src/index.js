import * as Comlink from 'comlink';
import * as zpMt from 'libzeropool-rs-wasm-web-mt';
import * as zkBob from 'libzkbob-rs-wasm-web-mt';

let worker;

function selectBackend(backendName) {
  if (backendName === 'mt') {
    return zpMt;
  } else if (backendName === 'bob') {
    return zkBob;
  } else {
    throw new Error(`unknown backend ${backendName}`);
  }
}

function setButtonInProgress(id, inProgress) {
  const button = document.getElementById(id);
  button.disabled = inProgress;
  button.setAttribute('aria-busy', inProgress);
}

function enableButton(id) {
  const button = document.getElementById(id);
  button.disabled = false;
}

function disableButton(id) {
  const button = document.getElementById(id);
  button.disabled = true;
}


async function initLib(backendName) {
  const lib = selectBackend(backendName);
  const initButton = `init-${backendName}`;
  const startButton = `start-bench-${backendName}`;
  const timeElement = `bench-time-${backendName}`;

  let account

  document.getElementById(initButton)
    .addEventListener('click', async () => {
      setButtonInProgress(initButton, true);

      await lib.default(undefined, new WebAssembly.Memory({ initial: 64, maximum: 4096, shared: true }));
      const state = await lib.UserState.init(`test-${backendName}`);

      if (backendName === 'mt') {
        account = new lib.UserAccount(new Uint8Array(32), state);
      } else if (backendName === 'bob') {
        account = new lib.UserAccount(new Uint8Array(32), 0, state, 'test');
      }

      await worker.init(backendName);

      setButtonInProgress(initButton, false);
      disableButton(initButton);
      enableButton(startButton);
    });

  document.getElementById(startButton)
    .addEventListener('click', async () => {
      setButtonInProgress(startButton, true);
      const txData = await account.createDeposit({ amount: '1', fee: '0', outputs: [] });
      const time = await worker.benchProof(backendName, txData.public, txData.secret);
      document.getElementById(timeElement).innerText = `${time}ms`;
      setButtonInProgress(startButton, false);
    });
}

async function init() {
  const w = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  worker = Comlink.wrap(w);

  await initLib('mt');
  await initLib('bob');


  // const buttons = document.querySelectorAll('.bench-button');
  // buttons.forEach((button) => {
  //   setButtonInProgress(button.id, false);
  // });

}

init();
