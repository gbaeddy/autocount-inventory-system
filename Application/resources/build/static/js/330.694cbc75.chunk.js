"use strict";(self.webpackChunkmyapp=self.webpackChunkmyapp||[]).push([[330],{90916:(e,t,n)=>{n.d(t,{A:()=>a});n(65043);var o=n(98964),r=n(70579);const{Footer:i}=o.A,a=()=>(0,r.jsxs)(i,{style:{textAlign:"center"},children:["\xa9",(new Date).getFullYear()," Fourntec. All rights reserved."]})},24330:(e,t,n)=>{n.r(t),n.d(t,{default:()=>Y});var o=n(65043),r=n(98964),i=n(56597),a=n(42209),s=n(59812),l=n(36428),c=n(72407),d=n(3188),u=n(58732),h=n(79126);const y="Aside_Sider__5hpbE",m="Aside_Logo__VQBls",p="Aside_Menu__QQ43f",g="Aside_menuButton__wt5z+",A="Aside_menuButtonOpen__ZXy08",x="Aside_menuButtonClosed__buqBU";var v=n(73216),f=n(32869),k=n(70579);const{Sider:_}=r.A,j=()=>{const e=(0,v.Zp)(),t=(0,v.zy)(),[n,r]=(0,o.useState)(!1),{user:i}=(0,f.Z)(),[j,w]=(0,o.useState)(window.innerWidth<=768),[b,I]=(0,o.useState)(!1);(0,o.useEffect)((()=>{const e=((e,t)=>{let n;return function(){for(var o=arguments.length,r=new Array(o),i=0;i<o;i++)r[i]=arguments[i];clearTimeout(n),n=setTimeout((()=>e(...r)),t)}})((()=>{const e=window.innerWidth<=768;w(e),e&&(r(!0),I(!1))}),200);return window.addEventListener("resize",e),()=>window.removeEventListener("resize",e)}),[]);const S=()=>{j&&(I(!b),r(!0))},C=[{key:"/home",icon:"HomeOutlined",label:"Home"},{key:"/notifications",icon:"BellOutlined",label:"Notifications"}],F=[{key:"/user",icon:"UserOutlined",label:"User",children:[{key:"/user/approval",label:"User Approval"},{key:"/user/management",label:"User Management"}]},..."APPROVED"===i.reg_status?[{key:"/inventory",icon:"ShoppingOutlined",label:"Inventory",children:[{key:"/inventory/request",label:"Inventory Request"},{key:"/inventory/operation",label:"Inventory Operation"},{key:"/inventory/level",label:"Inventory Level"}]}]:[],{key:"/activity",icon:"FileOutlined",label:"Activity Log"}],L=[..."APPROVED"===i.reg_status?[{key:"/inventory",icon:"ShoppingOutlined",label:"Inventory",children:[{key:"/inventory/request",label:"Inventory Request"},{key:"/inventory/operation",label:"Inventory Operation"},{key:"/inventory/level",label:"Inventory Level"}]}]:[]],O=[..."APPROVED"===i.reg_status?[{key:"/inventory",icon:"ShoppingOutlined",label:"Inventory",children:[{key:"/inventory/request",label:"Inventory Request"},{key:"/inventory/level",label:"Inventory Level"}]}]:[]],E=(()=>{if(i)switch(i.role){case"ADMIN":return[...C,...F];case"OFFICE_STAFF":return[...C,...L];case"SALESPERSON":return[...C,...O];default:return C}return C})().map((e=>{const t={key:e.key,icon:(n=e.icon,o.createElement(a[n])),label:e.label};var n;return e.children&&(t.children=e.children.map((e=>({key:e.key,label:e.label})))),t})),z=()=>{e("/home")};return(0,k.jsxs)(k.Fragment,{children:[j&&(0,k.jsx)(d.Ay,{className:`${g} ${b?A:x}`,onClick:S,icon:b?(0,k.jsx)(s.A,{style:{color:"#FFFFFF"}}):(0,k.jsx)(l.A,{style:{color:"#FFFFFF"}})}),(0,k.jsx)("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(0, 0, 0, 0.5)",zIndex:99,display:j&&b?"block":"none"},onClick:S}),(0,k.jsx)(u.Ay,{theme:{components:{Menu:{darkItemSelectedBg:"#4E71CF",darkSubMenuItemBg:"#101627"},Layout:{triggerBg:"#101627"}}},children:(0,k.jsxs)(_,{collapsible:!j,collapsed:n,onCollapse:e=>r(e),className:y,style:{width:j?"100%":"250px",position:j?"fixed":"sticky",left:j?b?0:"-100%":0,zIndex:100},children:[(0,k.jsx)("div",{className:m,style:{height:"15%",margin:"16px",textAlign:"center",color:"white"},children:n?(0,k.jsx)("img",{src:c,style:{width:"50px",height:"50px",marginTop:"1vh"},alt:"Logo",onClick:z}):(0,k.jsx)("img",{src:c,style:{width:"90px",height:"90px",marginTop:"1vh"},alt:"Logo",onClick:z})}),(0,k.jsx)(h.A,{theme:"dark",selectedKeys:[t.pathname],mode:"inline",items:E,className:p,onClick:t=>{let{key:n}=t;e(n)}})]})})]})};var w=n(33355),b=n(85531),I=n(54522),S=n(10898),C=n(22019),F=n(30326),L=n(37490),O=n(91686),E=n(2761),z=n(46237),B=n(89967),R=n(94786),N=n(36160),T=n(58502),q=n(53722),D=n(49997),P=n(33178),V=n(94505);const{Header:$}=r.A,{Text:M}=w.A,H=()=>{const e=(0,v.Zp)(),[t,n]=(0,o.useState)(!1),[r,i]=(0,o.useState)([]),[a,s]=(0,o.useState)(0),[l,c]=(0,o.useState)(!1),[h,y]=(0,o.useState)(window.innerWidth<=768),m=(0,o.useCallback)((async()=>{try{const e=await V.Ay.get("/notifications");i(e.data),s(e.data.filter((e=>"unread"===e.notif_status)).length)}catch(e){console.error("Failed to fetch notifications:",e)}}),[]);(0,o.useEffect)((()=>{m();const e=()=>{y(window.innerWidth<=768)};window.addEventListener("resize",e);const t=setInterval(m,3e4);return()=>{window.removeEventListener("resize",e),clearInterval(t)}}),[m]);const p=e=>{switch(e){case"APPROVED":return(0,k.jsx)(z.A,{style:{color:"#52c41a"}});case"REJECTED":return(0,k.jsx)(B.A,{style:{color:"#f5222d"}});default:return(0,k.jsx)(R.A,{style:{color:"#1890ff"}})}},g=e=>{let{notifications:t,onNotificationClick:n,onViewAll:o}=e;return(0,k.jsx)(b.A,{style:{width:300},children:(0,k.jsxs)("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:[(0,k.jsx)("div",{style:{maxHeight:"300px",overflowY:"auto",marginBottom:"8px"},children:(0,k.jsx)(I.A,{itemLayout:"horizontal",dataSource:t.slice(0,3),renderItem:e=>(0,k.jsx)(I.A.Item,{style:{padding:"12px",cursor:"pointer",transition:"background-color 0.3s"},onClick:()=>n(e),className:D.A.notificationItem,children:(0,k.jsx)(I.A.Item.Meta,{avatar:p(e.request_status),title:(0,k.jsx)(M,{strong:!0,style:{color:"unread"===e.notif_status?"#1890ff":"rgba(0, 0, 0, 0.85)"},children:e.message}),description:(0,k.jsx)(S.A,{direction:"vertical",size:4,children:(0,k.jsx)(M,{type:"secondary",style:{fontSize:"12px"},children:new Date(e.created_at).toLocaleString()})})})})})}),(0,k.jsx)("div",{style:{borderTop:"1px solid #f0f0f0",padding:"8px 0",textAlign:"center",marginTop:"auto"},children:(0,k.jsx)(d.Ay,{type:"link",onClick:o,style:{width:"100%"},children:"View all notifications"})})]})})},A={items:[{key:"logout",label:"Logout",icon:(0,k.jsx)(N.A,{}),onClick:async()=>{n(!0);try{await V.Ay.post("/logout",{},{headers:{Authorization:`Bearer ${localStorage.getItem("token")}`}}),C.Ay.success("Logging out..."),document.querySelector(`.${D.A.header.replace(/[^a-zA-Z0-9-_]/g,"\\$&")}`).classList.add(D.A.fadeOut),setTimeout((()=>{localStorage.removeItem("token"),localStorage.removeItem("user"),e("/login")}),500)}catch(t){console.error("Logout error:",t),C.Ay.error("An error occurred during logout. Please try again."),n(!1)}}}]};return(0,k.jsx)(u.Ay,{theme:{components:{Layout:{headerColor:"#fff"}}},children:(0,k.jsxs)($,{className:D.A.header,children:[(0,k.jsx)("h1",{className:D.A.headerTitle,children:h?"Fourntec":"Fourntec Inventory Management System"}),(0,k.jsxs)(S.A,{children:[(0,k.jsx)(F.A,{overlay:(0,k.jsx)(g,{notifications:r,onNotificationClick:t=>{const n=(e=>{const t=e.message.toLowerCase();if(t.includes("registration")){const t=e.message.match(/Staff ID: (\d+)/),n=t?t[1]:null;if(n)return`/user/approval?staffId=${n}`}if(t.includes("product request")){const t=e.message.match(/ID: (\d+)/),n=t?t[1]:null;return n?`/inventory/request?id=${n}`:"/inventory/request"}return"/notifications"})(t);c(!1),e(n)},onViewAll:()=>{c(!1),e("/notifications")}}),trigger:["click"],placement:"bottomRight",open:l,onOpenChange:e=>{c(e),e&&a>0&&(async()=>{try{await V.Ay.post("/notifications/mark-all-read"),m()}catch(e){console.error("Failed to mark all notifications as read:",e)}})()},children:(0,k.jsx)(L.A,{count:a,offset:[-15,5],children:(0,k.jsx)(d.Ay,{icon:(0,k.jsx)(T.A,{}),className:D.A.notificationButton})})}),(0,k.jsx)(O.A,{spinning:t,size:"small",children:(0,k.jsx)(F.A,{menu:A,placement:"bottomRight",arrow:!0,trigger:["click"],children:(0,k.jsx)(E.A,{icon:(0,k.jsx)(q.A,{}),src:P,className:D.A.avatar,style:{width:"40px",height:"40px",cursor:"pointer"}})})})]})]})})};var U=n(90916);const{Content:W}=r.A,Y=()=>(0,k.jsx)(i.A,{gap:"middle",wrap:!0,children:(0,k.jsxs)(r.A,{style:{minHeight:"100vh"},children:[(0,k.jsx)(j,{}),(0,k.jsxs)(r.A,{children:[(0,k.jsx)(H,{}),(0,k.jsx)(W,{children:(0,k.jsx)(v.sv,{})}),(0,k.jsx)(U.A,{})]})]})})},94505:(e,t,n)=>{n.d(t,{Ay:()=>a});var o=n(86213);const r=o.A.create({baseURL:"https://mcws.mooo.com/api",withCredentials:!0,headers:{Accept:"application/json","Content-Type":"application/json"}});r.interceptors.request.use((e=>{const t=localStorage.getItem("token");return t&&(e.headers.Authorization=`Bearer ${t}`),e}),(e=>Promise.reject(e))),r.interceptors.response.use((e=>e),(e=>(e.response&&401===e.response.status&&(localStorage.removeItem("token"),window.location="/login"),Promise.reject(e))));const i=localStorage.getItem("token");i&&(o.A.defaults.headers.common.Authorization=`Bearer ${i}`);const a=r},49997:(e,t,n)=>{n.d(t,{A:()=>o});const o={header:"header_header__+IKgv",headerTitle:"header_headerTitle__WM1Ht",headerRight:"header_headerRight__YjirV",avatar:"header_avatar__cj3aR",fadeOut:"header_fadeOut__YhYyY",notificationButton:"header_notificationButton__C69hU",notificationCard:"header_notificationCard__ynDZ6",notificationItem:"header_notificationItem__Wt+Gx",viewAllLink:"header_viewAllLink__SVXH4",headerLogo:"header_headerLogo__CtVx0"}},72407:(e,t,n)=>{e.exports=n.p+"static/media/FourntecLogo.b9221625fb6d7150b3b1.png"},33178:(e,t,n)=>{e.exports=n.p+"static/media/hutaowave.867ef5779761a5ceee23.png"}}]);
//# sourceMappingURL=330.694cbc75.chunk.js.map