(this["webpackJsonpwebook-react"]=this["webpackJsonpwebook-react"]||[]).push([[63],{1042:function(e,t,a){"use strict";var s=a(0),n=a(159),r=a(2855),i=a(687),o=a(50),c=a(22);const d=e=>{let{show_filters:t,setShowFilters:a}=e;return Object(c.jsx)(n.a,{className:t?"ant-btn-gold":void 0,type:t?"primary":"default",onClick:()=>a((e=>!e)),icon:t?Object(c.jsx)(r.a,{}):Object(c.jsx)(i.a,{}),children:Object(o.b)("verbs.filter")})};d.displayName="FilterButton",t.a=Object(s.memo)(d)},1130:function(e,t,a){"use strict";var s=a(37),n=a(1850),r=a(50),i=a(116),o=a(76);const c=s.e`
  mutation SaveSalon($data: SaveSalonInput!) {
    saveSalon(input: $data) {
      success errors
    }
  }
`;t.a=()=>{const[e,{loading:t}]=Object(n.a)(c);return[async t=>{try{const{data:a}=await e({variables:{data:t}}),{success:s=!1,errors:n=[]}=(null===a||void 0===a?void 0:a.saveSalon)||{};return null===n||void 0===n||n.map((e=>i.b.error(e))),{success:s}}catch(a){return o.a.captureException(a),i.b.error(Object(r.b)("phrases.generic_save_error_message")),console.error(a),{success:!1}}},{loading:t}]}},1533:function(e,t,a){"use strict";t.a=a.p+"static/media/mountains.0a9f3276.png"},1534:function(e,t,a){"use strict";a.d(t,"a",(function(){return r})),a.d(t,"b",(function(){return i})),a.d(t,"c",(function(){return o})),a.d(t,"d",(function(){return d}));var s=a(53),n=a.n(s);const r={start_date:n()().subtract(1,"month"),end_date:n()(),results:15,page:1,rating:void 0},i=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;return 100*(e-t)/(t>=1?t:1)},o=e=>e/60/60/24,c=JSON.stringify({raw_value:0,result_in_words:0}),d=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:c;return JSON.parse(e)}},2942:function(e,t,a){"use strict";a.r(t);var s=a(0),n=a(20),r=a(50),i=a(18),o=a(593),c=a(37),d=a(405),l=a(76),b=a(53),_=a.n(b);c.e`
  query MetricsSalon($start_date: String!,$end_date: String!,$diff_start_date: String!,$diff_end_date: String!) {
    current_salon {
      id
      name

      salon_reviews_information(start_date: $start_date, end_date: $end_date) {
        reviews_sent_count
        average_rating
        response_time(convert_time_in_words: true)
        response_rate(start_date: $start_date, end_date: $end_date)
      }

      old_salon_reviews_information: salon_reviews_information(start_date: $diff_start_date, end_date: $diff_end_date) {
        reviews_sent_count
        average_rating
        response_time
        response_rate(start_date: $diff_start_date, end_date: $diff_end_date)
      }

      employee_ratings: all_employees(active: true) {
        all {
          id
          name
          avatar_url: large_thumb_url
          avatar_blurhash
          rating(start_date: $start_date, end_date: $end_date)
          old_rating: rating(start_date: $diff_start_date, end_date: $diff_end_date)
        }
      }
    }
  }
`;const u=c.e`
  query SalonInformation {
    current_salon {
      id

      has_whatsapp_plan: has_addon(ids: [
        ${i.a.ID_REVIEW_WHATSAPP_BEGINNER},
        ${i.a.ID_REVIEW_WHATSAPP_PROFESSIONAL},
        ${i.a.ID_REVIEW_WHATSAPP_PREMIUM},
        ${i.a.ID_REVIEW_WHATSAPP_BONUS}
      ])
      has_sms_plan: has_addon(ids: [
        ${i.a.ID_REVIEW_BEGINNER},
        ${i.a.ID_REVIEW_PROFESSIONAL},
        ${i.a.ID_REVIEW_PREMIUM}
      ])

      salon_review_configuration_attributes: review_configurations {
        id
        success_swal_text
        background_image
        footer_text
        header_text
        header_title
        inverted_colors
        module_active
        send_priority
      }

      sms_message_configuration_attributes: sms_message_configuration {
        id
        sms_message_review
      }
    }
  }
`;var j=a(823),g=a(3071),m=a(3052),h=a(2937),p=a(116),f=a(875),x=a(1130),v=a(27),w=a(1533),O=a(339),$=a(250),y=a(2824),k=a(159),C=a(637),F=a(19),I=a(22);const S=Object(r.b)("reviews.default_sms_review"),E=Object(r.b)("reviews.default_success_text"),M=e=>{let{salon_information:t,saveSalon:a,openBlockModal:n,refetch:i}=e;const[o]=h.a.useForm(),c=Object(f.b)((e=>e.has_free)),d=Object(s.useRef)(null);Object(s.useEffect)((()=>{if(t){const{id:e,success_swal_text:a}=t.salon_review_configuration_attributes,s={sms_message_configuration_attributes:t.sms_message_configuration_attributes,salon_review_configuration_attributes:{id:e,success_swal_text:a}};o.setFieldsValue(s)}}),[t,o]);const l=e=>Object(I.jsx)($.h,{$link:!0,onClick:()=>{o.setFieldsValue(e)},children:Object(r.b)("reviews.restore_default")}),b=async e=>{if(c)n();else try{const{sms_message_configuration_attributes:t,salon_review_configuration_attributes:s}=await o.validateFields(),n="sms_message"===e?{sms_message_configuration_attributes:t}:{salon_review_configuration_attributes:s};if(!(await a(n)).success)return;p.b.success(Object(r.b)("phrases.saved_successfully",{prefix:Object(r.b)("words.message"),context:"female"})),i()}catch(t){console.log(t)}};return Object(I.jsxs)(h.a,{form:o,layout:void 0,component:!1,scrollToFirstError:!0,initialValues:{sms_message_configuration_attributes:{id:"",sms_message_review:S},salon_review_configuration_attributes:{id:"",success_swal_text:E}},children:[Object(I.jsx)(h.a.Item,{noStyle:!0,name:["sms_message_configuration_attributes","id"],children:Object(I.jsx)(y.a,{type:"hidden"})}),Object(I.jsx)(h.a.Item,{noStyle:!0,name:["salon_review_configuration_attributes","id"],children:Object(I.jsx)(y.a,{type:"hidden"})}),Object(I.jsxs)($.g,{$gap:10,children:[Object(I.jsxs)(R,{$alignCenter:!0,$column:!0,children:[Object(I.jsx)($.h,{$size:16,$bold:!0,$alignCenter:!0,$mBottom:20,children:Object(r.b)("reviews.review_request_message")}),Object(I.jsxs)($.h,{$mBottom:20,$align:"justify",children:[Object(r.b)("reviews.order_completion_message"),"\xa0",l({sms_message_configuration_attributes:{sms_message_review:S}})]}),Object(I.jsx)(h.a.Item,{name:["sms_message_configuration_attributes","sms_message_review"],rules:[{validateTrigger:"onChange",validator:async(e,t)=>{if(!t)return Promise.resolve(!0);return t.includes("%NOME%")&&t.includes("%LINK%")?Promise.resolve(!0):Promise.reject(Object(r.b)("reviews.insert_keywords_message"))}},{required:!0,message:Object(r.b)("phrases.required_field")}],style:{width:"100%"},children:Object(I.jsx)(B,{autoSize:!1,rows:3,maxLength:255,ref:d,showCount:!0})}),Object(I.jsx)($.g,{$fullWidth:!0,children:Object(I.jsx)(C.a,{keys:["client_name","link_review"],textAreaRef:d,fieldName:["sms_message_configuration_attributes","sms_message_review"],setFieldsValue:o.setFieldsValue})}),Object(I.jsx)($.g,{$mTop:15}),Object(I.jsx)(D,{onClick:()=>b("sms_message"),children:Object(r.b)("verbs.save")})]}),Object(I.jsxs)(R,{$alignCenter:!0,$column:!0,children:[Object(I.jsx)($.h,{$size:16,$bold:!0,$alignCenter:!0,$mBottom:20,children:Object(r.b)("reviews.thank_you_message")}),Object(I.jsxs)($.h,{$mBottom:20,$align:"justify",children:[Object(r.b)("reviews.after_review_thank_you_message"),"\xa0",l({salon_review_configuration_attributes:{success_swal_text:E}})]}),Object(I.jsx)(h.a.Item,{name:["salon_review_configuration_attributes","success_swal_text"],rules:[{required:!0,message:Object(r.b)("phrases.required_field")}],style:{width:"100%"},children:Object(I.jsx)(B,{autoSize:!1,rows:3,maxLength:255,showCount:!0})}),Object(I.jsx)($.g,{}),Object(I.jsx)(D,{onClick:()=>b("salon_review_configuration"),children:Object(r.b)("verbs.save")})]})]})]})};M.displayName="MessagesDesktop";var z=M;const R=Object(F.d)($.g).withConfig({componentId:"wb__sc-h826rm-0"})(["position:relative;border-radius:5px;background:#FFFFFF;box-shadow:0 3px 6px -4px rgba(0,0,0,0.12),0 2px 3px 0 rgba(0,0,0,0.08),0 9px 28px 8px rgba(0,0,0,0.05);padding:15px 25px 25px;"]),B=Object(F.d)(y.a.TextArea).withConfig({componentId:"wb__sc-h826rm-1"})(["border-radius:5px !important;resize:none !important;"]),D=Object(F.d)(k.a).attrs({type:"primary"}).withConfig({componentId:"wb__sc-h826rm-2"})(["padding:0 50px !important;"]);var N=a(585),V=a(597),Y=a(603),P=a(3025),q=a(13),A={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M928 140H96c-17.7 0-32 14.3-32 32v496c0 17.7 14.3 32 32 32h380v112H304c-8.8 0-16 7.2-16 16v48c0 4.4 3.6 8 8 8h432c4.4 0 8-3.6 8-8v-48c0-8.8-7.2-16-16-16H548V700h380c17.7 0 32-14.3 32-32V172c0-17.7-14.3-32-32-32zm-40 488H136V212h752v416z"}}]},name:"desktop",theme:"outlined"},L=a(71),H=function(e,t){return s.createElement(L.a,Object(q.a)({},e,{ref:t,icon:A}))};var T=s.forwardRef(H),W=a(631);const U=e=>{const t=Object(s.useRef)(null),a=Object(s.useRef)(null),{form:n,saving:i,setBackground:o,setPreview:c,onSubmit:d,setInvertedColors:l,preview:b,inverted_colors:u}=e,j=Object(v.a)((e=>e.current_user.salon));return Object(I.jsxs)(h.a,{form:n,layout:void 0,scrollToFirstError:!0,onFinish:d,initialValues:{salon_review_configuration_attributes:{id:"",header_title:"",header_text:"",footer_text:""}},children:[Object(I.jsx)(h.a.Item,{noStyle:!0,name:["salon_review_configuration_attributes","id"],children:Object(I.jsx)(y.a,{type:"hidden"})}),Object(I.jsxs)(K,{$column:!0,$alignCenter:!0,children:[Object(I.jsxs)($.g,{$column:!0,$paddings:{top:15},$alignCenter:!0,children:[Object(I.jsxs)($.h,{$alignCenter:!0,$size:24,children:[Object(I.jsx)(T,{})," ",Object(r.b)("reviews.review_page_settings")]}),Object(I.jsx)($.h,{$mBottom:15,$size:16,children:Object(r.b)("reviews.review_screen_message")})]}),Object(I.jsx)("input",{style:{display:"none"},type:"file",ref:t,onChange:async()=>{var e;const a=null===(e=t.current)||void 0===e?void 0:e.files;if(!a||!a[0])return;const s=a[0];let n=!1;try{await Object(Y.g)(s,t),n=!0}catch(r){p.b.error(r)}n&&(e=>{o(e),c(URL.createObjectURL(e))})(s)},multiple:!1,accept:"image/png, image/jpeg, image/jpg"}),Object(I.jsxs)(G,{style:{backgroundImage:`url(${b})`},children:[Object(I.jsxs)(Q,{children:[Object(I.jsx)(k.a,{disabled:i,className:"btn btn-default",onClick:()=>l((e=>!e)),children:Object(r.b)("reviews.invert_colors")}),Object(I.jsx)(k.a,{disabled:i,className:"btn btn-default",onClick:()=>{var e;return null===(e=t.current)||void 0===e?void 0:e.click()},children:Object(r.b)("reviews.background_image")}),Object(I.jsx)(k.a,{loading:i,className:"btn ant-button-success",type:"primary",onClick:n.submit,children:Object(r.b)("verbs.save")})]}),Object(I.jsxs)(X,{inverted:u,children:[Object(I.jsx)($.g,{$column:!0,children:Object(I.jsx)($.h,{$alignCenter:!0,$textEllipsis:!0,$size:30,$light:!0,children:j.name})}),Object(I.jsx)(Z,{}),Object(I.jsxs)($.g,{$column:!0,$alignCenter:!0,children:[Object(I.jsx)(h.a.Item,{name:["salon_review_configuration_attributes","header_title"],rules:[{required:!0,message:Object(r.b)("phrases.required_field")}],style:{width:"100%"},children:Object(I.jsx)(y.a,{style:{textAlign:"center"}})}),Object(I.jsx)(h.a.Item,{name:["salon_review_configuration_attributes","header_text"],rules:[{required:!0,message:Object(r.b)("phrases.required_field")}],style:{width:"100%"},children:Object(I.jsx)(y.a.TextArea,{rows:3,style:{textAlign:"center",resize:"none"}})})]}),Object(I.jsxs)($.g,{$column:!0,$alignCenter:!0,$isFlex:!0,$mBottom:10,children:[Object(I.jsx)(W.a,{size:150}),Object(I.jsx)($.h,{$size:18,$mTop:10,children:Object(r.b)("reviews.employee_name")}),Object(I.jsx)(P.a,{disabled:!0,value:5}),Object(I.jsxs)($.h,{$mTop:10,$bold:!0,children:[Object(r.b)("words.comment"),":"]}),Object(I.jsx)($.h,{$alignCenter:!0,children:Object(r.b)("reviews.sample_comment")})]}),Object(I.jsxs)($.g,{$column:!0,$alignCenter:!0,$margins:[20,0],children:[Object(I.jsx)(h.a.Item,{name:["salon_review_configuration_attributes","footer_text"],rules:[{required:!0,message:Object(r.b)("phrases.required_field")}],style:{width:"100%"},children:Object(I.jsx)(y.a.TextArea,{ref:a,rows:3,style:{textAlign:"center",resize:"none"}})}),Object(I.jsx)($.h,{children:Object(r.b)("reviews.service_date",{date:_()().format("L"),interpolation:{escapeValue:!1}})})]})]})]})]})]})};U.displayName="ReviewPage";var J=Object(s.memo)(U);const G=F.d.div.withConfig({componentId:"wb__sc-1gggfu5-0"})(["display:flex;position:relative;align-items:flex-start;overflow-x:hidden;justify-content:center;width:100%;border-bottom-left-radius:5px;border-bottom-right-radius:5px;background:linear-gradient(rgba(255,255,255,.95),rgba(255,255,255,.95)),no-repeat center;background-size:cover;"]),K=Object(F.d)($.g).withConfig({componentId:"wb__sc-1gggfu5-1"})(["margin-top:10px;border-radius:5px;background:#FFFFFF;box-shadow:0 3px 6px 2px rgba(0,0,0,0.12),0 2px 3px 0 rgba(0,0,0,0.08),0 9px 22px 8px rgba(0,0,0,0.05);"]),Q=Object(F.d)($.g).withConfig({componentId:"wb__sc-1gggfu5-2"})(["position:absolute;left:0;top:0;padding:15px;display:flex;flex-wrap:wrap;justify-content:flex-start;.btn{margin:3px;height:40px;}.btn-default{background:transparent;color:#FFFFFF;transition:all .1s;&:hover{background:rgba(255,255,255,0.9);;color:#555;}}"]),X=F.d.div.withConfig({componentId:"wb__sc-1gggfu5-3"})(["background:rgba(255,255,255,0.9);border-radius:5px;box-shadow:0 6px 18px 2px rgba(0,0,0,.5);display:flex;flex-wrap:wrap;flex-direction:column;align-items:center;margin:100px 10px;padding:15px;width:500px;max-width:95%;min-height:400px;",";.ant-input{","}"],(e=>e.inverted&&Object(F.c)(["background:rgba(29,29,29,0.9);color:#FFFFFF;"])),(e=>e.inverted&&Object(F.c)(["background:rgba(29,29,29,0.5);color:#FFFFFF;"]))),Z=F.d.hr.withConfig({componentId:"wb__sc-1gggfu5-4"})(["border-color:#ddd;width:80%;"]),ee=e=>{const[t,a]=Object(s.useState)(void 0),[n,i]=Object(s.useState)(w.a),[o,c]=Object(s.useState)(!1),{salon_information:d,loading:l,openBlockModal:b,refetch:_,routes:u}=e,j=Object(f.b)((e=>e.has_free)),g=Object(v.a)((e=>e.current_user.permissions)),[m,{loading:$}]=Object(x.a)(),[y]=h.a.useForm();Object(s.useEffect)((()=>{if(d){const{module_active:e,success_swal_text:t,inverted_colors:a,background_image:s,...n}=d.salon_review_configuration_attributes;y.setFieldsValue({salon_review_configuration_attributes:n}),s&&i(s),c(a)}}),[d,y]);return Object(I.jsxs)(N.b,{children:[Object(I.jsx)(V.b,{title:Object(r.b)("words.review_other"),tabs:u,$showBottomBorder:!0}),Object(I.jsx)(O.a,{loading:l}),Object(I.jsxs)(N.c,{style:{display:"flex",flexDirection:"column",marginBottom:20},has_permission:g.can_access_reviews,children:[Object(I.jsx)(z,{salon_information:d,saveSalon:m,openBlockModal:b,refetch:_}),Object(I.jsx)(J,{form:y,setBackground:a,setPreview:i,onSubmit:async e=>{if(j)return void b();const a={salon_review_configuration_attributes:{...e.salon_review_configuration_attributes,inverted_colors:o,background_image:t}},{success:s}=await m(a);s&&(p.b.success(Object(r.b)("phrases.saved_successfully",{prefix:Object(r.b)("words.personalization",{count:2}),context:"female",count:2})),_())},setInvertedColors:c,preview:n,inverted_colors:o,saving:$})]})]})};ee.displayName="PersonalizationDesktop";var te=Object(s.memo)(ee),ae=a(582),se=a(232);const ne=c.e`
  query MetricsSalon($start_date: String!,$end_date: String!,$diff_start_date: String!,$diff_end_date: String!) {
    current_salon {
      id
      name

      salon_reviews_information(start_date: $start_date, end_date: $end_date) {
        reviews_sent_count
        average_rating
        response_time(convert_time_in_words: true)
        response_rate(start_date: $start_date, end_date: $end_date)
      }

      old_salon_reviews_information: salon_reviews_information(start_date: $diff_start_date, end_date: $diff_end_date) {
        reviews_sent_count
        average_rating
        response_time
        response_rate(start_date: $diff_start_date, end_date: $diff_end_date)
      }

      employee_ratings: all_employees(active: true) {
        all {
          id
          name
          avatar_url: large_thumb_url
          avatar_blurhash
          rating(start_date: $start_date, end_date: $end_date)
          old_rating: rating(start_date: $diff_start_date, end_date: $diff_end_date)
        }
      }
    }
  }
`;var re=e=>{const t=e[0],a=e[1],s=a.diff(t,"day"),n=t.subtract(s,"days");return Object(d.f)(ne,{variables:{start_date:t.format("YYYY-MM-DD"),end_date:a.format("YYYY-MM-DD"),diff_start_date:n.format("YYYY-MM-DD"),diff_end_date:t.format("YYYY-MM-DD")},onError:e=>{l.a.captureException(e),console.log(e)}})},ie=a(703),oe=a(605);const ce=Object(s.lazy)((()=>Object(se.a)((()=>Promise.all([a.e(3),a.e(6),a.e(113)]).then(a.bind(null,2992)))))),de=Object(s.lazy)((()=>Object(se.a)((()=>a.e(150).then(a.bind(null,2968)))))),le=e=>{let{routes:t}=e;const[a,n]=Object(s.useState)([_()().subtract(1,"month"),_()()]),i=Object(v.a)((e=>e.is_mobile)),o=Object(v.a)((e=>e.current_user.permissions)),{data:c,loading:d}=re(a);return Object(I.jsxs)(N.b,{children:[Object(I.jsx)(V.b,{title:Object(r.b)("words.review_other"),tabs:t,$showBottomBorder:!0}),Object(I.jsx)(oe.c,{style:i?{margin:"0 15px 15px",padding:0}:{marginTop:10},children:Object(I.jsx)(ie.a,{disabled:d,style:{width:"unset"},variant:"borderless",value:a,onChange:n,placement:"bottomLeft"})}),Object(I.jsx)(_e,{$pageFull:!0,has_permission:o.can_access_reviews,children:Object(I.jsx)(ae.a,{Desktop:ce,Mobile:de,data:c,loading:d})})]})};le.displayName="Dashboard";var be=le;const _e=Object(F.d)(N.c).withConfig({componentId:"wb__sc-1oz0mcs-0"})(["display:flex;",""],(e=>e.theme.is_mobile&&Object(F.c)(["height:100%;"]))),ue=Object(s.lazy)((()=>Object(se.a)((()=>a.e(221).then(a.bind(null,2913)))))),je=Object(s.lazy)((()=>Object(se.a)((()=>a.e(222).then(a.bind(null,2993)))))),ge=e=>{const{salon_information:t,refetch:a,routes:n,loading:i,openBlockModal:o}=e,c=Object(f.b)((e=>e.has_free)),d=Object(v.a)((e=>e.current_user.permissions)),[l]=Object(x.a)(),b=!(null===t||void 0===t||!t.salon_review_configuration_attributes.module_active),_=Object(s.useCallback)((async e=>{const s={salon_review_configuration_attributes:{id:null===t||void 0===t?void 0:t.salon_review_configuration_attributes.id,...e}},{success:n}=await l(s);n&&(p.b.success(Object(r.b)("phrases.saved_successfully",{prefix:Object(r.b)("words.setting"),context:"female"})),a())}),[a,null===t||void 0===t?void 0:t.salon_review_configuration_attributes.id,l]),u=Object(s.useCallback)((()=>{b?_({module_active:!1}):c?o():_({module_active:!0})}),[_,c,b,o]);return Object(I.jsxs)(N.b,{children:[Object(I.jsx)(V.b,{title:Object(r.b)("words.review_other"),tabs:n,$showBottomBorder:!0}),Object(I.jsx)(O.a,{loading:i}),Object(I.jsx)(_e,{style:{height:"unset"},has_permission:d.can_access_reviews,children:Object(I.jsx)(ae.a,{Desktop:ue,Mobile:je,handleClickActiveModule:u,...e})})]})};ge.displayName="Settings";var me=ge;const he=c.e`
  query SalonReviewsQuery(
    $start_date: String!,
    $end_date: String!,
    $rating: Int,
    $results: Int!,
    $page: Int!,
    $employee_ids: [String!],
    $client_ids: [String!]
  ) {
    current_salon {
      id

      reviews(
        start_date: $start_date,
        end_date: $end_date,
        employee_ids: $employee_ids,
        client_ids: $client_ids,
        sort_order: "DESC",
        sort_field: "updated_at",
        rating: $rating,
        results: $results,
        page: $page
      ) {
        all {
          id
          description
          rating
          created_at

          inventory_sale {
            id
            code

            client {
              id
              name
              has_avatar
              name_initials
              avatar_url: small_thumb_url
              avatar_blurhash
            }
          }

          employee {
            id
            name
          }
        },
        total_count
      }
    }
  }
`;var pe=a(1042),fe=a(1534),xe=a(610),ve=a(614),we=a(621);const Oe=e=>{let{show_filters:t,filters:a,handleChangeFilters:s}=e;const n=Object(v.a)((e=>e.current_user.permissions));return Object(I.jsxs)(xe.a,{$visible:t,children:[Object(I.jsxs)(xe.b,{children:[Object(I.jsx)($.g,{$alignCenter:!0,justify:"space-between",$bottom:15,children:Object(I.jsx)($.h,{$size:14,$semibold:!0,children:Object(r.b)("words.period")})}),Object(I.jsxs)($.g,{$column:!0,children:[Object(I.jsx)(xe.c,{allowClear:!1,onRangeChange:e=>s({page:1,start_date:e[0],end_date:e[1]}),value:a.start_date,onChange:e=>s({page:1,start_date:e,end_date:a.end_date}),format:"LL",placeholder:Object(r.b)("date.start_date")}),Object(I.jsx)(xe.c,{allowClear:!1,onRangeChange:e=>s({page:1,start_date:e[0],end_date:e[1]}),value:a.end_date,onChange:e=>s({page:1,start_date:a.start_date,end_date:e}),format:"LL",placeholder:Object(r.b)("date.end_date")})]})]}),Object(I.jsxs)(xe.b,{children:[Object(I.jsx)($.g,{$alignCenter:!0,justify:"space-between",$bottom:15,children:Object(I.jsx)($.h,{$size:14,$semibold:!0,children:Object(r.b)("words.client")})}),Object(I.jsx)($.g,{children:Object(I.jsx)(we.a,{onChange:e=>s({client_ids:e?[e]:void 0}),show_phone:!1,style:{width:"100%"},allowClear:!0,getPopupContainer:()=>document.body})})]}),Object(I.jsxs)(xe.b,{children:[Object(I.jsx)($.g,{$alignCenter:!0,justify:"space-between",$bottom:15,children:Object(I.jsx)($.h,{$size:14,$semibold:!0,children:Object(r.b)("words.employee")})}),Object(I.jsx)($.g,{children:Object(I.jsx)(ve.a,{style:{width:"100%"},getPopupContainer:()=>document.body,disabled:!n.can_access_all_reviews,onChange:e=>s({employee_ids:e?[e]:void 0}),allowClear:!0,showCreateButton:!1})})]}),Object(I.jsxs)(xe.b,{children:[Object(I.jsx)($.g,{$alignCenter:!0,justify:"space-between",$bottom:15,children:Object(I.jsx)($.h,{$size:14,$semibold:!0,children:Object(r.b)("words.review")})}),Object(I.jsx)(P.a,{value:a.rating,onChange:e=>s({rating:e||void 0})})]})]})};Oe.displayName="ReviewsFiltersDesktop";var $e=Object(s.memo)(Oe);const ye=Object(s.lazy)((()=>Object(se.a)((()=>a.e(220).then(a.bind(null,3086)))))),ke=Object(s.lazy)((()=>Object(se.a)((()=>a.e(107).then(a.bind(null,2984)))))),Ce=e=>{var t,a,n,i;const[o,c]=Object(s.useState)(fe.a),[b,_]=Object(s.useState)(!1),{routes:u}=e,j=Object(v.a)((e=>e.current_user.permissions)),g=Object(v.a)((e=>e.is_mobile)),{data:m,loading:h}=(e=>{const t=Object(v.a)((e=>e.current_user.permissions)),a=Object(v.a)((e=>e.current_user.employee)),s=t.can_access_all_reviews?e.employee_ids:[a.id];return Object(d.f)(he,{variables:{...e,start_date:e.start_date.format("YYYY-MM-DD"),end_date:e.end_date.format("YYYY-MM-DD"),employee_ids:s},onError:e=>{l.a.captureException(e),console.log(e)}})})(o),p=Object(s.useCallback)((e=>{c((t=>({...t,...e})))}),[]),f=Object(s.useMemo)((()=>{var e,t;return(null===m||void 0===m||null===(e=m.current_salon)||void 0===e||null===(t=e.reviews)||void 0===t?void 0:t.all)||[]}),[null===m||void 0===m||null===(t=m.current_salon)||void 0===t||null===(a=t.reviews)||void 0===a?void 0:a.all]),x=Object(s.useMemo)((()=>{var e,t;return(null===m||void 0===m||null===(e=m.current_salon)||void 0===e||null===(t=e.reviews)||void 0===t?void 0:t.total_count)||0}),[null===m||void 0===m||null===(n=m.current_salon)||void 0===n||null===(i=n.reviews)||void 0===i?void 0:i.total_count]);return Object(I.jsxs)(N.b,{children:[Object(I.jsx)(V.b,{title:Object(r.b)("words.review_other"),tabs:u,$showBottomBorder:!0,children:!g&&Object(I.jsx)(pe.a,{show_filters:b,setShowFilters:_})}),Object(I.jsxs)(_e,{$pageFull:!0,has_permission:j.can_access_reviews,children:[!g&&Object(I.jsx)($e,{show_filters:b,filters:o,handleChangeFilters:p}),Object(I.jsx)(ae.a,{Desktop:ye,Mobile:ke,loading:h,reviews:f,total_count:x,handleChangeFilters:p,filters:o,setShowFilters:_})]})]})};Ce.displayName="Ratings";var Fe=Ce;const Ie=()=>{const e=Object(o.b)(),t=Object(v.a)((e=>e.current_user.permissions)),a=Object(v.a)((e=>e.is_mobile)),c=Object(n.o)();Object(s.useEffect)((()=>{t.is_admin||c("/reviews/ratings")}),[t.is_admin,c]);const{data:{current_salon:b}={},loading:_,refetch:h}=Object(d.f)(u,{onError:e=>{l.a.captureException(e),console.log(e)}}),p=!(null!==b&&void 0!==b&&b.has_sms_plan)&&!(null!==b&&void 0!==b&&b.has_whatsapp_plan),x=Object(s.useCallback)((()=>{e({is_addon:!0,search:i.a.ID_REVIEW_WHATSAPP_PREMIUM})}),[e]),w=Object(s.useMemo)((()=>({has_free:p})),[p]),O=Object(s.useMemo)((()=>{const e=[{label:Object(r.b)("words.panel"),path:"/reviews",disabled:!t.is_admin,icon:j.a},{label:Object(r.b)("words.review_other"),path:"/reviews/ratings",icon:g.a}];return a||e.push({label:Object(r.b)("words.personalization"),path:"/reviews/personalization",disabled:!t.is_admin}),e.push({label:Object(r.b)("words.setting_other"),path:"/reviews/settings",disabled:!t.is_admin,icon:m.a}),e}),[a,t.is_admin]);return Object(I.jsx)(f.a.Provider,{value:w,children:Object(I.jsx)($.g,{$column:!0,children:Object(I.jsxs)(n.d,{children:[Object(I.jsx)(n.b,{path:"/",element:Object(I.jsx)(be,{routes:O})}),Object(I.jsx)(n.b,{path:"/ratings",element:Object(I.jsx)(Fe,{routes:O})}),Object(I.jsx)(n.b,{path:"/personalization",element:Object(I.jsx)(te,{salon_information:b,loading:_,openBlockModal:x,refetch:h,routes:O})}),Object(I.jsx)(n.b,{path:"/settings",element:Object(I.jsx)(me,{salon_information:b,refetch:h,loading:_,openBlockModal:x,routes:O})})]})})})};Ie.displayName="Reviews";t.default=Ie},605:function(e,t,a){"use strict";a.d(t,"d",(function(){return r})),a.d(t,"a",(function(){return i})),a.d(t,"b",(function(){return o})),a.d(t,"c",(function(){return c}));var s=a(19),n=a(543);const r=s.d.div.withConfig({componentId:"wb__sc-w3bl1t-0"})(["padding:15px 25px 25px;background-color:#FFFFFF;box-shadow:0 3px 6px -4px rgba(0,0,0,0.12),0 6px 16px 0 rgba(0,0,0,0.08),0 9px 28px 8px rgba(0,0,0,0.05);"]),i=s.d.div.withConfig({componentId:"wb__sc-w3bl1t-1"})(["padding:0 0 25px;width:100%;height:100%;display:flex;flex-direction:row;"]),o=s.d.div.withConfig({componentId:"wb__sc-w3bl1t-2"})(["padding:0 0 25px 10px;width:100%;height:100%;min-height:400px;"]),c=Object(s.d)(n.a).withConfig({componentId:"wb__sc-w3bl1t-3"})(["display:flex;justify-content:center;align-items:center;padding:4px 0;margin-bottom:8px;border-radius:16px;box-shadow:0 4px 8px 5px #f3f3f3;border:1px solid #F1F2F9;transition:box-shadow .3s ease-in-out;background:#FFFFFF;"])},609:function(e,t,a){"use strict";var s=a(0),n=a(50),r=a(159),i=a(53),o=a.n(i),c=a(19),d=a(22);const l=e=>{let{handleChangeRange:t}=e;return Object(d.jsx)(b,{children:_.map((e=>{let{label:a,value:s}=e;return Object(d.jsx)(r.a,{type:"primary",onClick:()=>t(s),children:a},a)}))})};l.displayName="ExtraRangeComponent",t.a=Object(s.memo)(l);const b=c.d.div.withConfig({componentId:"wb__sc-hoi2yi-0"})(["display:flex;flex-wrap:wrap;justify-content:space-between;padding-top:8px;.ant-btn{cursor:pointer;width:49%;text-align:center;margin-bottom:8px;margin-right:0;}"]),_=[{label:Object(n.b)("words.today"),value:[o()(),o()()]},{label:Object(n.b)("date.last_week"),value:[o()().startOf("week").subtract(1,"week"),o()().endOf("week").subtract(1,"week")]},{label:Object(n.b)("date.last_month"),value:[o()().subtract(1,"month").startOf("month"),o()().subtract(1,"month").endOf("month")]},{label:Object(n.b)("date.current_month"),value:[o()().startOf("month"),o()().endOf("month")]},{label:Object(n.b)("date.six_months_ago"),value:[o()().subtract(6,"month"),o()()]},{label:Object(n.b)("date.one_year_ago"),value:[o()().subtract(12,"month"),o()()]}]},610:function(e,t,a){"use strict";a.d(t,"d",(function(){return u})),a.d(t,"b",(function(){return j})),a.d(t,"c",(function(){return g})),a.d(t,"a",(function(){return m}));var s=a(19),n=a(0),r=a(2934),i=a(609),o=a(22);const c=(e,t)=>{let{onRangeChange:a,...s}=e;const[c,d]=Object(n.useState)(!1),b=Object(n.useCallback)((e=>{a(e)}),[a]);return Object(o.jsx)(r.a,{ref:t,showNow:!1,renderExtraFooter:()=>Object(o.jsx)(l,{children:Object(o.jsx)(i.a,{handleChangeRange:b})}),...s,open:c,onOpenChange:d})};c.displayName="SimpleRangePicker";var d=Object(n.memo)(Object(n.forwardRef)(c));const l=s.d.div.withConfig({componentId:"wb__sc-13lwjt0-0"})(["width:265px;"]),b={true:!0,false:!1,all:null,none:null},_=["start_date","end_date","birthday_start_date","birthday_end_date","start_date_open","start_date_close","end_date_open","end_date_close"],u=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const t={},a={};return Object.entries(e).forEach((e=>{let[a,s]=e;s in b&&(t[a]=b[s])})),Object.entries(e).forEach((e=>{let[t,s]=e;_.includes(t)&&(a[t]=null===s||void 0===s?void 0:s.format("YYYY-MM-DD"))})),{...e,...t,...a}},j=s.d.div.withConfig({componentId:"wb__sc-gq8qm5-0"})(["display:flex;flex-direction:column;background-color:",";border-radius:16px;box-shadow:0 0 10px 5px #f3f3f3;padding:15px;border:1px solid rgba(0 0 0 / 3%);transition:box-shadow .1s;margin-bottom:5px;.ant-checkbox-wrapper + .ant-checkbox-wrapper{overflow:hidden;margin-left:0;width:100%;:not(:first-child){overflow:hidden;white-space:nowrap;text-overflow:ellipsis;word-break:keep-all;}}.ant-radio-wrapper{margin-right:0;}.ant-checkbox-group-item{margin-right:0;}.ant-calendar-picker-clear{background:transparent;color:",";}.ant-calendar-picker-input{border-top:none;border-left:none;border-right:none;border-radius:0;margin-top:5px;background:transparent;"," &:focus{box-shadow:none;}}.anticon-calendar{color:rgba(0,0,0,.2);}",""],(e=>e.theme.colors.white),(e=>e.theme.dark&&e.theme.dark_white),(e=>e.theme.dark&&`\n      border-color: ${e.theme.dark_secondary};\n      color: ${e.theme.dark_white};\n    `),(e=>e.tags&&Object(s.c)(["display:flex;flex-wrap:wrap;.ant-tag{margin:0 4px 4px 0;cursor:pointer;}"]))),g=Object(s.d)(d).withConfig({componentId:"wb__sc-gq8qm5-1"})(["width:100%;border-top:none;border-left:none;border-right:none;border-radius:0 !important;margin-top:5px;background:transparent;&.ant-picker-focused{box-shadow:none;}"]),m=s.d.div.withConfig({componentId:"wb__sc-gq8qm5-2"})(["min-width:0;width:0;z-index:210;text-overflow:ellipsis;white-space:nowrap;position:sticky;top:calc(","px + 10px);overflow:hidden;max-height:calc(100vh - 60px);align-self:flex-start;transition:width .2s;",""],(e=>e.theme.menu_top_height),(e=>!!e.$visible&&Object(s.c)(["min-width:230px;width:230px;padding-right:7px;overflow-y:auto;overflow-x:hidden;"])))},687:function(e,t,a){"use strict";var s=a(13),n=a(0),r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M880.1 154H143.9c-24.5 0-39.8 26.7-27.5 48L349 597.4V838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V597.4L907.7 202c12.2-21.3-3.1-48-27.6-48zM603.4 798H420.6V642h182.9v156zm9.6-236.6l-9.5 16.6h-183l-9.5-16.6L212.7 226h598.6L613 561.4z"}}]},name:"filter",theme:"outlined"},i=a(71),o=function(e,t){return n.createElement(i.a,Object(s.a)({},e,{ref:t,icon:r}))},c=n.forwardRef(o);t.a=c},823:function(e,t,a){"use strict";var s=a(13),n=a(0),r={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M946.5 505L560.1 118.8l-25.9-25.9a31.5 31.5 0 00-44.4 0L77.5 505a63.9 63.9 0 00-18.8 46c.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8a63.6 63.6 0 0018.7-45.3c0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204zm217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z"}}]},name:"home",theme:"outlined"},i=a(71),o=function(e,t){return n.createElement(i.a,Object(s.a)({},e,{ref:t,icon:r}))},c=n.forwardRef(o);t.a=c},875:function(e,t,a){"use strict";a.d(t,"a",(function(){return n}));var s=a(640);const n=Object(s.a)({has_free:!1});t.b=e=>Object(s.b)(n,e)}}]);
//# sourceMappingURL=63.86757c6d.chunk.js.map