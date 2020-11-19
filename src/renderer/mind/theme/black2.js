const blue={
    name:'black2',
    text:'黑色',
    use:false,
    config:{
        //主根节点
        'main-root-fill':'#c31105',             //填充色
        'main-root-stroke':'transparent',           //边框
        'main-root-textFill':'#fff',         //字体颜色
        'main-root-fontSize':'18',         //字体大小
        'main-root-textPadding':[18,14,18,14],
        //二级节点
        'second-node-fill':'#383833',
        'second-node-stroke':'#383833',//'#383833',
        'second-node-textFill':'#fff',
        'second-node-fontSize':'14',
        'second-node-textPadding':[10,6,10,6],
        'distance':40,                  //根节点与二级节点之间的距离
        //自由节点（根节点）
        'free-root-fill':'#383833',
        'free-root-stroke':'#383833',
        'free-root-textFill':'#fff',
        'free-root-fontSize':'14',
        'free-root-textPadding':[9,14,8,14],
        //自由节点（二级节点）
        'free-second-node-fill':'#f1f1f1',
        'free-second-node-stroke':'#383833',
        'free-second-node-textFill':'#383833',
        'free-second-node-fontSize':'12',
        'free-second-node-textPadding':[6,10,5,10],
        'free-distance':30,               //自由根节点与二级节点之间的距离
        //普通节点
        'node-fill':'#f1f1f1',
        'node-stroke':'transparent',
        'node-textFill':'#383833',
        'node-fontSize':'12',
        'node-textPadding':[5,8,4,8],
        //连线
        'stroke':'#383833',                       //连线颜色
        'lineWidth':2,                            //连线粗细
        //canvas 设置
        'background':'#f1f1f1',                   //画布背景色
        //关联线
        'relate-stroke':'#383833',                //关联线颜色
        'relate-textFill':'#333',                 //关联线文字颜色
        //外框
        'wireFrame-stroke':'#c31105',              //外框 颜色
        'wireFrame-fill':'transparent',                //外框填充色
        //总结
        'induce-stroke':'#333',                 //总结 线的颜色
        'induce-fill':'#333',                   //总结 文字背景色
        'induce-textFill':'#fff',               //总结 文字颜色
        'induce-fontSize':'',               //总结 文字大小
        'induce-fontFamily':'',             //字体
        'induce-fontStyle':''               //字型
    }   
  }

  export default blue;