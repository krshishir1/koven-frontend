import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-neutral-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-lg font-bold mb-2">Minidev</div>
            <p className="text-sm text-muted-foreground">Built on Base. Powered by Farcaster.</p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://x.com/minidevfun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              X (Twitter)
            </Link>
            <Link
              href="https://farcaster.xyz/minidev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Farcaster
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Minidev. All rights reserved.
        </div>
      </div>
    </footer>
  )
}