export default function getImageBase64(imgUrl) {
    return new Promise(function(resolve,reject){
        try{
            window.URL = window.URL || window.webkitURL;
            var xhr = new XMLHttpRequest();
            xhr.open("get", imgUrl, true);
            xhr.responseType = "blob";
            xhr.onload = function () {
             if (this.status == 200) {
                var blob = this.response;
                let oFileReader = new FileReader();
                oFileReader.onloadend = function (e) {
                  let base64 = e.target.result;
                  resolve(base64)
                };
                oFileReader.readAsDataURL(blob);
               }
            }
            xhr.send();
        }catch(e){
            reject(e);
        }  
    })
  
  }