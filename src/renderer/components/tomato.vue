<template>
  <div class="tomato">
    <div>
      <img :src="tomato" /><span id="timer" class="timer">{{ msg }}</span>
    </div>
  </div>
</template>
<script>
var tomato = require("../assets/tomato.png");
export default {
  name: "tomato",
  data() {
    return {
      maxtime: 0,
      timer: null,
      msg: "25:00",
      tomato,
    };
  },
  created() {},
  beforeDestroy() {
    this.timer && clearTimeout(this.timer);
  },
  mounted() {
    this.countDown();
  },
  methods: {
    countDown() {
      var me = this;
      this.maxtime = 25 * 60;
      var countDown = () => {
        if (this.maxtime >= 0) {
          var minutes = Math.floor(this.maxtime / 60);
          var seconds = Math.floor(this.maxtime % 60);
          if (seconds < 10) seconds = "0" + seconds;
          if (minutes < 10) minutes = "0" + minutes;
          this.msg = minutes + ":" + seconds;
          --this.maxtime;
        } else {
          clearTimeout(this.timer);
        }
      };

      function mySetInterval(fn, millisec) {
        function interval() {
          setTimeout(interval, millisec);
          fn();
        }
        me.timer = setTimeout(interval, millisec);
      }

      mySetInterval(countDown, 1000);
    },
  },
};
</script>
<style  scoped>
.tomato {
  font-size: 12px;
  float: left;
  margin-left: 10px;
}
.tomato > div {
  float: left;
  margin-top: -2px;
}
.tomato img {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}
.tomato span {
  vertical-align: middle;
}
.theme-dark .tomato span {
  color: #eee;
}
</style>