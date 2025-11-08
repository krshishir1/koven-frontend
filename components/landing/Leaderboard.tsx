"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { ProjectAvatar, AccountAvatar } from "@/components/ui/avatar-gen"

type TimeFrame = "today" | "week" | "all"

type Row = { rank: number; name: string; creator: string; volume: string; mini: string }

const DATA: Record<TimeFrame, Row[]> = {
  today: [
    { rank: 1, name: "Flash Token Deck", creator: "@devin", volume: "$2.1K", mini: "95" },
    { rank: 2, name: "Quiz Rush", creator: "@quizzy", volume: "$1.7K", mini: "80" },
    { rank: 3, name: "Mini Bets", creator: "@oddsmaker", volume: "$1.2K", mini: "64" },
    { rank: 4, name: "ArtistPad", creator: "@soundwave", volume: "$980", mini: "52" },
    { rank: 5, name: "PredictX", creator: "@alpha", volume: "$760", mini: "39" },
  ],
  week: [
    { rank: 1, name: "TokenLaunch Pro", creator: "@cryptodev", volume: "$12.5K", mini: "450" },
    { rank: 2, name: "NFT Betting Arena", creator: "@betmaster", volume: "$9.8K", mini: "380" },
    { rank: 3, name: "Music Quiz Battle", creator: "@quizking", volume: "$7.2K", mini: "290" },
    { rank: 4, name: "Artist Token Hub", creator: "@musicfan", volume: "$5.6K", mini: "220" },
    { rank: 5, name: "Prediction Market", creator: "@trader99", volume: "$4.3K", mini: "180" },
  ],
  all: [
    { rank: 1, name: "Mega Launch Suite", creator: "@whale", volume: "$250K", mini: "8.5K" },
    { rank: 2, name: "Quizverse", creator: "@trivia", volume: "$190K", mini: "6.1K" },
    { rank: 3, name: "Bet Royale", creator: "@sportsfi", volume: "$165K", mini: "5.5K" },
    { rank: 4, name: "Artist DAO Hub", creator: "@collective", volume: "$120K", mini: "4.0K" },
    { rank: 5, name: "Predict Pro", creator: "@oracle", volume: "$96K", mini: "3.4K" },
  ],
}

export default function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week")
  const rows = DATA[timeFrame]

  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4">Earn $MINI for the apps you launch</h2>
          <p className="text-base sm:text-lg text-muted-foreground">Top miniapp creators get weekly $MINI rewards.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Button
            variant={timeFrame === "today" ? "default" : "outline"}
            onClick={() => setTimeFrame("today")}
            className={`px-3 sm:px-4 ${timeFrame === "today" ? "bg-primary hover:bg-primary/90" : ""}`}
          >
            Today
          </Button>
          <Button
            variant={timeFrame === "week" ? "default" : "outline"}
            onClick={() => setTimeFrame("week")}
            className={`px-3 sm:px-4 ${timeFrame === "week" ? "bg-primary hover:bg-primary/90" : ""}`}
          >
            This Week
          </Button>
          <Button
            variant={timeFrame === "all" ? "default" : "outline"}
            onClick={() => setTimeFrame("all")}
            className={`px-3 sm:px-4 ${timeFrame === "all" ? "bg-primary hover:bg-primary/90" : ""}`}
          >
            All-time
          </Button>
        </div>

        <Card className="overflow-hidden border border-border/60 bg-card/80 backdrop-blur">
          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-border/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Miniapp</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Creator</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">24h Volume</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">MINI Earned</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {rows.map((item) => (
                  <tr key={item.rank} className="hover:bg-neutral-50/90 bg-white/90 transition-colors cursor-pointer">
                    <td className="px-6 py-4 align-middle">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground font-semibold">
                        {item.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ProjectAvatar seed={item.name} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AccountAvatar seed={item.creator} />
                        <span className="text-muted-foreground">{item.creator}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{item.volume}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-secondary/15 text-secondary px-2 py-1 text-sm font-semibold">
                        {item.mini} $MINI
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="group flex gap-2 items-center text-xs hover:text-primary">
                        <p className="text-muted-foreground group-hover:text-primary">Try</p>
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden bg-white/90 divide-y divide-border/70">
            {rows.map((item) => (
              <div key={item.rank} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-lg text-muted-foreground">#{item.rank}</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ProjectAvatar seed={item.name} />
                        <div className="font-semibold text-sm">{item.name}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <p>Created by</p>
                        <AccountAvatar seed={item.creator} className={"w-8"} />
                        <div className="font-bold">{item.creator}</div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="group text-primary -mt-1 px-2 py-1 h-8">
                    Try
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-xs mt-3">
                  <span className="text-muted-foreground">
                    24h: <span className="font-semibold text-foreground">{item.volume}</span>
                  </span>
                  <span className="inline-flex items-center rounded-md bg-secondary/15 text-secondary px-2 py-1 font-semibold">
                    {item.mini} $MINI
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  )
}
