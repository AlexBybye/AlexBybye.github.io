<template><span class="ui-tag"><slot /></span></template>

<style scoped lang="less">
@import '../../styles/tokens.less';

.ui-tag {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  border: 1px solid @line;
  border-radius: 12px;
  padding: 0.45rem 0.75rem;
  background: @surface-soft;
  color: @text;
  font-family: 'Geist Mono Variable', monospace;
  font-size: 0.78rem;
}
</style>
