export interface GithubUser {
  login: string;
  avatar_url: string;
  name?: string;
}

class GithubAuthService {
  private userKey = 'github_user_info';
  
  // 默认头像地址（当用户不存在或加载失败时使用）
  private readonly DEFAULT_AVATAR = 'https://github.com/identicons/guest.png';

  // 核心逻辑：直接拼接头像 URL
  private getAvatarUrl(username: string): string {
    if (!username || username === 'anonymous-user') return this.DEFAULT_AVATAR;
    // 使用 github.com/username.png 是获取头像最快的方式
    return `https://github.com/${username}.png`;
  }

  // 登录/保存用户信息
  login(username: string): GithubUser {
    const userInfo: GithubUser = {
      login: username,
      avatar_url: this.getAvatarUrl(username),
      name: username
    };
    localStorage.setItem(this.userKey, JSON.stringify(userInfo));
    return userInfo;
  }

  // 获取当前缓存的用户
  getCachedUserInfo(): GithubUser | null {
    const stored = localStorage.getItem(this.userKey);
    if (!stored) return null;
    try {
      const user = JSON.parse(stored);
      // 确保 URL 是最新的拼接格式
      user.avatar_url = this.getAvatarUrl(user.login);
      return user;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.userKey);
  }
}

export const githubAuthService = new GithubAuthService();