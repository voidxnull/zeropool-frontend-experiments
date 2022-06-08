import * as Comlink from 'comlink';
import { default as initWasm, initThreadPool, Params, Proof } from 'libzeropool-rs-wasm-web';
const wasmUrl = new URL('npm:libzeropool-rs-wasm-web/libzeropool_rs_wasm_bg.wasm', import.meta.url);
const paramsUrl = new URL('../assets/transfer_params.bin', import.meta.url);

let params;
// self.Window = class Window {
//   init() { }
// };

async function init() {
  await initWasm(wasmUrl);
  await initThreadPool(navigator.hardwareConcurrency);
  const paramsBuf = await fetch(paramsUrl).then(r => r.arrayBuffer());
  params = Params.fromBinary(new Uint8Array(paramsBuf));
}

async function benchProofMulticore(pub, sec) {
  const time = bench(() => Proof.tx(params, pub, sec));
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
  benchProofMulticore,
});
