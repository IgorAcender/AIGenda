(this["webpackJsonpwebook-react"]=this["webpackJsonpwebook-react"]||[]).push([[147],{2835:function(e,s,t){"use strict";t.r(s);var a=t(0),o=t(659),i=t(27),n=t(990);var _=()=>{const e=Object(i.a)((e=>e.current_user.permissions)),s=Object(i.a)((e=>e.current_user.employee_id));return e.is_admin?n.a:{...n.a,filters:{...n.a.filters,employee_id:s}}},c=t(37),r=t(148),d=t(76);const l=c.e`
  query CommissionsListEmployeeFeeConfig ($employee_id: ID) {
    employee(id: $employee_id, active: true) {
      id
      name
      avatar_url: large_thumb_url
      has_commission
      employee_fee_config {
        id fee_payer discount_payer open_sales filter_date_by product_consumed_price_by discount_consumed_products_on
        considers_additional_cost show_total_gross_value
      }
    }
  }
`;var m=e=>{const s=Object(r.a)(),t=Object(a.useRef)({}),[o,i]=Object(a.useState)(!1),n=Object(a.useCallback)((async a=>{t.current={employee_id:a},o&&i(!1),e({type:"reset_data"}),e({type:"set_employee_loading",payload:!0});try{const{data:a}=await s.query({query:l,variables:t.current,fetchPolicy:"network-only"});e({type:"set_employee",payload:a.employee})}catch(n){i(!0),d.a.captureException(n),console.error(n)}finally{e({type:"set_employee_loading",payload:!1})}}),[s,e,o]),_=Object(a.useCallback)((async()=>{t.current&&await n(t.current.employee_id)}),[n]);return Object(a.useMemo)((()=>[n,_,o]),[n,_,o])};const u=c.e`
  fragment inventory_sale_items_fields on SaleItem {
    id
    quantity
    inventory_sale_id
    value_cents
    sum_cents
    kind_points
    commission_sale_item_discount

    inventory_product {
      id
      description
    }

    inventory_package_item {
      id
      quantity
      value_cents
      sum_cents
    }

    inventory_sale_composes {
      id
      quantity
      unit_quantity
      extra_quantity
      inventory_product_cost_price_cents
      inventory_product_employee_price_cents
      inventory_product_sale_price_cents

      total_inventory_product_cost_price_cents
      total_inventory_product_employee_price_cents
      total_inventory_product_sale_price_cents

      inventory_product { id description }
    }
  }

  fragment finance_commission_items_fields on CommissionItem {
    id
    employee_product_commission_percentage
    product_commission_percentage
    available_value
    paid_value
    blocked_value
    total_value
    considered_commission_percentage
    employee_commission_mode
    accumulated_rate
    proportional_tax_rate
    total_taxes_value
    from_package_item
    from_offers_item
    from_subscription_item
    first_payment_realized
    discounted_for_assistants_sum
    discounted_for_products_sum
    considers_additional_cost
    additional_cost_price
    sale_item_gross_value

    inventory_sale {
      id
      code
      date
      schedule_group_id
      client {
        id
        name
        avatar_url: large_thumb_url
      }
    }

    inventory_sale_item { ...inventory_sale_items_fields }

    item_sale_assistant {
      id
      commission_percentage
      discount_assistant_commission_from
      calculate_assistant_commission_on
      inventory_sale_item { ...inventory_sale_items_fields }
    }
  }

  query CommissionItemsQuery(
    $employee_id: ID,
    $start_date: String,
    $end_date: String,
    $previous_end_date: String,
    $search_previous: Boolean!
  ) {
    finance_commission_items(
      employee_id: $employee_id,
      end_date: $end_date,
      start_date: $start_date,
      only_with_available_value: true
    ) {
      ...finance_commission_items_fields
    }

    previous_commission_items: finance_commission_items(
      employee_id: $employee_id,
      end_date: $previous_end_date,
      only_with_available_value: true
    ) @include(if: $search_previous) {
      ...finance_commission_items_fields
    }

    advances(
      employee_id: $employee_id,
      end_date: $end_date,
      start_date: $start_date,
      discounted: false,
      source: "commission"
    ) {
      id
      date
      note
      value_cents
    }

    all_bonifications(
      employee_id: $employee_id,
      end_date: $end_date,
      start_date: $start_date,
      without_payment: true
    ) {
      all {
        id
        created_at
        value_cents
      }
    }
  }
`;var p=e=>{const s=Object(r.a)(),[t,o]=Object(a.useState)(!1),i=Object(a.useRef)(),n=Object(a.useCallback)((async a=>{i.current=a,t&&o(!1),e({type:"set_commissions_loading",payload:!0}),e({type:"set_show_tables",payload:!0}),e({type:"set_commissions",payload:{commission_items:[],advances:[],bonifications:[]}});try{const{data:t}=await s.query({query:u,variables:i.current,fetchPolicy:"network-only"}),{advances:a,finance_commission_items:o,previous_commission_items:n=[],all_bonifications:_}=t,c={advances:a,commission_items:[...o,...n],bonifications:_.all};e({type:"set_commissions",payload:c})}catch(n){o(!0),d.a.captureException(n),console.error(n)}finally{e({type:"set_commissions_loading",payload:!1})}}),[s,e,t]),_=Object(a.useCallback)((async()=>{i.current&&n(i.current)}),[n]);return Object(a.useMemo)((()=>[n,_,t]),[n,_,t])},y=t(582),f=t(232),v=t(22);const b=Object(a.lazy)((()=>Object(f.a)((()=>Promise.all([t.e(2),t.e(21),t.e(206)]).then(t.bind(null,2931)))))),h=Object(a.lazy)((()=>Object(f.a)((()=>Promise.all([t.e(21),t.e(91)]).then(t.bind(null,2948)))))),g=()=>{const e=_(),[s,t]=Object(a.useReducer)(n.b,e),c=Object(i.a)((e=>e.current_user.features)),r=Object(i.a)((e=>e.is_agendapro)),d=Object(i.a)((e=>e.is_webook)),[l,u,f]=m(t),[g,j,w]=p(t),O=!(!d&&!r)||c.has_commissions;Object(a.useEffect)((()=>{const s=e.filters.employee_id;s&&O&&(async s=>{await l(s);const t={employee_id:s,start_date:e.filters.start_date.format("YYYY-MM-DD"),end_date:e.filters.end_date.format("YYYY-MM-DD"),previous_end_date:e.filters.start_date.subtract(1,"day").format("YYYY-MM-DD"),search_previous:e.filters.search_previous};g(t)})(s)}),[]);const k=Object(a.useMemo)((()=>({...s,dispatch:t,fetchCommissions:g,fetchFeeConfig:l,refetchFeeConfig:u,refetchCommissions:j,fee_config_error:f,commissions_has_error:w})),[w,f,g,l,j,u,s]);return Object(v.jsx)(o.a.Provider,{value:k,children:Object(v.jsx)(y.a,{Desktop:b,Mobile:h})})};g.displayName="CommissionItems";s.default=Object(a.memo)(g)},659:function(e,s,t){"use strict";t.d(s,"a",(function(){return i}));var a=t(640),o=t(990);const i=Object(a.a)({...o.a,dispatch:e=>{},fetchCommissions:async e=>{},fetchFeeConfig:async e=>{},refetchFeeConfig:async()=>{},refetchCommissions:async()=>{},commissions_has_error:!1,fee_config_error:!1});s.b=e=>Object(a.b)(i,e)},990:function(e,s,t){"use strict";t.d(s,"a",(function(){return i}));var a=t(53),o=t.n(a);const i={employee:void 0,selected_commission_items:[],selected_advances:[],selected_bonifications:[],expanded_row_keys:[],commission_items:[],advances:[],bonifications:[],show_tables:!1,employee_loading:!1,commission_items_loading:!1,filters:{start_date:o()().subtract(1,"month"),end_date:o()(),search_previous:!1}};s.b=(e,s)=>{switch(console.debug(s.type,s.payload),s.type){case"reset_data":return{...i,filters:e.filters};case"set_employee":return{...e,employee:s.payload};case"set_employee_loading":return{...e,employee_loading:s.payload};case"add_expanded_row_key":const t=[...e.expanded_row_keys,s.payload];return{...e,expanded_row_keys:t};case"remove_expanded_row_key":const a=e.expanded_row_keys.filter((e=>e!==s.payload));return{...e,expanded_row_keys:a};case"set_selected_commission_items":return{...e,selected_commission_items:s.payload};case"set_selected_advances":return{...e,selected_advances:s.payload};case"set_selected_bonifications":return{...e,selected_bonifications:s.payload};case"set_expanded_row_keys":return{...e,expanded_row_keys:s.payload};case"set_commissions_loading":return{...e,commission_items_loading:s.payload};case"set_commissions":return{...e,selected_advances:[],selected_commission_items:[],selected_bonifications:[],...s.payload};case"set_show_tables":return{...e,show_tables:s.payload};case"set_dates":return{...e,filters:{...e.filters,...s.payload}};case"set_search_previous":return{...e,filters:{...e.filters,search_previous:s.payload}};case"set_employee_id":return{...e,filters:{...e.filters,employee_id:s.payload}};case"add_selected_commission_items":return{...e,selected_commission_items:[...e.selected_commission_items,s.payload]};case"remove_selected_commission_items":const o=e.selected_commission_items.filter((e=>e!==s.payload));return{...e,selected_commission_items:o};case"add_selected_advances":return{...e,selected_advances:[...e.selected_advances,s.payload]};case"remove_selected_advances":const _=e.selected_advances.filter((e=>e!==s.payload));return{...e,selected_advances:_};case"add_selected_bonifications":return{...e,selected_bonifications:[...e.selected_bonifications,s.payload]};case"remove_selected_bonifications":const c=e.selected_bonifications.filter((e=>e!==s.payload));return{...e,selected_bonifications:c};case"select_all":return n(e);case"remove_all_seleceted":return{...e,selected_commission_items:[],selected_advances:[]};default:return e}};const n=e=>{const s=e.commission_items.map((e=>e.id)),t=e.advances.map((e=>e.id));return{...e,selected_commission_items:s,selected_advances:t}}}}]);
//# sourceMappingURL=147.7f0e7253.chunk.js.map