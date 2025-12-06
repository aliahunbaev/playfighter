export default function SevenSegment({ digit }: { digit: string }) {
  // Define which segments are active for each digit (0-9)
  const segments: { [key: string]: boolean[] } = {
    '0': [true, true, true, false, true, true, true],      // a,b,c,d,e,f,g
    '1': [false, true, true, false, false, false, false],
    '2': [true, true, false, true, true, false, true],
    '3': [true, true, true, true, false, false, true],
    '4': [false, true, true, true, false, true, true],
    '5': [true, false, true, true, false, true, true],
    '6': [true, false, true, true, true, true, true],
    '7': [true, true, true, false, false, false, false],
    '8': [true, true, true, true, true, true, true],
    '9': [true, true, true, true, false, true, true],
  }

  const activeSegments = segments[digit] || segments['0']

  return (
    <div className="relative w-16 h-24 md:w-20 md:h-32">
      {/* Top */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-3/5 h-1.5 md:h-2 ${activeSegments[0] ? 'bg-black' : 'bg-black/5'}`} />

      {/* Top Right */}
      <div className={`absolute top-1 right-0 w-1.5 md:w-2 h-[45%] ${activeSegments[1] ? 'bg-black' : 'bg-black/5'}`} />

      {/* Bottom Right */}
      <div className={`absolute bottom-1 right-0 w-1.5 md:w-2 h-[45%] ${activeSegments[2] ? 'bg-black' : 'bg-black/5'}`} />

      {/* Bottom */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-1.5 md:h-2 ${activeSegments[3] ? 'bg-black' : 'bg-black/5'}`} />

      {/* Bottom Left */}
      <div className={`absolute bottom-1 left-0 w-1.5 md:w-2 h-[45%] ${activeSegments[4] ? 'bg-black' : 'bg-black/5'}`} />

      {/* Top Left */}
      <div className={`absolute top-1 left-0 w-1.5 md:w-2 h-[45%] ${activeSegments[5] ? 'bg-black' : 'bg-black/5'}`} />

      {/* Middle */}
      <div className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-3/5 h-1.5 md:h-2 ${activeSegments[6] ? 'bg-black' : 'bg-black/5'}`} />
    </div>
  )
}
