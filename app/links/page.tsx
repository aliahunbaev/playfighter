export default function LinksPage() {
  const links = [
    {
      name: 'YouTube',
      handle: 'playfighter',
      url: 'https://youtube.com/@playfighter',
    },
    {
      name: 'Instagram',
      handle: '@playfighter_',
      url: 'https://instagram.com/playfighter_',
    },
    {
      name: 'Combat Créatif',
      handle: '@combatcreatif',
      url: 'https://instagram.com/combatcreatif',
    },
  ]

  return (
    <div>
      <div className="space-y-1">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group py-4 hover:opacity-60 transition-opacity"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-sans text-lg font-light" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                {link.name}
              </span>
              <span className="font-mono text-xs text-black/40 dark:text-[#e5e5e5]/40 uppercase tracking-wider">
                {link.handle}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
