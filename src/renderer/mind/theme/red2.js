const red={
    name:'red2',
    text:'red',
    use:true,
    config:{
        //主根节点
        'main-root-fill':'#B71C1C',             //填充色
        'main-root-stroke':'#B71C1C',           //边框
        'main-root-textFill':'#fff',         //字体颜色
        'main-root-fontSize':'18',         //字体大小
        'main-root-textPadding':[15,18,14,18],
        //二级节点
        'second-node-fill':'#263238',
        'second-node-stroke':'#B71C1C',//'rgb(191, 115, 115)',
        'second-node-textFill':'#eee',
        'second-node-fontSize':'14',
        'second-node-textPadding':[9,14,8,14],
        'distance':40,                  //根节点与二级节点之间的距离
        //自由节点（根节点）
        'free-root-fill':'rgb(246, 238, 238)',
        'free-root-stroke':'rgb(246, 238, 238)',
        'free-root-textFill':'#333',
        'free-root-fontSize':'14',
        'free-root-textPadding':[9,14,8,14],
        //自由节点（二级节点）
        'free-second-node-fill':'#263238',
        'free-second-node-stroke':'#B71C1C',
        'free-second-node-textFill':'#fff',
        'free-second-node-fontSize':'12',
        'free-second-node-textPadding':[6,10,5,10],
        'free-distance':30,               //自由根节点与二级节点之间的距离
        //普通节点
        'node-fill':'#263238',
        'node-stroke':'transparent',
        'node-textFill':'#eee',
        'node-fontSize':'12',
        'node-textPadding':[5,8,4,8],
        //连线
        'stroke':'#B71C1C',                      //连线颜色
        'lineWidth':2,                    //连线粗细
        //canvas 设置
        'background':'#263238',               //画布背景色
        //关联线
        'relate-stroke':'rgb(191, 115, 115)',                //关联线颜色
        'relate-textFill':'#fff',              //关联线文字颜色
        //外框
        'wireFrame-stroke':'rgb(191, 115, 115)',              //外框 颜色
        'wireFrame-fill':'transparent',                //外框填充色
        //总结
        'induce-stroke':'rgb(191, 115, 115)',                 //总结 线的颜色
        'induce-fill':'rgb(191, 115, 115)',                   //总结 文字背景色
        'induce-textFill':'#fff',               //总结 文字颜色
        'induce-fontSize':'',               //总结 文字大小
        'induce-fontFamily':'',             //字体
        'induce-fontStyle':''               //字型
    }   
  }

  export default red;