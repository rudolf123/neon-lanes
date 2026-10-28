// Web Share must be called directly from the user's tap, after the PNG is ready.
export async function shareDiplomaFile(file, shareApi = navigator){
 if(!file || typeof shareApi.share !== 'function' || typeof shareApi.canShare !== 'function')return 'unavailable';
 const data={files:[file]};
 try{if(!shareApi.canShare(data))return 'unavailable';}catch{return 'unavailable';}
 try{await shareApi.share(data);return 'opened';}
 catch(error){return error?.name==='AbortError'?'cancelled':'unavailable';}
}
