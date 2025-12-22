import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui-primitives/accordion";

export const SubscriptionFAQs = () => {
  const faqs = [
    {
      label:
        "How is this different from QueryTracker or Publisher's Marketplace?",
      content:
        "Those tools give you a database. We give you a system. QueryTracker is a directory—you still have to do all the research, filtering, and monitoring yourself. Write Query Hook does the work for you: Smart Match ranks agents specifically for your manuscript, Dispatch tracks the industry in real time, and everything lands in one dashboard ready to act on. Less hunting, more querying.",
    },

    {
      label: "What if I'm not ready to query yet?",
      content:
        "Even better. Most writers waste their first batch of queries on the wrong agents because they didn't have time to research properly. Start now—build your list while you revise, learn who's opening and closing, and when you're ready, you'll hit the ground running instead of scrambling.",
    },
    {
      label: "How often is the data updated?",
      content:
        "Dispatch monitors sources continuously—social media, MSWLs, agency announcements—and updates flow into your feed in real time. Our agent database is maintained and verified regularly, so you're not querying someone who closed six months ago.",
    },

    {
      label: "What if my genre is niche or uncommon?",
      content:
        "Smart Match is built to handle specificity. The more precise you are about your manuscript, the better your results. We track agents across every major category—literary fiction, upmarket, romance, SFF, thriller, MG, YA, memoir, and more.",
    },
    {
      label: "Can I cancel anytime?",
      content:
        "Yes. One click, no questions, no hoops. If it's not working for you, you're free to go.",
    },
  ];

  return (
    <div className="pb-4 w-full md:w-3/4 mx-auto">
      <h1 className="text-[22px] md:text-[30px] font-semibold leading-tight text-accent text-left">
        FAQs
      </h1>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem value={faq.label} key={faq.label}>
            <AccordionTrigger className="[&>svg]:text-accent underline-none text-lg font-semibold py-8 text-accent">
              {faq.label}
            </AccordionTrigger>
            <AccordionContent className="text-lg font-normal text-accent">
              {faq.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
