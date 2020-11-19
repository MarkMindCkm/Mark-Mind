export default function(text){
    var str =text.trim();
    var strLength = 0;
    if(str == "" || str == null) strLength = 0;
    else strLength = str.length;
    var i=0,j=0,c=0;
    var t=/\w/gi;		//	匹配26个字母
    var bo=false;
    for(i=0,j=i+1;j<=strLength;i=j++) {
        if(t.test(str.substring(i,j))&&!bo){    //test() 方法用于检测一个字符串是否匹配某个模式
            bo=true;
            c++;
        }
        else if(!t.test(str.substring(i,j))){
            bo=false;
        }
    }
    //中文
    str = str.replace(/[ ]/g,""); //去掉文本字符串中所有空格
    var sWords = str.replace(/\w/g,"").length;//中文的个数
    var temp = c + sWords;

    return temp;
}