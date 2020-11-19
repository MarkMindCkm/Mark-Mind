const green2={
    name:'green2',
    text:'绿色',
    use:false,
    config:{
        //主根节点
        'main-root-fill':'#43A047',             //填充色
        'main-root-stroke':'transparent',                //边框
        'main-root-textFill':'#fff',             //字体颜色
        'main-root-fontSize':'18',                       //字体大小
        'main-root-textPadding':[18,14,18,14],
        //二级节点
        'second-node-fill':'#F0F4C3',
        'second-node-stroke':'transparent',//rgb(83,174,127)
        'second-node-textFill':'rgb(83,175,128)',
        'second-node-fontSize':'14',
        'second-node-textPadding':[9,14,8,14],
        'distance':40,                  //根节点与二级节点之间的距离
        //自由节点（根节点）
        'free-root-fill':'#F0F4C3',
        'free-root-stroke':'transparent',//rgb(83,175,128)
        'free-root-textFill':'rgb(83,175,128)',
        'free-root-fontSize':'14',
        'free-root-textPadding':[9,14,8,14],
        //自由节点（二级节点）
        'free-second-node-fill':'#43A047',
        'free-second-node-stroke':'transparent',//rgb(242,242,242)
        'free-second-node-textFill':'#fff',
        'free-second-node-fontSize':'12',
        'free-second-node-textPadding':[6,10,5,10],
        'free-distance':30,               //自由根节点与二级节点之间的距离
        //普通节点
        'node-fill':'#263238',
        'node-stroke':'transparent',
        'node-textFill':'rgb(83,175,128)',
        'node-fontSize':'12',
        'node-textPadding':[5,8,4,8],
        //连线
        'stroke':'rgb(83,175,128)',                      //连线颜色
        'lineWidth':2,                    //连线粗细
        //canvas 设置
        'background':'#263238',               //画布背景色
        //关联线
        'relate-stroke':'#FF9E80',                //关联线颜色
        'relate-textFill':'#FF9E80',              //关联线文字颜色
        //外框
        'wireFrame-stroke':'#4DD0E1',              //外框 颜色
        'wireFrame-fill':'rgba(1,149,164,.2)',                   //外框填充色
        //总结
        'induce-stroke':'#4DD0E1',                 //总结 线的颜色
        'induce-fill':'#F0F4C3',               //总结 文字背景色
        'induce-textFill':'rgb(1,149,164)',               //总结 文字颜色
        'induce-fontSize':'14',                    //总结 文字大小
        'induce-fontFamily':'',                    //字体
        'induce-fontStyle':''                      //字型
    }   
  }

  export default green2;