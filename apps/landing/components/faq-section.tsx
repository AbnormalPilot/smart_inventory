import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How do I get started with Smart Inventory?",
    answer:
      "It's very simple! Create an account, add your products (manually or import via CSV), and start tracking. Your dashboard will be live within minutes — no complex setup required.",
  },
  {
    question: "What does Smart Inventory cost?",
    answer:
      "Smart Inventory is free for the hackathon demo. Our production pricing will include a generous free tier for small shops, with premium plans for multi-store operations and advanced AI features.",
  },
  {
    question: "How accurate is the AI demand forecasting?",
    answer:
      "Our AI analyzes your historical sales data, seasonal patterns, and market signals to achieve 95%+ accuracy on restock predictions. The model continuously improves as it learns your business patterns.",
  },
  {
    question: "Can I use Smart Inventory for multiple stores?",
    answer:
      "Yes! Smart Inventory supports multi-location management. Each store gets its own inventory tracking while the central dashboard gives you a unified view across all locations.",
  },
  {
    question: "How does the geolocation feature work?",
    answer:
      "The maps feature uses your store location to visualize customer reach, delivery zones, and competitor proximity. You can adjust the radius to see customer density and optimize your delivery coverage.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. All data is encrypted in transit and at rest. We use industry-standard security practices, and your inventory data is never shared with third parties.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-32 px-6 pb-80 relative overflow-hidden bg-cover bg-center bg-fixed" style={{ backgroundImage: `url('/bg-faq-tech.jpg')` }}>
      {/* Dark frosted overlay for perfect dark-mode legibility */}
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" />
      <div className="absolute inset-0 opacity-40 mix-blend-color-dodge" style={{
        backgroundImage: `radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)`
      }} />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-normal mb-6 text-balance font-serif text-white">Frequently asked questions</h2>
          <p className="text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Smart Inventory. Have a question not listed? Contact our support.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4 py-0 my-0">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 rounded-2xl px-6 data-[state=open]:border-emerald-500/50 data-[state=open]:bg-black/60 shadow-lg hover:shadow-xl"
            >
              <AccordionTrigger className="text-left text-base font-medium text-white hover:no-underline py-6 focus:outline-none">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-emerald-50/70 pb-6 leading-relaxed text-sm lg:text-base border-t border-white/5 pt-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
