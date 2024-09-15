'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Home() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const texts = [
    "Connect with friends",
    "Share your moments",
    "Discover new people",
    "Build your network"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-white mb-6">Welcome to SocialNet</h1>
        <motion.p
          key={currentTextIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-2xl text-gray-300 mb-8"
        >
          {texts[currentTextIndex]}
        </motion.p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-full transition-all duration-300 transform hover:scale-105">
          <Link href="/login">
            Get Started
          </Link>
        </Button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-12 text-gray-400"
      >
        <p>Join millions of people connecting and sharing experiences.</p>
      </motion.div>
    </div>
  )
}