(this["webpackJsonpwebook-react"]=this["webpackJsonpwebook-react"]||[]).push([[212],{2970:function(e,t,s){"use strict";s.r(t);var r=s(0),i=s(116),o=s(37);const c=o.e`
  fragment ServiceListCommonAttributes on Product {
    id
    image_blurhash
    image_url: small_thumb_url
    favorite
    description
    price_cents
    duration
    active
  }

`,a=o.e`
  fragment ServiceListDesktopAttributes on Product {
    commission
    site
    group_name
  }
`,l=o.e`
  query ServicesList (
    $page: Int,
    $results: Int,
    $search_query: String,
    $sort_field: String,
    $sort_order: String,
    $actives: Boolean,
    $favorites: Boolean,
    $group_ids: [ID],

    $is_mobile: Boolean!,
  ) {
    all_inventory_products (
      page: $page,
      results: $results,
      search_term: $search_query,
      sort_field: $sort_field,
      sort_order: $sort_order,
      actives: $actives,
      favorites: $favorites,
      group_ids: $group_ids,
      service: true,
      use_replica: true
    ) {
      all {
        ...ServiceListCommonAttributes

        ...ServiceListDesktopAttributes @skip(if: $is_mobile)
      }
      total_count
    }
  }

  ${c}
  ${a}
`,n=o.e`
  query ServicesIdsList ($actives: Boolean, $favorites: Boolean) {
    all_inventory_products (actives: $actives, favorites: $favorites, service: true, use_replica: true) {
      all {
        id active favorite
      }
    },
  }
`;var d=s(1830),b=s(713),u=s(627),j=s(27),v=s(50),h=s(1438),_=s(852),p=s(19),O=s(250),m=s(616),f=s(2845),g=s(3034),w=s(2854),x=s(579),y=s(599),$=s(22);var k=e=>{let{openServiceDrawer:t,handleDestroyService:s,handleFavorite:o}=e;const c=Object(p.f)(),a=Object(j.a)((e=>e.current_user.permissions)),l=Object(r.useCallback)((e=>{a.can_destroy_product?i.c.confirm({centered:!0,className:"webook-modal",title:Object(v.b)("words.attention"),maskClosable:!0,content:Object(v.b)("phrases.confirm_delete",{model:Object(v.b)("words.service").toLocaleLowerCase()}),okText:Object(v.b)("phrases.yes_delete"),okType:"danger",cancelText:Object(v.b)("verbs.cancel"),onOk:()=>s(e)}):i.b.warning(Object(v.b)("phrases.no_permission_to_do_this"))}),[s,a.can_destroy_product]);return Object(r.useMemo)((()=>[{title:Object(v.b)("words.name"),default_visible:!0,always_visible:!0,key:"description",dataIndex:"description",defaultSortOrder:"ascend",className:"table-sort",sorter:!0,ellipsis:!0,width:"80%",render:(e,s)=>Object($.jsxs)(O.i,{title:e,style:{width:"100%",textAlign:"start"},className:"link text-overflow-ellipsis",onClick:()=>t(s),children:[Object($.jsx)(y.a,{type:"image",size:"small",shape:"square",src:s.image_url,blurhash:s.image_blurhash}),"\xa0",e]})},{title:Object(v.b)("words.value"),default_visible:!0,key:"price_cents",dataIndex:"price_cents",align:"right",sorter:!0,width:100,render:e=>Object(x.d)(e)},{title:Object(v.b)("words.commission"),default_visible:!0,key:"commission",align:"right",dataIndex:"commission",sorter:!0,width:110,render:e=>Object(x.u)(e)},{title:Object(v.b)("words.duration"),default_visible:!0,key:"duraction",dataIndex:"duraction",sorter:!0,width:100,render:(e,t)=>Object(x.f)(t.duration,"seconds")},{title:Object(v.b)("words.category"),default_visible:!0,key:"group_name",dataIndex:"group_name",ellipsis:!0,width:"20%"},{title:Object(v.b)("services.shows_on_site"),default_visible:!0,sorter:!0,key:"site",ellipsis:!0,dataIndex:"site",width:160,align:"center",render:e=>e?Object(v.b)("words.yes"):Object(v.b)("words.no")},{default_visible:!0,key:"actions",align:"center",width:130,render:(e,s)=>Object($.jsxs)(m.a,{width:114,children:[Object($.jsx)("button",{className:"link",onClick:()=>o([s.id]),children:Object($.jsx)(f.a,{size:16,style:{color:s.favorite?c.colors.gold:"lightgray"}})}),Object($.jsx)(h.a,{type:"vertical"}),Object($.jsx)(_.a,{title:Object(v.b)("verbs.view"),placement:"bottom",children:Object($.jsx)("button",{className:"link",onClick:()=>t(s),children:Object($.jsx)(g.a,{})})}),Object($.jsx)(h.a,{type:"vertical"}),Object($.jsx)("button",{className:"link color-red",onClick:()=>l(s.id),children:Object($.jsx)(w.a,{})})]})}]),[l,o,t,c.colors.gold])},C=s(583);const S=e=>{const{item:t}=e,s=Object(p.f)();return Object($.jsxs)($.Fragment,{children:[Object($.jsx)("div",{children:Object($.jsx)(I,{type:"image",src:null===t||void 0===t?void 0:t.image_url,blurhash:null===t||void 0===t?void 0:t.image_blurhash})}),Object($.jsxs)("div",{style:{width:"100%",overflow:"hidden"},children:[Object($.jsxs)(O.g,{justify:"space-between",children:[Object($.jsx)(C.b,{width:10,$block:!0,$textEllipsis:!0,children:null===t||void 0===t?void 0:t.description}),Object($.jsx)(C.b,{width:4,$block:!0,$color:"gray_1",$size:14,children:Object($.jsx)(f.a,{size:22,style:{color:null!==t&&void 0!==t&&t.favorite?s.colors.gold:"lightgray"}})})]}),Object($.jsxs)(O.g,{justify:"space-between",children:[Object($.jsx)(C.b,{width:8,$block:!0,$color:"gray_1",$size:12,children:Object(x.d)(null===t||void 0===t?void 0:t.price_cents)}),Object($.jsx)(C.b,{width:6,$block:!0,$color:"gray_1",$size:12,children:Object(x.f)((null===t||void 0===t?void 0:t.duration)||0,"seconds",{descriptive:!0})})]})]})]})};var L=Object(r.memo)(S);const I=Object(p.d)(y.a).withConfig({componentId:"wb__sc-9ixe5r-0"})(["width:40px !important;height:40px !important;border-radius:5px !important;margin-right:10px !important;border:1px solid #eee;"]);var D=()=>{const e=Object(j.a)((e=>e.inventory_groups)).filter((e=>e.active&&!e.deleted_at));return Object(r.useMemo)((()=>{const t=e.map((e=>({value:e.id,label:e.name})));return[{label:Object(v.b)("words.status"),name:"actives",default_value:"true",double_checkbox:{true:Object(v.b)("words.active",{count:2}),false:Object(v.b)("words.inactive",{count:2})}},{label:Object(v.b)("words.favorite",{count:2}),name:"favorites",default_value:null,double_checkbox:{true:Object(v.b)("phrases.with_star"),false:Object(v.b)("phrases.no_star")}},{label:Object(v.b)("words.category",{count:2}),name:"group_ids",checkbox_options:t}]}),[e])},z=s(667),N=s(2872),T=s(1531),q=s(608);const R=e=>Object(v.b)("phrases.confirm_delete",{model:Object(v.b)("words.service",{count:e.length}).toLocaleLowerCase(),count:e.length}),A=p.d.div.withConfig({componentId:"wb__sc-1psbmfo-0"})(["display:flex;width:100%;flex-direction:column;align-items:center;background-color:#fbfbfb;border-radius:5px;box-shadow:0 2px 9px rgba(83,83,83,0.06);overflow:hidden;margin-bottom:15px;padding:10px;border:1px solid transparent;user-select:none;transition:transform .2s;"]);var B=s(1041),F=s(1532);t.default=()=>{const e=Object(r.useRef)(null),t=Object(r.useRef)(null),s=Object(r.useRef)(null),o=Object(j.a)((e=>e.current_user.permissions)),[c]=Object(F.a)(),[a]=Object(T.a)(),[_]=Object(B.a)(),p=Object(r.useCallback)((()=>{var t;null===(t=e.current)||void 0===t||t.refetch()}),[]),m=Object(r.useCallback)((async e=>{if(!o.can_destroy_product)return void i.b.warning(Object(v.b)("phrases.no_permission_to_do_this"));const{success:t,deactivated:s,errors:r}=await c({id:e});return t?(i.b.success(Object(v.b)("phrases.deleted_successfully",{prefix:Object(v.b)("words.service")})),void p()):s?(null===r||void 0===r||r.map((e=>i.b.info(e))),void p()):void(null===r||void 0===r||r.map((e=>i.b.error(e))))}),[c,o.can_destroy_product,p]),f=Object(r.useCallback)((async t=>{const{success:s,failures:r=[]}=await a({ids:t});(s||0!==r.length)&&(e=>{let{ids:t,failures:s=[],magicTableRef:r}=e;const o=s.length===t.length,c=0===s.length,a=s.filter((e=>e.deactivated)),l=t.length-a.length;var n;if(c)return i.b.success(`${t.length} ${Object(v.b)("phrases.deleted_successfully",{prefix:Object(v.b)("words.service",{count:t.length}).toLocaleLowerCase(),count:t.length})}`),void(null===(n=r.current)||void 0===n||n.afterDestroyRecord(t.length));q.a.information({closable:!0,className:"webook-modal hide-buttons",maskClosable:!0,onCancel:()=>{var e;o||null===(e=r.current)||void 0===e||e.afterDestroyRecord(s.length)},title:Object(v.b)("phrases.mass_delete_completed"),content:Object($.jsxs)("div",{style:{maxHeight:400,width:"100%",maxWidth:480,overflowX:"hidden",overflowY:"auto"},children:[!o&&Object($.jsxs)(O.h,{$size:16,$alignCenter:!0,$color:"green_2",children:[l,"\xa0",Object(v.b)("phrases.deleted_successfully",{prefix:Object(v.b)("words.service",{count:l}).toLocaleLowerCase(),count:l})]}),s.length>0&&Object($.jsxs)(O.g,{$column:!0,$paddings:[0,10],children:[Object($.jsx)(h.a,{dashed:!0}),Object($.jsxs)(O.h,{$size:16,$alignCenter:!0,$paddings:{bottom:10},children:[s.length,"\xa0",Object(v.b)("phrases.cant_be_deleted",{prefix:Object(v.b)("words.service",{count:s.length}).toLocaleLowerCase(),count:s.length})]}),s.map((e=>{let{inventory_product:t,errors:s=[],deactivated:r=!1}=e;return Object($.jsxs)(A,{children:[Object($.jsx)(O.g,{$column:!0,style:{overflow:"hidden"},children:Object($.jsx)(O.h,{$size:16,$textEllipsis:!0,$block:!0,children:t.description})}),Object($.jsx)(O.g,{$column:!0,style:{overflow:"hidden"},$mTop:10,children:s.map((e=>Object($.jsx)(O.h,{$color:r?"gray_1":"red",children:e},`${e}_${t.id}`)))})]},`item_${t.id}`)}))]})]})})})({ids:t,failures:r,magicTableRef:e})}),[a]),x=Object(r.useCallback)((e=>{var s;null===(s=t.current)||void 0===s||s.open({id:null===e||void 0===e?void 0:e.id})}),[]),y=Object(r.useCallback)((e=>{o.can_edit_product?x(e):i.b.warning(Object(v.b)("phrases.no_permission_to_do_this"))}),[x,o.can_edit_product]),C=Object(z.a)(o.can_destroy_product,R,f),S=Object(r.useCallback)((async e=>{if(!o.can_edit_product)return void i.b.warning(Object(v.b)("phrases.no_permission_to_do_this"));const{success:t,errors:s}=await _({product_ids:e,field:"favorite"});if(!t)return;const r=e.length-s.length,c=Object(v.b)("phrases.update_successfully",{prefix:Object(v.b)("words.service",{count:r}),count:r});i.b.success(c),p()}),[o.can_edit_product,p,_]),I=k({openServiceDrawer:y,handleDestroyService:m,handleFavorite:S}),M=D(),E=Object(r.useCallback)((e=>e),[]),J=Object(r.useMemo)((()=>[{label:Object(v.b)("verbs.delete"),icon:Object($.jsx)(w.a,{}),danger:!0,onClick:function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];const t=e.map((e=>e.id||e));C(t)}},{label:Object(v.b)("words.favorite"),icon:Object($.jsx)(N.a,{twoToneColor:"#f9b60c"}),title:Object(v.b)("phrases.reverse_favorite"),onClick:e=>{const t=e.map((e=>e.id));S(t)}},{label:Object(v.b)("verbs.edit"),icon:Object($.jsx)(g.a,{className:"link"}),onClick:e=>{var t;if(!o.can_edit_product)return void i.b.warning(Object(v.b)("phrases.no_permission_to_do_this"));const r=e.map((e=>e.id));null===(t=s.current)||void 0===t||t.open(r)}}]),[S,C,o.can_edit_product]);return Object($.jsxs)($.Fragment,{children:[Object($.jsx)(u.a,{ref:e,mass_actions:J,rowSelectorKey:E,title:Object(v.b)("words.service",{count:2}),permissions_key:"product",search_placeholder:Object(v.b)("services.search_placeholder"),filters:M,columns:I,query:l,select_all_query:n,MobileItem:L,getData:e=>{var t;return null===e||void 0===e||null===(t=e.all_inventory_products)||void 0===t?void 0:t.all},getTotalCount:e=>{var t;return(null===e||void 0===e||null===(t=e.all_inventory_products)||void 0===t?void 0:t.total_count)||0},openDrawer:x}),Object($.jsx)(b.a,{ref:t,afterSave:p}),Object($.jsx)(d.a,{ref:s,is_service:!0,afterSave:p})]})}}}]);
//# sourceMappingURL=212.f42b0827.chunk.js.map