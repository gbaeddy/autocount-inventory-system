"use strict";(self.webpackChunkmyapp=self.webpackChunkmyapp||[]).push([[491],{34491:(e,t,r)=>{r.r(t),r.d(t,{default:()=>Q});var n=r(65043),a=r(33355),l=r(95010),s=r(78507),o=r(22019),i=r(29682),c=r(47419),d=r(11645),u=r(85578),m=r(97914),p=r(3188),h=r(85531),g=r(76399),x=r(10898),v=r(96651),A=r(60647),y=r(18125),j=r(72968),f=r(64642),b=r(50223),C=r(94786),I=r(67407),O=r(61966),w=r(46011),S=r(75337),B=r(1259),P=r(46237),k=r(80599),F=r(83038),E=r(62058),T=r(90617),N=r(94505),$=r(52967),z=r(48092),D=r(70579);const{Title:_,Text:M}=a.A,{Option:V}=l.A,R=e=>{let{visible:t,onCancel:r,onSubmit:a,initialValues:p,mode:h}=e;const[g]=s.A.useForm(),[x]=(0,n.useState)(!1);(0,n.useEffect)((()=>{t&&(g.resetFields(),p&&g.setFieldsValue(p))}),[t,p,g]);const v=e=>(t,r)=>void 0===r||null===r?Promise.reject(`Please enter a valid ${e}`):r<0?Promise.reject(`${e} cannot be negative`):"Balance Qty"!==e||Number.isInteger(r)?Promise.resolve():Promise.reject("Balance Qty must be a whole number");(0,n.useEffect)((()=>{const e=g.getFieldValue("BaseUOM");e&&g.setFieldsValue({SalesUOM:e,PurchaseUOM:e});const t=g.getFieldValue("BalQty");void 0!==t&&g.setFieldsValue({TotalBalQty:t})}),[g]);return(0,D.jsx)(i.A,{title:"edit"===h?"Edit Item":"Add New Item",open:t,onCancel:r,onOk:async()=>{try{const e=await g.validateFields();console.log("Submitting form values:",e),await a(e),g.resetFields()}catch(e){console.error("Form validation failed:",e),e.errorFields&&o.Ay.error("Please fill in all required fields correctly")}},confirmLoading:x,width:800,children:(0,D.jsxs)(s.A,{form:g,layout:"vertical",children:[(0,D.jsxs)(c.A,{gutter:16,children:[(0,D.jsx)(d.A,{span:12,children:(0,D.jsx)(s.A.Item,{name:"ItemCode",label:"Item Code",rules:[{validator:async(e,t)=>{if("edit"===h)return Promise.resolve();if(!t)return Promise.reject("Please enter an item code");if(!/^[a-zA-Z0-9]+$/.test(t))return Promise.reject("Item Code can only contain letters and numbers");try{const e=await N.Ay.get("/items",{params:{search:t,per_page:100}});if(e.data&&e.data.data){const r=e.data.data;if(r.some((e=>e.ItemCode.toLowerCase()===t.toLowerCase())))return Promise.reject("Item code already exists")}return Promise.resolve()}catch(r){return console.error("Error checking item code:",r),o.Ay.warning("Could not verify if item code is unique"),Promise.resolve()}}}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsx)(u.A,{placeholder:"Item Code",maxLength:20,onInput:e=>{e.target.value=e.target.value.replace(/[^a-zA-Z0-9]/g,"")},disabled:"edit"===h})})}),(0,D.jsx)(d.A,{span:12,children:(0,D.jsx)(s.A.Item,{name:"Description",label:"Description",rules:[{validator:(e,t)=>t?Promise.resolve():Promise.reject("Please enter a description")}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsx)(u.A,{placeholder:"Description",maxLength:100})})})]}),(0,D.jsxs)(c.A,{gutter:16,children:[(0,D.jsx)(d.A,{span:12,children:(0,D.jsx)(s.A.Item,{name:"ItemGroup",label:"Item Group",rules:[{required:!0,message:"Required"}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsxs)(l.A,{placeholder:"Select Item Group",children:[(0,D.jsx)(l.A.Option,{value:"RELOAD",children:"RELOAD"}),(0,D.jsx)(l.A.Option,{value:"PHONE",children:"PHONE"})]})})}),(0,D.jsx)(d.A,{span:12,children:(0,D.jsx)(s.A.Item,{name:"ItemType",label:"Item Type",rules:[{required:!0,message:"Required"}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsxs)(l.A,{placeholder:"Select Item Type",children:[(0,D.jsx)(l.A.Option,{value:"CELCOM",children:"CELCOM"}),(0,D.jsx)(l.A.Option,{value:"DIGI",children:"DIGI"}),(0,D.jsx)(l.A.Option,{value:"LG",children:"LG"})]})})})]}),(0,D.jsxs)(c.A,{gutter:16,children:[(0,D.jsx)(d.A,{span:8,children:(0,D.jsx)(s.A.Item,{name:"StockControl",label:"Stock Control",rules:[{required:!0,message:"Required"}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsxs)(l.A,{children:[(0,D.jsx)(V,{value:"T",children:"Yes"}),(0,D.jsx)(V,{value:"F",children:"No"})]})})}),(0,D.jsx)(d.A,{span:8,children:(0,D.jsx)(s.A.Item,{name:"HasSerialNo",label:"Has Serial No",rules:[{required:!0,message:"Required"}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsxs)(l.A,{children:[(0,D.jsx)(V,{value:"T",children:"Yes"}),(0,D.jsx)(V,{value:"F",children:"No"})]})})}),(0,D.jsx)(d.A,{span:8,children:(0,D.jsx)(s.A.Item,{name:"HasBatchNo",label:"Has Batch No",rules:[{required:!0,message:"Required"}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsxs)(l.A,{children:[(0,D.jsx)(V,{value:"T",children:"Yes"}),(0,D.jsx)(V,{value:"F",children:"No"})]})})})]}),(0,D.jsxs)(c.A,{gutter:16,children:[(0,D.jsx)(d.A,{span:8,children:(0,D.jsx)(s.A.Item,{name:"DutyRate",label:"Duty Rate",rules:[{validator:v("Duty Rate")}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsx)(m.A,{style:{width:"100%"},min:0})})}),(0,D.jsx)(d.A,{span:8,children:(0,D.jsx)(s.A.Item,{name:"Price",label:"Price",rules:[{validator:v("Price")}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsx)(m.A,{style:{width:"100%"},min:0})})}),(0,D.jsx)(d.A,{span:8,children:(0,D.jsx)(s.A.Item,{name:"BalQty",label:"Balance Qty",rules:[{validator:v("Balance Qty")}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsx)(m.A,{style:{width:"100%"},min:0,precision:0})})})]}),(0,D.jsxs)(c.A,{gutter:16,children:[(0,D.jsx)(d.A,{span:8,children:(0,D.jsx)(s.A.Item,{name:"BaseUOM",label:"Base UOM",rules:[{validator:(e,t)=>t?/^[a-zA-Z]+$/.test(t)?Promise.resolve():Promise.reject("Base UOM can only contain letters"):Promise.reject("Please enter a base UOM")}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsx)(u.A,{onChange:e=>{return t=e.target.value,void(/^[a-zA-Z]*$/.test(t)&&g.setFieldsValue({SalesUOM:t,PurchaseUOM:t}));var t},disabled:"edit"===h,onInput:e=>{e.target.value=e.target.value.replace(/[^a-zA-Z]/g,"")}})})}),(0,D.jsx)(d.A,{span:8,children:(0,D.jsx)(s.A.Item,{name:"SalesUOM",label:"Sales UOM",rules:[{required:!0}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsx)(u.A,{disabled:!0})})}),(0,D.jsx)(d.A,{span:8,children:(0,D.jsx)(s.A.Item,{name:"PurchaseUOM",label:"Purchase UOM",rules:[{required:!0}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsx)(u.A,{disabled:!0})})})]}),(0,D.jsxs)(c.A,{gutter:16,children:[(0,D.jsx)(d.A,{span:12,children:(0,D.jsx)(s.A.Item,{name:"IsActive",label:"Status",rules:[{required:!0,message:"Required"}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsxs)(l.A,{children:[(0,D.jsx)(V,{value:"T",children:"Active"}),(0,D.jsx)(V,{value:"F",children:"Inactive"})]})})}),(0,D.jsx)(d.A,{span:12,children:(0,D.jsx)(s.A.Item,{name:"CostingMethod",label:"Costing Method",rules:[{required:!0,message:"Required"}],validateTrigger:["onChange","onBlur"],hasFeedback:!0,children:(0,D.jsxs)(l.A,{children:[(0,D.jsx)(V,{value:0,children:"FIXED COST"}),(0,D.jsx)(V,{value:1,children:"WEIGHTED AVERAGE"}),(0,D.jsx)(V,{value:2,children:"FIFO"}),(0,D.jsx)(V,{value:3,children:"LIFO"})]})})})]})]})})},H=e=>{let{item:t,visible:r,onClose:a}=e;const[l,s]=(0,n.useState)(!1),[o,u]=(0,n.useState)(r);(0,n.useEffect)((()=>{u(r),r&&s(!1)}),[r]);const m=()=>{s(!0),setTimeout((()=>{u(!1),a()}),300)};return t?(0,D.jsxs)(i.A,{title:"Item Details",open:o,onCancel:m,footer:[(0,D.jsx)(p.Ay,{onClick:m,children:"Close"},"close")],width:700,className:"item-details-modal "+(l?"closing":""),children:[(0,D.jsx)(h.A,{children:(0,D.jsxs)(c.A,{gutter:[16,16],children:[(0,D.jsxs)(d.A,{span:12,children:[(0,D.jsx)(M,{type:"secondary",children:"Item Code"}),(0,D.jsx)("div",{children:(0,D.jsx)(M,{strong:!0,children:t.ItemCode})})]}),(0,D.jsxs)(d.A,{span:12,children:[(0,D.jsx)(M,{type:"secondary",children:"Description"}),(0,D.jsx)("div",{children:(0,D.jsx)(M,{strong:!0,children:t.Description})})]}),(0,D.jsxs)(d.A,{span:12,children:[(0,D.jsx)(M,{type:"secondary",children:"Item Group"}),(0,D.jsx)("div",{children:(0,D.jsx)(M,{strong:!0,children:t.ItemGroup})})]}),(0,D.jsxs)(d.A,{span:12,children:[(0,D.jsx)(M,{type:"secondary",children:"Item Type"}),(0,D.jsx)("div",{children:(0,D.jsx)(M,{strong:!0,children:t.ItemType||"N/A"})})]}),(0,D.jsxs)(d.A,{span:12,children:[(0,D.jsx)(M,{type:"secondary",children:"Price"}),(0,D.jsx)("div",{children:(0,D.jsxs)(M,{strong:!0,children:["$",parseFloat(t.Price).toFixed(2)]})})]}),(0,D.jsxs)(d.A,{span:12,children:[(0,D.jsx)(M,{type:"secondary",children:"Current Stock"}),(0,D.jsx)("div",{children:(0,D.jsx)(M,{strong:!0,children:parseFloat(t.BalQty).toFixed(2)})})]}),(0,D.jsxs)(d.A,{span:12,children:[(0,D.jsx)(M,{type:"secondary",children:"Status"}),(0,D.jsx)("div",{children:(0,D.jsx)(g.A,{color:"T"===t.IsActive?"green":"red",children:"T"===t.IsActive?"Active":"Inactive"})})]}),(0,D.jsxs)(d.A,{span:12,children:[(0,D.jsx)(M,{type:"secondary",children:"Stock Control"}),(0,D.jsx)("div",{children:(0,D.jsx)(g.A,{color:"T"===t.StockControl?"blue":"default",children:"T"===t.StockControl?"Yes":"No"})})]})]})}),(0,D.jsx)("style",{jsx:!0,children:"\n        .item-details-modal {\n          transform: scale(1);\n          opacity: 1;\n          transition: transform 0.3s ease-out, opacity 0.3s ease-out;\n        }\n        .item-details-modal.closing {\n          transform: scale(0);\n          opacity: 0;\n        }\n        .ant-modal-content {\n          transition: transform 0.3s ease-out, opacity 0.3s ease-out;\n        }\n        .closing .ant-modal-content {\n          transform: scale(0.8);\n          opacity: 0;\n        }\n      "})]}):null},Q=()=>{const[e,t]=(0,n.useState)([]),[r,a]=(0,n.useState)(!1),[l,s]=(0,n.useState)(""),[i,m]=(0,n.useState)(!1),[V,Q]=(0,n.useState)(!1),[L,q]=(0,n.useState)(null),[W,U]=(0,n.useState)(null),[G,X]=(0,n.useState)(null),[Y,Z]=(0,n.useState)({field:void 0,order:void 0}),[K,J]=(0,n.useState)({totalItems:0,activeItems:0,lowStock:0,totalValue:0}),ee=(0,n.useRef)({current:1,pageSize:10,total:0}),te=(0,n.useCallback)((async function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(G){a(!0);try{var r;const n={page:e.current||ee.current.current,per_page:e.pageSize||ee.current.pageSize,search:l,sort_field:e.sortField||Y.field,sort_direction:e.sortOrder||Y.order},a=await N.Ay.get("/items",{params:n});a.data&&(t(a.data.data),ee.current={...ee.current,current:Number(a.data.current_page),total:Number(a.data.total)});const s=await N.Ay.get("/items",{params:{per_page:9999,search:l}});if(null!==(r=s.data)&&void 0!==r&&r.data){const e=s.data.data;J({totalItems:e.length,activeItems:e.filter((e=>"T"===e.IsActive)).length,lowStock:e.filter((e=>parseFloat(e.BalQty)<=G.low_threshold&&parseFloat(e.BalQty)>0)).length,totalValue:e.reduce(((e,t)=>e+parseFloat(t.Price)*parseFloat(t.BalQty)),0)})}}catch(n){console.error("Error fetching items:",n),o.Ay.error("Failed to fetch inventory items")}finally{a(!1)}}}),[l,G,Y]);(0,n.useEffect)((()=>{(async()=>{a(!0);try{var e;const[r,n]=await Promise.all([N.Ay.get("/stock-settings"),N.Ay.get("/items",{params:{page:ee.current.current,per_page:ee.current.pageSize,search:l}})]);X(r.data),n.data&&(t(n.data.data),ee.current={...ee.current,current:n.data.current_page,total:n.data.total});const a=await N.Ay.get("/items",{params:{per_page:9999,search:l}});if(null!==(e=a.data)&&void 0!==e&&e.data){const e=a.data.data;J({totalItems:e.length,activeItems:e.filter((e=>"T"===e.IsActive)).length,lowStock:e.filter((e=>parseFloat(e.BalQty)<=r.data.low_threshold&&parseFloat(e.BalQty)>0)).length,totalValue:e.reduce(((e,t)=>e+parseFloat(t.Price)*parseFloat(t.BalQty)),0)})}}catch(r){console.error("Error initializing data:",r),o.Ay.error("Failed to load inventory data")}finally{a(!1)}})()}),[l]),(0,n.useEffect)((()=>{G&&te()}),[G,te]);const re=e=>{s(e),ee.current.current=1},ne=[{title:"Item",key:"item",dataIndex:"ItemCode",render:(e,t)=>(0,D.jsxs)(x.A,{children:[(0,D.jsx)(M,{strong:!0,children:t.ItemCode}),(0,D.jsx)(M,{type:"secondary",children:t.Description})]}),sorter:!0},{title:"Group",dataIndex:"ItemGroup",sorter:!0},{title:"Price",dataIndex:"Price",render:e=>`$${parseFloat(e).toFixed(2)}`,sorter:!0},{title:"Stock Level",dataIndex:"BalQty",render:e=>{const t=(e=>{if(!G)return{color:"#52c41a",text:"Loading...",status:"success"};const t=parseFloat(e),{critical_threshold:r,low_threshold:n}=G;return t<=r?{color:"red",text:"Critical"}:t<=n?{color:"orange",text:"Low"}:{color:"green",text:"Healthy"}})(e);return(0,D.jsxs)(g.A,{color:t.color,children:[parseFloat(e).toFixed(2)," - ",t.text]})},sorter:!0},{title:"Status",dataIndex:"IsActive",render:e=>(0,D.jsx)(g.A,{color:"T"===e?"green":"red",children:"T"===e?"Active":"Inactive"})},{title:"Actions",key:"actions",render:(e,t)=>(0,D.jsxs)(x.A,{children:[(0,D.jsx)(v.A,{title:"View Details",children:(0,D.jsx)(p.Ay,{className:$.A.ActionButton,icon:(0,D.jsx)(C.A,{}),onClick:()=>{q(t),Q(!0)}})}),(0,D.jsx)(v.A,{title:"Edit",children:(0,D.jsx)(p.Ay,{className:$.A.ActionButton,icon:(0,D.jsx)(I.A,{}),onClick:()=>{U(t),m(!0)}})}),(0,D.jsx)(A.A,{title:"Delete Item",description:"Are you sure you want to delete this item?",onConfirm:()=>(async e=>{try{await N.Ay.delete(`/items/${e}`),o.Ay.success("Item deleted successfully"),te()}catch(t){console.error("Error deleting item:",t),o.Ay.error("Failed to delete item")}})(t.ItemCode),okText:"Yes",cancelText:"No",okButtonProps:{danger:!0},children:(0,D.jsx)(v.A,{title:"Delete",children:(0,D.jsx)(p.Ay,{className:$.A.DeleteButton,danger:!0,icon:(0,D.jsx)(O.A,{})})})})]})}];return(0,D.jsxs)("div",{style:{padding:24,minHeight:"100vh",background:"#f5f5f5f"},children:[(0,D.jsxs)(x.A,{direction:"vertical",size:"large",style:{width:"100%"},children:[(0,D.jsx)(y.A,{items:[{title:(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(w.A,{})," Home"]})},{title:"Inventory"},{title:"Inventory Operation"}]}),(0,D.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,D.jsx)(_,{level:2,children:"Inventory Operation"}),(0,D.jsx)(p.Ay,{className:$.A.ActionButton,icon:(0,D.jsx)(S.A,{}),onClick:()=>{U(null),m(!0)},children:"Add Item"})]}),(0,D.jsxs)(c.A,{gutter:[16,16],children:[(0,D.jsx)(d.A,{xs:24,sm:12,md:6,children:(0,D.jsx)(h.A,{hoverable:!0,className:z.A.CardDetails,children:(0,D.jsx)(j.A,{title:(0,D.jsxs)(x.A,{children:[(0,D.jsx)(B.A,{})," Total Items"]}),value:K.totalItems,valueStyle:{color:"#1890ff"}})})}),(0,D.jsx)(d.A,{xs:24,sm:12,md:6,children:(0,D.jsx)(h.A,{hoverable:!0,className:z.A.CardDetails,children:(0,D.jsx)(j.A,{title:(0,D.jsxs)(x.A,{children:[(0,D.jsx)(P.A,{})," Active Items"]}),value:K.activeItems,valueStyle:{color:"#52c41a"}})})}),(0,D.jsx)(d.A,{xs:24,sm:12,md:6,children:(0,D.jsx)(h.A,{hoverable:!0,className:z.A.CardDetails,children:(0,D.jsx)(j.A,{title:(0,D.jsxs)(x.A,{children:[(0,D.jsx)(k.A,{})," Low Stock Items"]}),value:K.lowStock,valueStyle:{color:"#faad14"}})})}),(0,D.jsx)(d.A,{xs:24,sm:12,md:6,children:(0,D.jsx)(h.A,{hoverable:!0,className:z.A.CardDetails,children:(0,D.jsx)(j.A,{title:(0,D.jsxs)(x.A,{children:[(0,D.jsx)(F.A,{})," Total Value"]}),value:K.totalValue,precision:2,prefix:"$",valueStyle:{color:"#722ed1"}})})})]}),(0,D.jsx)(h.A,{children:(0,D.jsxs)(x.A,{direction:"vertical",size:"middle",style:{width:"100%",padding:"1%"},children:[(0,D.jsxs)(x.A,{wrap:!0,children:[(0,D.jsx)(u.A.Search,{placeholder:"Search by code or description...",allowClear:!0,enterButton:(0,D.jsx)(p.Ay,{icon:(0,D.jsx)(E.A,{}),type:"primary",className:$.A.ActionButton,children:"Search"}),onSearch:re,onChange:e=>{e.target.value||re("")},style:{width:300}}),(0,D.jsx)(p.Ay,{className:$.A.ActionButton,icon:(0,D.jsx)(T.A,{}),onClick:()=>te(),tooltip:"Refresh",children:"Refresh"})]}),0!==e.length||r?(0,D.jsx)(b.A,{columns:ne,dataSource:e,rowKey:"ItemCode",loading:r,pagination:{...ee.current,showQuickJumper:!0,showTotal:(e,t)=>`${t[0]}-${t[1]} of ${e} items`},onChange:(e,t,r)=>{const n={field:r.field,order:"ascend"===r.order?"asc":"descend"===r.order?"desc":void 0};Z(n),ee.current={...ee.current,current:e.current,pageSize:e.pageSize},te({current:e.current,pageSize:e.pageSize,sortField:n.field,sortOrder:n.order})},scroll:{x:1e3}}):(0,D.jsx)(f.A,{message:"No Items Found",description:"No inventory items match your search criteria.",type:"info",showIcon:!0})]})}),(0,D.jsx)(R,{visible:i,onCancel:()=>{m(!1),U(null)},onSubmit:async e=>{try{W?("BalQty"in e&&null!=W.BalQty&&(e.BalQty=e.BalQty-W.BalQty),await N.Ay.put(`/items/${W.ItemCode}`,e),o.Ay.success("Item updated successfully")):(await N.Ay.post("/items",e),o.Ay.success("Item added successfully")),m(!1),U(null),te()}catch(t){console.error("Error saving item:",t.response?t.response.data:t),o.Ay.error("Failed to save item: "+(t.response?t.response.data.message:"Unknown error"))}},initialValues:W,mode:W?"edit":"add"}),(0,D.jsx)(H,{item:L,visible:V,onClose:()=>{Q(!1),q(null)}})]}),(0,D.jsx)("style",{jsx:!0,children:"\n        .stat-card {\n          transition: all 0.3s ease;\n        }\n        .stat-card:hover {\n          transform: translateY(-4px);\n          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n        }\n        .ant-table-row {\n          transition: all 0.3s ease;\n        }\n        .ant-table-row:hover {\n          transform: translateX(4px);\n        }\n        .ant-tag {\n          transition: all 0.3s ease;\n        }\n        .ant-tag:hover {\n          transform: scale(1.05);\n        }\n      "})]})}},94505:(e,t,r)=>{r.d(t,{Ay:()=>s});var n=r(86213);const a=n.A.create({baseURL:"https://mcws.mooo.com/api",withCredentials:!0,headers:{Accept:"application/json","Content-Type":"application/json"}});a.interceptors.request.use((e=>{const t=localStorage.getItem("token");return t&&(e.headers.Authorization=`Bearer ${t}`),e}),(e=>Promise.reject(e))),a.interceptors.response.use((e=>e),(e=>(e.response&&401===e.response.status&&(localStorage.removeItem("token"),window.location="/login"),Promise.reject(e))));const l=localStorage.getItem("token");l&&(n.A.defaults.headers.common.Authorization=`Bearer ${l}`);const s=a},1259:(e,t,r)=>{r.d(t,{A:()=>i});var n=r(58168),a=r(65043);const l={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-600 72h560v208H232V136zm560 480H232V408h560v208zm0 272H232V680h560v208zM304 240a40 40 0 1080 0 40 40 0 10-80 0zm0 272a40 40 0 1080 0 40 40 0 10-80 0zm0 272a40 40 0 1080 0 40 40 0 10-80 0z"}}]},name:"database",theme:"outlined"};var s=r(51835),o=function(e,t){return a.createElement(s.A,(0,n.A)({},e,{ref:t,icon:l}))};const i=a.forwardRef(o)},61966:(e,t,r)=>{r.d(t,{A:()=>i});var n=r(58168),a=r(65043);const l={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"}}]},name:"delete",theme:"outlined"};var s=r(51835),o=function(e,t){return a.createElement(s.A,(0,n.A)({},e,{ref:t,icon:l}))};const i=a.forwardRef(o)},94786:(e,t,r)=>{r.d(t,{A:()=>i});var n=r(58168),a=r(65043);const l={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"}},{tag:"path",attrs:{d:"M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z"}}]},name:"info-circle",theme:"outlined"};var s=r(51835),o=function(e,t){return a.createElement(s.A,(0,n.A)({},e,{ref:t,icon:l}))};const i=a.forwardRef(o)},83038:(e,t,r)=>{r.d(t,{A:()=>i});var n=r(58168),a=r(65043);const l={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M832 312H696v-16c0-101.6-82.4-184-184-184s-184 82.4-184 184v16H192c-17.7 0-32 14.3-32 32v536c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V344c0-17.7-14.3-32-32-32zm-432-16c0-61.9 50.1-112 112-112s112 50.1 112 112v16H400v-16zm392 544H232V384h96v88c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-88h224v88c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-88h96v456z"}}]},name:"shopping",theme:"outlined"};var s=r(51835),o=function(e,t){return a.createElement(s.A,(0,n.A)({},e,{ref:t,icon:l}))};const i=a.forwardRef(o)},98986:(e,t,r)=>{r.d(t,{b:()=>n});const n=e=>e?"function"===typeof e?e():e:null},60647:(e,t,r)=>{r.d(t,{A:()=>O});var n=r(65043),a=r(51376),l=r(98139),s=r.n(l),o=r(28678),i=r(18574),c=r(35296),d=r(36282),u=r(38046),m=r(98986),p=r(3188),h=r(64160),g=r(10370),x=r(90618),v=r(34382),A=r(78855);const y=(0,A.OF)("Popconfirm",(e=>(e=>{const{componentCls:t,iconCls:r,antCls:n,zIndexPopup:a,colorText:l,colorWarning:s,marginXXS:o,marginXS:i,fontSize:c,fontWeightStrong:d,colorTextHeading:u}=e;return{[t]:{zIndex:a,[`&${n}-popover`]:{fontSize:c},[`${t}-message`]:{marginBottom:i,display:"flex",flexWrap:"nowrap",alignItems:"start",[`> ${t}-message-icon ${r}`]:{color:s,fontSize:c,lineHeight:1,marginInlineEnd:i},[`${t}-title`]:{fontWeight:d,color:u,"&:only-child":{fontWeight:"normal"}},[`${t}-description`]:{marginTop:o,color:l}},[`${t}-buttons`]:{textAlign:"end",whiteSpace:"nowrap",button:{marginInlineStart:i}}}}})(e)),(e=>{const{zIndexPopupBase:t}=e;return{zIndexPopup:t+60}}),{resetStyle:!1});var j=function(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var a=0;for(n=Object.getOwnPropertySymbols(e);a<n.length;a++)t.indexOf(n[a])<0&&Object.prototype.propertyIsEnumerable.call(e,n[a])&&(r[n[a]]=e[n[a]])}return r};const f=e=>{const{prefixCls:t,okButtonProps:r,cancelButtonProps:l,title:s,description:o,cancelText:i,okText:d,okType:v="primary",icon:A=n.createElement(a.A,null),showCancel:y=!0,close:j,onConfirm:f,onCancel:b,onPopupClick:C}=e,{getPrefixCls:I}=n.useContext(c.QO),[O]=(0,g.A)("Popconfirm",x.A.Popconfirm),w=(0,m.b)(s),S=(0,m.b)(o);return n.createElement("div",{className:`${t}-inner-content`,onClick:C},n.createElement("div",{className:`${t}-message`},A&&n.createElement("span",{className:`${t}-message-icon`},A),n.createElement("div",{className:`${t}-message-text`},w&&n.createElement("div",{className:`${t}-title`},w),S&&n.createElement("div",{className:`${t}-description`},S))),n.createElement("div",{className:`${t}-buttons`},y&&n.createElement(p.Ay,Object.assign({onClick:b,size:"small"},l),i||(null===O||void 0===O?void 0:O.cancelText)),n.createElement(u.A,{buttonProps:Object.assign(Object.assign({size:"small"},(0,h.DU)(v)),r),actionFn:f,close:j,prefixCls:I("btn"),quitOnNullishReturnValue:!0,emitEvent:!0},d||(null===O||void 0===O?void 0:O.okText))))},b=e=>{const{prefixCls:t,placement:r,className:a,style:l}=e,o=j(e,["prefixCls","placement","className","style"]),{getPrefixCls:i}=n.useContext(c.QO),d=i("popconfirm",t),[u]=y(d);return u(n.createElement(v.Ay,{placement:r,className:s()(d,a),style:l,content:n.createElement(f,Object.assign({prefixCls:d},o))}))};var C=function(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var a=0;for(n=Object.getOwnPropertySymbols(e);a<n.length;a++)t.indexOf(n[a])<0&&Object.prototype.propertyIsEnumerable.call(e,n[a])&&(r[n[a]]=e[n[a]])}return r};const I=n.forwardRef(((e,t)=>{var r,l;const{prefixCls:u,placement:m="top",trigger:p="click",okType:h="primary",icon:g=n.createElement(a.A,null),children:x,overlayClassName:v,onOpenChange:A,onVisibleChange:j}=e,b=C(e,["prefixCls","placement","trigger","okType","icon","children","overlayClassName","onOpenChange","onVisibleChange"]),{getPrefixCls:I}=n.useContext(c.QO),[O,w]=(0,o.A)(!1,{value:null!==(r=e.open)&&void 0!==r?r:e.visible,defaultValue:null!==(l=e.defaultOpen)&&void 0!==l?l:e.defaultVisible}),S=(e,t)=>{w(e,!0),null===j||void 0===j||j(e),null===A||void 0===A||A(e,t)},B=I("popconfirm",u),P=s()(B,v),[k]=y(B);return k(n.createElement(d.A,Object.assign({},(0,i.A)(b,["title"]),{trigger:p,placement:m,onOpenChange:(t,r)=>{const{disabled:n=!1}=e;n||S(t,r)},open:O,ref:t,overlayClassName:P,content:n.createElement(f,Object.assign({okType:h,icon:g},e,{prefixCls:B,close:e=>{S(!1,e)},onConfirm:t=>{var r;return null===(r=e.onConfirm)||void 0===r?void 0:r.call(void 0,t)},onCancel:t=>{var r;S(!1,t),null===(r=e.onCancel)||void 0===r||r.call(void 0,t)}})),"data-popover-inject":!0}),x))}));I._InternalPanelDoNotUseOrYouWillBeFired=b;const O=I},34382:(e,t,r)=>{r.d(t,{Ay:()=>p,hJ:()=>u});var n=r(65043),a=r(98139),l=r.n(a),s=r(17659),o=r(98986),i=r(35296),c=r(24892),d=function(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var a=0;for(n=Object.getOwnPropertySymbols(e);a<n.length;a++)t.indexOf(n[a])<0&&Object.prototype.propertyIsEnumerable.call(e,n[a])&&(r[n[a]]=e[n[a]])}return r};const u=e=>{let{title:t,content:r,prefixCls:a}=e;return t||r?n.createElement(n.Fragment,null,t&&n.createElement("div",{className:`${a}-title`},t),r&&n.createElement("div",{className:`${a}-inner-content`},r)):null},m=e=>{const{hashId:t,prefixCls:r,className:a,style:i,placement:c="top",title:d,content:m,children:p}=e,h=(0,o.b)(d),g=(0,o.b)(m),x=l()(t,r,`${r}-pure`,`${r}-placement-${c}`,a);return n.createElement("div",{className:x,style:i},n.createElement("div",{className:`${r}-arrow`}),n.createElement(s.z,Object.assign({},e,{className:t,prefixCls:r}),p||n.createElement(u,{prefixCls:r,title:h,content:g})))},p=e=>{const{prefixCls:t,className:r}=e,a=d(e,["prefixCls","className"]),{getPrefixCls:s}=n.useContext(i.QO),o=s("popover",t),[u,p,h]=(0,c.A)(o);return u(n.createElement(m,Object.assign({},a,{prefixCls:o,hashId:p,className:l()(r,h)})))}},36282:(e,t,r)=>{r.d(t,{A:()=>v});var n=r(65043),a=r(98139),l=r.n(a),s=r(28678),o=r(25001),i=r(98986),c=r(83290),d=r(12701),u=r(35296),m=r(96651),p=r(34382),h=r(24892),g=function(e,t){var r={};for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&t.indexOf(n)<0&&(r[n]=e[n]);if(null!=e&&"function"===typeof Object.getOwnPropertySymbols){var a=0;for(n=Object.getOwnPropertySymbols(e);a<n.length;a++)t.indexOf(n[a])<0&&Object.prototype.propertyIsEnumerable.call(e,n[a])&&(r[n[a]]=e[n[a]])}return r};const x=n.forwardRef(((e,t)=>{var r,a;const{prefixCls:x,title:v,content:A,overlayClassName:y,placement:j="top",trigger:f="hover",children:b,mouseEnterDelay:C=.1,mouseLeaveDelay:I=.1,onOpenChange:O,overlayStyle:w={}}=e,S=g(e,["prefixCls","title","content","overlayClassName","placement","trigger","children","mouseEnterDelay","mouseLeaveDelay","onOpenChange","overlayStyle"]),{getPrefixCls:B}=n.useContext(u.QO),P=B("popover",x),[k,F,E]=(0,h.A)(P),T=B(),N=l()(y,F,E),[$,z]=(0,s.A)(!1,{value:null!==(r=e.open)&&void 0!==r?r:e.visible,defaultValue:null!==(a=e.defaultOpen)&&void 0!==a?a:e.defaultVisible}),D=(e,t)=>{z(e,!0),null===O||void 0===O||O(e,t)},_=(0,i.b)(v),M=(0,i.b)(A);return k(n.createElement(m.A,Object.assign({placement:j,trigger:f,mouseEnterDelay:C,mouseLeaveDelay:I,overlayStyle:w},S,{prefixCls:P,overlayClassName:N,ref:t,open:$,onOpenChange:e=>{D(e)},overlay:_||M?n.createElement(p.hJ,{prefixCls:P,title:_,content:M}):null,transitionName:(0,c.b)(T,"zoom-big",S.transitionName),"data-popover-inject":!0}),(0,d.Ob)(b,{onKeyDown:e=>{var t,r;n.isValidElement(b)&&(null===(r=null===b||void 0===b?void 0:(t=b.props).onKeyDown)||void 0===r||r.call(t,e)),(e=>{e.keyCode===o.A.ESC&&D(!1,e)})(e)}})))}));x._InternalPanelDoNotUseOrYouWillBeFired=p.Ay;const v=x},24892:(e,t,r)=>{r.d(t,{A:()=>m});var n=r(94414),a=r(85814),l=r(16208),s=r(82094),o=r(62979),i=r(78855),c=r(78446);const d=e=>{const{componentCls:t,popoverColor:r,titleMinWidth:a,fontWeightStrong:s,innerPadding:o,boxShadowSecondary:i,colorTextHeading:c,borderRadiusLG:d,zIndexPopup:u,titleMarginBottom:m,colorBgElevated:p,popoverBg:h,titleBorderBottom:g,innerContentPadding:x,titlePadding:v}=e;return[{[t]:Object.assign(Object.assign({},(0,n.dF)(e)),{position:"absolute",top:0,left:{_skip_check_:!0,value:0},zIndex:u,fontWeight:"normal",whiteSpace:"normal",textAlign:"start",cursor:"auto",userSelect:"text","--valid-offset-x":"var(--arrow-offset-horizontal, var(--arrow-x))",transformOrigin:["var(--valid-offset-x, 50%)","var(--arrow-y, 50%)"].join(" "),"--antd-arrow-background-color":p,width:"max-content",maxWidth:"100vw","&-rtl":{direction:"rtl"},"&-hidden":{display:"none"},[`${t}-content`]:{position:"relative"},[`${t}-inner`]:{backgroundColor:h,backgroundClip:"padding-box",borderRadius:d,boxShadow:i,padding:o},[`${t}-title`]:{minWidth:a,marginBottom:m,color:c,fontWeight:s,borderBottom:g,padding:v},[`${t}-inner-content`]:{color:r,padding:x}})},(0,l.Ay)(e,"var(--antd-arrow-background-color)"),{[`${t}-pure`]:{position:"relative",maxWidth:"none",margin:e.sizePopupArrow,display:"inline-block",[`${t}-content`]:{display:"inline-block"}}}]},u=e=>{const{componentCls:t}=e;return{[t]:o.s.map((r=>{const n=e[`${r}6`];return{[`&${t}-${r}`]:{"--antd-arrow-background-color":n,[`${t}-inner`]:{backgroundColor:n},[`${t}-arrow`]:{background:"transparent"}}}}))}},m=(0,i.OF)("Popover",(e=>{const{colorBgElevated:t,colorText:r}=e,n=(0,c.oX)(e,{popoverBg:t,popoverColor:r});return[d(n),u(n),(0,a.aB)(n,"zoom-big")]}),(e=>{const{lineWidth:t,controlHeight:r,fontHeight:n,padding:a,wireframe:o,zIndexPopupBase:i,borderRadiusLG:c,marginXS:d,lineType:u,colorSplit:m,paddingSM:p}=e,h=r-n,g=h/2,x=h/2-t,v=a;return Object.assign(Object.assign(Object.assign({titleMinWidth:177,zIndexPopup:i+30},(0,s.n)(e)),(0,l.Ke)({contentRadius:c,limitVerticalRadius:!0})),{innerPadding:o?0:12,titleMarginBottom:o?0:d,titlePadding:o?`${g}px ${v}px ${x}px`:0,titleBorderBottom:o?`${t}px ${u} ${m}`:"none",innerContentPadding:o?`${p}px ${v}px`:0})}),{resetStyle:!1,deprecatedTokens:[["width","titleMinWidth"],["minWidth","titleMinWidth"]]})},52967:(e,t,r)=>{r.d(t,{A:()=>n});const n={"fade-in":"App_fade-in__8IP91",show:"App_show__YgTh4",ActionButton:"App_ActionButton__SVqGL",DeleteButton:"App_DeleteButton__ffM0l"}},48092:(e,t,r)=>{r.d(t,{A:()=>n});const n={CardDetails:"inventory_CardDetails__XXeMW",ActiveButton:"inventory_ActiveButton__SfZgS"}}}]);
//# sourceMappingURL=491.c5214097.chunk.js.map