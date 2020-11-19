export default class PptFrame{
    constructor(num=1,left=0,top=0){
          this.num=num;
          this.left=left;
          this.top=top;
          this.width=100;
          this.height=80;
          this.init();
    }
    init(){
        this.dom=document.createElement('div');
        this.dom.classList.add('ppt-frame');
        this.dom.innerHTML='<span class="ppt-num">'+this.num+'<span class=""></span></span>';
        this.dom.style=`position:absolute;left:${this.left}px;top:${this.top}px;width:${this.width}px;height:${height}px`;
    }
    setWidth(w){
        this.width=w;
        this.refresh();
        return this;
    }
    setHeight(h){
        this.height=h;
        this.refresh();
        return this;
    }

    refresh(){
        this.dom.style=`left:${this.left}px;top:${this.top}px;width:${this.width}px;height:${height}px`;
        return this;
    }

}