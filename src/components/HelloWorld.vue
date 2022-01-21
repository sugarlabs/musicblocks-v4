<!-- == TEMPLATE =============================================================================== -->

<template>
  <h1 class="message">{{ msg }}</h1>
</template>

<!-- == SCRIPT ================================================================================= -->

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  props: {
    msg: String,
  },
})
export default class HelloWorld extends Vue {
  msg!: string;
}
</script>

<!-- == STYLE ================================================================================== -->

<style scoped lang="scss">
.message {
  margin: 0 auto;
}
</style>
