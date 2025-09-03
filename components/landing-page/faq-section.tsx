"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqData = [
  {
    question: "What is Fantasy Nexus and who is it for?",
    answer:
      "Fantasy Nexus provides weekly fantasy football rankings, projections, and a Start/Sit comparison tool. It's built for players who want sharper, faster decisions using Vegas-powered data.",
  },
  {
    question: "How are your projections generated?",
    answer:
      "We incorporate sportsbook lines (game totals, spreads) and player prop markets where available. This market information helps anchor projections to the sharpest signals and updates as lines move.",
  },
  {
    question: "What's included in Free vs Pro?",
    answer:
      "Free users can browse the homepage, view the top 5 players per position, and see limited insights. Pro unlocks full weekly rankings, custom scoring (PPR/Half/Standard & 4/6pt pass TD), unlimited Start/Sit comparisons, and deeper betting context.",
  },
  {
    question: "How often are rankings updated?",
    answer:
      "Rankings refresh as market data moves, roster updates hit, and kickoff approaches. You’ll typically see updates daily and more frequently on game days.",
  },
  {
    question: "Which scoring formats are supported?",
    answer:
      "We support Half PPR (default), Full PPR, and Standard, along with 4pt or 6pt passing touchdowns. You can switch formats in the filters on the Rankings and Start/Sit pages (Pro unlocks all).",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Open Profile → Manage Subscription to access the Stripe Customer Portal. You can cancel at period end, update payment methods, and view invoices there.",
  },
  {
    question: "Do I need an account to purchase Pro?",
    answer:
      "Yes. We’ll ask you to sign up before checkout so your subscription unlocks instantly across the app.",
  },
  {
    question: "I used OddSmash before — can I sign in here?",
    answer:
      "Yes. Existing OddSmash users can sign in with the same email to access Fantasy Nexus.",
  },
]

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onToggle()
  }
  return (
    <div
      className={`w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out cursor-pointer`}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">{question}</div>
        <div className="flex justify-center items-center">
          <ChevronDown
            className={`w-6 h-6 text-muted-foreground-dark transition-all duration-500 ease-out ${isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-5 transition-all duration-500 ease-out ${isOpen ? "pb-[18px] pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"}`}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words">{answer}</div>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }
  return (
    <section className="w-full pt-[66px] pb-20 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[620px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            Frequently Asked Questions
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
            Everything you need to know about Fantasy Nexus — projections, subscriptions, and how to get the most out of our Vegas‑powered tools.
          </p>
        </div>
      </div>
      <div className="w-full max-w-[600px] pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10">
        {faqData.map((faq, index) => (
          <FAQItem key={index} {...faq} isOpen={openItems.has(index)} onToggle={() => toggleItem(index)} />
        ))}
      </div>
    </section>
  )
}
