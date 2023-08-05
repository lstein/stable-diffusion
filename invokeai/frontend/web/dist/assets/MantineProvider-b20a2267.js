import{z as p,A as d,a4 as Z,aH as xe,ga as We,Z as De,U as j,a7 as q,T as z,V as R,a1 as _e,a0 as Be,$ as Ce,_ as Ge,Y as Ue,gb as Ve,gc as Ze,g1 as qe,ab as A,f$ as B,g7 as Xe}from"./index-18f2f740.js";function Je(e,t){return`${e} returned \`undefined\`. Seems you forgot to wrap component within ${t}`}function M(e={}){const{name:t,strict:r=!0,hookName:o="useContext",providerName:a="Provider",errorMessage:n,defaultValue:s}=e,i=p.createContext(s);i.displayName=t;function l(){var c;const u=p.useContext(i);if(!u&&r){const f=new Error(n??Je(o,a));throw f.name="ContextError",(c=Error.captureStackTrace)==null||c.call(Error,f,l),f}return u}return[i.Provider,l,i]}var[Ke,Ye]=M({strict:!1,name:"PortalManagerContext"});function Qe(e){const{children:t,zIndex:r}=e;return d.jsx(Ke,{value:{zIndex:r},children:t})}Qe.displayName="PortalManager";var[ke,et]=M({strict:!1,name:"PortalContext"}),J="chakra-portal",tt=".chakra-portal",rt=e=>d.jsx("div",{className:"chakra-portal-zIndex",style:{position:"absolute",zIndex:e.zIndex,top:0,left:0,right:0},children:e.children}),nt=e=>{const{appendToParentPortal:t,children:r}=e,[o,a]=p.useState(null),n=p.useRef(null),[,s]=p.useState({});p.useEffect(()=>s({}),[]);const i=et(),l=Ye();Z(()=>{if(!o)return;const u=o.ownerDocument,f=t?i??u.body:u.body;if(!f)return;n.current=u.createElement("div"),n.current.className=J,f.appendChild(n.current),s({});const y=n.current;return()=>{f.contains(y)&&f.removeChild(y)}},[o]);const c=l!=null&&l.zIndex?d.jsx(rt,{zIndex:l==null?void 0:l.zIndex,children:r}):r;return n.current?xe.createPortal(d.jsx(ke,{value:n.current,children:c}),n.current):d.jsx("span",{ref:u=>{u&&a(u)}})},ot=e=>{const{children:t,containerRef:r,appendToParentPortal:o}=e,a=r.current,n=a??(typeof window<"u"?document.body:void 0),s=p.useMemo(()=>{const l=a==null?void 0:a.ownerDocument.createElement("div");return l&&(l.className=J),l},[a]),[,i]=p.useState({});return Z(()=>i({}),[]),Z(()=>{if(!(!s||!n))return n.appendChild(s),()=>{n.removeChild(s)}},[s,n]),n&&s?xe.createPortal(d.jsx(ke,{value:o?s:null,children:t}),s):null};function G(e){const t={appendToParentPortal:!0,...e},{containerRef:r,...o}=t;return r?d.jsx(ot,{containerRef:r,...o}):d.jsx(nt,{...o})}G.className=J;G.selector=tt;G.displayName="Portal";function m(e,t={}){let r=!1;function o(){if(!r){r=!0;return}throw new Error("[anatomy] .part(...) should only be called once. Did you mean to use .extend(...) ?")}function a(...u){o();for(const f of u)t[f]=l(f);return m(e,t)}function n(...u){for(const f of u)f in t||(t[f]=l(f));return m(e,t)}function s(){return Object.fromEntries(Object.entries(t).map(([f,y])=>[f,y.selector]))}function i(){return Object.fromEntries(Object.entries(t).map(([f,y])=>[f,y.className]))}function l(u){const g=`chakra-${(["container","root"].includes(u??"")?[e]:[e,u]).filter(Boolean).join("__")}`;return{className:g,selector:`.${g}`,toString:()=>u}}return{parts:a,toPart:l,extend:n,selectors:s,classnames:i,get keys(){return Object.keys(t)},__type:{}}}var Or=m("accordion").parts("root","container","button","panel").extend("icon"),zr=m("alert").parts("title","description","container").extend("icon","spinner"),Rr=m("avatar").parts("label","badge","container").extend("excessLabel","group"),Mr=m("breadcrumb").parts("link","item","container").extend("separator");m("button").parts();var Lr=m("checkbox").parts("control","icon","container").extend("label");m("progress").parts("track","filledTrack").extend("label");var Fr=m("drawer").parts("overlay","dialogContainer","dialog").extend("header","closeButton","body","footer"),Hr=m("editable").parts("preview","input","textarea"),Wr=m("form").parts("container","requiredIndicator","helperText"),Dr=m("formError").parts("text","icon"),Br=m("input").parts("addon","field","element","group"),Gr=m("list").parts("container","item","icon"),at=m("menu").parts("button","list","item").extend("groupTitle","icon","command","divider"),Ur=m("modal").parts("overlay","dialogContainer","dialog").extend("header","closeButton","body","footer"),Vr=m("numberinput").parts("root","field","stepperGroup","stepper");m("pininput").parts("field");var Zr=m("popover").parts("content","header","body","footer").extend("popper","arrow","closeButton"),qr=m("progress").parts("label","filledTrack","track"),Xr=m("radio").parts("container","control","label"),Jr=m("select").parts("field","icon"),Kr=m("slider").parts("container","track","thumb","filledTrack","mark"),Yr=m("stat").parts("container","label","helpText","number","icon"),Qr=m("switch").parts("container","track","thumb"),en=m("table").parts("table","thead","tbody","tr","th","td","tfoot","caption"),tn=m("tabs").parts("root","tab","tablist","tabpanel","tabpanels","indicator"),rn=m("tag").parts("container","label","closeButton"),nn=m("card").parts("container","header","body","footer");function P(e,t){return r=>r.colorMode==="dark"?t:e}function on(e){const{orientation:t,vertical:r,horizontal:o}=e;return t?t==="vertical"?r:o:{}}var st=(e,t)=>e.find(r=>r.id===t);function re(e,t){const r=we(e,t),o=r?e[r].findIndex(a=>a.id===t):-1;return{position:r,index:o}}function we(e,t){for(const[r,o]of Object.entries(e))if(st(o,t))return r}function it(e){const t=e.includes("right"),r=e.includes("left");let o="center";return t&&(o="flex-end"),r&&(o="flex-start"),{display:"flex",flexDirection:"column",alignItems:o}}function lt(e){const r=e==="top"||e==="bottom"?"0 auto":void 0,o=e.includes("top")?"env(safe-area-inset-top, 0px)":void 0,a=e.includes("bottom")?"env(safe-area-inset-bottom, 0px)":void 0,n=e.includes("left")?void 0:"env(safe-area-inset-right, 0px)",s=e.includes("right")?void 0:"env(safe-area-inset-left, 0px)";return{position:"fixed",zIndex:"var(--toast-z-index, 5500)",pointerEvents:"none",display:"flex",flexDirection:"column",margin:r,top:o,bottom:a,right:n,left:s}}function ct(e,t=[]){const r=p.useRef(e);return p.useEffect(()=>{r.current=e}),p.useCallback((...o)=>{var a;return(a=r.current)==null?void 0:a.call(r,...o)},t)}function ut(e,t){const r=ct(e);p.useEffect(()=>{if(t==null)return;let o=null;return o=window.setTimeout(()=>{r()},t),()=>{o&&window.clearTimeout(o)}},[t,r])}function ne(e,t){const r=p.useRef(!1),o=p.useRef(!1);p.useEffect(()=>{if(r.current&&o.current)return e();o.current=!0},t),p.useEffect(()=>(r.current=!0,()=>{r.current=!1}),[])}var dt={initial:e=>{const{position:t}=e,r=["top","bottom"].includes(t)?"y":"x";let o=["top-right","bottom-right"].includes(t)?1:-1;return t==="bottom"&&(o=1),{opacity:0,[r]:o*24}},animate:{opacity:1,y:0,x:0,scale:1,transition:{duration:.4,ease:[.4,0,.2,1]}},exit:{opacity:0,scale:.85,transition:{duration:.2,ease:[.4,0,1,1]}}},Pe=p.memo(e=>{const{id:t,message:r,onCloseComplete:o,onRequestRemove:a,requestClose:n=!1,position:s="bottom",duration:i=5e3,containerStyle:l,motionVariants:c=dt,toastSpacing:u="0.5rem"}=e,[f,y]=p.useState(i),g=We();ne(()=>{g||o==null||o()},[g]),ne(()=>{y(i)},[i]);const h=()=>y(null),$=()=>y(i),S=()=>{g&&a()};p.useEffect(()=>{g&&n&&a()},[g,n,a]),ut(S,f);const H=p.useMemo(()=>({pointerEvents:"auto",maxWidth:560,minWidth:300,margin:u,...l}),[l,u]),N=p.useMemo(()=>it(s),[s]);return d.jsx(De.div,{layout:!0,className:"chakra-toast",variants:c,initial:"initial",animate:"animate",exit:"exit",onHoverStart:h,onHoverEnd:$,custom:{position:s},style:N,children:d.jsx(j.div,{role:"status","aria-atomic":"true",className:"chakra-toast__inner",__css:H,children:q(r,{id:t,onClose:S})})})});Pe.displayName="ToastComponent";function ft(e,t){var r;const o=e??"bottom",n={"top-start":{ltr:"top-left",rtl:"top-right"},"top-end":{ltr:"top-right",rtl:"top-left"},"bottom-start":{ltr:"bottom-left",rtl:"bottom-right"},"bottom-end":{ltr:"bottom-right",rtl:"bottom-left"}}[o];return(r=n==null?void 0:n[t])!=null?r:o}var oe={path:d.jsxs("g",{stroke:"currentColor",strokeWidth:"1.5",children:[d.jsx("path",{strokeLinecap:"round",fill:"none",d:"M9,9a3,3,0,1,1,4,2.829,1.5,1.5,0,0,0-1,1.415V14.25"}),d.jsx("path",{fill:"currentColor",strokeLinecap:"round",d:"M12,17.25a.375.375,0,1,0,.375.375A.375.375,0,0,0,12,17.25h0"}),d.jsx("circle",{fill:"none",strokeMiterlimit:"10",cx:"12",cy:"12",r:"11.25"})]}),viewBox:"0 0 24 24"},L=z((e,t)=>{const{as:r,viewBox:o,color:a="currentColor",focusable:n=!1,children:s,className:i,__css:l,...c}=e,u=R("chakra-icon",i),f=_e("Icon",e),y={w:"1em",h:"1em",display:"inline-block",lineHeight:"1em",flexShrink:0,color:a,...l,...f},g={ref:t,focusable:n,className:u,__css:y},h=o??oe.viewBox;if(r&&typeof r!="string")return d.jsx(j.svg,{as:r,...g,...c});const $=s??oe.path;return d.jsx(j.svg,{verticalAlign:"middle",viewBox:h,...g,...c,children:$})});L.displayName="Icon";function pt(e){return d.jsx(L,{viewBox:"0 0 24 24",...e,children:d.jsx("path",{fill:"currentColor",d:"M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"})})}function mt(e){return d.jsx(L,{viewBox:"0 0 24 24",...e,children:d.jsx("path",{fill:"currentColor",d:"M12,0A12,12,0,1,0,24,12,12.013,12.013,0,0,0,12,0Zm.25,5a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,12.25,5ZM14.5,18.5h-4a1,1,0,0,1,0-2h.75a.25.25,0,0,0,.25-.25v-4.5a.25.25,0,0,0-.25-.25H10.5a1,1,0,0,1,0-2h1a2,2,0,0,1,2,2v4.75a.25.25,0,0,0,.25.25h.75a1,1,0,1,1,0,2Z"})})}function ae(e){return d.jsx(L,{viewBox:"0 0 24 24",...e,children:d.jsx("path",{fill:"currentColor",d:"M11.983,0a12.206,12.206,0,0,0-8.51,3.653A11.8,11.8,0,0,0,0,12.207,11.779,11.779,0,0,0,11.8,24h.214A12.111,12.111,0,0,0,24,11.791h0A11.766,11.766,0,0,0,11.983,0ZM10.5,16.542a1.476,1.476,0,0,1,1.449-1.53h.027a1.527,1.527,0,0,1,1.523,1.47,1.475,1.475,0,0,1-1.449,1.53h-.027A1.529,1.529,0,0,1,10.5,16.542ZM11,12.5v-6a1,1,0,0,1,2,0v6a1,1,0,1,1-2,0Z"})})}var[gt,K]=M({name:"AlertContext",hookName:"useAlertContext",providerName:"<Alert />"}),[bt,Y]=M({name:"AlertStylesContext",hookName:"useAlertStyles",providerName:"<Alert />"}),Ae={info:{icon:mt,colorScheme:"blue"},warning:{icon:ae,colorScheme:"orange"},success:{icon:pt,colorScheme:"green"},error:{icon:ae,colorScheme:"red"},loading:{icon:Be,colorScheme:"blue"}};function yt(e){return Ae[e].colorScheme}function vt(e){return Ae[e].icon}var je=z(function(t,r){const o=Y(),{status:a}=K(),n={display:"inline",...o.description};return d.jsx(j.div,{ref:r,"data-status":a,...t,className:R("chakra-alert__desc",t.className),__css:n})});je.displayName="AlertDescription";function Ee(e){const{status:t}=K(),r=vt(t),o=Y(),a=t==="loading"?o.spinner:o.icon;return d.jsx(j.span,{display:"inherit","data-status":t,...e,className:R("chakra-alert__icon",e.className),__css:a,children:e.children||d.jsx(r,{h:"100%",w:"100%"})})}Ee.displayName="AlertIcon";var Ne=z(function(t,r){const o=Y(),{status:a}=K();return d.jsx(j.div,{ref:r,"data-status":a,...t,className:R("chakra-alert__title",t.className),__css:o.title})});Ne.displayName="AlertTitle";var $e=z(function(t,r){var o;const{status:a="info",addRole:n=!0,...s}=Ce(t),i=(o=t.colorScheme)!=null?o:yt(a),l=Ge("Alert",{...t,colorScheme:i}),c={width:"100%",display:"flex",alignItems:"center",position:"relative",overflow:"hidden",...l.container};return d.jsx(gt,{value:{status:a},children:d.jsx(bt,{value:l,children:d.jsx(j.div,{"data-status":a,role:n?"alert":void 0,ref:r,...s,className:R("chakra-alert",t.className),__css:c})})})});$e.displayName="Alert";function ht(e){return d.jsx(L,{focusable:"false","aria-hidden":!0,...e,children:d.jsx("path",{fill:"currentColor",d:"M.439,21.44a1.5,1.5,0,0,0,2.122,2.121L11.823,14.3a.25.25,0,0,1,.354,0l9.262,9.263a1.5,1.5,0,1,0,2.122-2.121L14.3,12.177a.25.25,0,0,1,0-.354l9.263-9.262A1.5,1.5,0,0,0,21.439.44L12.177,9.7a.25.25,0,0,1-.354,0L2.561.44A1.5,1.5,0,0,0,.439,2.561L9.7,11.823a.25.25,0,0,1,0,.354Z"})})}var Te=z(function(t,r){const o=_e("CloseButton",t),{children:a,isDisabled:n,__css:s,...i}=Ce(t),l={outline:0,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0};return d.jsx(j.button,{type:"button","aria-label":"Close",ref:r,disabled:n,__css:{...l,...o,...s},...i,children:a||d.jsx(ht,{width:"1em",height:"1em"})})});Te.displayName="CloseButton";var St={top:[],"top-left":[],"top-right":[],"bottom-left":[],bottom:[],"bottom-right":[]},C=xt(St);function xt(e){let t=e;const r=new Set,o=a=>{t=a(t),r.forEach(n=>n())};return{getState:()=>t,subscribe:a=>(r.add(a),()=>{o(()=>e),r.delete(a)}),removeToast:(a,n)=>{o(s=>({...s,[n]:s[n].filter(i=>i.id!=a)}))},notify:(a,n)=>{const s=_t(a,n),{position:i,id:l}=s;return o(c=>{var u,f;const g=i.includes("top")?[s,...(u=c[i])!=null?u:[]]:[...(f=c[i])!=null?f:[],s];return{...c,[i]:g}}),l},update:(a,n)=>{a&&o(s=>{const i={...s},{position:l,index:c}=re(i,a);return l&&c!==-1&&(i[l][c]={...i[l][c],...n,message:Ie(n)}),i})},closeAll:({positions:a}={})=>{o(n=>(a??["bottom","bottom-right","bottom-left","top","top-left","top-right"]).reduce((l,c)=>(l[c]=n[c].map(u=>({...u,requestClose:!0})),l),{...n}))},close:a=>{o(n=>{const s=we(n,a);return s?{...n,[s]:n[s].map(i=>i.id==a?{...i,requestClose:!0}:i)}:n})},isActive:a=>!!re(C.getState(),a).position}}var se=0;function _t(e,t={}){var r,o;se+=1;const a=(r=t.id)!=null?r:se,n=(o=t.position)!=null?o:"bottom";return{id:a,message:e,position:n,duration:t.duration,onCloseComplete:t.onCloseComplete,onRequestRemove:()=>C.removeToast(String(a),n),status:t.status,requestClose:!1,containerStyle:t.containerStyle}}var Ct=e=>{const{status:t,variant:r="solid",id:o,title:a,isClosable:n,onClose:s,description:i,colorScheme:l,icon:c}=e,u=o?{root:`toast-${o}`,title:`toast-${o}-title`,description:`toast-${o}-description`}:void 0;return d.jsxs($e,{addRole:!1,status:t,variant:r,id:u==null?void 0:u.root,alignItems:"start",borderRadius:"md",boxShadow:"lg",paddingEnd:8,textAlign:"start",width:"auto",colorScheme:l,children:[d.jsx(Ee,{children:c}),d.jsxs(j.div,{flex:"1",maxWidth:"100%",children:[a&&d.jsx(Ne,{id:u==null?void 0:u.title,children:a}),i&&d.jsx(je,{id:u==null?void 0:u.description,display:"block",children:i})]}),n&&d.jsx(Te,{size:"sm",onClick:s,position:"absolute",insetEnd:1,top:1})]})};function Ie(e={}){const{render:t,toastComponent:r=Ct}=e;return a=>typeof t=="function"?t({...a,...e}):d.jsx(r,{...a,...e})}function an(e,t){const r=a=>{var n;return{...t,...a,position:ft((n=a==null?void 0:a.position)!=null?n:t==null?void 0:t.position,e)}},o=a=>{const n=r(a),s=Ie(n);return C.notify(s,n)};return o.update=(a,n)=>{C.update(a,r(n))},o.promise=(a,n)=>{const s=o({...n.loading,status:"loading",duration:null});a.then(i=>o.update(s,{status:"success",duration:5e3,...q(n.success,i)})).catch(i=>o.update(s,{status:"error",duration:5e3,...q(n.error,i)}))},o.closeAll=C.closeAll,o.close=C.close,o.isActive=C.isActive,o}var[sn,ln]=M({name:"ToastOptionsContext",strict:!1}),cn=e=>{const t=p.useSyncExternalStore(C.subscribe,C.getState,C.getState),{motionVariants:r,component:o=Pe,portalProps:a}=e,s=Object.keys(t).map(i=>{const l=t[i];return d.jsx("div",{role:"region","aria-live":"polite","aria-label":"Notifications",id:`chakra-toast-manager-${i}`,style:lt(i),children:d.jsx(Ue,{initial:!1,children:l.map(c=>d.jsx(o,{motionVariants:r,...c},c.id))})},i)});return d.jsx(G,{...a,children:s})};function kt(){if(console&&console.warn){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];typeof t[0]=="string"&&(t[0]=`react-i18next:: ${t[0]}`),console.warn(...t)}}const ie={};function X(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];typeof t[0]=="string"&&ie[t[0]]||(typeof t[0]=="string"&&(ie[t[0]]=new Date),kt(...t))}const Oe=(e,t)=>()=>{if(e.isInitialized)t();else{const r=()=>{setTimeout(()=>{e.off("initialized",r)},0),t()};e.on("initialized",r)}};function le(e,t,r){e.loadNamespaces(t,Oe(e,r))}function ce(e,t,r,o){typeof r=="string"&&(r=[r]),r.forEach(a=>{e.options.ns.indexOf(a)<0&&e.options.ns.push(a)}),e.loadLanguages(t,Oe(e,o))}function wt(e,t){let r=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};const o=t.languages[0],a=t.options?t.options.fallbackLng:!1,n=t.languages[t.languages.length-1];if(o.toLowerCase()==="cimode")return!0;const s=(i,l)=>{const c=t.services.backendConnector.state[`${i}|${l}`];return c===-1||c===2};return r.bindI18n&&r.bindI18n.indexOf("languageChanging")>-1&&t.services.backendConnector.backend&&t.isLanguageChangingTo&&!s(t.isLanguageChangingTo,e)?!1:!!(t.hasResourceBundle(o,e)||!t.services.backendConnector.backend||t.options.resources&&!t.options.partialBundledLanguages||s(o,e)&&(!a||s(n,e)))}function Pt(e,t){let r=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};return!t.languages||!t.languages.length?(X("i18n.languages were undefined or empty",t.languages),!0):t.options.ignoreJSONStructure!==void 0?t.hasLoadedNamespace(e,{lng:r.lng,precheck:(a,n)=>{if(r.bindI18n&&r.bindI18n.indexOf("languageChanging")>-1&&a.services.backendConnector.backend&&a.isLanguageChangingTo&&!n(a.isLanguageChangingTo,e))return!1}}):wt(e,t,r)}const At=p.createContext();class jt{constructor(){this.usedNamespaces={}}addUsedNamespaces(t){t.forEach(r=>{this.usedNamespaces[r]||(this.usedNamespaces[r]=!0)})}getUsedNamespaces(){return Object.keys(this.usedNamespaces)}}const Et=(e,t)=>{const r=p.useRef();return p.useEffect(()=>{r.current=t?r.current:e},[e,t]),r.current};function un(e){let t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};const{i18n:r}=t,{i18n:o,defaultNS:a}=p.useContext(At)||{},n=r||o||Ze();if(n&&!n.reportNamespaces&&(n.reportNamespaces=new jt),!n){X("You will need to pass in an i18next instance by using initReactI18next");const v=(w,x)=>typeof x=="string"?x:x&&typeof x=="object"&&typeof x.defaultValue=="string"?x.defaultValue:Array.isArray(w)?w[w.length-1]:w,k=[v,{},!1];return k.t=v,k.i18n={},k.ready=!1,k}n.options.react&&n.options.react.wait!==void 0&&X("It seems you are still using the old wait option, you may migrate to the new useSuspense behaviour.");const s={...Ve(),...n.options.react,...t},{useSuspense:i,keyPrefix:l}=s;let c=e||a||n.options&&n.options.defaultNS;c=typeof c=="string"?[c]:c||["translation"],n.reportNamespaces.addUsedNamespaces&&n.reportNamespaces.addUsedNamespaces(c);const u=(n.isInitialized||n.initializedStoreOnce)&&c.every(v=>Pt(v,n,s));function f(){return n.getFixedT(t.lng||null,s.nsMode==="fallback"?c:c[0],l)}const[y,g]=p.useState(f);let h=c.join();t.lng&&(h=`${t.lng}${h}`);const $=Et(h),S=p.useRef(!0);p.useEffect(()=>{const{bindI18n:v,bindI18nStore:k}=s;S.current=!0,!u&&!i&&(t.lng?ce(n,t.lng,c,()=>{S.current&&g(f)}):le(n,c,()=>{S.current&&g(f)})),u&&$&&$!==h&&S.current&&g(f);function w(){S.current&&g(f)}return v&&n&&n.on(v,w),k&&n&&n.store.on(k,w),()=>{S.current=!1,v&&n&&v.split(" ").forEach(x=>n.off(x,w)),k&&n&&k.split(" ").forEach(x=>n.store.off(x,w))}},[n,h]);const H=p.useRef(!0);p.useEffect(()=>{S.current&&!H.current&&g(f),H.current=!1},[n,l]);const N=[y,n,u];if(N.t=y,N.i18n=n,N.ready=u,u||!u&&!i)return N;throw new Promise(v=>{t.lng?ce(n,t.lng,c,()=>v()):le(n,c,()=>v())})}const{definePartsStyle:Nt,defineMultiStyleConfig:$t}=qe(at.keys),Tt=Nt(e=>({button:{fontWeight:500,bg:P("base.300","base.500")(e),color:P("base.900","base.100")(e),_hover:{bg:P("base.400","base.600")(e),color:P("base.900","base.50")(e),fontWeight:600}},list:{zIndex:9999,color:P("base.900","base.150")(e),bg:P("base.200","base.800")(e),shadow:"dark-lg",border:"none"},item:{fontSize:"sm",bg:P("base.200","base.800")(e),_hover:{bg:P("base.300","base.700")(e),svg:{opacity:1}},_focus:{bg:P("base.400","base.600")(e)},svg:{opacity:.7,fontSize:14}}})),dn=$t({variants:{invokeAI:Tt},defaultProps:{variant:"invokeAI"}}),fn={variants:{enter:{visibility:"visible",opacity:1,scale:1,transition:{duration:.07,ease:[.4,0,.2,1]}},exit:{transitionEnd:{visibility:"hidden"},opacity:0,scale:.8,transition:{duration:.07,easings:"easeOut"}}}},It={dark:["#C1C2C5","#A6A7AB","#909296","#5c5f66","#373A40","#2C2E33","#25262b","#1A1B1E","#141517","#101113"],gray:["#f8f9fa","#f1f3f5","#e9ecef","#dee2e6","#ced4da","#adb5bd","#868e96","#495057","#343a40","#212529"],red:["#fff5f5","#ffe3e3","#ffc9c9","#ffa8a8","#ff8787","#ff6b6b","#fa5252","#f03e3e","#e03131","#c92a2a"],pink:["#fff0f6","#ffdeeb","#fcc2d7","#faa2c1","#f783ac","#f06595","#e64980","#d6336c","#c2255c","#a61e4d"],grape:["#f8f0fc","#f3d9fa","#eebefa","#e599f7","#da77f2","#cc5de8","#be4bdb","#ae3ec9","#9c36b5","#862e9c"],violet:["#f3f0ff","#e5dbff","#d0bfff","#b197fc","#9775fa","#845ef7","#7950f2","#7048e8","#6741d9","#5f3dc4"],indigo:["#edf2ff","#dbe4ff","#bac8ff","#91a7ff","#748ffc","#5c7cfa","#4c6ef5","#4263eb","#3b5bdb","#364fc7"],blue:["#e7f5ff","#d0ebff","#a5d8ff","#74c0fc","#4dabf7","#339af0","#228be6","#1c7ed6","#1971c2","#1864ab"],cyan:["#e3fafc","#c5f6fa","#99e9f2","#66d9e8","#3bc9db","#22b8cf","#15aabf","#1098ad","#0c8599","#0b7285"],teal:["#e6fcf5","#c3fae8","#96f2d7","#63e6be","#38d9a9","#20c997","#12b886","#0ca678","#099268","#087f5b"],green:["#ebfbee","#d3f9d8","#b2f2bb","#8ce99a","#69db7c","#51cf66","#40c057","#37b24d","#2f9e44","#2b8a3e"],lime:["#f4fce3","#e9fac8","#d8f5a2","#c0eb75","#a9e34b","#94d82d","#82c91e","#74b816","#66a80f","#5c940d"],yellow:["#fff9db","#fff3bf","#ffec99","#ffe066","#ffd43b","#fcc419","#fab005","#f59f00","#f08c00","#e67700"],orange:["#fff4e6","#ffe8cc","#ffd8a8","#ffc078","#ffa94d","#ff922b","#fd7e14","#f76707","#e8590c","#d9480f"]};function Ot(e){return()=>({fontFamily:e.fontFamily||"sans-serif"})}var zt=Object.defineProperty,ue=Object.getOwnPropertySymbols,Rt=Object.prototype.hasOwnProperty,Mt=Object.prototype.propertyIsEnumerable,de=(e,t,r)=>t in e?zt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,fe=(e,t)=>{for(var r in t||(t={}))Rt.call(t,r)&&de(e,r,t[r]);if(ue)for(var r of ue(t))Mt.call(t,r)&&de(e,r,t[r]);return e};function Lt(e){return t=>({WebkitTapHighlightColor:"transparent",[t||"&:focus"]:fe({},e.focusRing==="always"||e.focusRing==="auto"?e.focusRingStyles.styles(e):e.focusRingStyles.resetStyles(e)),[t?t.replace(":focus",":focus:not(:focus-visible)"):"&:focus:not(:focus-visible)"]:fe({},e.focusRing==="auto"||e.focusRing==="never"?e.focusRingStyles.resetStyles(e):null)})}function F(e){return t=>typeof e.primaryShade=="number"?e.primaryShade:e.primaryShade[t||e.colorScheme]}function Q(e){const t=F(e);return(r,o,a=!0,n=!0)=>{if(typeof r=="string"&&r.includes(".")){const[i,l]=r.split("."),c=parseInt(l,10);if(i in e.colors&&c>=0&&c<10)return e.colors[i][typeof o=="number"&&!n?o:c]}const s=typeof o=="number"?o:t();return r in e.colors?e.colors[r][s]:a?e.colors[e.primaryColor][s]:r}}function ze(e){let t="";for(let r=1;r<e.length-1;r+=1)t+=`${e[r]} ${r/(e.length-1)*100}%, `;return`${e[0]} 0%, ${t}${e[e.length-1]} 100%`}function Ft(e,...t){return`linear-gradient(${e}deg, ${ze(t)})`}function Ht(...e){return`radial-gradient(circle, ${ze(e)})`}function Re(e){const t=Q(e),r=F(e);return o=>{const a={from:(o==null?void 0:o.from)||e.defaultGradient.from,to:(o==null?void 0:o.to)||e.defaultGradient.to,deg:(o==null?void 0:o.deg)||e.defaultGradient.deg};return`linear-gradient(${a.deg}deg, ${t(a.from,r(),!1)} 0%, ${t(a.to,r(),!1)} 100%)`}}function Me(e){return t=>{if(typeof t=="number")return`${t/16}${e}`;if(typeof t=="string"){const r=t.replace("px","");if(!Number.isNaN(Number(r)))return`${Number(r)/16}${e}`}return t}}const E=Me("rem"),U=Me("em");function Le({size:e,sizes:t,units:r}){return e in t?t[e]:typeof e=="number"?r==="em"?U(e):E(e):e||t.md}function W(e){return typeof e=="number"?e:typeof e=="string"&&e.includes("rem")?Number(e.replace("rem",""))*16:typeof e=="string"&&e.includes("em")?Number(e.replace("em",""))*16:Number(e)}function Wt(e){return t=>`@media (min-width: ${U(W(Le({size:t,sizes:e.breakpoints})))})`}function Dt(e){return t=>`@media (max-width: ${U(W(Le({size:t,sizes:e.breakpoints}))-1)})`}function Bt(e){return/^#?([0-9A-F]{3}){1,2}$/i.test(e)}function Gt(e){let t=e.replace("#","");if(t.length===3){const s=t.split("");t=[s[0],s[0],s[1],s[1],s[2],s[2]].join("")}const r=parseInt(t,16),o=r>>16&255,a=r>>8&255,n=r&255;return{r:o,g:a,b:n,a:1}}function Ut(e){const[t,r,o,a]=e.replace(/[^0-9,.]/g,"").split(",").map(Number);return{r:t,g:r,b:o,a:a||1}}function ee(e){return Bt(e)?Gt(e):e.startsWith("rgb")?Ut(e):{r:0,g:0,b:0,a:1}}function T(e,t){if(typeof e!="string"||t>1||t<0)return"rgba(0, 0, 0, 1)";if(e.startsWith("var(--"))return e;const{r,g:o,b:a}=ee(e);return`rgba(${r}, ${o}, ${a}, ${t})`}function Vt(e=0){return{position:"absolute",top:E(e),right:E(e),left:E(e),bottom:E(e)}}function Zt(e,t){if(typeof e=="string"&&e.startsWith("var(--"))return e;const{r,g:o,b:a,a:n}=ee(e),s=1-t,i=l=>Math.round(l*s);return`rgba(${i(r)}, ${i(o)}, ${i(a)}, ${n})`}function qt(e,t){if(typeof e=="string"&&e.startsWith("var(--"))return e;const{r,g:o,b:a,a:n}=ee(e),s=i=>Math.round(i+(255-i)*t);return`rgba(${s(r)}, ${s(o)}, ${s(a)}, ${n})`}function Xt(e){return t=>{if(typeof t=="number")return E(t);const r=typeof e.defaultRadius=="number"?e.defaultRadius:e.radius[e.defaultRadius]||e.defaultRadius;return e.radius[t]||t||r}}function Jt(e,t){if(typeof e=="string"&&e.includes(".")){const[r,o]=e.split("."),a=parseInt(o,10);if(r in t.colors&&a>=0&&a<10)return{isSplittedColor:!0,key:r,shade:a}}return{isSplittedColor:!1}}function Kt(e){const t=Q(e),r=F(e),o=Re(e);return({variant:a,color:n,gradient:s,primaryFallback:i})=>{const l=Jt(n,e);switch(a){case"light":return{border:"transparent",background:T(t(n,e.colorScheme==="dark"?8:0,i,!1),e.colorScheme==="dark"?.2:1),color:n==="dark"?e.colorScheme==="dark"?e.colors.dark[0]:e.colors.dark[9]:t(n,e.colorScheme==="dark"?2:r("light")),hover:T(t(n,e.colorScheme==="dark"?7:1,i,!1),e.colorScheme==="dark"?.25:.65)};case"subtle":return{border:"transparent",background:"transparent",color:n==="dark"?e.colorScheme==="dark"?e.colors.dark[0]:e.colors.dark[9]:t(n,e.colorScheme==="dark"?2:r("light")),hover:T(t(n,e.colorScheme==="dark"?8:0,i,!1),e.colorScheme==="dark"?.2:1)};case"outline":return{border:t(n,e.colorScheme==="dark"?5:r("light")),background:"transparent",color:t(n,e.colorScheme==="dark"?5:r("light")),hover:e.colorScheme==="dark"?T(t(n,5,i,!1),.05):T(t(n,0,i,!1),.35)};case"default":return{border:e.colorScheme==="dark"?e.colors.dark[4]:e.colors.gray[4],background:e.colorScheme==="dark"?e.colors.dark[6]:e.white,color:e.colorScheme==="dark"?e.white:e.black,hover:e.colorScheme==="dark"?e.colors.dark[5]:e.colors.gray[0]};case"white":return{border:"transparent",background:e.white,color:t(n,r()),hover:null};case"transparent":return{border:"transparent",color:n==="dark"?e.colorScheme==="dark"?e.colors.dark[0]:e.colors.dark[9]:t(n,e.colorScheme==="dark"?2:r("light")),background:"transparent",hover:null};case"gradient":return{background:o(s),color:e.white,border:"transparent",hover:null};default:{const c=r(),u=l.isSplittedColor?l.shade:c,f=l.isSplittedColor?l.key:n;return{border:"transparent",background:t(f,u,i),color:e.white,hover:t(f,u===9?8:u+1)}}}}}function Yt(e){return t=>{const r=F(e)(t);return e.colors[e.primaryColor][r]}}function Qt(e){return{"@media (hover: hover)":{"&:hover":e},"@media (hover: none)":{"&:active":e}}}function er(e){return()=>({userSelect:"none",color:e.colorScheme==="dark"?e.colors.dark[3]:e.colors.gray[5]})}function tr(e){return()=>e.colorScheme==="dark"?e.colors.dark[2]:e.colors.gray[6]}const b={fontStyles:Ot,themeColor:Q,focusStyles:Lt,linearGradient:Ft,radialGradient:Ht,smallerThan:Dt,largerThan:Wt,rgba:T,cover:Vt,darken:Zt,lighten:qt,radius:Xt,variant:Kt,primaryShade:F,hover:Qt,gradient:Re,primaryColor:Yt,placeholderStyles:er,dimmed:tr};var rr=Object.defineProperty,nr=Object.defineProperties,or=Object.getOwnPropertyDescriptors,pe=Object.getOwnPropertySymbols,ar=Object.prototype.hasOwnProperty,sr=Object.prototype.propertyIsEnumerable,me=(e,t,r)=>t in e?rr(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,ir=(e,t)=>{for(var r in t||(t={}))ar.call(t,r)&&me(e,r,t[r]);if(pe)for(var r of pe(t))sr.call(t,r)&&me(e,r,t[r]);return e},lr=(e,t)=>nr(e,or(t));function Fe(e){return lr(ir({},e),{fn:{fontStyles:b.fontStyles(e),themeColor:b.themeColor(e),focusStyles:b.focusStyles(e),largerThan:b.largerThan(e),smallerThan:b.smallerThan(e),radialGradient:b.radialGradient,linearGradient:b.linearGradient,gradient:b.gradient(e),rgba:b.rgba,cover:b.cover,lighten:b.lighten,darken:b.darken,primaryShade:b.primaryShade(e),radius:b.radius(e),variant:b.variant(e),hover:b.hover,primaryColor:b.primaryColor(e),placeholderStyles:b.placeholderStyles(e),dimmed:b.dimmed(e)}})}const cr={dir:"ltr",primaryShade:{light:6,dark:8},focusRing:"auto",loader:"oval",colorScheme:"light",white:"#fff",black:"#000",defaultRadius:"sm",transitionTimingFunction:"ease",colors:It,lineHeight:1.55,fontFamily:"-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",fontFamilyMonospace:"ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",primaryColor:"blue",respectReducedMotion:!0,cursorType:"default",defaultGradient:{from:"indigo",to:"cyan",deg:45},shadows:{xs:"0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), 0 0.0625rem 0.125rem rgba(0, 0, 0, 0.1)",sm:"0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 0.625rem 0.9375rem -0.3125rem, rgba(0, 0, 0, 0.04) 0 0.4375rem 0.4375rem -0.3125rem",md:"0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 1.25rem 1.5625rem -0.3125rem, rgba(0, 0, 0, 0.04) 0 0.625rem 0.625rem -0.3125rem",lg:"0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 1.75rem 1.4375rem -0.4375rem, rgba(0, 0, 0, 0.04) 0 0.75rem 0.75rem -0.4375rem",xl:"0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 2.25rem 1.75rem -0.4375rem, rgba(0, 0, 0, 0.04) 0 1.0625rem 1.0625rem -0.4375rem"},fontSizes:{xs:"0.75rem",sm:"0.875rem",md:"1rem",lg:"1.125rem",xl:"1.25rem"},radius:{xs:"0.125rem",sm:"0.25rem",md:"0.5rem",lg:"1rem",xl:"2rem"},spacing:{xs:"0.625rem",sm:"0.75rem",md:"1rem",lg:"1.25rem",xl:"1.5rem"},breakpoints:{xs:"36em",sm:"48em",md:"62em",lg:"75em",xl:"88em"},headings:{fontFamily:"-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",fontWeight:700,sizes:{h1:{fontSize:"2.125rem",lineHeight:1.3,fontWeight:void 0},h2:{fontSize:"1.625rem",lineHeight:1.35,fontWeight:void 0},h3:{fontSize:"1.375rem",lineHeight:1.4,fontWeight:void 0},h4:{fontSize:"1.125rem",lineHeight:1.45,fontWeight:void 0},h5:{fontSize:"1rem",lineHeight:1.5,fontWeight:void 0},h6:{fontSize:"0.875rem",lineHeight:1.5,fontWeight:void 0}}},other:{},components:{},activeStyles:{transform:"translateY(0.0625rem)"},datesLocale:"en",globalStyles:void 0,focusRingStyles:{styles:e=>({outlineOffset:"0.125rem",outline:`0.125rem solid ${e.colors[e.primaryColor][e.colorScheme==="dark"?7:5]}`}),resetStyles:()=>({outline:"none"}),inputStyles:e=>({outline:"none",borderColor:e.colors[e.primaryColor][typeof e.primaryShade=="object"?e.primaryShade[e.colorScheme]:e.primaryShade]})}},te=Fe(cr);var ur=Object.defineProperty,dr=Object.defineProperties,fr=Object.getOwnPropertyDescriptors,ge=Object.getOwnPropertySymbols,pr=Object.prototype.hasOwnProperty,mr=Object.prototype.propertyIsEnumerable,be=(e,t,r)=>t in e?ur(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,gr=(e,t)=>{for(var r in t||(t={}))pr.call(t,r)&&be(e,r,t[r]);if(ge)for(var r of ge(t))mr.call(t,r)&&be(e,r,t[r]);return e},br=(e,t)=>dr(e,fr(t));function yr({theme:e}){return A.createElement(B,{styles:{"*, *::before, *::after":{boxSizing:"border-box"},html:{colorScheme:e.colorScheme==="dark"?"dark":"light"},body:br(gr({},e.fn.fontStyles()),{backgroundColor:e.colorScheme==="dark"?e.colors.dark[7]:e.white,color:e.colorScheme==="dark"?e.colors.dark[0]:e.black,lineHeight:e.lineHeight,fontSize:e.fontSizes.md,WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale"})}})}function I(e,t,r,o=E){Object.keys(t).forEach(a=>{e[`--mantine-${r}-${a}`]=o(t[a])})}function vr({theme:e}){const t={"--mantine-color-white":e.white,"--mantine-color-black":e.black,"--mantine-transition-timing-function":e.transitionTimingFunction,"--mantine-line-height":`${e.lineHeight}`,"--mantine-font-family":e.fontFamily,"--mantine-font-family-monospace":e.fontFamilyMonospace,"--mantine-font-family-headings":e.headings.fontFamily,"--mantine-heading-font-weight":`${e.headings.fontWeight}`};I(t,e.shadows,"shadow"),I(t,e.fontSizes,"font-size"),I(t,e.radius,"radius"),I(t,e.spacing,"spacing"),I(t,e.breakpoints,"breakpoints",U),Object.keys(e.colors).forEach(o=>{e.colors[o].forEach((a,n)=>{t[`--mantine-color-${o}-${n}`]=a})});const r=e.headings.sizes;return Object.keys(r).forEach(o=>{t[`--mantine-${o}-font-size`]=r[o].fontSize,t[`--mantine-${o}-line-height`]=`${r[o].lineHeight}`}),A.createElement(B,{styles:{":root":t}})}var hr=Object.defineProperty,Sr=Object.defineProperties,xr=Object.getOwnPropertyDescriptors,ye=Object.getOwnPropertySymbols,_r=Object.prototype.hasOwnProperty,Cr=Object.prototype.propertyIsEnumerable,ve=(e,t,r)=>t in e?hr(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,_=(e,t)=>{for(var r in t||(t={}))_r.call(t,r)&&ve(e,r,t[r]);if(ye)for(var r of ye(t))Cr.call(t,r)&&ve(e,r,t[r]);return e},V=(e,t)=>Sr(e,xr(t));function kr(e,t){var r;if(!t)return e;const o=Object.keys(e).reduce((a,n)=>{if(n==="headings"&&t.headings){const s=t.headings.sizes?Object.keys(e.headings.sizes).reduce((i,l)=>(i[l]=_(_({},e.headings.sizes[l]),t.headings.sizes[l]),i),{}):e.headings.sizes;return V(_({},a),{headings:V(_(_({},e.headings),t.headings),{sizes:s})})}if(n==="breakpoints"&&t.breakpoints){const s=_(_({},e.breakpoints),t.breakpoints);return V(_({},a),{breakpoints:Object.fromEntries(Object.entries(s).sort((i,l)=>W(i[1])-W(l[1])))})}return a[n]=typeof t[n]=="object"?_(_({},e[n]),t[n]):typeof t[n]=="number"||typeof t[n]=="boolean"||typeof t[n]=="function"?t[n]:t[n]||e[n],a},{});if(t!=null&&t.fontFamily&&!((r=t==null?void 0:t.headings)!=null&&r.fontFamily)&&(o.headings.fontFamily=t.fontFamily),!(o.primaryColor in o.colors))throw new Error("MantineProvider: Invalid theme.primaryColor, it accepts only key of theme.colors, learn more – https://mantine.dev/theming/colors/#primary-color");return o}function wr(e,t){return Fe(kr(e,t))}function Pr(e){return Object.keys(e).reduce((t,r)=>(e[r]!==void 0&&(t[r]=e[r]),t),{})}const Ar={html:{fontFamily:"sans-serif",lineHeight:"1.15",textSizeAdjust:"100%"},body:{margin:0},"article, aside, footer, header, nav, section, figcaption, figure, main":{display:"block"},h1:{fontSize:"2em"},hr:{boxSizing:"content-box",height:0,overflow:"visible"},pre:{fontFamily:"monospace, monospace",fontSize:"1em"},a:{background:"transparent",textDecorationSkip:"objects"},"a:active, a:hover":{outlineWidth:0},"abbr[title]":{borderBottom:"none",textDecoration:"underline"},"b, strong":{fontWeight:"bolder"},"code, kbp, samp":{fontFamily:"monospace, monospace",fontSize:"1em"},dfn:{fontStyle:"italic"},mark:{backgroundColor:"#ff0",color:"#000"},small:{fontSize:"80%"},"sub, sup":{fontSize:"75%",lineHeight:0,position:"relative",verticalAlign:"baseline"},sup:{top:"-0.5em"},sub:{bottom:"-0.25em"},"audio, video":{display:"inline-block"},"audio:not([controls])":{display:"none",height:0},img:{borderStyle:"none",verticalAlign:"middle"},"svg:not(:root)":{overflow:"hidden"},"button, input, optgroup, select, textarea":{fontFamily:"sans-serif",fontSize:"100%",lineHeight:"1.15",margin:0},"button, input":{overflow:"visible"},"button, select":{textTransform:"none"},"button, [type=reset], [type=submit]":{WebkitAppearance:"button"},"button::-moz-focus-inner, [type=button]::-moz-focus-inner, [type=reset]::-moz-focus-inner, [type=submit]::-moz-focus-inner":{borderStyle:"none",padding:0},"button:-moz-focusring, [type=button]:-moz-focusring, [type=reset]:-moz-focusring, [type=submit]:-moz-focusring":{outline:`${E(1)} dotted ButtonText`},legend:{boxSizing:"border-box",color:"inherit",display:"table",maxWidth:"100%",padding:0,whiteSpace:"normal"},progress:{display:"inline-block",verticalAlign:"baseline"},textarea:{overflow:"auto"},"[type=checkbox], [type=radio]":{boxSizing:"border-box",padding:0},"[type=number]::-webkit-inner-spin-button, [type=number]::-webkit-outer-spin-button":{height:"auto"},"[type=search]":{appearance:"none"},"[type=search]::-webkit-search-cancel-button, [type=search]::-webkit-search-decoration":{appearance:"none"},"::-webkit-file-upload-button":{appearance:"button",font:"inherit"},"details, menu":{display:"block"},summary:{display:"list-item"},canvas:{display:"inline-block"},template:{display:"none"}};function jr(){return A.createElement(B,{styles:Ar})}var Er=Object.defineProperty,he=Object.getOwnPropertySymbols,Nr=Object.prototype.hasOwnProperty,$r=Object.prototype.propertyIsEnumerable,Se=(e,t,r)=>t in e?Er(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,O=(e,t)=>{for(var r in t||(t={}))Nr.call(t,r)&&Se(e,r,t[r]);if(he)for(var r of he(t))$r.call(t,r)&&Se(e,r,t[r]);return e};const D=p.createContext({theme:te});function He(){var e;return((e=p.useContext(D))==null?void 0:e.theme)||te}function pn(e){const t=He(),r=o=>{var a,n,s,i;return{styles:((a=t.components[o])==null?void 0:a.styles)||{},classNames:((n=t.components[o])==null?void 0:n.classNames)||{},variants:(s=t.components[o])==null?void 0:s.variants,sizes:(i=t.components[o])==null?void 0:i.sizes}};return Array.isArray(e)?e.map(r):[r(e)]}function mn(){var e;return(e=p.useContext(D))==null?void 0:e.emotionCache}function gn(e,t,r){var o;const a=He(),n=(o=a.components[e])==null?void 0:o.defaultProps,s=typeof n=="function"?n(a):n;return O(O(O({},t),s),Pr(r))}function Tr({theme:e,emotionCache:t,withNormalizeCSS:r=!1,withGlobalStyles:o=!1,withCSSVariables:a=!1,inherit:n=!1,children:s}){const i=p.useContext(D),l=wr(te,n?O(O({},i.theme),e):e);return A.createElement(Xe,{theme:l},A.createElement(D.Provider,{value:{theme:l,emotionCache:t}},r&&A.createElement(jr,null),o&&A.createElement(yr,{theme:l}),a&&A.createElement(vr,{theme:l}),typeof l.globalStyles=="function"&&A.createElement(B,{styles:l.globalStyles(l)}),s))}Tr.displayName="@mantine/core/MantineProvider";export{on as A,Yr as B,Te as C,Gr as D,at as E,Ur as F,Vr as G,Zr as H,L as I,Fr as J,Hr as K,Wr as L,Dr as M,Mr as N,nn as O,G as P,Or as Q,zr as R,Rr as S,Qe as T,sn as U,cn as V,dn as W,Tr as X,M as a,ct as b,an as c,ne as d,un as e,mn as f,He as g,pn as h,Pr as i,W as j,Le as k,gn as l,fn as m,P as n,tn as o,rn as p,Br as q,E as r,Qr as s,en as t,ln as u,qr as v,Lr as w,Xr as x,Jr as y,Kr as z};
