export default function WriteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Override parent layout's header/footer with a clean slate */}
      <style>{`
        body > div > header,
        body > div > footer { display: none !important; }
        body > div > main { margin-top: 0; }
        body > div { padding-top: 1.5rem; padding-bottom: 0; }
      `}</style>
      {children}
    </>
  )
}
