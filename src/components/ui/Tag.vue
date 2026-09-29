<template>
  <span class="ui-tag">
    <span class="ui-tag__shine" aria-hidden="true" />
    <span class="ui-tag__label"><slot /></span>
  </span>
</template>

<style scoped lang="less">
@import '../../styles/tokens.less';

.ui-tag {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  border: 1px solid @line;
  border-radius: 12px;
  padding: 0.45rem 0.75rem;
  background: linear-gradient(135deg, @surface-soft, @surface-raised);
  color: @text;
  font-family: 'Geist Mono Variable', monospace;
  font-size: 0.78rem;
  transition: transform 220ms cubic-bezier(.2, .8, .2, 1), border-color 220ms ease, color 220ms ease, box-shadow 220ms ease;
}

.ui-tag__shine {
  position: absolute;
  z-index: 0;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(110deg, transparent 20%, rgba(255, 51, 64, .2) 48%, rgba(255, 255, 255, .08) 54%, transparent 78%);
  opacity: 0;
  transform: translateX(-115%);
  transition: transform 520ms cubic-bezier(.16, 1, .3, 1), opacity 150ms ease;
}

.ui-tag__label {
  position: relative;
  z-index: 1;
}

@media (hover: hover) {
  .ui-tag {
    cursor: inherit;
  }

  .ui-tag:hover {
    border-color: @accent-strong;
    color: #fff;
    box-shadow: 0 5px 18px rgba(227, 6, 19, .2);
    transform: translateY(-2px);
  }

  .ui-tag:hover .ui-tag__shine {
    opacity: 1;
    transform: translateX(115%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-tag,
  .ui-tag__shine {
    transition: none;
    transform: none;
  }
}
</style>
