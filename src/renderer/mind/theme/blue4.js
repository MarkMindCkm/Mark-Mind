const blue={
    name:'blue4',
    text:'蓝色',
    use:false,
    config:{
        //主根节点
        'main-root-fill':'rgb(48,61,77)',             //填充色
        'main-root-stroke':'rgb(48,61,77)',           //边框
        'main-root-textFill':'#fff',         //字体颜色
        'main-root-fontSize':'18',            //字体大小
        'main-root-textPadding':[18,14,18,14],
        //二级节点
        'second-node-fill':'rgb(63,114,175)',
        'second-node-stroke':'rgb(63,114,175)',
        'second-node-textFill':'#fff',
        'second-node-fontSize':'14',
        'second-node-textPadding':[9,14,8,14],
        'distance':40,                  //根节点与二级节点之间的距离
        //自由节点（根节点）
        'free-root-fill':'rgb(213,214,210)',
        'free-root-stroke':'rgb(213,214,210)',//'rgb(213,214,210)',
        'free-root-textFill':'rgb(48,61,77)',
        'free-root-fontSize':'14',
        'free-root-textPadding':[9,14,8,14],
        //自由节点（二级节点）
        'free-second-node-fill':'rgb(175,188,207)',
        'free-second-node-stroke':'rgb(175,188,207)',
        'free-second-node-textFill':'rgb(48,61,77)',
        'free-second-node-fontSize':'12',
        'free-second-node-textPadding':[6,10,5,10],
        'free-distance':30,               //自由根节点与二级节点之间的距离
        //普通节点
        'node-fill':'rgb(175,188,207)',
        'node-stroke':'transparent',
        'node-textFill':'rgb(48,61,77)',
        'node-fontSize':'12',
        'node-textPadding':[5,8,4,8],
        //连线
        'stroke':'rgb(48,61,77)',                      //连线颜色
        'lineWidth':2,                    //连线粗细
        //canvas 设置
        'background':'rgb(175,188,207)',               //画布背景色
        //关联线
        'relate-stroke':'#fff',                //关联线颜色
        'relate-textFill':'#fff',             //关联线文字颜色
        //外框
        'wireFrame-stroke':'rgb(213,214,210)',              //外框 颜色
        'wireFrame-fill':'rgba(255,255,255,.2)',                //外框填充色
        //总结
        'induce-stroke':'rgb(213,214,210)',                 //总结 线的颜色
        'induce-fill':'rgb(213,214,210)',                   //总结 文字背景色
        'induce-textFill':'#333',               //总结 文字颜色
        'induce-fontSize':'',               //总结 文字大小
        'induce-fontFamily':'',             //字体
        'induce-fontStyle':''               //字型
    }   
  }

  export default blue;