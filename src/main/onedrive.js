var Store=require('electron-store');
var http = require('http');
const url = require('url');
const path=require('path')
const fs=require('fs');
const app=require('electron').app;
var  request=require('request');
var shell=require('electron').shell;
var ipcMain=require('electron').ipcMain;

var exePath = path.dirname(app.getPath('userData'));

if(exePath){
    var uploadFolder=exePath;
}else{
    var uploadFolder=app.getAppPath();
}

if(!fs.existsSync(uploadFolder)){
    fs.mkdirSync(uploadFolder)
}


var rootUrl="https://graph.microsoft.com/v1.0";
var scope="files.readwrite offline_access";
var code='',
   client_id="87f96c9c-6a3e-402e-a59e-c6dd91db9927",
   client_secret="dTqbxt-8BzP~T9IR.~86~YDf34HGMa1-bq",
   redirect_url="http://localhost:5000/onedrive";

var store=new Store();
var access_token='',refresh_token='';
var oneToken=store.get('oneToken')||'';

if(oneToken){
    var oneTokenObj=JSON.parse(oneToken);
    access_token=oneTokenObj.access_token;
    var refreshToken=(refresh_token)=>{
        var uri="https://login.microsoftonline.com/common/oauth2/v2.0/token";
        request({
           url:uri,
           headers: {
              "content-type": "application/x-www-form-urlencoded"
          },
          form:{
              client_id:client_id,
              refresh_token:refresh_token,
              grant_type:'refresh_token',
              scope:scope
          }
       },(err,body)=>{
           if(err){
              //remote.getCurrentWebContents().send('onedrive_err');
              return;
           }
   
           var b=JSON.parse(body.body);
           access_token=b.access_token;
          
        
           store.set('oneToken',JSON.stringify({
               access_token:access_token,
               refresh_token:b.refresh_token
           }));
           //getAppRoot();
       })
   
   }
   if(oneTokenObj.refresh_token){
       refreshToken(oneTokenObj.refresh_token);
   }
}


var port=5000;

var server=null,api=null;


//get app root folder
ipcMain.on('getAppRoot',(e,arg)=>{
      getAppRoot(e);
});

ipcMain.on('openOnedrive',(e,sender)=>{
    if(access_token){
        getAppRoot(e);
    }else{
       createServer(e);
       shell.openExternal(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${client_id}&scope=${scope}&response_type=code&redirect_uri=${redirect_url}`)
     }
});


ipcMain.on('saveOneDrive',(e,arg)=>{
   if(arg.pid&&arg.name){
       var filepath=path.resolve(path.join(uploadFolder,'_oneDrive.mind'));
       arg.path=filepath;
       e.sender.send('saveOneDrive',arg)
   }
});

ipcMain.on('saveToOneDrive',(e,arg)=>{
   // console.log(arg,12345);
  // console.log(arg);
    var id=arg.id;
    var data=arg.data;
    var pid=arg.pid;
    var name=arg.name;
    var route=arg.route;   
    if(id){   //更新文件
    //  if(route){
             //console.log(route,id,name,data);
            updateFile(e,id,'',data,name,route);
       // }
    }else if(pid){   //新建文件
        //if(route){
            updateFile(e,'',pid,data,name,route);
     //   }
     
    }else{
        e.sender.send('onedrive_err')
    }
});

ipcMain.on('createFile',(e,arg)=>{
    var id=arg.id;
    var route=arg.route;
    if(id&&route){
        createFile(e,id,route);
    }else{
       e.sender.send('onedrive_err');
    }
});

ipcMain.on('createFolder',(e,arg)=>{
    var id=arg.id;
    var route=arg.route;
    if(id&&route){
        createFolder(e,id,route);
    }else{
       e.sender.send('onedrive_err')
    }
});

ipcMain.on('getChildren',(e,arg)=>{
    var id=arg['id'];
    if(id){
       getList(e,id);
    }else{
       e.sender.send('ondrive_err',{error:{msg:'missing id'}})
    }
});

ipcMain.on('getRootChildren',(e,arg)=>{

});

ipcMain.on('getFile',(e,arg)=>{
    var id=arg['id'];
    if(id){
       getFile(e,id,arg.url);
    }else{
      e.sender.send('ondrive_err',{error:{msg:'missing id'}})
    }
})

ipcMain.on('openUrl',(e,arg)=>{
    if(arg.url){
        openUrl(arg.url);
    }
});


function createServer(e){
    if(server)return;
     server=http.createServer((req,response)=>{
        const pathname = url.parse(req.url).pathname;
        const method=req.method.toLowerCase();  
        const query = url.parse(req.url,true).query; 
        if(pathname=='/onedrive'&&method=='get'){
              var code=query.code;
              if(code){
                  var uri='https://login.microsoftonline.com/common/oauth2/v2.0/token';
                 request({
                     url:uri,
                     headers: {
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    form:{
                        code:code,
                        client_id:client_id,
                      
                        redirect_uri:redirect_url,
                        grant_type:'authorization_code'
                    }
                 },(err,body)=>{
                     server.close();
                     if(err){
                        e.sender.send('onedrive_err',err);
                        return;
                     }
                    // console.log(body);
                     var b=JSON.parse(body.body);

                     access_token=b.access_token;
                     var refresh_token=b.refresh_token;
                  //   console.log(access_token);
                     if(refresh_token){
                        var str=JSON.stringify({
                            access_token:access_token,
                            refresh_token:refresh_token
                        });
                     }else{
                         var t=store.get('oneToken');
                         if(t){
                             var d=JSON.parse(t);
                             d.access_token=access_token;
                             str=JSON.stringify(d);
                         }else{
                             var str=JSON.stringify({
                                access_token:access_token,
                                refresh_token:refresh_token
                            })
                         }
                     }
                   
                     store.set('oneToken',str);
                     getAppRoot(e);
                 })
              }
              
              response.writeHead('200')
              response.end('success');

        }else{
            response.writeHead('200')
            response.end('success')
        }
    }).listen(port);
};



//获取应用根文件
function getAppRoot(e){
    if(!access_token){
        e.sender.send('onedeive_err',{error:{msg:'miss accessToken'}})
    }
    var uri=`${rootUrl}/me/drive/special/approot`;
    request({
        url:uri,
        type:'GET',
        headers: {
            Authorization: `bearer ${access_token}`
        }
       },(err,res,body)=>{
          if(err){
              if(oneTokenObj&&oneTokenObj.refresh_token){
                  refreshToken(oneTokenObj.refresh_token)
               }
              e.sender.send('onedrive_err',err)
              return
          }

          var rootInfo=JSON.parse(body);
          if(rootInfo['error']){
              e.sender.send('onedrive_err',rootInfo)
              if(oneTokenObj&&oneTokenObj.refresh_token){
                refreshToken(oneTokenObj.refresh_token)
              }
              return;
          }
          if(rootInfo['@odata.context']){
             e.sender.send('appRoot',rootInfo);
             getList(e,rootInfo.id);
          }else{
             e.sender.send('onedrive_err',rootInfo);
          }
       })
}


//获取某文件夹下的列表
function getList(e,id){
    var uri=`${rootUrl}/me/drive/items/${id}/children`;
    request({
        url:uri,
        type:'GET',
        headers: {
            Authorization: `bearer ${access_token}`
        }
       },(err,res,body)=>{
          if(err){
              e.sender.send('onedrive_err',err)
              return
          }
          var rootInfo=JSON.parse(body);
          if(rootInfo['error']){
            e.sender.send('onedrive_err',rootInfo)
            return;
          }
          if(rootInfo['@odata.context']){
            rootInfo.id=id;
            e.sender.send('list',rootInfo);

         }else{
            e.sender.send('onedrive_err',rootInfo);
         }
       })
}

function openUrl(url){
    shell.openExternal(url);
}

//下载内容
function getFile(e,id,url){
    var filepath=path.resolve(path.join(uploadFolder,'_oneDrive.mind'));
    if(fs.existsSync(filepath)){
        fs.unlinkSync(filepath);
    }
   var writer=fs.createWriteStream(filepath);
   var uri= `${rootUrl}/me/drive/items/${id}/content`;
   request({
    url:uri,
    type:'GET',
    headers: {
        Authorization: `bearer ${access_token}`,
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
    }
   }).pipe(writer).on("finish", function () {
   
      e.sender.send('getFile',{id:id,route:filepath});
     
   }).on('error',(err)=>{
     //  console.log(err)
       // store.set('oneToken','');
        if(oneTokenObj.refresh_token){
           refreshToken(oneTokenObj.refresh_token);
        }
        e.sender.send('onedrive_err',{error:{msg:'download err'}});
        //createServer();
   })
}


//捕获异常
process.on('uncaughtException', function(err) {

     
});

//登出
function logout(){
  //  console.log('logout');
    var uri=`https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${redirect_url}`;
    store.set('oneToken','');
    request.get(uri);
}


//上传小文件，小于4M
function updateFile(e,id,pid,data,name,route){
   // console.log(id);
    var stat=fs.statSync(route);
    if(id){   //更新文件
        if(stat.size<4*1024*1024){
            var uri= `${rootUrl}/me/drive/items/${id}/content`;
            var reader=fs.createReadStream(route);
          //  console.log(data)
            reader.pipe(request({
                url:encodeURI(uri),
                method:'PUT',
                headers:{
                    Authorization: `bearer ${access_token}`
                },
                json: true
            },(err,res,body)=>{
                //console.log(res,body);
                if (err) {
                   // console.log(err)
                    return e.sender.send('onedrive_error',{error:{msg:'upload fail'}}) ;
                }
                else if (res.statusCode >= 400)
                return   e.sender.send('onedrive_error',{error:{msg:'upload fail'}}) ;
                e.sender.send('onedrive_success',{data:{msg:'upload success'}});
            }));
        }else{
            var uri=`${rootUrl}/me/drive/items/${id}/createUploadSession`;
            uploadSession(e,name,route,stat.size,encodeURI(uri));
        }
    }else{   
       if(stat.size<4*1024*1024){
           var uri= `${rootUrl}/me/drive/items/${pid}:/${name}:/content`;
          // console.log(pid,name,data);
          //var reader = Readable.from([data])
            var reader=fs.createReadStream(route);
          //  console.log(uri,route);
            reader.pipe(request({
                url:encodeURI(uri),
                method:'PUT',
                headers:{
                    Authorization: `bearer ${access_token}`
                },
                json: true
            },(err,res,body)=>{
                if (err)
                  return e.sender.send('onedrive_error',{error:{msg:'upload fail'}}) ;
                else if (res.statusCode >= 400)
                  return   e.sender.send('onedrive_error',{error:{msg:'upload fail'}}) ;
                 e.sender.send('onedrive_success',{data:{msg:'upload success'}});
            }));
       }else{
         //  console.log(name,1111111);
          var pattern=/[`~!@#$^&*()=|{}':;',\\\[\]<>\/?~！《》@#￥……&*（）——|{}【】'；：""'。，、？\s]/g;
          name=name.replace(pattern,'');
          var uri=`${rootUrl}/drive/items/${pid}:/${name}:/createUploadSession`;
          uploadSession(e,name,route,stat.size,encodeURI(uri));
       }
    
    
    }
}


//创建文件
function createFile(e,pid,filename){
    var uri=`${rootUrl}/me/drive/items/{pid}:/{filename}:/content`;

}
//创建文件夹
function createFolder(e,pid,name){
    var uri=`${rootUrl}/me/drive/items/${pid}/children`;
    var options = {
        method: 'POST',
        uri,
        headers: {
          "Content-Type": "application/json",
           Authorization: "Bearer " + access_token
        },
        body: {
          'name': name,
          'folder': {},
          '@microsoft.graph.conflictBehavior': "rename"
        },
        json: true
      };
      request(options,(err,res,body)=>{
          
      });
}
//上传大文件
function uploadSession(e,name,route,fileSize,uri){
   // var pattern=/[`~!@#$^&*()=|{}':;',\\\[\]<>\/?~！《》@#￥……&*（）——|{}【】'；：""'。，、？\s]/g;
    
   // return;
     // var name=""
      var uploadedBytes = 0;
      var chunksToUploadSize = 0;
      var chunks = [];
      var chunksToUpload=10;

      e.sender.send('onedrive_big');
  
    request({
        method: "POST",
        uri,
        headers: {
          Authorization: 'Bearer ' + access_token
        },
        body: {
          "@microsoft.graph.conflictBehavior": "rename",
          fileSystemInfo: { "@odata.type": "microsoft.graph.fileSystemInfo" },
          name:encodeURI(name)
        },
        resolveWithFullResponse: true,
        json: true
      },(error,response,body)=>{
         
            if(error){
                e.sender.send('onedrive_error',{error:{msg:'upload fail'}});
                return;
            }
            if (response.statusCode >= 400) {
               return  e.sender.send('onedrive_error',{error:{msg:'upload fail'}});
            }

            var readerStream=fs.createReadStream(route);

            readerStream.on('data',(chunk)=>{
              chunks.push(chunk);
              chunksToUploadSize += chunk.length;

              if (chunks.length === chunksToUpload || chunksToUploadSize + uploadedBytes === fileSize) {
                  readerStream.pause();
                  var payload = Buffer.concat(chunks, chunksToUploadSize);

                  request({
                    method: "PUT",
                    uri: response.body.uploadUrl,
                    headers: {
                      "Content-Length": chunksToUploadSize,
                      "Content-Range": 'bytes ' + uploadedBytes + '-' + (uploadedBytes + chunksToUploadSize - 1) + '/' +fileSize
                    },
                    body: payload,
                    resolveWithFullResponse: true
                  },function(err,res,body){
                     if(err){
                        e.sender.send('onedrive_err',{error:{msg:'upload fail'}});
                        return;
                     }
                    if(res.statusCode >= 400) {
                        return  e.sender.send('onedrive_error',{error:{msg:'upload fail'}});
                     }

                     uploadedBytes += chunksToUploadSize;
                     chunks = [];
                     chunksToUploadSize = 0;
                     if (
                       res.statusCode === 201 ||
                       res.statusCode === 203 ||
                       res.statusCode === 200
                     ) {
                          var b=JSON.parse(res.body);
                          b.progress=uploadedBytes/fileSize;
                          e.sender.send('onedrive_progress',b);
                          if(chunksToUploadSize + uploadedBytes === fileSize){
                             e.sender.send('onedrive_success');
                          }
                     }
                     readerStream.resume();
                  });
              }

           });

           readerStream.on('end',()=>{
            e.sender.send('onedrive_complete');
           });

           readerStream.on('error',()=>{
              e.sender.send('onedrive_error',{error:{msg:'upload fail'}});
           });

      })
}







function postBuilder(url, data, access_token) {
    return {
      method: 'post',
      url: url,
      json: true,
      headers: {
        "Authorization": "Bearer " + access_token,
      },
      form: data
    }
  }






