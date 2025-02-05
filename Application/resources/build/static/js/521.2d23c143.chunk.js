"use strict";(self.webpackChunkmyapp=self.webpackChunkmyapp||[]).push([[521],{90916:(e,a,r)=>{r.d(a,{A:()=>o});r(65043);var t=r(98964),s=r(70579);const{Footer:n}=t.A,o=()=>(0,s.jsxs)(n,{style:{textAlign:"center"},children:["\xa9",(new Date).getFullYear()," Fourntec. All rights reserved."]})},16470:(e,a,r)=>{r.d(a,{A:()=>d});var t=r(65043),s=r(98964),n=r(10898),o=r(72407),i=r(49997),c=r(70579);const{Header:l}=s.A,d=()=>{const[e,a]=(0,t.useState)(!1);return(0,t.useEffect)((()=>{const e=()=>{a(window.innerWidth<768)};return e(),window.addEventListener("resize",e),()=>window.removeEventListener("resize",e)}),[]),(0,c.jsx)(l,{className:i.A.header,children:(0,c.jsxs)(n.A,{align:"center",children:[(0,c.jsx)("img",{src:o,alt:"Fourntec Logo",className:i.A.headerLogo}),(0,c.jsx)("h1",{className:i.A.headerTitle,children:e?"Fourntec":"Fourntec Inventory Management System"})]})})}},57521:(e,a,r)=>{r.r(a),r.d(a,{default:()=>F});var t=r(65043),s=r(98964),n=r(95010),o=r(78507),i=r(22019),c=r(85578),l=r(3188),d=r(61831),m=r(53722),h=r(75388),u=r(98617),f=r(73216),g=r(35475),p=r(86213);const v="RegisterForm_registerContainer__oLUxG",A="RegisterForm_register_title__v2aIY",x="RegisterForm_registerForm__P0QB9",j="RegisterForm_loginLink__XepzG";var y=r(70579);const{Option:_}=n.A,w=()=>{const[e]=o.A.useForm(),a=(0,f.Zp)(),[r,s]=(0,t.useState)(!1);return(0,y.jsxs)("div",{className:v,children:[(0,y.jsx)("h1",{className:A,children:"Create an Account"}),(0,y.jsxs)(o.A,{form:e,onFinish:async r=>{s(!0);try{const e=await p.A.post("https://mcws.mooo.com/api/register",r,{headers:{Accept:"application/json","Content-Type":"application/json"}});if(!e.data||201!==e.status)throw new Error("Unexpected response from server");i.Ay.success("Registration successful! Please log in."),a("/login")}catch(c){var t;if(422===(null===(t=c.response)||void 0===t?void 0:t.status)){const a=c.response.data.errors;Object.keys(a).forEach((r=>{e.setFields([{name:r,errors:[a[r][0]]}])}))}else{var n,o;i.Ay.error((null===(n=c.response)||void 0===n||null===(o=n.data)||void 0===o?void 0:o.message)||"An error occurred during registration")}}finally{s(!1)}},className:x,children:[(0,y.jsx)(o.A.Item,{name:"staff_id",validateTrigger:["onBlur","onChange"],rules:[{validator:async(e,a)=>{if(!a)return Promise.reject("Please input your Staff ID!");if(a.startsWith("0"))return Promise.reject("Staff ID cannot start with 0");if(!/^[a-zA-Z0-9]+$/.test(a))return Promise.reject("Staff ID can only contain letters and numbers");if(a.length<4)return Promise.reject("Staff ID must be at least 4 characters long");try{return(await p.A.post("https://mcws.mooo.com/api/check-staff-id",{staff_id:a},{headers:{Accept:"application/json","Content-Type":"application/json"}})).data.exists?Promise.reject("This Staff ID is already in use"):Promise.resolve()}catch(r){return Promise.reject("Error checking Staff ID availability")}}}],hasFeedback:!0,children:(0,y.jsx)(c.A,{prefix:(0,y.jsx)(d.A,{}),placeholder:"Staff ID",maxLength:20,onInput:e=>{e.target.value=e.target.value.replace(/[^a-zA-Z0-9]/g,"").replace(/^0+/,"")}})}),(0,y.jsx)(o.A.Item,{name:"username",validateTrigger:["onBlur","onChange"],rules:[{validator:async(e,a)=>{if(!a)return Promise.reject("Please input your username!");if(!/^[a-zA-Z0-9_]+$/.test(a))return Promise.reject("Username can only contain letters, numbers, and underscores");if(a.length<3)return Promise.reject("Username must be at least 3 characters long");try{return(await p.A.post("https://mcws.mooo.com/api/check-username",{username:a},{headers:{Accept:"application/json","Content-Type":"application/json"}})).data.exists?Promise.reject("This Username is already in use"):Promise.resolve()}catch(r){return Promise.reject("Error checking Username availability")}}}],hasFeedback:!0,children:(0,y.jsx)(c.A,{prefix:(0,y.jsx)(m.A,{}),placeholder:"Username",maxLength:30,onInput:e=>{e.target.value=e.target.value.replace(/[^a-zA-Z0-9_]/g,"")}})}),(0,y.jsx)(o.A.Item,{name:"email",validateTrigger:["onBlur","onChange"],rules:[{validator:async(e,a)=>{if(!a)return Promise.reject("Please input your email");if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(a))return Promise.reject("Please enter a valid email address!");try{return(await p.A.post("https://mcws.mooo.com/api/check-email",{email:a},{headers:{Accept:"application/json","Content-Type":"application/json"}})).data.exists?Promise.reject("This email is already registered"):Promise.resolve()}catch(r){return Promise.reject("Error checking email availability")}}}],hasFeedback:!0,children:(0,y.jsx)(c.A,{prefix:(0,y.jsx)(h.A,{}),placeholder:"Email",maxLength:50})}),(0,y.jsx)(o.A.Item,{name:"password",validateTrigger:["onBlur","onChange"],rules:[{required:!0,message:"Please input your password!"},{min:8,message:"Password must be at least 8 characters long"}],hasFeedback:!0,children:(0,y.jsx)(c.A.Password,{prefix:(0,y.jsx)(u.A,{}),placeholder:"Password",maxLength:100})}),(0,y.jsx)(o.A.Item,{name:"password_confirmation",validateTrigger:["onBlur","onChange"],dependencies:["password"],rules:[{required:!0,message:"Please confirm your password!"},e=>{let{getFieldValue:a}=e;return{validator:(e,r)=>r&&a("password")!==r?Promise.reject(new Error("The two passwords do not match!")):Promise.resolve()}}],hasFeedback:!0,children:(0,y.jsx)(c.A.Password,{prefix:(0,y.jsx)(u.A,{}),placeholder:"Confirm Password",maxLength:100})}),(0,y.jsx)(o.A.Item,{name:"role",validateTrigger:["onBlur","onChange"],rules:[{required:!0,message:"Please select your role!"}],hasFeedback:!0,children:(0,y.jsxs)(n.A,{placeholder:"Select your role",children:[(0,y.jsx)(_,{value:"SALESPERSON",children:"Salesperson"}),(0,y.jsx)(_,{value:"OFFICE_STAFF",children:"Office Staff"})]})}),(0,y.jsx)(o.A.Item,{children:(0,y.jsx)(l.Ay,{type:"primary",htmlType:"submit",loading:r,block:!0,children:"Register"})})]}),(0,y.jsxs)("div",{className:j,children:["Already have an account? ",(0,y.jsx)(g.N_,{to:"/login",children:"Login here"})]})]})};var C=r(16470),P=r(90916);const b="register_layout__AXRBK",N="register_content__JiRHc",{Content:S}=s.A,F=()=>(0,y.jsxs)(s.A,{className:b,children:[(0,y.jsx)(C.A,{}),(0,y.jsx)(S,{className:N,children:(0,y.jsx)(w,{})}),(0,y.jsx)(P.A,{})]})},61831:(e,a,r)=>{r.d(a,{A:()=>c});var t=r(58168),s=r(65043);const n={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 632H136V232h752v560zM610.3 476h123.4c1.3 0 2.3-3.6 2.3-8v-48c0-4.4-1-8-2.3-8H610.3c-1.3 0-2.3 3.6-2.3 8v48c0 4.4 1 8 2.3 8zm4.8 144h185.7c3.9 0 7.1-3.6 7.1-8v-48c0-4.4-3.2-8-7.1-8H615.1c-3.9 0-7.1 3.6-7.1 8v48c0 4.4 3.2 8 7.1 8zM224 673h43.9c4.2 0 7.6-3.3 7.9-7.5 3.8-50.5 46-90.5 97.2-90.5s93.4 40 97.2 90.5c.3 4.2 3.7 7.5 7.9 7.5H522a8 8 0 008-8.4c-2.8-53.3-32-99.7-74.6-126.1a111.8 111.8 0 0029.1-75.5c0-61.9-49.9-112-111.4-112s-111.4 50.1-111.4 112c0 29.1 11 55.5 29.1 75.5a158.09 158.09 0 00-74.6 126.1c-.4 4.6 3.2 8.4 7.8 8.4zm149-262c28.5 0 51.7 23.3 51.7 52s-23.2 52-51.7 52-51.7-23.3-51.7-52 23.2-52 51.7-52z"}}]},name:"idcard",theme:"outlined"};var o=r(51835),i=function(e,a){return s.createElement(o.A,(0,t.A)({},e,{ref:a,icon:n}))};const c=s.forwardRef(i)},98617:(e,a,r)=>{r.d(a,{A:()=>c});var t=r(58168),s=r(65043);const n={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240zm460 600H232V536h560v304zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 10-56 0z"}}]},name:"lock",theme:"outlined"};var o=r(51835),i=function(e,a){return s.createElement(o.A,(0,t.A)({},e,{ref:a,icon:n}))};const c=s.forwardRef(i)},75388:(e,a,r)=>{r.d(a,{A:()=>c});var t=r(58168),s=r(65043);const n={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 110.8V792H136V270.8l-27.6-21.5 39.3-50.5 42.8 33.3h643.1l42.8-33.3 39.3 50.5-27.7 21.5zM833.6 232L512 482 190.4 232l-42.8-33.3-39.3 50.5 27.6 21.5 341.6 265.6a55.99 55.99 0 0068.7 0L888 270.8l27.6-21.5-39.3-50.5-42.7 33.2z"}}]},name:"mail",theme:"outlined"};var o=r(51835),i=function(e,a){return s.createElement(o.A,(0,t.A)({},e,{ref:a,icon:n}))};const c=s.forwardRef(i)},53722:(e,a,r)=>{r.d(a,{A:()=>c});var t=r(58168),s=r(65043);const n={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"}}]},name:"user",theme:"outlined"};var o=r(51835),i=function(e,a){return s.createElement(o.A,(0,t.A)({},e,{ref:a,icon:n}))};const c=s.forwardRef(i)},98964:(e,a,r)=>{r.d(a,{A:()=>_});var t=r(60436),s=r(65043),n=r(98139),o=r.n(n),i=r(18574),c=r(35296),l=r(26396),d=r(62149),m=r(18156);var h=r(58313),u=function(e,a){var r={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&a.indexOf(t)<0&&(r[t]=e[t]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var s=0;for(t=Object.getOwnPropertySymbols(e);s<t.length;s++)a.indexOf(t[s])<0&&Object.prototype.propertyIsEnumerable.call(e,t[s])&&(r[t[s]]=e[t[s]])}return r};function f(e){let{suffixCls:a,tagName:r,displayName:t}=e;return e=>s.forwardRef(((t,n)=>s.createElement(e,Object.assign({ref:n,suffixCls:a,tagName:r},t))))}const g=s.forwardRef(((e,a)=>{const{prefixCls:r,suffixCls:t,className:n,tagName:i}=e,l=u(e,["prefixCls","suffixCls","className","tagName"]),{getPrefixCls:d}=s.useContext(c.QO),m=d("layout",r),[f,g,p]=(0,h.Ay)(m),v=t?`${m}-${t}`:m;return f(s.createElement(i,Object.assign({className:o()(r||v,n,g,p),ref:a},l)))})),p=s.forwardRef(((e,a)=>{const{direction:r}=s.useContext(c.QO),[n,f]=s.useState([]),{prefixCls:g,className:p,rootClassName:v,children:A,hasSider:x,tagName:j,style:y}=e,_=u(e,["prefixCls","className","rootClassName","children","hasSider","tagName","style"]),w=(0,i.A)(_,["suffixCls"]),{getPrefixCls:C,layout:P}=s.useContext(c.QO),b=C("layout",g),N=function(e,a,r){return"boolean"===typeof r?r:!!e.length||(0,d.A)(a).some((e=>e.type===m.A))}(n,A,x),[S,F,z]=(0,h.Ay)(b),I=o()(b,{[`${b}-has-sider`]:N,[`${b}-rtl`]:"rtl"===r},null===P||void 0===P?void 0:P.className,p,v,F,z),O=s.useMemo((()=>({siderHook:{addSider:e=>{f((a=>[].concat((0,t.A)(a),[e])))},removeSider:e=>{f((a=>a.filter((a=>a!==e))))}}})),[]);return S(s.createElement(l.M.Provider,{value:O},s.createElement(j,Object.assign({ref:a,className:I,style:Object.assign(Object.assign({},null===P||void 0===P?void 0:P.style),y)},w),A)))})),v=f({tagName:"div",displayName:"Layout"})(p),A=f({suffixCls:"header",tagName:"header",displayName:"Header"})(g),x=f({suffixCls:"footer",tagName:"footer",displayName:"Footer"})(g),j=f({suffixCls:"content",tagName:"main",displayName:"Content"})(g),y=v;y.Header=A,y.Footer=x,y.Content=j,y.Sider=m.A,y._InternalSiderContext=m.P;const _=y},49997:(e,a,r)=>{r.d(a,{A:()=>t});const t={header:"header_header__+IKgv",headerTitle:"header_headerTitle__WM1Ht",headerRight:"header_headerRight__YjirV",avatar:"header_avatar__cj3aR",fadeOut:"header_fadeOut__YhYyY",notificationButton:"header_notificationButton__C69hU",notificationCard:"header_notificationCard__ynDZ6",notificationItem:"header_notificationItem__Wt+Gx",viewAllLink:"header_viewAllLink__SVXH4",headerLogo:"header_headerLogo__CtVx0"}},72407:(e,a,r)=>{e.exports=r.p+"static/media/FourntecLogo.b9221625fb6d7150b3b1.png"}}]);
//# sourceMappingURL=521.2d23c143.chunk.js.map