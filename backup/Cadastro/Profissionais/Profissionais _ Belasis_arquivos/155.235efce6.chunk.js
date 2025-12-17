(this["webpackJsonpwebook-react"]=this["webpackJsonpwebook-react"]||[]).push([[155],{2965:function(e,t,s){"use strict";s.r(t);var a=s(0),o=s(20),c=s(50),n=s(116),i=s(137),r=s(250),l=s(585),b=s(1220),d=s(1829),p=s(2843),u=s(690),m=s(19),j=s(37),_=s(1850),y=s(76);const O=j.e`
  mutation EmployeesListUpdatePositions ($data: UpdateEmployeesPositionsInput!) {
    updateEmployeesPositions (input: $data) {
      success errors
    }
  }
`;var v=()=>{const[e,{loading:t}]=Object(_.a)(O);return[async t=>{const s=t.map((e=>e.id));try{const{data:t}=await e({variables:{data:{ids:s}}}),{success:a=!1,errors:o=[]}=(null===t||void 0===t?void 0:t.updateEmployeesPositions)||{};return null===o||void 0===o||o.map((e=>n.b.error(e))),{success:a}}catch(a){return y.a.captureException(a),n.b.error(Object(c.b)("phrases.generic_delete_error_message")),console.error(a),{success:!1}}},{loading:t}]},h=s(638),x=s(155),w=s(27),g=s(1078),f=s(582),E=s(232),k=s(22);const C=Object(a.lazy)((()=>Object(E.a)((()=>s.e(175).then(s.bind(null,2986)))))),$=Object(a.lazy)((()=>Object(E.a)((()=>s.e(176).then(s.bind(null,3010)))))),D=e=>{const{employees:t,savePositions:s}=e,o=Object(a.useCallback)((e=>{if(!e.destination||e.destination.index===e.source.index)return;if(e.destination.index===e.source.index)return;const a=[...t],o=a.splice(e.source.index,1);a.splice(e.destination.index,0,...o),s(a)}),[t,s]);return Object(k.jsx)(g.a,{onDragEnd:o,children:Object(k.jsx)(f.a,{Desktop:C,Mobile:$,...e})})};D.displayName="EmployeesTable";var P=Object(a.memo)(D);const B=j.e`
  mutation EmployeeListDestroyEmployee($data: DestroyEmployeeInput!) {
    destroyEmployee(input: $data) {
      success deactivated errors
    }
  }
`;var I=()=>{const[e,{loading:t}]=Object(_.a)(B),s=Object(a.useCallback)((async t=>{const s=n.b.loading(`${Object(c.b)("verbs.wait")}...`,0);try{const{data:a}=await e({variables:{data:{id:t}}}),{success:o,deactivated:i,errors:r}=(null===a||void 0===a?void 0:a.destroyEmployee)||{};return i?(n.b.info(Object(c.b)("employees.deactivated_value")),{success:!0}):o?(n.b.success(Object(c.b)("phrases.deleted_successfully",{prefix:Object(c.b)("words.employee")})),{success:!0}):(null===r||void 0===r||r.map((e=>n.b.error(e))),{success:!1})}catch(a){return y.a.captureException(a),n.b.error(Object(c.b)("phrases.generic_delete_error_message")),console.error(a),{success:!1}}finally{s()}}),[e]);return[s,t]},N=s(405);const z=j.e`
  query EmployeesList ($actives: Boolean) {
    employees (actives: $actives, order: "position") {
      id
      name
      active
      position
      email
      avatar_url: small_thumb_url
      avatar_blurhash
      cellphone: phone2

      user {
        id
        email
        fake_email
        current_access_rule_user_salon {
          id is_admin
        }
      }
    }
  }
`;var L=e=>{let{onCompleted:t,actives:s}=e;return Object(N.f)(z,{variables:{actives:s},fetchPolicy:"network-only",onCompleted:e=>{let{employees:s}=e;return t(s)},onError:e=>{y.a.captureException(e),console.log({error:e})}})},q=s(1837),H=s(3081),J=s(597);const M=Object(a.lazy)((()=>Object(E.a)((()=>s.e(203).then(s.bind(null,2911)))))),S=e=>Object(k.jsx)(J.b,{$showBottomBorder:!0,title:Object(c.b)("words.employee",{count:2}),tabs:[{label:Object(c.b)("words.active",{count:2}),path:"/employees",icon:q.a},{label:Object(c.b)("words.inactive_other"),path:"/employees/inactives",icon:H.a}],children:Object(k.jsx)(f.a,{Desktop:M,...e})});S.displayName="DefaultHeader";var U=S,F=s(586);const R=e=>{let{actives:t=!0}=e;const[s,r]=Object(a.useState)([]),m=Object(w.a)((e=>e.current_user.permissions)),j=Object(w.a)((e=>e.is_mobile)),_=Object(a.useRef)(null),y=Object(o.o)(),O=Object(x.c)(),[g,{loading:f}]=v(),[E]=I(),C=Object(a.useCallback)((e=>{r(e)}),[]),{data:$,loading:D,error:B,refetch:N}=L({onCompleted:C,actives:t}),z=null===$||void 0===$?void 0:$.employees,q=Object(a.useCallback)((async()=>{const e=await N();if(!e)return;const{employees:t}=e.data;C(t)}),[C,N]),H=Object(a.useCallback)((e=>{var t;m.can_edit_employee?null===(t=_.current)||void 0===t||t.open({id:e.id}):n.b.warning(Object(c.b)("phrases.no_permission_to_do_this"))}),[m.can_edit_employee]);Object(h.a)(Object(a.useMemo)((()=>[{label:Object(c.b)("words.panel"),icon:b.a,onClick:()=>y("/wow")},{label:Object(c.b)("words.schedule"),icon:d.a,onClick:()=>{null!==m&&void 0!==m&&m.can_access_calendar?y("/calendar"):n.b.warning(Object(c.b)("phrases.no_permission_to_do_this"))}},{label:Object(c.b)("verbs.create"),icon:p.a,onClick:()=>{var e;null!==m&&void 0!==m&&m.can_create_employee?null===(e=_.current)||void 0===e||e.open():n.b.warning(Object(c.b)("phrases.no_permission_to_do_this"))}}]),[y,m.can_access_calendar,null===m||void 0===m?void 0:m.can_create_employee]));const J=Object(a.useCallback)((async e=>{if(Object(i.isEqual)(z,e))return;r(e);const{success:t}=await g(e);if(t)return n.b.success(Object(c.b)("employees.position_updated")),q(),void O();r(z||[])}),[z,q,O,g]),M=Object(a.useCallback)((async e=>{if(!m.can_destroy_employee)return void n.b.warning(Object(c.b)("phrases.no_permission_to_do_this"));const{success:t}=await E(e);t&&q()}),[E,m.can_destroy_employee,q]);return Object(k.jsxs)(l.b,{children:[Object(k.jsx)(U,{openEmployeeDrawer:()=>{var e;return null===(e=_.current)||void 0===e?void 0:e.open()}}),Object(k.jsx)(A,{children:Object(k.jsx)(l.c,{$pageFull:!0,$minimalHeight:j,has_permission:m.can_access_employee,style:{width:"100%"},children:Object(k.jsx)(F.a,{visible:!!B,small:j,children:Object(k.jsx)(P,{loading:D,save_loading:f,employees:s,savePositions:J,handleDestroyEmployees:M,openEmployeeDrawer:H})})})}),Object(k.jsx)(u.a,{ref:_,onSave:()=>q()})]})};R.displayName="Employees";var T=Object(a.memo)(R);const A=Object(m.d)(r.g).withConfig({componentId:"wb__sc-b5ljg4-0"})(["padding:0 0 25px;",""],(e=>e.theme.is_mobile&&Object(m.c)(["padding:0 15px ","px;"],e.theme.sidebar_mobile_bottom_margin))),G=()=>Object(k.jsxs)(o.d,{children:[Object(k.jsx)(o.b,{path:"/",element:Object(k.jsx)(T,{})}),Object(k.jsx)(o.b,{path:"/inactives",element:Object(k.jsx)(T,{actives:!1})})]});G.displayName="EmployeesIndex";t.default=G},638:function(e,t,s){"use strict";var a=s(0),o=s(62),c=s(27);t.a=function(e){let{disabled:t=!1}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const s=Object(c.a)((e=>e.is_mobile)),n=Object(o.a)();Object(a.useEffect)((()=>{if(s&&!t)return n({type:"set_mobile_menu_actions",payload:e.filter(Boolean)}),()=>{n({type:"set_mobile_menu_actions",payload:[]})}}),[t,s,e,n])}}}]);
//# sourceMappingURL=155.235efce6.chunk.js.map