(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))a(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const d of o.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&a(d)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();const O={success:"✅",error:"❌",warning:"⚠️",info:"ℹ️"},j={success:"Berhasil",error:"Error",warning:"Peringatan",info:"Info"};function i(e,n="info",t=4e3){const a=document.getElementById("toast-container");if(!a)return;const r=document.createElement("div");r.className=`toast ${n}`,r.innerHTML=`
        <span class="toast-icon">${O[n]}</span>
        <div class="toast-body">
            <div class="toast-title">${j[n]}</div>
            <div class="toast-message">${e}</div>
        </div>
    `,a.appendChild(r),setTimeout(()=>{r.classList.add("removing"),setTimeout(()=>r.remove(),300)},t)}function $(e="Processing..."){const n=document.getElementById("loading-overlay"),t=document.getElementById("loading-text");n&&(n.classList.remove("hidden"),t&&(t.textContent=e))}function x(){const e=document.getElementById("loading-overlay");e&&e.classList.add("hidden")}function C(e){const n={};for(const[t,a]of Object.entries(e)){const{value:r,rules:o}=a;if(o.required&&(!r||r.trim()==="")){n[t]=`${t} wajib diisi`;continue}if(o.minLength&&r.length<o.minLength){n[t]=`${t} minimal ${o.minLength} karakter`;continue}if(o.maxLength&&r.length>o.maxLength){n[t]=`${t} maksimal ${o.maxLength} karakter`;continue}if(o.match&&r!==o.match.value){n[t]=o.match.message||`${t} tidak cocok`;continue}o.pattern&&!o.pattern.test(r)&&(n[t]=o.patternMessage||`${t} format tidak valid`)}return{valid:Object.keys(n).length===0,errors:n}}function m(e,n){const t=document.getElementById(e);if(!t)return;t.classList.add("error");const a=t.parentElement.querySelector(".form-error");a&&a.remove();const r=document.createElement("div");r.className="form-error",r.textContent=n,t.parentElement.appendChild(r)}function k(e){const n=document.getElementById(e);n&&(n.querySelectorAll(".form-input.error").forEach(t=>{t.classList.remove("error")}),n.querySelectorAll(".form-error").forEach(t=>{t.remove()}))}function z(e){return e?`${e.slice(0,6)}...${e.slice(-4)}`:""}const I="zkp_auth_session",B="zkp_auth_users";function P(e){sessionStorage.setItem(I,JSON.stringify(e))}function D(){const e=sessionStorage.getItem(I);return e?JSON.parse(e):null}function Z(){sessionStorage.removeItem(I)}function q(e){const n=L();n[e.username]=e,localStorage.setItem(B,JSON.stringify(n))}function L(){const e=localStorage.getItem(B);return e?JSON.parse(e):{}}async function _(e){const t=new TextEncoder().encode(e),a=await crypto.subtle.digest("SHA-256",t);return Array.from(new Uint8Array(a)).map(o=>o.toString(16).padStart(2,"0")).join("")}const f={chainId:"0xaa36a7",chainName:"Sepolia Testnet",rpcUrls:["https://rpc.sepolia.org"],blockExplorerUrls:["https://sepolia.etherscan.io"],nativeCurrency:{name:"SepoliaETH",symbol:"ETH",decimals:18}},S="0x1b5771B964444CEE4836E0c630e66E90AFc61618",A="/zkp/auth.wasm",N="/zkp/auth_final.zkey",J=BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617"),W=[{inputs:[{internalType:"string",name:"_username",type:"string"},{internalType:"uint256",name:"_commitment",type:"uint256"}],name:"register",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"string",name:"_username",type:"string"},{internalType:"uint[2]",name:"_pA",type:"uint256[2]"},{internalType:"uint[2][2]",name:"_pB",type:"uint256[2][2]"},{internalType:"uint[2]",name:"_pC",type:"uint256[2]"},{internalType:"uint[1]",name:"_pubSignals",type:"uint256[1]"}],name:"login",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"string",name:"_username",type:"string"}],name:"getUser",outputs:[{internalType:"bool",name:"isRegistered",type:"bool"},{internalType:"uint256",name:"commitment",type:"uint256"},{internalType:"uint256",name:"registeredAt",type:"uint256"},{internalType:"uint256",name:"loginCount",type:"uint256"},{internalType:"uint256",name:"lastLogin",type:"uint256"},{internalType:"address",name:"registeredBy",type:"address"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"string",name:"_username",type:"string"}],name:"isUserRegistered",outputs:[{internalType:"bool",name:"",type:"bool"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"string",name:"_username",type:"string"}],name:"getCommitment",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{inputs:[],name:"totalUsers",outputs:[{internalType:"uint256",name:"",type:"uint256"}],stateMutability:"view",type:"function"},{anonymous:!1,inputs:[{indexed:!0,internalType:"string",name:"username",type:"string"},{indexed:!1,internalType:"uint256",name:"commitment",type:"uint256"},{indexed:!0,internalType:"address",name:"wallet",type:"address"},{indexed:!1,internalType:"uint256",name:"timestamp",type:"uint256"}],name:"UserRegistered",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"string",name:"username",type:"string"},{indexed:!0,internalType:"address",name:"wallet",type:"address"},{indexed:!1,internalType:"uint256",name:"loginCount",type:"uint256"},{indexed:!1,internalType:"uint256",name:"timestamp",type:"uint256"}],name:"UserLoggedIn",type:"event"}];function F(e){const n=window.ethers;if(!n)throw new Error("ethers.js belum dimuat!");const t=n.keccak256(n.toUtf8Bytes(e));return(BigInt(t)%J).toString()}async function R(e){const n=window.snarkjs;if(!n)throw new Error("snarkjs belum dimuat! Pastikan CDN script loaded.");const t=F(e);console.log("🔐 Secret (field element):",t.substring(0,20)+"..."),console.log("⏳ Generating ZK proof...");const{proof:a,publicSignals:r}=await n.groth16.fullProve({secret:t},A,N);return console.log("✅ Proof generated!"),console.log("📊 Commitment (public signal):",r[0]),{proof:a,publicSignals:r,commitment:r[0]}}function V(e,n){return{pA:[e.pi_a[0],e.pi_a[1]],pB:[[e.pi_b[0][1],e.pi_b[0][0]],[e.pi_b[1][1],e.pi_b[1][0]]],pC:[e.pi_c[0],e.pi_c[1]],pubSignals:[n[0]]}}async function Y(){try{const[e,n]=await Promise.all([fetch(A,{method:"HEAD"}),fetch(N,{method:"HEAD"})]);return e.ok&&n.ok}catch{return!1}}let v=null,w=null,h=null,u=null;function G(){return typeof window.ethereum<"u"&&window.ethereum.isMetaMask}async function U(){if(!G())throw new Error("MetaMask belum terinstall! Silakan install di metamask.io");const e=window.ethers;if(!e)throw new Error("ethers.js belum dimuat!");try{const n=await window.ethereum.request({method:"eth_requestAccounts"});if(!n||n.length===0)throw new Error("Tidak ada akun yang dipilih");return v=new e.BrowserProvider(window.ethereum),w=await v.getSigner(),u=n[0],await Q(),X(),console.log("🦊 MetaMask connected:",u),u}catch(n){throw n.code===4001?new Error("Koneksi MetaMask ditolak oleh user"):n}}function y(){return u}function E(){return u!==null}async function Q(){try{await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:f.chainId}]})}catch(e){if(e.code===4902)await window.ethereum.request({method:"wallet_addEthereumChain",params:[{chainId:f.chainId,chainName:f.chainName,rpcUrls:f.rpcUrls,blockExplorerUrls:f.blockExplorerUrls,nativeCurrency:f.nativeCurrency}]});else throw e}}async function H(){if(!v)return null;try{const e=await v.getNetwork();return{chainId:e.chainId.toString(),name:e.name}}catch{return null}}function X(){const e=window.ethers;!e||!w||(h=new e.Contract(S,W,w),console.log("📄 Contract connected at:",S))}async function ee(e,n){if(!h)throw new Error("Contract belum terhubung! Pastikan MetaMask connected dan contract address sudah di-set.");console.log("📝 Registering on-chain..."),console.log("  Username:",e),console.log("  Commitment:",n);try{const t=await h.register(e,n);console.log("⏳ Transaction sent:",t.hash),i(`Transaction sent! Hash: ${t.hash.substring(0,10)}...`,"info");const a=await t.wait();return console.log("✅ Transaction confirmed!",a),{hash:t.hash,blockNumber:a.blockNumber,gasUsed:a.gasUsed.toString()}}catch(t){throw console.error("❌ Register failed:",t),t.reason?new Error(`Register gagal: ${t.reason}`):t.code==="ACTION_REJECTED"?new Error("Transaksi ditolak oleh user"):t}}async function ne(e,n){if(!h)throw new Error("Contract belum terhubung! Pastikan MetaMask connected dan contract address sudah di-set.");console.log("🔐 Login on-chain with ZKP...");try{const t=await h.login(e,n.pA,n.pB,n.pC,n.pubSignals);console.log("⏳ Login transaction sent:",t.hash),i(`Verifying proof on-chain... Hash: ${t.hash.substring(0,10)}...`,"info");const a=await t.wait();return console.log("✅ Login verified on-chain!",a),{hash:t.hash,blockNumber:a.blockNumber,gasUsed:a.gasUsed.toString()}}catch(t){throw console.error("❌ Login failed:",t),t.reason?new Error(`Login gagal: ${t.reason}`):t.code==="ACTION_REJECTED"?new Error("Transaksi ditolak oleh user"):t}}function te(e,n){window.ethereum&&(window.ethereum.on("accountsChanged",t=>{t.length===0?(u=null,v=null,w=null,h=null,i("Wallet disconnected","warning")):(u=t[0],i(`Account changed: ${u.substring(0,8)}...`,"info")),e&&e(u)}),window.ethereum.on("chainChanged",()=>{i("Network changed. Reloading...","warning"),setTimeout(()=>window.location.reload(),1500)}))}function K(){const e=document.getElementById("console-output");e&&(e.innerHTML="",e.classList.remove("active"))}function s(e,n="info"){const t=document.getElementById("console-output");if(t){t.classList.add("active");const a=document.createElement("p");a.className=`term-${n}`,a.textContent=`> ${e}`,t.appendChild(a),t.scrollTop=t.scrollHeight}}function T(e,n,t){return`
        <div class="auth-widget">
            <div class="widget-header">
                <div class="brand">
                    <div class="brand-icon">NA</div>
                    <h1>Nazril Azzam</h1>
                </div>
                
                <div class="method-tabs">
                    <a href="#/konvensional/login" class="method-tab ${e==="konvensional"?"active":""}">Konvensional</a>
                    <a href="#/zkp/login" class="method-tab ${e==="zkp"?"active":""}">Zero-Knowledge</a>
                </div>

                <div class="action-tabs">
                    <a href="#/${e}/login" class="action-tab ${n==="login"?"active":""}">Login</a>
                    <a href="#/${e}/register" class="action-tab ${n==="register"?"active":""}">Register</a>
                </div>
            </div>
            
            <div class="widget-body">
                ${t}
            </div>
        </div>
    `}function ae(){return T("konvensional","register",`
        <form id="form-conv-register">
            <div class="form-group">
                <label class="form-label" for="conv-reg-name">Nama Lengkap</label>
                <input class="form-input" type="text" id="conv-reg-name" placeholder="John Doe">
            </div>
            <div class="form-group">
                <label class="form-label" for="conv-reg-username">Username</label>
                <input class="form-input" type="text" id="conv-reg-username" placeholder="johndoe">
            </div>
            <div class="form-group">
                <label class="form-label" for="conv-reg-password">Password</label>
                <input class="form-input" type="password" id="conv-reg-password" placeholder="••••••••">
            </div>
            <div class="form-group">
                <label class="form-label" for="conv-reg-confirm">Konfirmasi Password</label>
                <input class="form-input" type="password" id="conv-reg-confirm" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary">Daftar Akun Konvensional</button>
        </form>
    `)}function M(){return T("konvensional","login",`
        <form id="form-conv-login">
            <div class="form-group">
                <label class="form-label" for="conv-login-username">Username</label>
                <input class="form-input" type="text" id="conv-login-username" placeholder="johndoe">
            </div>
            <div class="form-group">
                <label class="form-label" for="conv-login-password">Password</label>
                <input class="form-input" type="password" id="conv-login-password" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary">Masuk</button>
        </form>
    `)}function re(){const n=`
        ${E()?`<button type="button" class="btn btn-wallet connected" id="btn-connect-wallet">
               <span class="status-dot"></span> ${z(y())}
           </button>`:`<button type="button" class="btn btn-wallet" id="btn-connect-wallet">
               Hubungkan MetaMask
           </button>`}
        <form id="form-zkp-register">
            <div class="form-group">
                <label class="form-label" for="zkp-reg-name">Nama Lengkap</label>
                <input class="form-input" type="text" id="zkp-reg-name" placeholder="John Doe">
            </div>
            <div class="form-group">
                <label class="form-label" for="zkp-reg-username">Username</label>
                <input class="form-input" type="text" id="zkp-reg-username" placeholder="johndoe">
            </div>
            <div class="form-group">
                <label class="form-label" for="zkp-reg-password">Password</label>
                <input class="form-input" type="password" id="zkp-reg-password" placeholder="••••••••">
                <div class="form-hint">Akan di-hash lokal, tidak dikirim ke blockchain.</div>
            </div>
            <div class="form-group">
                <label class="form-label" for="zkp-reg-confirm">Konfirmasi Password</label>
                <input class="form-input" type="password" id="zkp-reg-confirm" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary">Registrasi di Blockchain</button>
        </form>
        <div id="console-output" class="terminal-box"></div>
    `;return T("zkp","register",n)}function oe(){const n=`
        ${E()?`<button type="button" class="btn btn-wallet connected" id="btn-connect-wallet">
               <span class="status-dot"></span> ${z(y())}
           </button>`:`<button type="button" class="btn btn-wallet" id="btn-connect-wallet">
               Hubungkan MetaMask
           </button>`}
        <form id="form-zkp-login">
            <div class="form-group">
                <label class="form-label" for="zkp-login-username">Username</label>
                <input class="form-input" type="text" id="zkp-login-username" placeholder="johndoe">
            </div>
            <div class="form-group">
                <label class="form-label" for="zkp-login-password">Password</label>
                <input class="form-input" type="password" id="zkp-login-password" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary">Generate Proof & Login</button>
        </form>
        <div id="console-output" class="terminal-box"></div>
    `;return T("zkp","login",n)}function se(e){const n=e.method==="zkp";return`
        <div class="dashboard-widget" style="max-width: 700px;">
            <div class="dash-header">
                <div class="brand">
                    <div class="brand-icon">NA</div>
                    <h1>Nazril Azzam</h1>
                </div>
                <button class="btn-logout" id="btn-logout">Keluar (Logout)</button>
            </div>

            <div style="background: var(--bg-input); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 24px; display: flex; gap: 16px; align-items: flex-start;">
                <div style="background: var(--brand-light); color: var(--brand-primary); padding: 12px; border-radius: var(--radius-sm);">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
                <div>
                    <h2 style="font-size: 1.2rem; font-weight: 700; color: var(--text-heading); margin-bottom: 8px;">Selamat Datang, ${e.username||e.name}!</h2>
                    <p style="color: var(--text-body); font-size: 0.9rem;">Anda berhasil masuk dengan verifikasi ${n?"Zero-Knowledge Proof di blockchain Sepolia":"Konvensional"}.</p>
                </div>
            </div>

            <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 24px;">
                <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-heading); margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                    Detail Akun On-Chain
                </h3>
                
                <div class="info-list" style="gap: 0;">
                    <div class="info-item" style="border: none; border-bottom: 1px solid var(--border-subtle); border-radius: 0; padding: 16px 0;">
                        <span class="info-label">Nama Lengkap</span>
                        <span class="info-value">${e.name||e.username}</span>
                    </div>
                    <div class="info-item" style="border: none; border-bottom: 1px solid var(--border-subtle); border-radius: 0; padding: 16px 0;">
                        <span class="info-label">Username</span>
                        <span class="info-value">${e.username}</span>
                    </div>
                    <div class="info-item" style="border: none; border-bottom: 1px solid var(--border-subtle); border-radius: 0; padding: 16px 0;">
                        <span class="info-label">Metode Registrasi</span>
                        <span class="badge ${n?"badge-zkp":"badge-conv"}">${n?"Zero-Knowledge Proof":"Konvensional"}</span>
                    </div>
                    ${n?`
                    <div class="info-item" style="border: none; border-bottom: 1px solid var(--border-subtle); border-radius: 0; padding: 16px 0;">
                        <span class="info-label">Jaringan</span>
                        <span class="badge" style="background: var(--brand-light); color: var(--brand-primary);">Sepolia Testnet</span>
                    </div>
                    <div class="info-item" style="border: none; padding: 16px 0;">
                        <span class="info-label">Smart Contract</span>
                        <span class="info-value mono">${z(S)}</span>
                    </div>
                    `:""}
                </div>
            </div>
        </div>
    `}function ie(){return(window.location.hash||"#/").replace("#","")}function p(e){window.location.hash=`#${e}`}function b(){const e=document.getElementById("app");if(!e)return;let n=ie();if(n==="/"||n===""){p("/konvensional/login");return}const t=D();if(n.includes("/dashboard")&&!t){p("/konvensional/login");return}let a="";switch(n){case"/konvensional/register":a=ae();break;case"/konvensional/login":a=M();break;case"/zkp/register":a=re();break;case"/zkp/login":a=oe();break;case"/konvensional/dashboard":case"/zkp/dashboard":a=se(t||{});break;default:a=M();break}e.innerHTML=a,le(n)}function le(e){e==="/konvensional/register"&&ce(),e==="/konvensional/login"&&de(),e==="/zkp/register"&&ue(),e==="/zkp/login"&&me(),e.includes("/dashboard")&&document.getElementById("btn-logout")?.addEventListener("click",()=>{Z(),p("/konvensional/login")})}function ce(){document.getElementById("form-conv-register")?.addEventListener("submit",async e=>{e.preventDefault(),k("form-conv-register");const n=document.getElementById("conv-reg-name").value.trim(),t=document.getElementById("conv-reg-username").value.trim(),a=document.getElementById("conv-reg-password").value,r=document.getElementById("conv-reg-confirm").value,{valid:o,errors:d}=C({name:{value:n,rules:{required:!0}},username:{value:t,rules:{required:!0,minLength:3}},password:{value:a,rules:{required:!0,minLength:6}},confirm:{value:r,rules:{required:!0,match:{value:a,message:"Tidak cocok"}}}});if(!o){for(const[l,g]of Object.entries(d))m(`conv-reg-${l}`,g);return}if(L()[t]){m("conv-reg-username","Username sudah terdaftar");return}$("Menyimpan data...");try{const l=await _(a);q({name:n,username:t,passwordHash:l,method:"konvensional"}),i("Registrasi berhasil!","success"),setTimeout(()=>p("/konvensional/login"),1e3)}catch(l){i(l.message,"error")}finally{x()}})}function de(){document.getElementById("form-conv-login")?.addEventListener("submit",async e=>{e.preventDefault(),k("form-conv-login");const n=document.getElementById("conv-login-username").value.trim(),t=document.getElementById("conv-login-password").value;if(!n){m("conv-login-username","Wajib diisi");return}if(!t){m("conv-login-password","Wajib diisi");return}$("Memverifikasi...");const r=L()[n];if(!r||await _(t)!==r.passwordHash){x(),m("conv-login-password","Username/Password salah");return}P(r),x(),p("/konvensional/dashboard")})}function ue(){document.getElementById("btn-connect-wallet")?.addEventListener("click",async()=>{try{await U(),b()}catch(e){i(e.message,"error")}}),document.getElementById("form-zkp-register")?.addEventListener("submit",async e=>{e.preventDefault(),k("form-zkp-register"),K();const n=document.getElementById("zkp-reg-name").value.trim(),t=document.getElementById("zkp-reg-username").value.trim(),a=document.getElementById("zkp-reg-password").value,r=document.getElementById("zkp-reg-confirm").value;if(!E()){i("Hubungkan MetaMask dahulu","error");return}const{valid:o,errors:d}=C({name:{value:n,rules:{required:!0}},username:{value:t,rules:{required:!0,minLength:3}},password:{value:a,rules:{required:!0,minLength:6}},confirm:{value:r,rules:{match:{value:a,message:"Tidak cocok"}}}});if(!o){for(const[c,l]of Object.entries(d))m(`zkp-reg-${c}`,l);return}try{s("Mulai proses Registrasi ZKP...","info");const c=await H();c&&(s(`Jaringan terdeteksi: ${c.name} (Chain ID: ${c.chainId})`,"accent"),s(`Wallet Address: ${y()}`,"info")),s("Mengonversi password ke format BigInt & Poseidon hash...","info");const{commitment:l}=await R(a);s(`Commitment Hash berhasil dibuat: ${l.substring(0,20)}...`,"success"),s("Mengirim transaksi pendaftaran ke Smart Contract di Sepolia...","info");const g=await ee(t,l);s(`Transaksi berhasil dikonfirmasi! Block: ${g.blockNumber}`,"success"),s(`Tx Hash: ${g.hash}`,"accent"),localStorage.setItem("zkp_profile_"+t,n),i("Registrasi ZKP berhasil!","success"),setTimeout(()=>p("/zkp/login"),2500)}catch(c){s(`ERROR: ${c.message}`,"error"),i(c.message,"error")}})}function me(){document.getElementById("btn-connect-wallet")?.addEventListener("click",async()=>{try{await U(),b()}catch(e){i(e.message,"error")}}),document.getElementById("form-zkp-login")?.addEventListener("submit",async e=>{e.preventDefault(),k("form-zkp-login"),K();const n=document.getElementById("zkp-login-username").value.trim(),t=document.getElementById("zkp-login-password").value;if(!E()){i("Hubungkan MetaMask dahulu","error");return}if(!n){m("zkp-login-username","Wajib diisi");return}if(!t){m("zkp-login-password","Wajib diisi");return}try{s("Mulai proses Login ZKP...","info");const a=await H();a&&(s(`Jaringan terdeteksi: ${a.name} (Chain ID: ${a.chainId})`,"accent"),s(`Wallet Address: ${y()}`,"info")),s("Mengambil file circuit.wasm & auth_final.zkey...","info"),s("Men-generate Zero-Knowledge Proof secara lokal (SnarkJS)...","info");const{proof:r,publicSignals:o,commitment:d}=await R(t);s("Proof berhasil dibuat! Mengekstrak calldata...","success"),s(`Commitment Hash: ${d.substring(0,20)}...`,"accent");const c=V(r,o);s("Mengirim transaksi verifikasi ZKP ke Smart Contract di Sepolia...","info");const l=await ne(n,c);s(`Verifikasi Sukses di Blockchain! Block: ${l.blockNumber}`,"success"),s(`Tx Hash: ${l.hash}`,"accent");const g=localStorage.getItem("zkp_profile_"+n)||"";P({username:n,name:g,method:"zkp",commitment:d,wallet:y()}),i("Login ZKP berhasil!","success"),setTimeout(()=>p("/zkp/dashboard"),2e3)}catch(a){s(`ERROR: ${a.message}`,"error"),i(a.message,"error")}})}async function pe(){te(()=>b()),Y(),b(),window.addEventListener("hashchange",b)}document.addEventListener("DOMContentLoaded",pe);
