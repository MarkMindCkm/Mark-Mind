<template>
  <div class="win" v-bind:style="'left:' + left + 'px;top:' + top + 'px'">
    <div class="win-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "win",
  props: ["left", "top", "command"],
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.win {
  position: absolute;
  z-index: 60;
  user-select: none;
  background: #fff;
  padding: 10px;
  text-align: left;
  border-radius: 3px;
  font-size: 12px;
  z-index: 600;
  height: auto !important;
  min-width: 200px;
  box-shadow: 0 3px 3px #ccc;
}
</style>
