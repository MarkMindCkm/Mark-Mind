const red={
    name:'red1',
    text:'red',
    use:true,
    config:{
        //主根节点
        'main-root-fill':'#D32F2F',             //填充色
        'main-root-stroke':'#D32F2F',           //边框
        'main-root-textFill':'#fff',         //字体颜色
        'main-root-fontSize':'18',         //字体大小
        'main-root-textPadding':[15,18,14,18],
        //二级节点
        'second-node-fill':'#FFF8E1',
        'second-node-stroke':'#D32F2F',//'rgb(191, 115, 115)',
        'second-node-textFill':'#333',
        'second-node-fontSize':'14',
        'second-node-textPadding':[9,14,8,14],
        'distance':40,                  //根节点与二级节点之间的距离
        //自由节点（根节点）
        'free-root-fill':'#FFD180',
        'free-root-stroke':'#FFD180',
        'free-root-textFill':'#fff',
        'free-root-fontSize':'14',
        'free-root-textPadding':[9,14,8,14],
        //自由节点（二级节点）
        'free-second-node-fill':'#FFF8E1',
        'free-second-node-stroke':'#D32F2F',
        'free-second-node-textFill':'#333',
        'free-second-node-fontSize':'12',
        'free-second-node-textPadding':[6,10,5,10],
        'free-distance':30,               //自由根节点与二级节点之间的距离
        //普通节点
        'node-fill':'#FFF8E1',
        'node-stroke':'transparent',
        'node-textFill':'#333',
        'node-fontSize':'12',
        'node-textPadding':[5,8,4,8],
        //连线
        'stroke':'#D32F2F',                      //连线颜色
        'lineWidth':2,                    //连线粗细
        //canvas 设置
        'background':'#FFF8E1',               //画布背景色
        //关联线
        'relate-stroke':'#D32F2F',                //关联线颜色
        'relate-textFill':'#333',              //关联线文字颜色
        //外框
        'wireFrame-stroke':'#FFD180',              //外框 颜色
        'wireFrame-fill':'transparent',                //外框填充色
        //总结
        'induce-stroke':'#FFD180',                 //总结 线的颜色
        'induce-fill':'#FFD180',                   //总结 文字背景色
        'induce-textFill':'#fff',               //总结 文字颜色
        'induce-fontSize':'',               //总结 文字大小
        'induce-fontFamily':'',             //字体
        'induce-fontStyle':''               //字型
    }   
  }

  export default red;