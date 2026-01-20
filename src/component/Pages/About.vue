<template>
  <div class="about-wrapper" align="center">
    <header class="about-header">
      <img
        src="https://readme-typing-svg.herokuapp.com/?lines=Hello,+There!;This+is+Lin_eclipse......;Welcome+to+my+zone!;&center=true&size=24&color=E0E0E0"
        alt="Typing SVG" />
    </header>

    <section class="card technical-stack-card float-anim-2">
      <h3 class="light-text"><i class="icon">🔥</i> Technical Stack & Contributions</h3>
      <div class="skill-group">
        <img
          src="https://skillicons.dev/icons?i=cpp,python,javascript,typescript,vue,go,kotlin,matlab,anaconda,ubuntu,pinia,docker,pytorch,vuetify"
          alt="Skills" />
      </div>
      <div class="contribution-box">
        <img class="gh-graph"
          src="https://github-readme-activity-graph.vercel.app/graph?username=alexbybye&theme=tokyo-night&bg_color=ffffff00&hide_border=true" />
      </div>
      <h1 class="who-am-i">Hey! But,who am I ??</h1>
    </section>

    <div class="about-main-grid">

      <section class="card profile-card float-anim-1">
        <div class="avatar-box">
          <img src="/images/avatar.jpg" class="avatar" alt="Avatar" />
          <div class="online-status"></div>
        </div>
        <h2 class="user-name">Lin_eclipse</h2>


        <div class="info-item">
          <img src="https://skillicons.dev/icons?i=redhat" class="mini-icon" />
          <a href="https://baike.baidu.com/item/%E5%8D%8E%E5%8D%97%E7%90%86%E5%B7%A5%E5%A4%A7%E5%AD%A6/134597"
            target="_blank" class="scut-link">SCUT</a> CS Undergraduate
        </div>

        <div class="info-item">
          <img src="https://skillicons.dev/icons?i=prisma" class="mini-icon" />Guangzhou
        </div>

        <div class="info-item">
          <img src="https://skillicons.dev/icons?i=linux" class="mini-icon" />244417287
        </div>

        <div class="info-item">
          <img src="https://skillicons.dev/icons?i=github" class="mini-icon" />
          <a href="https://github.com/AlexBybye" target="_blank" class="light-link"><b>AlexBybye</b></a>
        </div>
        <div class="visitor-box" align="left">
          <img src="https://visitor-badge.laobi.icu/badge?page_id=alexbybye/alexbybye" alt="Visitors" />
        </div>

      </section>
      <section class="card hobby-card float-anim-3">
        <h3 class="light-text"><i class="icon">🌿</i> Lifestyle & Explorations</h3>

        <div class="hobby-content">
          <div class="hobby-item bayern">
            <span class="label">Soul Team</span>
            <div class="value-row">
              <span class="value">FC Bayern Munich</span>
              <span class="badge red">Mia San Mia</span>
            </div>
          </div>

          <div class="hobby-item">
            <span class="label">Athletics</span>
            <div class="value-row">
              <span class="value">Football · Tennis · Running</span>
            </div>
          </div>

          <div class="hobby-item">
            <span class="label">Discovery</span>
            <div class="value-row">
              <span class="value highlight-photo">Photography 📷</span>
              <span class="sep">|</span>
              <span class="value highlight-adv">Adventure 🧗‍♂️</span>
            </div>
          </div>

          <div class="hobby-item">
            <span class="label">Acoustics</span>
            <div class="value-row">
              <span class="value">Post-Punk · Synthwave · Deep House</span>
            </div>
          </div>
        </div>
      </section>

      <section class="card awards-card float-anim-1">
        <h3 class="light-text"><i class="icon">🏆</i> Awards & Achievements</h3>
        <div class="achievement-list">
          <div class="achieve-item special">
            <span class="achieve-year">2025</span>
            <span class="achieve-content">First Author of a <b>Large Language Model (LLM)</b> paper (Under Review at
              Top-tier Conference)</span>
          </div>
          <div class="achieve-item special">
            <span class="achieve-year">2025</span>
            <span class="achieve-content">Patent: A Multi-modal Learning Method and System (Pending)</span>
          </div>
          <div class="achieve-item">
            <span class="achieve-year">2025</span>
            <span class="achieve-content">Second Prize in Interdisciplinary Contest in Modeling (MCM/ICM)</span>
          </div>
          <div class="achieve-item leader">
            <span class="achieve-year">2024</span>
            <span class="achieve-content"><b>Chairman</b> of SCUT-Huawei "Intelligent Base" Student Community</span>
          </div>
          <div class="achieve-item">
            <span class="achieve-year">2024</span>
            <span class="achieve-content">Third Prize in APMCM (Asia-Pacific Mathematical Contest in Modeling)</span>
          </div>
          <div class="achieve-item">
            <span class="achieve-year">2024</span>
            <span class="achieve-content">Third Prize in "ETIC" English Public Speaking Contest</span>
          </div>
          <div class="achieve-item">
            <span class="achieve-year">2023</span>
            <span class="achieve-content">Third Prize in NECCS (National English Competition for College
              Students)</span>
          </div>
        </div>
      </section>
    </div>
    <section class="card awards-card float-anim-1">
      <h3 class="light-text">🚀 Featured Repositories</h3>
      <div class="repo-grid">
        <a href="https://github.com/AlexBybye/Java_MAll" target="_blank">
          <img
            src="https://github-readme-stats-fast.vercel.app/api/pin/?username=alexbybye&repo=Java_MAll&theme=tokyonight" />
        </a>
        <a href="https://github.com/scutcsweaver/SCUT_CS" target="_blank">
          <img
            src="https://github-readme-stats-fast.vercel.app/api/pin/?username=scutcsweaver&repo=SCUT_CS&theme=tokyonight" />
        </a>
      </div>
    </section>
  </div>

</template>

<style scoped>
/* 容器 */
.about-wrapper {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  z-index: 1;
}

/* 玻璃框基础样式 - 初始透明度 0.1 */
.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 悬停状态 - 透明度 0.9 */
.card:hover {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transform: translateY(-5px);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5);
  color: #1a1a1a !important;
  /* 背景变亮，文字变深 */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 悬停时内部文字和链接颜色适配 */
.card:hover .user-name,
.card:hover .light-text,
.card:hover .info-item,
.card:hover .value,
.card:hover .achieve-content,
.card:hover .tagline {
  color: #1a1a1a !important;
}

.card:hover .label {
  color: #555555 !important;
}

/* 栅格布局：左侧头像 + 右侧田字格 */
.about-main-grid {
  display: grid;
  grid-template-columns: 300px 1fr 1fr;
  /* 三列布局 */
  grid-template-rows: auto auto;
  gap: 20px;
  align-items: stretch;
}

/* 生活方式卡片网格布局 */
.hobby-card {
  grid-column: span 1;
}

/* Profile 卡片占据左侧整列 */
.profile-card {
  grid-column: 1;
  grid-row: 1 / span 2;
  /* 纵跨两行 */
}

/* 强制清除之前可能干扰布局的 margin 和 width */
.awards-card {
  width: 100% !important;
  margin-left: 0 !important;
}

/* 底部仓库占据右侧两列宽度 */
.repo-footer {
  grid-column: 2 / span 2;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.4s;
}

.repo-footer:hover {
  background: rgba(255, 255, 255, 0.9);
  color: #1a1a1a;
}

/* 基础文字样式 */
.user-name {
  font-size: 1.8rem;
  margin: 15px 0;
}

.tagline {
  font-size: 1rem;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-size: 0.9rem;
}

.mini-icon {
  width: 24px;
  height: 24px;
}

/* 特定链接样式 */
.scut-link {
  color: #ff4d4d;
  font-weight: bold;
  text-decoration: none;
  border-bottom: 2px solid #ff4d4d;
}

.light-link {
  color: #80d4ff;
  text-decoration: none;
}

/* 头像 */
.avatar-box {
  margin: 0 auto;
  width: 120px;
  height: 120px;
  position: relative;
  align-items: left;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  object-fit: cover;
}

.online-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 15px;
  height: 15px;
  background: #2ecc71;
  border-radius: 50%;
  border: 2px solid #fff;
}

/* 动画 */
@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.float-anim-1 {
  animation: float 4s ease-in-out infinite;
}

.float-anim-2 {
  animation: float 5s ease-in-out infinite;
}

.float-anim-3 {
  animation: float 6s ease-in-out infinite;
}

/* GitHub图表 */
.gh-graph {
  width: 100%;
  filter: brightness(1.1) contrast(1.1);
}

/* 仓库网格 */
.repo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
}

.repo-grid img {
  width: 100%;
  border-radius: 12px;
}

/* 标题样式 */
h3 {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
  margin-bottom: 15px;
}

/* 成就列表 */
.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.achieve-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 0.95rem;
  line-height: 1.4;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-left: 3px solid transparent;
}

.achieve-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(8px);
  box-shadow: 4px 4px 15px rgba(0, 0, 0, 0.2);
  border-left-width: 6px;
}

.achieve-item.special {
  border-left-color: #f1c40f;
  background: rgba(241, 196, 15, 0.08);
}

.achieve-item.leader {
  border-left-color: #e74c3c;
  background: rgba(231, 76, 60, 0.08);
}

.achieve-item:not(.special):not(.leader):hover {
  border-left-color: #80d4ff;
}

.achieve-year {
  font-weight: bold;
  color: #80d4ff;
  font-family: 'Courier New', Courier, monospace;
  min-width: 45px;
}

/* 生活方式内容 */
.hobby-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
  text-align: left;
  padding: 5px 10px;
}

.hobby-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.value-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hobby-item .value {
  font-size: 1.15rem;
  color: #ffffff;
  font-weight: 500;
}

.bayern .value {
  color: #ff4d4d;
  font-weight: bold;
}

.badge.red {
  background: rgba(220, 5, 45, 0.2);
  color: #ff4d4d;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  border: 1px solid rgba(220, 5, 45, 0.4);
}

.highlight-photo {
  color: #ffeb3b !important;
}

.highlight-adv {
  color: #4caf50 !important;
}

.sep {
  color: rgba(255, 255, 255, 0.2);
  margin: 0 5px;
}

.hobby-item:hover .value {
  transform: translateX(5px);
  transition: transform 0.3s ease;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

/* 技能组图片 */
.skill-group img {
  max-width: 100%;
  height: auto;
}

/* Who am I heading */
.who-am-i {
  color: red;
  text-align: center;
}

.who-am-i:hover {
  transform: translateX(5px);
  transition: transform 0.3s ease;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

/* 响应式适配 */
@media (max-width: 1100px) {
  .about-main-grid {
    grid-template-columns: 1fr 1fr;
  }

  .profile-card {
    grid-column: span 2;
    grid-row: auto;
  }
}

@media (max-width: 768px) {
  .about-main-grid {
    grid-template-columns: 1fr;
  }

  .profile-card,
  .repo-footer {
    grid-column: span 1;
  }
}

@media (max-width: 1200px) {
  .about-main-grid {
    grid-template-columns: 1fr;
  }

  .card {
    animation: none;
  }
}
</style>