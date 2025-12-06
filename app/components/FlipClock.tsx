export default function FlipClock({ day }: { day: number }) {
  const digits = day.toString().padStart(4, '0').split('')

  return (
    <div className="flex gap-2 md:gap-3">
      {digits.map((digit, index) => (
        <FlipCard key={index} digit={digit} />
      ))}
    </div>
  )
}

function FlipCard({ digit }: { digit: string }) {
  return (
    <div className="bg-black rounded-md w-16 h-24 md:w-24 md:h-36 flex items-center justify-center shadow-xl">
      <span className="font-mono font-bold text-6xl md:text-8xl text-white leading-none">
        {digit}
      </span>
    </div>
  )
}
