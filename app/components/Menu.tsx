'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Menu() {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 150) // Match animation duration
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => {
          if (isOpen) {
            handleClose()
          } else {
            setIsOpen(true)
          }
        }}
        className="absolute left-0 hover:opacity-60 transition-opacity z-50 p-2"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
          <g transform="translate(12, 12)">
            <line
              x1="-10"
              y1="0"
              x2="10"
              y2="0"
              className="transition-all duration-150 ease-in-out"
              style={{
                transform: isOpen ? 'translateY(0) rotate(45deg)' : 'translateY(-3px) rotate(0deg)',
                transformOrigin: '0 0'
              }}
            />
            <line
              x1="-10"
              y1="0"
              x2="10"
              y2="0"
              className="transition-all duration-150 ease-in-out"
              style={{
                transform: isOpen ? 'translateY(0) rotate(-45deg)' : 'translateY(3px) rotate(0deg)',
                transformOrigin: '0 0'
              }}
            />
          </g>
        </svg>
      </button>

      {(isOpen || isClosing) && (
        <div className={`fixed inset-0 bg-cream dark:bg-[#0a0a0a] z-30 flex items-center justify-center ${isClosing ? 'menu-flash-out' : 'menu-flash'}`}>
          <nav className="flex flex-col gap-8 text-center">
            <Link
              href="/"
              onClick={handleClose}
              className="font-mono text-4xl md:text-5xl font-light hover:opacity-60 transition-opacity text-black dark:text-[#e5e5e5] uppercase tracking-wider"
            >
              Home
            </Link>
            <Link
              href="/archive"
              onClick={handleClose}
              className="font-mono text-4xl md:text-5xl font-light hover:opacity-60 transition-opacity text-black dark:text-[#e5e5e5] uppercase tracking-wider"
            >
              Archive
            </Link>
            <Link
              href="/about"
              onClick={handleClose}
              className="font-mono text-4xl md:text-5xl font-light hover:opacity-60 transition-opacity text-black dark:text-[#e5e5e5] uppercase tracking-wider"
            >
              About
            </Link>
            <Link
              href="/links"
              onClick={handleClose}
              className="font-mono text-4xl md:text-5xl font-light hover:opacity-60 transition-opacity text-black dark:text-[#e5e5e5] uppercase tracking-wider"
            >
              Links
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
