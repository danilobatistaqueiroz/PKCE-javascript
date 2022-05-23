import * as jsZip from 'jszip';
import { Howl, Howler } from 'howler';
import * as localforage from 'localforage';

window.localforage = localforage

//## https://blog.ropnop.com/storing-tokens-in-browser/ ##//

function authorize(){
  let width = 646;
  let height = 756;
  let left = (screen.width/2)-(width/2);
  let top = (screen.height/2)-(height/2);
  let myWindow = window.open("/authorization", "", `toolbar=no,location=no,menubar=no,titlebar=no,width=${width},height=${height},top=${top},left=${left}`);
}

function logoff(){
  localSession.removeItem('codeVerifier');
  localSession.removeItem('codeChallenge');
  localSession.removeItem('csrfToken');
  localSession.removeItem('token');
}

function starter(){
  if(localSession.getItem('codeVerifier')){
    let ini = window.location.href.indexOf('?code=');
    let end = window.location.href.indexOf('&',ini);
    let authCode = window.location.href.substring(ini+'?code='.length,end);
    let opt = {
      client_id: 'ny4213rwak4bfv9',
      grant_type: 'authorization_code',
      code: authCode,
      code_verifier: localSession.getItem('codeVerifier'),
      redirect_uri: 'http://localhost:3000'
    }
    localSession.removeItem('codeVerifier')
    localSession.removeItem('codeChallenge')
    localSession.removeItem('csrfToken')
    $.ajax({
      type: "POST",
      url: `https://api.dropbox.com/oauth2/token`,
      data: opt,
      success: fnreturn,
      dataType: 'json'
    });
    function fnreturn(data,status,jq){
      localSession.setItem('token',data.access_token);
      window.close();
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
  http.setRequestHeader('Authorization', `Bearer ${localSession.getItem('token')}`);
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