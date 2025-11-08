import { Lightbulb, Sparkles, Rocket } from "lucide-react";
import { Badge } from "../ui/badge";

const STEPS = [
  {
    icon: Lightbulb,
    title: "Type an Idea",
    description: "Describe your idea in natural language.",
  },
  {
    icon: Sparkles,
    title: "We Generate Everything",
    description:
      "Smart contracts, UI, and miniapp are auto-generated. Iterate with AI.",
  },
  {
    icon: Rocket,
    title: "Launch & Earn",
    description: "Go live with a token and start earning $MINI.",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-neutral-50 py-12 sm:py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-14 md:mb-16">How it works</h2>
        <div className="relative grid grid-cols-1 md:grid-cols-3 items-stretch gap-6 sm:gap-8 md:gap-12">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative h-auto sm:h-[280px] md:h-[300px] text-center p-6 pt-10 sm:pt-12 rounded-xl bg-white border shadow-md transition-transform hover:-translate-y-1 md:hover:-translate-y-2"
              >
                {/* <div>
                  <Badge className="p-1 px-2">Step {index + 1}</Badge>
                </div> */}
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-orange-500/10 text-primary mb-4 sm:mb-6 mx-auto">
                  <Icon size={28} className="sm:hidden" />
                  <Icon size={32} className="hidden sm:block" />
                </div>
                <div className="flex flex-col items-center">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                <div className="hidden md:block absolute -top-4 -left-4 sm:-top-5 sm:-left-5 text-white font-bold h-9 sm:h-10 py-1 pt-1.5 sm:pt-2 rounded-lg">
                  <Badge className="p-1 px-2 bg-purple-500/90 text-[10px] sm:text-xs">Step {index + 1}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
