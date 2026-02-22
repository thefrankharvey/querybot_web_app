"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, CircleCheckBigIcon, SquarePen } from "lucide-react";
import { motion } from "framer-motion";
import QueryDashMockDialog from "./query-dash-mock-dialog";
import DotIndicators from "@/app/(app)/query-dashboard/components/dot-indicators";

export type MockColumn = {
  id: string;
  title: string;
};

export type MockCard = {
  id: string;
  columnId: string;
  name: string;
  agency: string;
  fit: "Perfect Fit" | "Great Fit" | "Good Fit" | "Neutral Fit";
  project: string;
  queryLetterReady: boolean;
  timingLabel?: string;
  email: string;
  notes?: string;
  matchScore?: number;
  queryTrackerUrl?: string;
  pubMarketplaceUrl?: string;
  agencyUrl?: string;
};

const COLUMNS: MockColumn[] = [
  { id: "agents-to-research", title: "Agents to Research" },
  { id: "submitted-query", title: "Submitted Query" },
  { id: "pages-requested", title: "Pages Requested" },
  { id: "rejected", title: "Rejected" },
  { id: "offer-made", title: "Offer Made" },
];

type BaseMockCard = Omit<
  MockCard,
  "email" | "notes" | "matchScore" | "queryTrackerUrl" | "pubMarketplaceUrl" | "agencyUrl"
>;

const BASE_MOCK_CARDS: BaseMockCard[] = [
  {
    id: "card-1",
    columnId: "agents-to-research",
    name: "Elio Bracken",
    agency: "Inkforge Meridian",
    fit: "Perfect Fit",
    project: "My Book 1",
    queryLetterReady: false,
  },
  {
    id: "card-2",
    columnId: "agents-to-research",
    name: "Nara Voss",
    agency: "Juniper Quill Collective",
    fit: "Great Fit",
    project: "My Book 2",
    queryLetterReady: false,
  },
  {
    id: "card-3",
    columnId: "agents-to-research",
    name: "Tamsin Vale",
    agency: "Glass Harbor Literary",
    fit: "Good Fit",
    project: "My Book 1",
    queryLetterReady: false,
  },
  {
    id: "card-13",
    columnId: "agents-to-research",
    name: "Ivo Calder",
    agency: "Cinderpath Letters",
    fit: "Neutral Fit",
    project: "My Book 2",
    queryLetterReady: false,
  },
  {
    id: "card-14",
    columnId: "agents-to-research",
    name: "Maren Pike",
    agency: "Foxglove Story Bureau",
    fit: "Great Fit",
    project: "My Book 1",
    queryLetterReady: false,
  },
  {
    id: "card-4",
    columnId: "submitted-query",
    name: "Cato Wren",
    agency: "Northlight Narrative House",
    fit: "Perfect Fit",
    project: "My Book 2",
    queryLetterReady: true,
    timingLabel: "Submitted 2 days ago",
  },
  {
    id: "card-5",
    columnId: "submitted-query",
    name: "Blythe Corin",
    agency: "Hearthline Literary Studio",
    fit: "Great Fit",
    project: "My Book 1",
    queryLetterReady: true,
    timingLabel: "Submitted 7 days ago",
  },
  {
    id: "card-15",
    columnId: "submitted-query",
    name: "Soren Lark",
    agency: "Rivercoil Rights Group",
    fit: "Good Fit",
    project: "My Book 2",
    queryLetterReady: true,
    timingLabel: "Submitted 4 days ago",
  },
  {
    id: "card-16",
    columnId: "submitted-query",
    name: "Ansel Greer",
    agency: "Moonstamp Lit Partners",
    fit: "Great Fit",
    project: "My Book 1",
    queryLetterReady: true,
    timingLabel: "Submitted 10 days ago",
  },
  {
    id: "card-6",
    columnId: "pages-requested",
    name: "Petra Sol",
    agency: "Vellum Bridge Agency",
    fit: "Perfect Fit",
    project: "My Book 2",
    queryLetterReady: true,
    timingLabel: "Pages requested 2 days ago",
  },
  {
    id: "card-7",
    columnId: "pages-requested",
    name: "Kellan Frost",
    agency: "Wildfen Manuscript Co",
    fit: "Great Fit",
    project: "My Book 1",
    queryLetterReady: true,
    timingLabel: "Pages requested 2 days ago",
  },
  {
    id: "card-8",
    columnId: "pages-requested",
    name: "Lyra Mott",
    agency: "Starwharf Literary Office",
    fit: "Good Fit",
    project: "My Book 2",
    queryLetterReady: true,
    timingLabel: "Pages requested 2 days ago",
  },
  {
    id: "card-11",
    columnId: "rejected",
    name: "Rook Hallow",
    agency: "Bramblegate Author Works",
    fit: "Good Fit",
    project: "My Book 1",
    queryLetterReady: true,
  },
  {
    id: "card-12",
    columnId: "rejected",
    name: "Nico Thorne",
    agency: "Copper Thread Lit",
    fit: "Great Fit",
    project: "My Book 2",
    queryLetterReady: true,
  },
  {
    id: "card-17",
    columnId: "offer-made",
    name: "Orla Finch",
    agency: "Crestmark Story Agency",
    fit: "Perfect Fit",
    project: "My Book 1",
    queryLetterReady: true,
  },
];

const MOCK_CARDS: MockCard[] = BASE_MOCK_CARDS.map((card, index) => ({
  ...card,
  email: `agent${index + 1}@litmail.example`,
  notes: `Mock note: ${card.name} at ${card.agency} is being tracked in ${card.project}.`,
  matchScore: Number((4.9 - (index % 4) * 0.5).toFixed(1)),
  queryTrackerUrl: `https://query-tracker.example/${card.id}`,
  pubMarketplaceUrl: `https://pub-marketplace.example/${card.id}`,
  agencyUrl: `https://agency-site.example/${card.id}`,
}));

const FIT_CLASS: Record<MockCard["fit"], string> = {
  "Perfect Fit": "bg-[var(--fit-perfect)]",
  "Great Fit": "bg-[var(--fit-great)]",
  "Good Fit": "bg-[var(--fit-good)]",
  "Neutral Fit": "bg-[var(--fit-neutral)]",
};

const SWIPE_THRESHOLD = 50;
const MOBILE_COLUMN_WIDTH = "100vw - 48px";
const MOBILE_COLUMN_GAP = 16;
const MOBILE_COLUMN_MIN_HEIGHT = 320;
const CARD_INITIAL = { opacity: 0, y: 28 };
const CARD_WHILE_IN_VIEW = { opacity: 1, y: 0 };
const CARD_VIEWPORT = { once: true, amount: 0.2 };

const QueryDashBlock = () => {
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [selectedCard, setSelectedCard] = useState<MockCard | null>(null);
  const [mobileColumnContentHeight, setMobileColumnContentHeight] = useState<number>(
    MOBILE_COLUMN_MIN_HEIGHT
  );
  const mobileColumnRefs = useRef<Array<HTMLDivElement | null>>([]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < -SWIPE_THRESHOLD && currentColumnIndex < COLUMNS.length - 1) {
      setCurrentColumnIndex((prev) => prev + 1);
    } else if (deltaX > SWIPE_THRESHOLD && currentColumnIndex > 0) {
      setCurrentColumnIndex((prev) => prev - 1);
    }
  };

  const navigateToColumn = (index: number) => {
    setCurrentColumnIndex(index);
  };

  const measureMobileColumnHeight = useCallback(() => {
    const measuredHeights = mobileColumnRefs.current
      .map((column) => column?.scrollHeight ?? 0)
      .filter((height) => height > 0);

    const nextHeight = Math.max(MOBILE_COLUMN_MIN_HEIGHT, ...measuredHeights);
    setMobileColumnContentHeight((prev) => (prev === nextHeight ? prev : nextHeight));
  }, []);

  useEffect(() => {
    measureMobileColumnHeight();

    if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      measureMobileColumnHeight();
    });

    mobileColumnRefs.current.forEach((column) => {
      if (column) {
        resizeObserver.observe(column);
      }
    });

    window.addEventListener("resize", measureMobileColumnHeight);
    window.addEventListener("orientationchange", measureMobileColumnHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureMobileColumnHeight);
      window.removeEventListener("orientationchange", measureMobileColumnHeight);
    };
  }, [measureMobileColumnHeight]);

  const getCardsForColumn = (columnId: string) =>
    MOCK_CARDS.filter((card) => card.columnId === columnId);

  const handleCardClick = (card: MockCard) => {
    setSelectedCard(card);
  };

  const renderCard = (card: MockCard, index: number) => {
    const isRejected = card.columnId === "rejected";

    return (
      <motion.div
        key={card.id}
        initial={CARD_INITIAL}
        whileInView={CARD_WHILE_IN_VIEW}
        viewport={CARD_VIEWPORT}
        transition={{
          duration: 0.5,
          ease: "easeOut",
          delay: index * 0.1,
        }}
      >
        <div
          className="group bg-white rounded-lg p-3 shadow-sm border-2 border-transparent hover:shadow-md hover:border-accent/60 transition-all duration-300 cursor-pointer"
          onClick={() => handleCardClick(card)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCardClick(card);
            }
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-sm font-semibold text-gray-900 truncate capitalize ${isRejected ? "line-through" : ""
                }`}
            >
              {card.name}
            </p>
            <SquarePen className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity" />
          </div>
          <p
            className={`text-xs text-gray-500 truncate mt-0.5 ${isRejected ? "line-through" : ""
              }`}
          >
            {card.agency}
          </p>
          {card.timingLabel && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-accent">{card.timingLabel}</p>
            </div>
          )}
          <div className={`flex items-center gap-1 mb-4 ${card.timingLabel ? "mt-3" : "mt-4"}`}>
            <p className="text-xs font-semibold text-accent">Query Letter Ready</p>
            {card.queryLetterReady ? (
              <CircleCheckBigIcon className="w-4 h-4 text-accent" />
            ) : (
              <Circle className="w-4 h-4 text-accent" />
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${FIT_CLASS[card.fit]}`}
            >
              {card.fit}
            </span>
            <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
              {card.project}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="w-full pt-40 pb-20">
      <div className="w-full md:w-[90%] mx-auto text-left md:text-center pb-10 md:pb-20">
        <h1 className="text-2xl md:text-[40px] leading-normal text-accent">
          Your saved agents are automatically added to your{" "}
          <span className="bg-accent text-white p-1 px-3 rounded-xl font-semibold">
            Query Dashboard
          </span>
          .{" "}
          No more filling out spreadsheets! Manage your query progress with ease from one modern dashboard.
        </h1>
      </div>

      <div className="relative left-1/2 right-1/2 w-screen max-w-none -ml-[50vw] -mr-[50vw]">
        {/* Desktop view */}
        <div className="hidden md:flex justify-center">
          <div className="flex gap-4 w-fit p-4">
            {COLUMNS.map((column) => (
              <div key={column.id} className="w-[235px]">
                <div className="text-base bg-accent/10 rounded-lg px-4 font-medium text-accent py-3 mb-4">
                  <h2>{column.title}</h2>
                </div>
                <div className="flex flex-col gap-2 p-2 bg-accent/10 rounded-lg min-h-[320px]">
                  {getCardsForColumn(column.id).map((card, index) =>
                    renderCard(card, index)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view */}
        <div
          className="md:hidden overflow-hidden px-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(calc(${-currentColumnIndex} * ((${MOBILE_COLUMN_WIDTH}) + ${MOBILE_COLUMN_GAP}px)))`,
            }}
          >
            {COLUMNS.map((column, index) => (
              <div key={column.id} className="w-[calc(100vw-48px)] flex-shrink-0 py-4">
                <div className="text-base bg-accent/10 rounded-lg px-4 font-medium text-accent py-3 mb-4">
                  <h2>{column.title}</h2>
                </div>
                <div
                  ref={(node) => {
                    mobileColumnRefs.current[index] = node;
                  }}
                  className="flex flex-col gap-2 p-2 bg-accent/10 rounded-lg"
                  style={{ minHeight: mobileColumnContentHeight }}
                >
                  {getCardsForColumn(column.id).map((card, index) =>
                    renderCard(card, index)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:hidden">
          <DotIndicators
            total={COLUMNS.length}
            current={currentColumnIndex}
            onDotClick={navigateToColumn}
          />
        </div>
      </div>
      <QueryDashMockDialog
        card={selectedCard}
        columns={COLUMNS}
        open={!!selectedCard}
        onOpenChange={(open) => {
          if (!open) setSelectedCard(null);
        }}
      />
    </section>
  );
};

export default QueryDashBlock;
