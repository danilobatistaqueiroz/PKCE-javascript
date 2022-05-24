import * as jsZip from 'jszip';
import { Howl, Howler } from 'howler';
import * as localforage from 'localforage';

window.localforage = localforage

//## https://blog.ropnop.com/storing-tokens-in-browser/ ##//

function authorize(){
  window.location.href = '/authorization'
}

function logoff(){
  sessionStorage.removeItem('codeVerifier');
  sessionStorage.removeItem('codeChallenge');
  sessionStorage.removeItem('csrfToken');
  sessionStorage.removeItem('token');
  document.location.reload();
}

function starter(){
  if(sessionStorage.getItem('codeVerifier')){
    let ini = window.location.href.indexOf('?code=');
    let end = window.location.href.indexOf('&',ini);
    let authCode = window.location.href.substring(ini+'?code='.length,end);
    let opt = {
      client_id: 'ny4213rwak4bfv9',
      grant_type: 'authorization_code',
      code: authCode,
      code_verifier: sessionStorage.getItem('codeVerifier'),
      redirect_uri: 'http://localhost:3000'
    }
    sessionStorage.removeItem('codeVerifier')
    sessionStorage.removeItem('codeChallenge')
    sessionStorage.removeItem('csrfToken')
    $.ajax({
      type: "POST",
      url: `https://api.dropbox.com/oauth2/token`,
      data: opt,
      success: fnreturn,
      dataType: 'json'
    });
    function fnreturn(data,status,jq){
      sessionStorage.setItem('token',data.access_token);
      document.location.reload();
    }
  }
}

let selfs = this

async function downloader(res,self){
jsZip.loadAsync(res).then((zip) => {
  let o='arraybuffer';
  zip.forEach(function (relativePath, zipEntry) {
    zip.files[zipEntry.name].async(o).then((data)=>{
      localforage.setItem(zipEntry.name,data);
    });
  });
});
}

function download(){
  let http = new XMLHttpRequest();
  http.open("POST", "https://content.dropboxapi.com/2/files/download", true);
  http.setRequestHeader('Content-type', 'application/octet-stream; charset=utf-8');
  http.setRequestHeader('Dropbox-API-Arg', '{"path":"/1-1000.zip"}');
  http.setRequestHeader('Accept', 'application/zip');
  http.setRequestHeader('Authorization', `Bearer ${sessionStorage.getItem('token')}`);
  http.responseType = "arraybuffer";
  http.onload = function(oEvent) {
    let arrayBuffer = http.response;
    let blob = new Blob([arrayBuffer], {type: "application/zip"});
    downloader(blob,selfs);
  };
  http.send();
}


window.starter = starter
window.logoff = logoff
window.download = download
window.authorize = authorize