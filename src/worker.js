import * as Comlink from 'comlink';
import * as zpSt from 'libzeropool-rs-wasm-web';
import * as zpMt from 'libzeropool-rs-wasm-web-mt';
// const wasmUrl = new URL('npm:libzeropool-rs-wasm-web-mt/libzeropool_rs_wasm_bg.wasm', import.meta.url);
const paramsUrl = new URL('../assets/transfer_params.bin', import.meta.url);

let paramsSt, paramsMt;

async function init() {
  console.log('worker: init')
  await zpSt.default();
  await zpMt.default();
  await zpMt.initThreadPool(navigator.hardwareConcurrency);
  const paramsBuf = await fetch(paramsUrl).then(r => r.arrayBuffer());
  paramsSt = zpSt.Params.fromBinary(new Uint8Array(paramsBuf));
  paramsMt = zpMt.Params.fromBinary(new Uint8Array(paramsBuf));
  console.log('worker: init done');
}


async function benchProofSt(pub, sec) {
  console.log('worker: bench st start');
  return bench(() => zpSt.Proof.tx(paramsSt, pub, sec));
}

async function benchProofMt(pub, sec) {
  console.log('worker: bench mt start');
  return bench(() => zpMt.Proof.tx(paramsMt, pub, sec));
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
  benchProofMt,
  benchProofSt,
});
