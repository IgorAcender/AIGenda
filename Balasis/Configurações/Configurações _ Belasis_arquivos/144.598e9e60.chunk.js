(this["webpackJsonpwebook-react"]=this["webpackJsonpwebook-react"]||[]).push([[144],{2991:function(e,t,s){"use strict";s.r(t);var i=s(0),c=s(50),a=s(37);const r=a.e`
  query CustomerSubscriptions(
    $page: Int, $results: Int, $payment_type: [String!], $status: [String!], $start_date: String, $end_date: String,
    $search_query: String
  ) {
    all_customer_subscriptions (
      page: $page, results: $results, payment_type: $payment_type, status: $status, start_due: $start_date,
      end_due: $end_date, search_term: $search_query, sort_field: "created_at", sort_order: "DESC"
    ) {
      all {
        id
        code
        total_cents
        status
        payment_type
        due
        payment_link

        client {
          id
          name
        }

        customer_subscription_template {
          id
          name
          image_url: small_thumb_url
          image_blurhash
        }

        customer_subscription_items {
          id
          discount
          discount_type
          quantity
          total_cents
          value_cents
          inventory_product {
            id
            description
          }
        }
      }

      total_count
    }
  }
`;a.e`
  mutation DestroyCustomerSubscription($data: DestroyCustomerSubscriptionInput!) {
    destroyCustomerSubscription(input: $data) {
      success errors
    }
  }
`;var n=s(18),l=s(754),o=s(627),b=s(593),d=s(547),u=s(250),p=s(579),m=s(786),_=s(599),j=s(583),O=s(19),h=s(22);const v=e=>{var t,s,i;const{item:a}=e;return Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)("div",{children:Object(h.jsx)(g,{type:"image",src:null===a||void 0===a||null===(t=a.customer_subscription_template)||void 0===t?void 0:t.image_url,blurhash:null===a||void 0===a||null===(s=a.customer_subscription_template)||void 0===s?void 0:s.image_blurhash})}),Object(h.jsxs)(y,{children:[Object(h.jsxs)(u.g,{$column:!0,$top:2,children:[Object(h.jsx)(j.b,{width:16,$block:!0,$bold:!0,children:null===a||void 0===a?void 0:a.client.name}),Object(h.jsx)(j.b,{width:6,$block:!0,$semibold:!0,children:(null===a||void 0===a||null===(i=a.customer_subscription_template)||void 0===i?void 0:i.name)||Object(c.b)("words.custom")}),null===a||void 0===a?void 0:a.customer_subscription_items.map((e=>Object(h.jsx)(j.b,{width:6,$block:!0,$color:"gray_1",$size:12,children:`${e.quantity}x ${e.inventory_product.description}`})))]}),Object(h.jsxs)("div",{children:[Object(h.jsx)(j.b,{width:8,$block:!0,$size:12,$semibold:!0,$align:"end",children:Object(p.d)(null===a||void 0===a?void 0:a.total_cents)}),Object(h.jsx)(d.a,{color:m.b[(null===a||void 0===a?void 0:a.status)||"disabled"],style:{marginRight:0},children:m.c[(null===a||void 0===a?void 0:a.status)||"disabled"]})]})]})]})};var x=Object(i.memo)(v);const y=O.d.div.withConfig({componentId:"wb__sc-zh518e-0"})(["width:100%;display:flex;flex-direction:row;"]),g=Object(O.d)(_.a).withConfig({componentId:"wb__sc-zh518e-1"})(["width:40px !important;height:40px !important;margin-right:10px !important;border:1px solid rgba(0,0,0,0.1);object-fit:cover;"]);var w=s(1652);const k=Object(O.d)(d.a).withConfig({componentId:"wb__sc-1ji2gmb-0"})(["margin:2px 0;"]),f=[{value:"pending",label:Object(h.jsx)(k,{color:m.b.pending,children:Object(c.b)("customer.subscription.status.pending")})},{value:"active",label:Object(h.jsx)(k,{color:m.b.active,children:Object(c.b)("customer.subscription.status.active")})},{value:"expired",label:Object(h.jsx)(k,{color:m.b.expired,children:Object(c.b)("customer.subscription.status.expired")})},{value:"disabled",label:Object(h.jsx)(k,{color:m.b.disabled,children:Object(c.b)("customer.subscription.status.disabled")})},{value:"canceled",label:Object(h.jsx)(k,{color:m.b.canceled,children:Object(c.b)("customer.subscription.status.canceled")})}],$=[{value:"automatic",label:Object(c.b)("words.automatic")},{value:"manual",label:Object(c.b)("words.manual")}];var C=()=>Object(i.useMemo)((()=>[{label:Object(c.b)("words.due"),name:"due",rangepicker:{start_date_name:"start_date",end_date_name:"end_date"}},{label:Object(c.b)("words.status"),name:"status",checkbox_options:f,checkbox_disabled:!0},{label:Object(c.b)("words.payment_type"),name:"payment_type",checkbox_options:$,checkbox_disabled:!0}]),[]);t.default=()=>{Object(b.a)({feature_keys:["has_customer_subscription"],addon_keys:["has_customer_subscription"],search:n.a.ID_CUSTOMER_SUBSCRIPTION});const e=Object(i.useRef)(null),t=Object(i.useRef)(null),s=Object(i.useCallback)((()=>{var e;null===(e=t.current)||void 0===e||e.refetch()}),[]),a=Object(i.useCallback)((t=>{var s;null===(s=e.current)||void 0===s||s.open(null===t||void 0===t?void 0:t.id)}),[]),d=Object(i.useCallback)((e=>!0),[]),u=Object(m.d)({openSubscriptionDrawer:a,afterDeleteSubscription:s}),p=C();return Object(h.jsxs)(h.Fragment,{children:[Object(h.jsx)(o.a,{ref:t,Header:w.a,title:Object(c.b)("phrases.subscription_sale_other"),storage_key:"customer_subscriptions",permissions_key:"subscription_template",columns:u,query:r,getData:e=>{var t;return null===e||void 0===e||null===(t=e.all_customer_subscriptions)||void 0===t?void 0:t.all},getTotalCount:e=>{var t;return(null===e||void 0===e||null===(t=e.all_customer_subscriptions)||void 0===t?void 0:t.total_count)||0},MobileItem:x,openDrawer:a,validateRow:d,filters:p,search_placeholder:Object(c.b)("customer.subscription.search_placeholder")}),Object(h.jsx)(l.a,{ref:e,afterSave:s})]})}},691:function(e,t,s){"use strict";var i=s(13),c=s(0),a={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z"}}]},name:"menu",theme:"outlined"},r=s(71),n=function(e,t){return c.createElement(r.a,Object(i.a)({},e,{ref:t,icon:a}))},l=c.forwardRef(n);t.a=l},786:function(e,t,s){"use strict";s.d(t,"c",(function(){return k})),s.d(t,"b",(function(){return f})),s.d(t,"a",(function(){return $}));var i=s(0),c=s(50),a=s(547),r=s(616),n=s(250),l=s(579),o=s(599),b=s(27),d=s(1809),u=s(116),p=s(3064),m=s(3034),_=s(2854),j=s(691),O=s(795),h=s(654),v=s(22);const x=e=>{let{subscription:t,handleEdit:s,afterDeleteSubscription:a}=e;const r=Object(b.a)((e=>e.current_user.permissions)),l=Object(h.a)(),[o]=Object(O.a)(),x=Object(i.useCallback)((()=>{r.can_edit_subscription_template?l(t.payment_link):u.b.warning(Object(c.b)("phrases.no_permission_to_do_this"))}),[l,r.can_edit_subscription_template,t.payment_link]),y=Object(i.useCallback)((async e=>{const{success:t}=await o(e);t&&(u.b.success(Object(c.b)("phrases.deleted_successfully",{prefix:Object(c.b)("words.subscription"),context:"female"})),a())}),[a,o]),g=Object(i.useCallback)((e=>{r.can_destroy_subscription_template?u.c.confirm({centered:!0,className:"webook-modal",title:Object(c.b)("words.attention"),maskClosable:!0,content:Object(c.b)("phrases.confirm_delete_female",{model:Object(c.b)("words.subscription").toLocaleLowerCase()}),okText:Object(c.b)("phrases.yes_delete"),okType:"danger",cancelText:Object(c.b)("verbs.cancel"),onOk:()=>y(e)}):u.b.warning(Object(c.b)("phrases.no_permission_to_do_this"))}),[y,r.can_destroy_subscription_template]),w=Object(i.useMemo)((()=>[{key:"copy_link",title:Object(c.b)("phrases.share_link"),icon:Object(v.jsx)(p.a,{}),label:Object(c.b)("phrases.share_link"),onClick:x},{key:"edit",title:Object(c.b)("verbs.edit"),icon:Object(v.jsx)(m.a,{}),onClick:()=>s(t),label:Object(c.b)("verbs.edit")},{key:"delete",title:Object(c.b)("verbs.delete"),danger:!0,onClick:()=>g(t.id),icon:Object(v.jsx)(_.a,{}),label:Object(c.b)("verbs.delete")}]),[g,s,x,t]);return Object(v.jsx)(n.g,{$justifyCenter:!0,children:Object(v.jsx)(d.a,{menu:{items:w},trigger:["click"],getPopupContainer:e=>e.parentElement||document.body,children:Object(v.jsx)(n.i,{className:"link",children:Object(v.jsx)(j.a,{})})})})};x.displayName="ActionColumns";var y=Object(i.memo)(x),g=s(53),w=s.n(g);const k={pending:Object(c.b)("customer.subscription.status.pending"),active:Object(c.b)("customer.subscription.status.active"),expired:Object(c.b)("customer.subscription.status.expired"),disabled:Object(c.b)("customer.subscription.status.disabled"),canceled:Object(c.b)("customer.subscription.status.canceled")},f={pending:"orange",active:"green",disabled:"red",canceled:"red",expired:"red"},$={automatic:Object(c.b)("words.automatic_female"),manual:Object(c.b)("words.manual")};t.d=e=>{let{openSubscriptionDrawer:t,afterDeleteSubscription:s}=e;const d=Object(b.a)((e=>e.current_user.permissions)),p=Object(i.useCallback)((e=>{d.can_edit_subscription_template?t(e):u.b.warning(Object(c.b)("phrases.no_permission_to_do_this"))}),[t,d.can_edit_subscription_template]);return Object(i.useMemo)((()=>[{title:Object(c.b)("words.code"),default_visible:!0,align:"center",key:"code",dataIndex:"code",ellipsis:!0,width:80,render:(e,t)=>Object(v.jsxs)(n.i,{onClick:()=>p(t),children:["#",e]})},{title:Object(c.b)("words.model"),default_visible:!0,key:"customer_subscription_template",dataIndex:"customer_subscription_template",ellipsis:!0,render:e=>Object(v.jsxs)("div",{style:{alignItems:"center",overflow:"hidden",textOverflow:"ellipsis"},children:[Object(v.jsx)(o.a,{type:"image",src:null===e||void 0===e?void 0:e.image_url,blurhash:null===e||void 0===e?void 0:e.image_blurhash,size:"small"}),"\xa0",Object(v.jsx)(n.h,{children:(null===e||void 0===e?void 0:e.name)||Object(c.b)("words.custom")})]})},{title:Object(c.b)("words.client"),default_visible:!0,key:"client",dataIndex:"client",ellipsis:!0,render:e=>e.name},{title:Object(c.b)("words.due"),default_visible:!0,key:"due",dataIndex:"due",ellipsis:!0,width:130,render:e=>e?w()(e).format("L"):null},{title:Object(c.b)("words.status"),default_visible:!0,key:"status",dataIndex:"status",ellipsis:!0,width:130,render:e=>Object(v.jsx)(a.a,{color:f[e],children:k[e]})},{title:Object(c.b)("words.renovation"),default_visible:!0,key:"payment_type",dataIndex:"payment_type",ellipsis:!0,width:130,render:e=>$[e]},{title:Object(c.b)("words.total"),default_visible:!0,key:"total_cents",align:"right",dataIndex:"total_cents",width:150,render:e=>Object(l.d)(e)},{default_visible:!0,always_visible:!0,key:"actions",width:80,align:"center",render:(e,t)=>Object(v.jsx)(r.a,{width:64,children:Object(v.jsx)(y,{subscription:t,handleEdit:p,afterDeleteSubscription:s})})}]),[s,p])}}}]);
//# sourceMappingURL=144.598e9e60.chunk.js.map