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
    <section id="faq" className="py-32 px-6 pb-80">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-normal mb-6 text-balance font-serif">Frequently asked questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Smart Inventory. Have a question not listed? Contact our support.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3 py-0 my-0">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-foreground/30"
            >
              <AccordionTrigger className="text-left text-base font-medium text-foreground hover:no-underline py-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 leading-relaxed text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
