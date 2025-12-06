# Playfighter — 1000 Days

A minimal, timeless journal documenting my journey from Dec 5, 2025 to September 2028.

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Markdown** for blog posts with gray-matter for frontmatter

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` to view the site.

## Adding Posts

Posts are stored in `/content/posts/` as markdown files.

### File naming convention:
- `day-1.md`, `day-2.md`, etc.

### Post format:
```markdown
---
date: "December 5, 2025"
---

Your post content here. Write freely. Be honest.

**Bold text** and *italic text* are supported, along with links and blockquotes.
```

## Project Structure

```
playfighter/
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Homepage with day counter
│   ├── archive/
│   │   └── page.tsx        # Archive page
│   ├── day/[number]/
│   │   └── page.tsx        # Individual post pages
│   ├── about/
│   │   └── page.tsx        # About page
│   └── links/
│       └── page.tsx        # Links page
├── content/
│   └── posts/              # Markdown posts go here
├── lib/
│   └── posts.ts            # Post utilities and day counter logic
└── public/                 # Static assets
```

## Design Philosophy

- Timeless, not trendy
- Generous whitespace
- Classical typography (Crimson Text + Inter)
- Cream background (#F5F3ED)
- Maximum readability
- No distractions

## The Journey

1000 days of building, learning, and documenting. Raw. Honest. Public.

Start date: December 5, 2025
End date: September 2028

---

Built with intention. Maintained with discipline.
