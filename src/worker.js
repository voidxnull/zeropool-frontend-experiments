import * as Comlink from 'comlink';
import * as zpMt from 'libzeropool-rs-wasm-web-mt';
import * as zkBob from 'libzkbob-rs-wasm-web-mt';
const paramsUrl = new URL('../assets/transfer_params.bin', import.meta.url);

let params = {
  mt: null,
  bob: null,
}

function selectBackend(backendName) {
  if (backendName === 'mt') {
    return zpMt;
  } else if (backendName === 'bob') {
    return zkBob;
  } else {
    throw new Error(`unknown backend ${backendName}`);
  }
}

async function init(backendName) {
  console.log(`worker: init ${backendName}`)

  const lib = selectBackend(backendName);

  try {
    await lib.default(undefined, new WebAssembly.Memory({ initial: 64, maximum: 4096, shared: true }));
    await lib.initThreadPool(navigator.hardwareConcurrency);
  } catch (e) {
    console.error(e);
    throw e;
  }

  const paramsBuf = await fetch(paramsUrl).then(r => r.arrayBuffer());

  params[backendName] = lib.Params.fromBinary(new Uint8Array(paramsBuf));

  console.log(`worker: init ${backendName} done`);
}

async function benchProof(backendName, pub, sec) {
  console.log('worker: bench mt start');

  const lib = selectBackend(backendName);

  console.log('proving bob', pub, sec);

  zkBob.Proof

  return bench(() => lib.Proof.tx(params[backendName], pub, sec));
}

function bench(func) {
  const start = new Date;
  func();
  const time = (new Date - start);
  console.log(`${time}ms`);
  return time;
}

Comlink.expose({
  init,
  benchProof,
});
