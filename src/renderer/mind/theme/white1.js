const white={
    name:'white1',
    text:'白色',
    use:false,
    config:{
        //主根节点
        'main-root-fill':'#283593',             //填充色
        'main-root-stroke':'#283593',           //边框
        'main-root-textFill':'#fff',         //字体颜色
        'main-root-fontSize':'18',         //字体大小
        'main-root-textPadding':[15,18,14,18],
        //二级节点
        'second-node-fill':'#fff',
        'second-node-stroke':'#283593',//'#333',
        'second-node-textFill':'#283593',
        'second-node-fontSize':'14',
        'second-node-textPadding':[9,14,8,14],
        'distance':40,                  //根节点与二级节点之间的距离
        //自由节点（根节点）
        'free-root-fill':'#AD1457',
        'free-root-stroke':'#AD1457',
        'free-root-textFill':'#fff',
        'free-root-fontSize':'14',
        'free-root-textPadding':[9,14,8,14],
        //自由节点（二级节点）
        'free-second-node-fill':'#fff',
        'free-second-node-stroke':'#283593',
        'free-second-node-textFill':'#283593',
        'free-second-node-fontSize':'12',
        'free-second-node-textPadding':[6,10,5,10],
        'free-distance':30,               //自由根节点与二级节点之间的距离
        //普通节点
        'node-fill':'#D7CCC8',
        'node-stroke':'transparent',
        'node-textFill':'#283593',
        'node-fontSize':'12',
        'node-textPadding':[5,8,4,8],
        //连线
        'stroke':'#283593',                      //连线颜色
        'lineWidth':2,                    //连线粗细
        //canvas 设置
        'background':'#D7CCC8',               //画布背景色
        //关联线
        'relate-stroke':'#AD1457',                //关联线颜色
        'relate-textFill':'#333',              //关联线文字颜色
        //外框
        'wireFrame-stroke':'#AD1457',              //外框 颜色
        'wireFrame-fill':'transparent',                //外框填充色
        //总结
        'induce-stroke':'#AD1457',                 //总结 线的颜色
        'induce-fill':'#AD1457',                   //总结 文字背景色
        'induce-textFill':'#fff',               //总结 文字颜色
        'induce-fontSize':'14',               //总结 文字大小
        'induce-fontFamily':'',             //字体
        'induce-fontStyle':''               //字型
    }   
  }

  export default white;