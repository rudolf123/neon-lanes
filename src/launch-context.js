const identityParams=['accountUuid','playerName','platform','authToken'];
const configBase='./config/rhythm_with_dino_config_';
const platforms=['android','ios','test'];
// Recognize obsolete date-only launches as invalid app entries, never as demos.
export const isAppLaunch=params=>[...identityParams,'startDate','endDate'].some(key=>params.has(key));
export function parseLaunchDate(value,{dateOffsetMinutes=0,endDateInclusive=false}={},end=false){
 if(typeof value!=='string')throw Error('launch-date');
 let match, result;
 if((match=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value||'')) || (match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value||''))){
  const [y,m,d]=value.includes('.')?[+match[3],+match[2],+match[1]]:[+match[1],+match[2],+match[3]];
  const utc=Date.UTC(y,m-1,d),date=new Date(utc);
  if(date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d)throw Error('launch-date');
  result=utc-dateOffsetMinutes*60000+(end&&endDateInclusive?86400000:0);
 }else if(/^\d{10}$|^\d{13}$/.test(value||''))result=Number(value)*(value.length===10?1000:1);
 else if(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(value||'')){parseLaunchDate(value.slice(0,10));result=Date.parse(value);}
 if(!Number.isFinite(result))throw Error('launch-date');
 return result;
}
function validateLaunch(params){
 if(!isAppLaunch(params))return null;
 for(const key of identityParams)if(!params.get(key)?.trim())throw Error('launch-'+key);
 if(!params.get('lang')?.trim())throw Error('launch-lang');
 if(params.get('accountUuid').length>100||params.get('playerName').length>100||params.get('lang').length>10)throw Error('launch-length');
 const platform=params.get('platform').trim().toLowerCase();
 if(!platforms.includes(platform))throw Error('launch-platform');
 return platform;
}
export function readLaunchContext(params,config,eventConfig){
 const platform=validateLaunch(params);
 if(!platform)return null;
 const startsAt=parseLaunchDate(eventConfig?.startDate,config),endsAt=parseLaunchDate(eventConfig?.endDate,config,true);
 if(endsAt<=startsAt)throw Error('launch-period');
 return {accountUuid:params.get('accountUuid'),playerName:params.get('playerName'),platform,
  region:params.get('lang'),language:params.get('lang').toLowerCase().split(/[-_]/)[0],
  startsAt,endsAt,authToken:params.get('authToken'),eventId:`rythm:${startsAt}:${endsAt}`};
}
export async function loadLaunchContext(params,config,fetcher=fetch){
 const platform=validateLaunch(params);
 if(!platform)return null;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await fetcher(configBase+platform,{cache:'no-store',credentials:'omit',redirect:'error',signal:controller.signal});
  if(!response.ok)throw Error('config-http-'+response.status);
  // The published S3 files contain trailing commas. Preserve quoted strings
  // verbatim and remove only commas immediately before an object/array close.
  const source=await response.text();
  const data=JSON.parse(source.replace(/"(?:\\.|[^"\\])*"|,\s*(?=[}\]])/g,token=>token.startsWith(',')?'':token));
  return readLaunchContext(params,config,data);
 }finally{clearTimeout(timer);}
}
export function launchEvent(context,now=Date.now()){
 return {id:context.eventId,startsAt:context.startsAt,endsAt:context.endsAt,serverNow:now,clockSource:'device',prototype:false};
}
export const progressKey=context=>'321playsy:app:'+JSON.stringify([context.accountUuid,context.startsAt,context.endsAt]);
