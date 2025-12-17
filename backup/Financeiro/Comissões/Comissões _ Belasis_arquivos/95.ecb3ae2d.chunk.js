(this["webpackJsonpwebook-react"]=this["webpackJsonpwebook-react"]||[]).push([[95,179],{1086:function(e,t,a){"use strict";var c=a(0),n=a(50),r=a(2937),s=a(250),l=a(53),i=a.n(l),o=a(645),d=a(27),b=a(116),u=a(37),_=a(1850),j=a(657),m=a(76);const p=u.e`
  mutation TransferModal($data: CreateTransferInput!) {
    createTransfer(input: $data) {
      success errors
    }
  }
`;var O=e=>{const[t,{loading:a}]=Object(_.a)(p);return[async a=>{try{const{data:c}=await t({variables:{data:a}}),{success:n=!1,errors:r=[]}=(null===c||void 0===c?void 0:c.createTransfer)||{};return null===r||void 0===r||r.forEach((t=>{"Caixa n\xe3o est\xe1 aberto"!==t?b.b.error(t):Object(j.a)(e)})),{success:n}}catch(c){return m.a.captureException(c),b.b.error(Object(n.b)("phrases.generic_save_error_message")),console.error(c),{success:!1}}},{loading:a}]},h=a(543),f=a(2883),v=a(2824),y=a(2977),g=a(2857),x=a(2856),$=a(666),w=a(646),C=a(672),k=a(584),D=a(653),I=a(22);var S=()=>{const e=Object(d.a)((e=>e.is_mobile));return Object(I.jsxs)(I.Fragment,{children:[Object(I.jsxs)(h.a,{gutter:16,children:[Object(I.jsx)(f.a,{xs:24,sm:24,md:8,children:Object(I.jsx)(r.a.Item,{name:"value_cents",label:Object(n.b)("words.value"),rules:[{required:!0,message:Object(n.b)("phrases.required_field")},{type:"number",min:1,message:Object(n.b)("phrases.enter_value")}],children:Object(I.jsx)(k.a,{size:e?"large":"middle"})})}),Object(I.jsx)(f.a,{xs:24,sm:24,md:8,children:Object(I.jsx)(r.a.Item,{name:"date",label:Object(n.b)("words.date"),rules:[{required:!0,message:Object(n.b)("phrases.required_field")}],children:Object(I.jsx)(D.b,{})})}),Object(I.jsx)(f.a,{xs:24,sm:24,md:8,children:Object(I.jsx)(r.a.Item,{name:"payment_id",label:Object(n.b)("words.payment_type"),rules:[{required:!0,message:Object(n.b)("phrases.required_field")}],children:Object(I.jsx)($.a,{size:e?"large":"middle",default_cash:!1})})}),Object(I.jsx)(f.a,{xs:24,sm:24,md:24,children:Object(I.jsx)(r.a.Item,{name:"historical",label:Object(n.b)("words.reason"),children:Object(I.jsx)(v.a,{placeholder:Object(n.b)("finance.drawers.insert_reason"),size:e?"large":"middle"})})})]}),Object(I.jsxs)(h.a,{gutter:16,children:[Object(I.jsx)(f.a,{xs:24,sm:24,md:12,children:Object(I.jsxs)(y.a,{size:"small",styles:{header:{textAlign:"center"}},title:Object(I.jsxs)("span",{children:[Object(I.jsx)(g.a,{style:{color:"red"}})," ",Object(n.b)("finance.drawers.source_account")]}),children:[Object(I.jsx)(r.a.Item,{name:"account_from",label:Object(n.b)("words.account"),rules:[{required:!0,message:Object(n.b)("phrases.required_field")}],children:Object(I.jsx)(w.a,{size:e?"large":"middle"})}),Object(I.jsx)(r.a.Item,{name:"chart_from",label:Object(n.b)("words.category"),rules:[{required:!0,message:Object(n.b)("phrases.required_field")}],children:Object(I.jsx)(C.a,{kind:"D",defaultOption:"Transfer",size:e?"large":"middle"})})]})}),Object(I.jsx)(f.a,{xs:24,sm:24,md:12,children:Object(I.jsxs)(y.a,{size:"small",styles:{header:{textAlign:"center"}},title:Object(I.jsxs)("span",{children:[Object(I.jsx)(x.a,{style:{color:"green"}})," ",Object(n.b)("finance.drawers.destination_account")]}),children:[Object(I.jsx)(r.a.Item,{name:"account_to",label:Object(n.b)("words.account"),dependencies:["account_from"],rules:[{required:!0,message:Object(n.b)("phrases.required_field")},e=>{let{getFieldValue:t}=e;return{validator:(e,a)=>a&&t("account_from")===a?Promise.reject(new Error(Object(n.b)("finance.drawers.cannot_be_the_same_as_source_account"))):Promise.resolve()}}],children:Object(I.jsx)(w.a,{size:e?"large":"middle"})}),Object(I.jsx)(r.a.Item,{name:"chart_to",label:Object(n.b)("words.category"),rules:[{required:!0,message:Object(n.b)("phrases.required_field")}],children:Object(I.jsx)(C.a,{kind:"C",defaultOption:"Transfer",size:e?"large":"middle"})})]})})]})]})},M=a(581);const F={value_cents:0,date:i()()},z=(e,t)=>{let{afterSave:a}=e;const l=Object(d.a)((e=>e.is_mobile)),i=Object(d.a)((e=>e.current_user.permissions)),[u,_]=Object(c.useState)(!1),[j]=r.a.useForm(),{submit:m,resetFields:p,setFieldsValue:h}=j,f=Object(c.useRef)(null),v=Object(c.useCallback)((()=>{var e;i.can_access_cash_accounting?null===(e=f.current)||void 0===e||e.open():b.b.warning(Object(n.b)("phrases.no_permission_to_do_this"))}),[i.can_access_cash_accounting]),[y,{loading:g}]=O(v),x=()=>{_(!0),h(F)},$=()=>{_(!1)};Object(c.useImperativeHandle)(t,(()=>({open:x,close:$})));return Object(I.jsxs)(s.a,{closable:!0,width:780,push:!1,height:"100%",destroyOnClose:!0,onClose:$,open:u,title:Object(n.b)("finance.drawers.new_transfer"),afterOpenChange:()=>{u||p()},placement:l?"bottom":"right",footer:Object(I.jsx)(M.a,{loading:g,submit:m,disabled:!i.can_create_transfer}),children:[Object(I.jsx)(r.a,{form:j,layout:"vertical",onFinish:async e=>{const t={...e,date:e.date.format("YYYY-MM-DD")},{success:c}=await y(t);c&&(b.b.success(Object(n.b)("phrases.saved_successfully",{context:"female",prefix:Object(n.b)("words.transfer")})),null===a||void 0===a||a(),$())},children:Object(I.jsx)(S,{})}),Object(I.jsx)(o.a,{ref:f})]})};z.displayName="TransferDrawer";t.a=Object(c.forwardRef)(z)},1219:function(e,t,a){"use strict";var c=a(13),n=a(0),r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M882 272.1V144c0-17.7-14.3-32-32-32H174c-17.7 0-32 14.3-32 32v128.1c-16.7 1-30 14.9-30 31.9v131.7a177 177 0 0014.4 70.4c4.3 10.2 9.6 19.8 15.6 28.9v345c0 17.6 14.3 32 32 32h676c17.7 0 32-14.3 32-32V535a175 175 0 0015.6-28.9c9.5-22.3 14.4-46 14.4-70.4V304c0-17-13.3-30.9-30-31.9zM214 184h596v88H214v-88zm362 656.1H448V736h128v104.1zm234 0H640V704c0-17.7-14.3-32-32-32H416c-17.7 0-32 14.3-32 32v136.1H214V597.9c2.9 1.4 5.9 2.8 9 4 22.3 9.4 46 14.1 70.4 14.1s48-4.7 70.4-14.1c13.8-5.8 26.8-13.2 38.7-22.1.2-.1.4-.1.6 0a180.4 180.4 0 0038.7 22.1c22.3 9.4 46 14.1 70.4 14.1 24.4 0 48-4.7 70.4-14.1 13.8-5.8 26.8-13.2 38.7-22.1.2-.1.4-.1.6 0a180.4 180.4 0 0038.7 22.1c22.3 9.4 46 14.1 70.4 14.1 24.4 0 48-4.7 70.4-14.1 3-1.3 6-2.6 9-4v242.2zm30-404.4c0 59.8-49 108.3-109.3 108.3-40.8 0-76.4-22.1-95.2-54.9-2.9-5-8.1-8.1-13.9-8.1h-.6c-5.7 0-11 3.1-13.9 8.1A109.24 109.24 0 01512 544c-40.7 0-76.2-22-95-54.7-3-5.1-8.4-8.3-14.3-8.3s-11.4 3.2-14.3 8.3a109.63 109.63 0 01-95.1 54.7C233 544 184 495.5 184 435.7v-91.2c0-.3.2-.5.5-.5h655c.3 0 .5.2.5.5v91.2z"}}]},name:"shop",theme:"outlined"},s=a(71),l=function(e,t){return n.createElement(s.a,Object(c.a)({},e,{ref:t,icon:r}))},i=n.forwardRef(l);t.a=i},2945:function(e,t,a){"use strict";a.r(t);var c=a(0),n=a(50),r=a(116),s=a(585),l=a(3038),i=a(676),o=a(1038),d=a(3024),b=a(250),u=a(583),_=a(37),j=a(2879);const m=_.e`
  query FinanceAllTransactions (
    $accounts: [ID], $charts: [ID], $payments: [ID], $start_date: String, $end_date: String, $date_type: String,
    $status: [ID], $search_query: String, $sort_field: String, $sort_order: String, $bill_type: String
  ) {
    finance_bills (
      accounts: $accounts, charts: $charts, payments: $payments, start_date: $start_date, end_date: $end_date,
      date_type: $date_type, status: $status, search: $search_query, sort_field: $sort_field, sort_order: $sort_order,
      bill_type: $bill_type, no_transfer: true
    ) {
      all {
        ... on BillPay {
          id date due value_cents status bill_type historical movement_type movement_url movement_id
          vendor { id name }
          employee { id name }
          account { id name }
          cash_accounting { id code }
          chart { id name _default }
          payment { id name }
          bill_pay_offs { id compensated_at }
          salon { id }

          movement {
            ... on Movement {
              id code note has_commissions_advance_payment
            }
            ... on CashAccounting {
              id code closed
            }
          }
        }

        ... on BillRec {
          id date due value_cents status movement_type bill_type historical movement_url net_value_cents payment_rates
          consider_rates

          cash_accounting { id code }
          chart { id name _default }
          payment { id name processing_days }
          client { id name }
          account { id name }
          salon { id }

          movement {
            ... on Movement {
              id code
            }
            ... on CashAccounting {
              id code closed
            }
            ... on Offers_Sale {
              id code
            }
            ... on CustomerSubscriptionPayment {
              id customer_subscription {
                id code
              }
            }
          }

          bill_rec_offs { id compensated_at }
        }
      }
    }
  }
`;var p=()=>Object(j.a)(m,{fetchPolicy:"network-only"}),O=a(19),h=a(579),f=a(22);const v=e=>{let{name:t,color:a,value:c}=e;return Object(f.jsx)(g,{$color:a,children:Object(f.jsxs)("div",{style:{color:"#FFFFFF"},children:[Object(f.jsx)(b.h,{$size:18,$block:!0,children:t}),Object(f.jsx)(u.b,{width:"100%",$size:24,$bold:!0,$block:!0,children:Object(h.d)(c)})]})})};v.displayName="Total";var y=v;const g=O.d.div.withConfig({componentId:"wb__sc-hqobjs-0"})([""," background:",";border-radius:5px;padding:10px;display:flex;justify-content:space-between;box-shadow:rgba(99,99,99,0.2) 0 2px 8px 0;margin-bottom:10px;box-sizing:border-box;"],(e=>!e.theme.is_mobile&&O.c`
    width: 24%;
  `),(e=>e.$color)),x=(e,t)=>{const[a,r]=Object(c.useState)(!1),[s,{data:l,loading:i}]=p(),o=(null===l||void 0===l?void 0:l.finance_bills.all)||[],_=o.filter((e=>"rec"===e.bill_type)),j=o.filter((e=>"pay"===e.bill_type)),m=_.filter((e=>"3"===e.status)).reduce(((e,t)=>e+t.value_cents),0),O=_.filter((e=>"3"!==e.status)).reduce(((e,t)=>e+t.value_cents),0),h=j.filter((e=>"3"===e.status)).reduce(((e,t)=>e+t.value_cents),0),v=j.filter((e=>"3"!==e.status)).reduce(((e,t)=>e+t.value_cents),0),g=()=>{r(!0),s({variables:e})},x=()=>r(!1);return Object(c.useImperativeHandle)(t,(()=>({open:g,close:x}))),Object(f.jsx)(d.a,{title:Object(f.jsx)(b.h,{$block:!0,$size:18,$bold:!0,children:Object(n.b)("words.total_other")}),centered:!0,closable:!0,destroyOnClose:!0,open:a,onCancel:x,width:800,footer:!1,children:Object(f.jsx)(u.a.Provider,{value:i,children:Object(f.jsxs)(w,{children:[Object(f.jsx)(y,{name:Object(n.b)("finance.dashboard.received"),color:"#5cb85c",value:m}),Object(f.jsx)(y,{name:Object(n.b)("finance.dashboard.to_receive"),color:"#2196F3",value:O}),Object(f.jsx)(y,{name:Object(n.b)("finance.dashboard.paid"),color:"#f5a139",value:h}),Object(f.jsx)(y,{name:Object(n.b)("finance.dashboard.to_pay"),color:"#c73d3d",value:v})]})})})};x.displayName="TotalsModal";var $=Object(c.memo)(Object(c.forwardRef)(x));const w=O.d.div.withConfig({componentId:"wb__sc-1ep11yo-0"})([""," justify-content:space-between;margin:0 0 15px 0;"],(e=>!e.theme.is_mobile&&Object(O.c)(["display:flex;"])));var C=a(892),k=a(1204),D=a(1205),I=a(76);const S=_.e`
  query LoadFinanceBillPayData($id: ID!) {
    finance_bill: finance_bill_pay(id: $id) {
      id
      recurrence { id }
    }
  }
`,M=_.e`
  query LoadFinanceBillRecData($id: ID!) {
    finance_bill: finance_bill_rec(id: $id) {
      id
      recurrence: bill_rec_recurrence { id }
    }
  }
`;var F=a(1426),z=a(3023),B=a(543),P=a(2883),R=a(159),q=a(1850);const E=_.e`
  mutation BillModalDeleteBillPay($data: DeleteFinanceBillPayInput!) {
    deleteFinanceBillPay(input: $data) {
      deleted errors
    }
  }
`,T=_.e`
mutation BillModalDeleteBillRec($data: DeleteFinanceBillRecInput!) {
  deleteFinanceBillRec(input: $data) {
    deleted errors
  }
}
`,Y=(e,t)=>{let{afterDeleteBill:a}=e;const[s,l]=Object(c.useState)(!1),[i,o]=Object(c.useState)(),[u,_]=Object(c.useState)(!1),[m,p]=Object(c.useState)(!1),[O,{loading:h,error:v}]=(e=>Object(j.a)(S,{onCompleted:t=>{const a=!!t.finance_bill.recurrence;e(a)},onError:e=>{I.a.captureException(e),console.error(e),r.b.error(Object(n.b)("phrases.generic_load_error_message"))}}))(p),[y,{loading:g,error:x}]=(e=>Object(j.a)(M,{onCompleted:t=>{const a=!!t.finance_bill.recurrence;e(a)},onError:e=>{I.a.captureException(e),console.error(e),r.b.error(Object(n.b)("phrases.generic_load_error_message"))}}))(p),[$,w]=(()=>{const[e,{loading:t}]=Object(q.a)(E);return[Object(c.useCallback)((async t=>{try{var a;const c=await e({variables:{data:t}}),{deleted:n,errors:s}=(null===(a=c.data)||void 0===a?void 0:a.deleteFinanceBillPay)||{};return n?{success:!0}:(null===s||void 0===s||s.forEach((e=>r.b.error(e))),{success:!1})}catch(c){return I.a.captureException(c),console.error(c),r.b.error(Object(n.b)("phrases.generic_delete_error_message")),{success:!1}}}),[e]),t]})(),[C,k]=(()=>{const[e,{loading:t}]=Object(q.a)(T);return[Object(c.useCallback)((async t=>{try{var a;const c=await e({variables:{data:t}}),{deleted:n,errors:s}=(null===(a=c.data)||void 0===a?void 0:a.deleteFinanceBillRec)||{};return n?{success:!0}:(null===s||void 0===s||s.forEach((e=>r.b.error(e))),{success:!1})}catch(c){return I.a.captureException(c),console.error(c),r.b.error(Object(n.b)("phrases.generic_delete_error_message")),{success:!1}}}),[e]),t]})(),D=Object(c.useCallback)((e=>{o(e),"pay"===e.bill_type?O({variables:{id:e.id}}):y({variables:{id:e.id}}),l(!0)}),[O,y]),Y=Object(c.useCallback)((()=>{l(!1)}),[]);Object(c.useImperativeHandle)(t,(()=>({open:D,close:Y})));const H=Object(c.useCallback)((async()=>{var e;if(!i)return;let t=null;"pay"===i.bill_type?t=await $({id:i.id,affect_future_recurrences:u}):"rec"===i.bill_type&&(t=await C({id:i.id,affect_future_recurrences:u})),null!==(e=t)&&void 0!==e&&e.success&&(l(!1),r.b.success(Object(n.b)("phrases.deleted_successfully",{context:"female",prefix:Object(n.b)("words.transaction")})),a())}),[u,a,i,$,C]),V=Object(c.useCallback)((()=>{_(!1),o(void 0)}),[]),A=h||g,N=v||x;return Object(f.jsx)(d.a,{width:400,footer:null,closable:!1,open:s,afterClose:V,children:Object(f.jsxs)(F.a,{spinning:A,children:[Object(f.jsx)(b.h,{$size:15,$semibold:!0,$bottom:20,children:Object(n.b)("phrases.confirm_delete",{context:"female",model:Object(n.b)("words.transaction").toLocaleLowerCase()})}),Object(f.jsx)(b.h,{$block:!0,$bottom:20,children:m&&Object(f.jsxs)(f.Fragment,{children:[Object(f.jsxs)(b.h,{$block:!0,$bottom:10,children:[Object(n.b)("finance.transactions.delete_next_recurrences"),":"]}),Object(f.jsx)(z.a,{checked:u,onChange:e=>_(e)})]})}),Object(f.jsxs)(B.a,{gutter:8,justify:"end",children:[Object(f.jsx)(P.a,{children:Object(f.jsx)(R.a,{onClick:()=>l(!1),children:Object(n.b)("verbs.cancel")})}),Object(f.jsx)(P.a,{children:Object(f.jsx)(R.a,{danger:!0,type:"primary",disabled:!!N,onClick:H,loading:w||k,children:Object(n.b)("verbs.delete")})})]})]})})};Y.displayName="DeleteBillModal";var H=Object(c.memo)(Object(c.forwardRef)(Y)),V=a(1086),A=a(853),N=a(1438),L=a(608);var G=e=>{let{ids:t,failures:a}=e;const c=a.length===t.length,s=0===a.length,l=t.length-a.length;s?r.b.success(Object(n.b)("finance.transactions.mass_payment.all_payed")):L.a.information({closable:!0,className:"webook-modal hide-buttons",maskClosable:!0,title:Object(n.b)("finance.transactions.mass_payment.title"),content:Object(f.jsxs)("div",{style:{maxHeight:400,width:"100%",maxWidth:480,overflowX:"hidden",overflowY:"auto"},children:[!c&&Object(f.jsx)(b.h,{$size:16,$alignCenter:!0,$color:"green_2",children:Object(n.b)("finance.transactions.mass_payment.some_payed_success",{count:l})}),a.length>0&&Object(f.jsxs)(b.g,{$column:!0,$paddings:[0,10],children:[Object(f.jsx)(N.a,{dashed:!0}),Object(f.jsx)(b.h,{$size:16,$alignCenter:!0,$paddings:{bottom:10},children:Object(n.b)("finance.transactions.mass_payment.some_failed",{count:a.length})}),a.map((e=>{let{id:t,historical:a,value_cents:c,bill_type:r,errors:s=[]}=e;return Object(f.jsxs)(J,{$backgroundColor:"Finance::BillRec"===r?"#def3de99":"#ffe5e599",children:[Object(f.jsx)(b.g,{$column:!0,children:Object(f.jsx)(b.h,{$size:16,$block:!0,children:a?Object(f.jsxs)(f.Fragment,{children:[Object(h.d)(c)," - ",a]}):Object(f.jsxs)(f.Fragment,{children:[Object(h.d)(c)," - ","Finance::BillRec"===r?Object(n.b)("words.receipt"):Object(n.b)("words.expense")]})})}),Object(f.jsx)(b.g,{$column:!0,style:{overflow:"hidden"},$mTop:10,children:s.map((e=>Object(f.jsx)(b.h,{style:{color:"#FF7875"},children:e},`${e}_${t}`)))})]},`sale_failure_item_${t}`)}))]})]})})};const J=O.d.div.withConfig({componentId:"wb__sc-1y3zag0-0"})(["display:flex;width:100%;flex-direction:column;align-items:center;background-color:",";border-radius:5px;box-shadow:0 2px 9px rgba(83,83,83,0.06);overflow:hidden;margin-bottom:15px;padding:10px;border:1px solid transparent;user-select:none;transition:transform .2s;"],(e=>e.$backgroundColor));var U=a(27),K=a(593),W=a(582),X=a(405);const Q=_.e`
  query FinanceTransactions (
    $accounts: [ID], $charts: [ID], $payments: [ID], $start_date: String, $end_date: String, $date_type: String,
    $status: [ID], $page: Int, $results: Int, $search_query: String, $sort_field: String, $sort_order: String,
    $bill_type: String
  ) {
    finance_bills (
      accounts: $accounts, charts: $charts, payments: $payments, start_date: $start_date, end_date: $end_date,
      date_type: $date_type, status: $status, page: $page, results: $results, search: $search_query, sort_field: $sort_field,
      sort_order: $sort_order, bill_type: $bill_type
    ) {
      total_count

      all {
        ... on BillPay {
          id date due value_cents status bill_type historical movement_type movement_url movement_id
          vendor { id name }
          employee { id name }
          account { id name }
          cash_accounting { id code }
          chart { id name _default }
          payment { id name }
          bill_pay_offs { id compensated_at }
          salon { id }

          movement {
            ... on Movement {
              id code note has_commissions_advance_payment
            }
            ... on CashAccounting {
              id code closed
            }
          }
        }

        ... on BillRec {
          id date due value_cents status movement_type bill_type historical movement_url net_value_cents payment_rates
          consider_rates

          cash_accounting { id code }
          chart { id name _default }
          payment { id name processing_days }
          client { id name }
          account { id name }
          salon { id }

          movement {
            ... on Movement {
              id code
            }
            ... on CashAccounting {
              id code closed
            }
            ... on Offers_Sale {
              id code
            }
            ... on CustomerSubscriptionPayment {
              id customer_subscription {
                id code
              }
            }
          }

          bill_rec_offs { id compensated_at }
        }
      }
    }
  }
`;var Z=(e,t)=>Object(X.f)(Q,{fetchPolicy:"network-only",variables:e,notifyOnNetworkStatusChange:!0,onError:e=>{console.error(e),I.a.captureException(e),r.b.error(Object(n.b)("phrases.generic_load_error_message"))},onCompleted:t}),ee=a(53),te=a.n(ee),ae=a(20);var ce=()=>{const{search:e}=Object(ae.m)();return Object(c.useMemo)((()=>{const t=new URLSearchParams(e);return Object.keys(o.a.filters).reduce(((e,a)=>{const c=t.get(a);return c?"start_date"===a||"end_date"===a?{...e,[a]:te()(c)}:"date_type"===a?{...e,[a]:c}:{...e,[a]:c.split(",")}:e}),{})}),[e])},ne=a(2937),re=a(2934);var se=e=>{const t=Object(U.a)((e=>e.current_user.permissions)),a=t.can_edit_bill_pay,s=t.can_edit_bill_rec;return Object(c.useCallback)(((t,l)=>{if(!a&&!s)return void r.b.warning(Object(n.b)("phrases.no_permission_to_do_this"));let i=te()();const o=()=>{const[e,t]=Object(c.useState)(te()());return i=e,Object(f.jsxs)(f.Fragment,{children:[Object(n.b)("finance.transactions.confirm_mass_payment"),Object(f.jsx)(ne.a.Item,{style:{marginTop:12},layout:"vertical",required:!0,label:Object(n.b)("phrases.payment_date"),children:Object(f.jsx)(le,{value:e,onChange:e=>{e&&te.a.isDayjs(e)&&t(e)},size:"large",style:{width:"100%"},format:"DD MMMM, YYYY",disabledDate:e=>e>te()(),getPopupContainer:e=>e.parentElement||document.body,allowClear:!1})})]})};L.a.information({useConfirm:!0,className:"webook-modal",title:Object(n.b)("finance.transactions.confirm_mass_payment_title"),content:Object(f.jsx)(o,{}),okText:Object(n.b)("phrases.yes_pay"),okType:"danger",cancelText:Object(n.b)("verbs.cancel"),onOk:()=>e(t,i,l)})}),[e,a,s])};const le=Object(O.d)(re.a).withConfig({componentId:"wb__sc-b43ifc-0"})(["input{text-align:center;}"]),ie=_.e`
  mutation CreateBillMultiplePolymorphicPayments ($data: CreateBillMultiplePolymorphicPaymentsInput!) {
    createBillMultiplePolymorphicPayments (input: $data) {
      success
      failures {
        id
        historical
        bill_type
        value_cents
        errors
      }
      bill_recs {
        id
        status
        compensated_at
      }
      bill_pays {
        id
        status
        compensated_at
      }
    }
  }
`;var oe=()=>{const[e,{loading:t}]=Object(q.a)(ie);return[Object(c.useCallback)((async t=>{try{var a;const c=await e({variables:{data:t}}),{success:n=!1,failures:r=[],bill_recs:s=[],bill_pays:l=[]}=(null===(a=c.data)||void 0===a?void 0:a.createBillMultiplePolymorphicPayments)||{};return{success:n,failures:r,updated_bills:[...s.map((e=>({...e,bill_type:"rec"}))),...l.map((e=>({...e,bill_type:"pay"})))]}}catch(c){return I.a.captureException(c),console.error(c),r.b.error(Object(n.b)("clients.debit.cant_create_payment_message_error")),{success:!1,updated_bills:[]}}}),[e]),t]},de=a(232);const be=Object(c.lazy)((()=>Object(de.a)((()=>a.e(68).then(a.bind(null,2936)))))),ue=Object(c.lazy)((()=>Object(de.a)((()=>a.e(57).then(a.bind(null,2956)))))),_e=()=>{const e=Object(o.c)(),t=ce(),a={...e.filters,...t},[d,b]=Object(c.useReducer)(o.b,{...e,filters:a}),[u,_]=Object(c.useState)([]),[j,m]=Object(c.useState)(0),[p,O]=Object(c.useState)([]),h=Object(U.a)((e=>e.is_mobile)),v=Object(c.useRef)(null),y=Object(c.useRef)(null),g=Object(c.useRef)(null),x=Object(c.useRef)(null),w=Object(c.useRef)(null),I=Object(c.useRef)(null),S=Object(c.useRef)(null);Object(c.useEffect)((()=>{0!==Object.keys(t).length&&b({type:"toggle_show_filters"})}),[]),Object(K.a)({feature_keys:["has_finance_transactions"]});const M=Object(c.useMemo)((()=>{let e="both";1===d.filters.bill_type.length&&(e=d.filters.bill_type[0]);const t=d.filters.start_date.format("YYYY-MM-DD"),a=d.filters.end_date.format("YYYY-MM-DD"),c=d.filters.search?d.filters.search.replace(/[,.]/g,""):void 0;return{...d.filters,search_query:c,bill_type:e,start_date:t,end_date:a,page:d.page,results:d.results,sort_field:d.filters.date_type,sort_order:d.sort_order}}),[d.filters,d.page,d.results,d.sort_order]),{loading:F,refetch:z}=Z(M,(e=>{if(!h||1===d.page)return _(e.finance_bills.all),void m(e.finance_bills.total_count);_((t=>{const a=new Set(t.map((e=>`${e.bill_type}_${e.id}`))),c=e.finance_bills.all.filter((e=>!a.has(`${e.bill_type}_${e.id}`)));return[...t,...c]})),m(e.finance_bills.total_count)})),[B]=oe(),P=Object(c.useCallback)((e=>{_((t=>t.map((t=>t.id===e.id&&t.bill_type===e.bill_type?{...t,...e}:t))))}),[]),R=Object(c.useCallback)((async(e,t,a)=>{const{success:c,failures:n=[],updated_bills:s=[]}=await B({ids:e,bills_type:a,compensated_at:t.format("YYYY-MM-DD")});if(c)return O([]),s.forEach((e=>{P(e)})),void G({ids:e,failures:n});r.b.error("Houve um erro na cria\xe7\xe3o dos pagamentos.")}),[B,P]),q=se(R),E=Object(c.useCallback)((()=>{if(h)return 1===d.page?void z():void b({type:"set_page",payload:1});z()}),[h,z,d.page]),T=Object(c.useCallback)((()=>{if(h)return 1===d.page?void z():void b({type:"set_page",payload:1});const e=Math.ceil((j-1)/d.results);d.page>e?b({type:"set_page",payload:e}):z()}),[h,z,d.page,d.results,j]),Y=Object(c.useCallback)((()=>{b({type:"set_page",payload:d.page+1})}),[d.page]),N=Object(c.useCallback)((e=>{var t;null===(t=I.current)||void 0===t||t.open(e)}),[]),L=Object(c.useCallback)((e=>{O(e)}),[]),J=Object(c.useCallback)((e=>{if(e){const e=(null===u||void 0===u?void 0:u.map((e=>e.id)))||[];O(e)}else O([])}),[u]),X=Object(c.useMemo)((()=>({selected_rows:p,selectedRowKeys:p,onChange:L,onSelectAll:J})),[p,L,J]),Q=Object(c.useMemo)((()=>[{label:Object(n.b)("verbs.pay"),icon:Object(f.jsx)(l.a,{}),onClick:e=>{const t=u.filter((t=>e.includes(t.id))),a=t.map((e=>e.id)),c=t.map((e=>"rec"===e.bill_type?"Finance::BillRec":"Finance::BillPay"));q(a,c)}}]),[q,u]),ee=Object(c.useMemo)((()=>({...d,dispatch:b,openAdvanceDrawer:e=>{var t;return null===(t=x.current)||void 0===t?void 0:t.open(e)},openBillRecDrawer:e=>{var t;return null===(t=v.current)||void 0===t?void 0:t.open(e)},openBillPayDrawer:e=>{var t;return null===(t=y.current)||void 0===t?void 0:t.open(e)},openTransferDrawer:()=>{var e;return null===(e=g.current)||void 0===e?void 0:e.open()},openDeleteBillModal:e=>{var t;return null===(t=w.current)||void 0===t?void 0:t.open(e)},openGenerateDocumentModal:N,refetch:E,handleFetchMore:Y,openTotalsModal:()=>{var e;return null===(e=S.current)||void 0===e?void 0:e.open()},updateBillInList:P,mass_actions:Q,row_selection:X})),[Y,E,N,Q,d,X,P]);return Object(f.jsxs)(i.a.Provider,{value:ee,children:[Object(f.jsx)(s.b,{children:Object(f.jsx)(W.a,{Desktop:ue,Mobile:be,bills:u,loading:F,total_count:j})}),Object(f.jsx)(k.a,{ref:v,afterSave:E}),Object(f.jsx)(D.a,{ref:y,afterSave:E}),Object(f.jsx)(V.a,{ref:g,afterSave:E}),Object(f.jsx)(C.a,{ref:x,afterSave:E}),Object(f.jsx)(H,{ref:w,afterDeleteBill:T}),Object(f.jsx)(A.a,{ref:I}),Object(f.jsx)($,{ref:S,...M})]})};_e.displayName="Transactions";t.default=_e},716:function(e,t,a){"use strict";var c=a(13),n=a(0),r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-32 736H663.9V602.2h104l15.6-120.7H663.9v-77.1c0-35 9.7-58.8 59.8-58.8h63.9v-108c-11.1-1.5-49-4.8-93.2-4.8-92.2 0-155.3 56.3-155.3 159.6v89H434.9v120.7h104.3V848H176V176h672v672z"}}]},name:"facebook",theme:"outlined"},s=a(71),l=function(e,t){return n.createElement(s.a,Object(c.a)({},e,{ref:t,icon:r}))},i=n.forwardRef(l);t.a=i},717:function(e,t,a){"use strict";var c=a(13),n=a(0),r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M512 306.9c-113.5 0-205.1 91.6-205.1 205.1S398.5 717.1 512 717.1 717.1 625.5 717.1 512 625.5 306.9 512 306.9zm0 338.4c-73.4 0-133.3-59.9-133.3-133.3S438.6 378.7 512 378.7 645.3 438.6 645.3 512 585.4 645.3 512 645.3zm213.5-394.6c-26.5 0-47.9 21.4-47.9 47.9s21.4 47.9 47.9 47.9 47.9-21.3 47.9-47.9a47.84 47.84 0 00-47.9-47.9zM911.8 512c0-55.2.5-109.9-2.6-165-3.1-64-17.7-120.8-64.5-167.6-46.9-46.9-103.6-61.4-167.6-64.5-55.2-3.1-109.9-2.6-165-2.6-55.2 0-109.9-.5-165 2.6-64 3.1-120.8 17.7-167.6 64.5C132.6 226.3 118.1 283 115 347c-3.1 55.2-2.6 109.9-2.6 165s-.5 109.9 2.6 165c3.1 64 17.7 120.8 64.5 167.6 46.9 46.9 103.6 61.4 167.6 64.5 55.2 3.1 109.9 2.6 165 2.6 55.2 0 109.9.5 165-2.6 64-3.1 120.8-17.7 167.6-64.5 46.9-46.9 61.4-103.6 64.5-167.6 3.2-55.1 2.6-109.8 2.6-165zm-88 235.8c-7.3 18.2-16.1 31.8-30.2 45.8-14.1 14.1-27.6 22.9-45.8 30.2C695.2 844.7 570.3 840 512 840c-58.3 0-183.3 4.7-235.9-16.1-18.2-7.3-31.8-16.1-45.8-30.2-14.1-14.1-22.9-27.6-30.2-45.8C179.3 695.2 184 570.3 184 512c0-58.3-4.7-183.3 16.1-235.9 7.3-18.2 16.1-31.8 30.2-45.8s27.6-22.9 45.8-30.2C328.7 179.3 453.7 184 512 184s183.3-4.7 235.9 16.1c18.2 7.3 31.8 16.1 45.8 30.2 14.1 14.1 22.9 27.6 30.2 45.8C844.7 328.7 840 453.7 840 512c0 58.3 4.7 183.2-16.2 235.8z"}}]},name:"instagram",theme:"outlined"},s=a(71),l=function(e,t){return n.createElement(s.a,Object(c.a)({},e,{ref:t,icon:r}))},i=n.forwardRef(l);t.a=i},853:function(e,t,a){"use strict";var c=a(0),n=a(50),r=a(2937),s=a(116),l=a(20),i=a(250),o=a(18),d=a(582),b=a(27),u=a(37),_=a(2879);const j=u.e`
  query fetchDocumentTemplate (
    $id: ID, $client_id: ID, $employee_id: ID, $schedule_group_id: ID, $inventory_sale_id: ID,
    $inventory_package_id: ID, $finance_bill_rec_id: ID, $finance_bill_pay_id: ID, $inventory_purchase_id: ID
  ) {
    document_template (id: $id) {
      id name save_on_generation exchange_variables(
        client_id: $client_id, employee_id: $employee_id, schedule_group_id: $schedule_group_id,
        inventory_sale_id: $inventory_sale_id, inventory_package_id: $inventory_package_id,
        finance_bill_rec_id: $finance_bill_rec_id, finance_bill_pay_id: $finance_bill_pay_id,
        inventory_purchase_id: $inventory_purchase_id
      )
    }
  }
`;var m=()=>Object(_.a)(j,{fetchPolicy:"network-only",notifyOnNetworkStatusChange:!0}),p=a(232),O=a(19),h=a(82),f=a(22);const v=Object(c.lazy)((()=>Object(p.a)((()=>Promise.all([a.e(13),a.e(157)]).then(a.bind(null,3084)))))),y=Object(c.lazy)((()=>Object(p.a)((()=>Promise.all([a.e(13),a.e(158)]).then(a.bind(null,3085)))))),g=(e,t)=>{const[a,i]=Object(c.useState)(!1),[u,_]=Object(c.useState)(),[j,p]=Object(c.useState)(),[O,g]=Object(c.useState)(),[$,w]=Object(c.useState)(!0),C=Object(l.o)(),k=Object(b.a)((e=>e.current_user.id)),D=Object(b.a)((e=>e.current_user.authentication_token)),I=Object(b.a)((e=>e.current_user.addons.has_upload_image)),S=Object(c.useRef)(null),[M]=r.a.useForm(),{setFieldsValue:F,getFieldsValue:z,resetFields:B}=M,[P,{data:R,loading:q,called:E}]=m();Object(c.useEffect)((()=>{var e;E&&!q&&null!==R&&void 0!==R&&R.document_template&&(F({exchange_variables:null===R||void 0===R?void 0:R.document_template.exchange_variables}),w(null!==(e=R.document_template.save_on_generation)&&void 0!==e&&e))}),[null===R||void 0===R?void 0:R.document_template,q,E]);const T=Object(c.useCallback)((e=>{let{document_template_id:t,...a}=e;P({variables:{id:t,...a}}),i(!0),_(t),g(a.client_id);const c=a.schedule_group_id||a.inventory_sale_id||a.inventory_package_id||a.finance_bill_rec_id;p(c)}),[P]),Y=Object(c.useCallback)((()=>{i(!1)}),[]);Object(c.useImperativeHandle)(t,(()=>({close:Y,open:T})));const H=Object(c.useCallback)((()=>{C(`/subscription/addons?addon_id=${o.a.ID_UPLOAD_IMAGE}`)}),[C]),V=Object(c.useCallback)((e=>{const t=document.getElementById("generate-pdf-form");if(!t)return;const a=z();t.save_on_generation.value=e,t.exchange_variables.value=a.exchange_variables,t.submit()}),[z]),A=Object(c.useCallback)((()=>{I||!$?V($):s.c.confirm({content:Object(n.b)("document_templates.upload_activation"),okText:Object(n.b)("verbs.contract"),okType:"primary",cancelText:Object(n.b)("verbs.cancel"),zIndex:1042,onOk:H,onCancel:()=>{w(!1),V(!1)}})}),[H,I,$,V]),N=Object(c.useCallback)((e=>{e||(B(),_(void 0),g(void 0),p(void 0),w(!0))}),[B]);return Object(f.jsxs)(x,{open:a,width:1650,height:"100%",onClose:Y,destroyOnClose:!0,afterOpenChange:N,children:[Object(f.jsx)(r.a,{form:M,layout:"vertical",style:{height:"100%"},children:Object(f.jsx)(d.a,{Mobile:y,Desktop:v,title:null===R||void 0===R?void 0:R.document_template.name,loading:q,save_on_generation:$,setSaveOnGeneration:w,close:Y,generatePDF:A,editorRef:S})}),Object(f.jsxs)("form",{id:"generate-pdf-form",action:`${h.a.API}/document_templates/generate_document`,method:"post",target:"_blank",children:[Object(f.jsx)("input",{type:"hidden",name:"document_template_id",value:u,readOnly:!0}),Object(f.jsx)("input",{type:"hidden",name:"client_id",value:O,readOnly:!0}),Object(f.jsx)("input",{type:"hidden",name:"class_id",value:j,readOnly:!0}),Object(f.jsx)("input",{type:"hidden",name:"current_user_id",value:k,readOnly:!0}),Object(f.jsx)("input",{type:"hidden",name:"authentication_token",value:D,readOnly:!0}),Object(f.jsx)("input",{type:"hidden",name:"exchange_variables",readOnly:!0}),Object(f.jsx)("input",{type:"hidden",name:"save_on_generation",readOnly:!0})]})]})};g.displayName="GenerateDocumentDrawer";t.a=Object(c.memo)(Object(c.forwardRef)(g));const x=Object(O.d)(i.a).withConfig({componentId:"wb__sc-wueh2s-0"})([".ant-drawer-body{padding-left:0;padding-right:0;background:",";.tox-statusbar__branding{display:none;}}"],(e=>e.theme.is_mobile?"#f8f8f8":"transparent"))},897:function(e,t,a){"use strict";var c=a(13),n=a(0),r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M847.9 592H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h605.2L612.9 851c-4.1 5.2-.4 13 6.3 13h72.5c4.9 0 9.5-2.2 12.6-6.1l168.8-214.1c16.5-21 1.6-51.8-25.2-51.8zM872 356H266.8l144.3-183c4.1-5.2.4-13-6.3-13h-72.5c-4.9 0-9.5 2.2-12.6 6.1L150.9 380.2c-16.5 21-1.6 51.8 25.1 51.8h696c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"}}]},name:"swap",theme:"outlined"},s=a(71),l=function(e,t){return n.createElement(s.a,Object(c.a)({},e,{ref:t,icon:r}))},i=n.forwardRef(l);t.a=i}}]);
//# sourceMappingURL=95.ecb3ae2d.chunk.js.map