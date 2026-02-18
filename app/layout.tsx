import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "DMP-TMS | Durban Metropolitan Police Time Management System",
  description: "eThekwini Municipality - HR Time Management System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
