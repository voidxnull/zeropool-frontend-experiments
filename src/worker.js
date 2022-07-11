import * as Comlink from 'comlink';
import * as zpSt from 'libzeropool-rs-wasm-web';
import * as zpMt from 'libzeropool-rs-wasm-web-mt';
import * as zpMtZkBob from 'libzeropool-rs-wasm-web-mt-zkbob';
const wasmUrl = new URL('npm:libzeropool-rs-wasm-web-mt/libzeropool_rs_wasm_bg.wasm', import.meta.url);
const paramsUrl = new URL('../assets/transfer_params.bin', import.meta.url);

let paramsSt, paramsMt, paramsMtZkBob;

async function init() {
  await zpSt.default();
  await zpMt.default();
  await zpMtZkBob.default();
  await zpMt.initThreadPool(navigator.hardwareConcurrency);
  await zpMtZkBob.initThreadPool(navigator.hardwareConcurrency);
  const paramsBuf = await fetch(paramsUrl).then(r => r.arrayBuffer());
  paramsSt = Params.fromBinary(new Uint8Array(paramsBuf));
  paramsMt = Params.fromBinary(new Uint8Array(paramsBuf));
  paramsMtZkBob = Params.fromBinary(new Uint8Array(paramsBuf));
}


async function benchProofSt(pub, sec) {
  const time = bench(() => zpSt.Proof.tx(paramsSt, pub, sec));
  return time;
}

async function benchProofMt(pub, sec) {
  const time = bench(() => zpMt.Proof.tx(paramsMt, pub, sec));
  return time;
}

async function benchProofMtZkBob() {
  const time = bench(() => zpMtZkBob.Proof.tx(paramsMtZkBob));
  return time;
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
  benchProofMtZkBob,
});
