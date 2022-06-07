import { Proof, Params, UserAccount, UserState, default as initWasm } from 'libzeropool-rs-wasm-web';

const wasmUrl = new URL('npm:libzeropool-rs-wasm-web/libzeropool_rs_wasm_bg.wasm', import.meta.url);
const paramsUrl = new URL('../assets/transfer_params.bin', import.meta.url);;

let params, state, account;

async function init(set) {
  await initWasm(wasmUrl);
  const paramsBuf = await fetch(paramsUrl).then(r => r.arrayBuffer());
  params = Params.fromBinary(new Uint8Array(paramsBuf));
  state = await UserState.init('test');
  account = new UserAccount(new Uint8Array(32), state);

  document.getElementById("start-bench")
    .addEventListener("click", benchProof);
}

async function benchProof() {
  console.log("Creating transaction...");
  const txData = await account.createDeposit({ amount: "1", fee: "0" });
  console.log("Generating proof...");
  const time = bench(() => Proof.tx(params, txData.public, txData.secret));

  document.getElementById("bench-time").innerText = `${time}ms`;
}

function bench(func) {
  const start = new Date;
  func();
  const time = (new Date - start);
  console.log(`${time}ms`);
  return time;
}

init();
