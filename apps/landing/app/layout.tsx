import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, Outfit } from "next/font/google"
import "./globals.css"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" })

export const metadata: Metadata = {
  title: "Smart Inventory — AI-Powered Retail Intelligence",
  description: "Inventory optimization, reinvented. AI-powered retail intelligence for small businesses.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased selection:bg-black selection:text-white`}>
        {children}
      </body>
    </html>
  )
}
