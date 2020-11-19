/**
 * 高亮显示关键字, 构造函数
 * @param {} colors 颜色数组，其中每个元素是一个 '背景色,前景色' 组合
 */
var Highlighter = function(colors) {
    this.colors = colors;
    if (this.colors == null) {
     //默认颜色
     this.colors = ['#dede8a,#000000','#dae9d1,#000000','#eabcf4,#000000',
     '#c8e5ef,#000000','#f3e3cb, #000000', '#e7cfe0,#000000',
     '#c5d1f1,#000000','#deeee4, #000000','#b55ed2,#000000', 
     '#dcb7a0,#333333', '#7983ab,#000000', '#6894b5, #000000'];
    }
   }
   
   /**
    * 高亮显示关键字
    * @param {} node    html element
    * @param {} keywords  关键字， 多个关键字可以通过空格隔开， 其中每个关键字会以一种颜色显式
    * 
    * 用法：
    * var hl = new Highlighter();
    * hl.highlight(document.body, '这个 世界 需要 和平');
    */
   Highlighter.prototype.highlight = function(node, keywords) {
    if (!keywords || !node || !node.nodeType || node.nodeType != 1)
     return;
    
    keywords = this.parsewords(keywords);
    if (keywords == null)
     return;
    
    for (var i = 0; i < keywords.length; i++) {
     this.colorword(node, keywords[i]);
    }
   }
   
   /**
    * 对所有#text的node进行查找，如果有关键字则进行着色
    * @param {} node 节点
    * @param {} keyword 关键字结构体，包含了关键字、前景色、背景色
    */
   Highlighter.prototype.colorword = function(node, keyword) {
    for (var i = 0; i < node.childNodes.length; i++) {
     var childNode = node.childNodes[i];
     
     if (childNode.nodeType == 3) {
      //childNode is #text
      var re = new RegExp(keyword.word, 'i');
      if (childNode.data.search(re) == -1) continue;
      re = new RegExp('(' + keyword.word + ')', 'gi');
      var forkNode = document.createElement('span');
      forkNode.innerHTML = childNode.data.replace(re, '<span class="search_key" style="background-color:'+keyword.bgColor+';color:'+keyword.foreColor+'" mce_style="background-color:'+keyword.bgColor+';color:'+keyword.foreColor+'">$1</span>');
      node.replaceChild(forkNode, childNode);
     }
     else if (childNode.nodeType == 1) {
      //childNode is element
      this.colorword(childNode, keyword);
     }
    }
   }
   
   /**
    * 将空格分隔开的关键字转换成对象数组
    * @param {} keywords
    * @return {}
    */
   Highlighter.prototype.parsewords = function(keywords) {
    keywords = keywords.replace(/\s+/g, ' ');
    keywords = keywords.split(' ')
    if (keywords == null || keywords.length == 0){
        return null;
    }
    
    var results = [];
    for (var i = 0; i < keywords.length; i++) {
     var keyword = {};
     var color = this.colors[i % this.colors.length].split(',');
     keyword.word = keywords[i];
     keyword.bgColor = color[0];
     keyword.foreColor = color[1];
     results.push(keyword);
    }
    return results;
   }
   
   /**
    * 按照字符串长度，由长到短进行排序
    * @param {} list 字符串数组
    */
   Highlighter.prototype.sort = function(list) {
    list.sort(function(e1, e2) {
     return e1.length < e2.length;
    });
   }
   
   export default Highlighter;