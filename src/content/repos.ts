export interface FeaturedRepo {
  owner: string
  name: string
  visitorPageId: string
  description: string
  language: string
  href: string
}

export const featuredRepos: FeaturedRepo[] = [
  {
    owner: 'AlexBybye',
    name: 'Make_Video_Great_Again',
    visitorPageId: '/AlexBybye/Make_Video_Great_Again',
    description: 'Tools and experiments for improving video workflows.',
    language: 'Python',
    href: 'https://github.com/AlexBybye/Make_Video_Great_Again'
  },
  {
    owner: 'AlexBybye',
    name: 'SCUT_CS_temporary',
    visitorPageId: '/AlexBybye/SCUT_CS_temporary',
    description: 'A shared learning resource for SCUT computer science students.',
    language: 'Community',
    href: 'https://github.com/AlexBybye/SCUT_CS_temporary'
  }
]
