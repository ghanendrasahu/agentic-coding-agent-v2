const API="http://localhost:8000";

export async function api(
 endpoint:string,
 options?:RequestInit
){

 return fetch(
  API+endpoint,
  options
 );

}
