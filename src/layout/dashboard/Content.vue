<template>
  <div class="content">
    <div class="container-fluid card py-4" style="overflow: scroll;">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </div>
  </div>
</template>
<script>
export default {};
</script>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}

.fade-enter,
  .fade-leave-to
  /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}

.content{
  padding-left: 0px !important;
  padding-right: 0px !important;
}

.W90 {
  width: 90% !important;
}
</style>
