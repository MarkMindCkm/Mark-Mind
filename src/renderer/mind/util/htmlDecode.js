function  htmlDecodeByRegExp (str){  
    var s = "";
    if(str.length == 0) return "";
  //  s = str.replace(/&amp;/g,"&");
    // s = s.replace(/&nbsp;/g," ");
    // s = s.replace(/&#39;/g,"\'");
    // s = s.replace(/&quot;/g,"\"");
    return s;  
  
}

export default htmlDecodeByRegExp;