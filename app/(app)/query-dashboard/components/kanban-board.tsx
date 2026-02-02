"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn, ColumnData } from "./kanban-column";
import { KanbanCard, KanbanCardData } from "./kanban-card";
import { KanbanDialog } from "./kanban-dialog";

const COLUMNS: ColumnData[] = [
  { id: "agents-to-research", title: "Agents to Research" },
  // { id: "prep-query-letter", title: "Prep Query Letter" },
  { id: "submitted-query", title: "Submitted Query" },
  { id: "pages-requested", title: "Pages Requested" },
  { id: "rejected", title: "Rejected" },
  { id: "offer-made", title: "Offer Made" },
];

// Sample cards with fully mocked AgentMatch data
const INITIAL_CARDS: KanbanCardData[] = [
  {
    // Kanban-specific fields
    columnId: "agents-to-research",
    prepQueryLetterDone: false,
    // Required AgentMatch fields
    id: "card-1",
    name: "Sarah Johnson",
    agency: "Sterling Literary Agency",
    bio: "Sarah Johnson has been a literary agent for over 15 years, specializing in commercial fiction and upmarket women's fiction. She is passionate about discovering new voices and helping authors build lasting careers.",
    genres: "Commercial Fiction, Women's Fiction, Book Club Fiction",
    favorites: "Strong female protagonists, multi-generational stories, stories with a sense of place",
    submission_req: "Query letter, synopsis, first 10 pages pasted in email body",
    score: 85,
    normalized_score: 4.2,
    // Optional AgentMatch fields
    aala_member: "Yes",
    email: "sarah@sterlingliterary.com",
    website: "https://sterlingliterary.com/sarah-johnson",
    location: "New York, NY",
    clients: "Jane Doe, Emily Richards, Michael Chen",
    twitter_handle: "@sarahjohnsonlit",
    twitter_url: "https://twitter.com/sarahjohnsonlit",
    querytracker: "https://querytracker.net/agent/sarah-johnson",
    querymanager: "https://querymanager.com/query/sarahjohnson",
    pubmarketplace: "https://pubmarketplace.com/agent/sarah-johnson",
    sales: "50+ deals in the last 5 years",
    dont_send: "No horror, no erotica",
    negatives: "Slow response times reported",
    extra_interest: "Looking for diverse voices and #OwnVoices stories",
    extra_links: "https://sterlingliterary.com/blog",
    agent_id: "sj-001",
    status: "Open to queries",
  },
  {
    columnId: "agents-to-research",
    prepQueryLetterDone: true,
    id: "card-2",
    name: "Marcus Chen",
    agency: "Lighthouse Literary",
    bio: "Marcus Chen represents science fiction, fantasy, and speculative fiction. He's drawn to stories that blend big ideas with deeply human characters.",
    genres: "Science Fiction, Fantasy, Speculative Fiction",
    favorites: "Space opera, hard sci-fi, epic fantasy, magical realism",
    submission_req: "Query letter and first 3 chapters as attachment",
    score: 92,
    normalized_score: 4.6,
    aala_member: "Yes",
    email: "marcus@lighthousebooks.com",
    website: "https://lighthousebooks.com/marcus-chen",
    location: "San Francisco, CA",
    clients: "Robert Kim, Aisha Patel, Thomas Wright",
    twitter_handle: "@marcuschenlit",
    twitter_url: "https://twitter.com/marcuschenlit",
    querytracker: "https://querytracker.net/agent/marcus-chen",
    sales: "30+ deals in sci-fi/fantasy",
    dont_send: "No urban fantasy with vampires/werewolves",
    extra_interest: "Particularly interested in climate fiction",
    agent_id: "mc-002",
    status: "Open to queries",
  },
  {
    columnId: "agents-to-research",
    prepQueryLetterDone: false,
    id: "card-3",
    name: "Elena Rodriguez",
    agency: "Bright Horizons Agency",
    bio: "Elena Rodriguez specializes in middle grade and young adult fiction. She loves stories that capture the intensity of growing up and finding your place in the world.",
    genres: "Middle Grade, Young Adult, Children's Fiction",
    favorites: "Coming-of-age stories, found family, adventure, humor",
    submission_req: "Query letter, 1-page synopsis, first 50 pages",
    score: 78,
    normalized_score: 3.9,
    aala_member: "No",
    email: "elena@brighthorizonsagency.com",
    website: "https://brighthorizonsagency.com/elena",
    location: "Austin, TX",
    clients: "Sophie Martinez, David Park",
    twitter_handle: "@elenarodriguezya",
    twitter_url: "https://twitter.com/elenarodriguezya",
    querytracker: "https://querytracker.net/agent/elena-rodriguez",
    querymanager: "https://querymanager.com/query/elenarodriguez",
    sales: "20+ MG/YA deals",
    dont_send: "No adult fiction, no picture books",
    negatives: "Closed periodically for catch-up",
    extra_interest: "Seeking Latine voices and stories",
    agent_id: "er-003",
    status: "Open to queries",
  },
  {
    columnId: "submitted-query",
    prepQueryLetterDone: true,
    id: "card-4",
    name: "William Brooks",
    agency: "Heritage Literary Management",
    bio: "William Brooks has 20 years of experience in literary fiction and narrative nonfiction. He values beautiful prose and stories that illuminate the human condition.",
    genres: "Literary Fiction, Narrative Nonfiction, Memoir",
    favorites: "Literary prose, historical settings, family sagas, cultural exploration",
    submission_req: "Query letter only, no attachments",
    score: 88,
    normalized_score: 4.4,
    aala_member: "Yes",
    email: "wbrooks@heritageliterary.com",
    website: "https://heritageliterary.com/william-brooks",
    location: "Boston, MA",
    clients: "Margaret Atwood (not really), James McBride (not really)",
    twitter_handle: "@wbrookslit",
    twitter_url: "https://twitter.com/wbrookslit",
    querytracker: "https://querytracker.net/agent/william-brooks",
    pubmarketplace: "https://pubmarketplace.com/agent/william-brooks",
    sales: "100+ career deals, multiple NYT bestsellers",
    dont_send: "No genre fiction, no self-help",
    extra_interest: "Open to debut literary fiction with strong voice",
    agent_id: "wb-004",
    status: "Open to queries",
  },
  {
    columnId: "pages-requested",
    prepQueryLetterDone: true,
    id: "card-5",
    name: "Jennifer Park",
    agency: "Momentum Literary",
    bio: "Jennifer Park is building a list focused on thriller, suspense, and mystery. She loves page-turners with unexpected twists and complex characters.",
    genres: "Thriller, Suspense, Mystery, Crime Fiction",
    favorites: "Psychological thrillers, domestic suspense, unreliable narrators, procedurals",
    submission_req: "Query letter, synopsis, first 10,000 words",
    score: 95,
    normalized_score: 4.75,
    aala_member: "Yes",
    email: "jennifer@momentumlit.com",
    website: "https://momentumlit.com/jennifer-park",
    location: "Chicago, IL",
    clients: "Lisa Nguyen, Mark Thompson, Rachel Green",
    twitter_handle: "@jenparkbooks",
    twitter_url: "https://twitter.com/jenparkbooks",
    querytracker: "https://querytracker.net/agent/jennifer-park",
    querymanager: "https://querymanager.com/query/jenniferpark",
    sales: "40+ thriller/mystery deals",
    dont_send: "No cozy mysteries, no paranormal",
    extra_interest: "Looking for international settings and diverse protagonists",
    extra_links: "https://momentumlit.com/wishlist",
    agent_id: "jp-005",
    status: "Open to queries",
  },
  {
    columnId: "rejected",
    prepQueryLetterDone: true,
    id: "card-6",
    name: "David Miller",
    agency: "Westside Literary",
    bio: "David Miller represents romance and women's fiction. He's passionate about love stories in all their forms and believes in the power of happily ever after.",
    genres: "Romance, Women's Fiction, Romantic Comedy",
    favorites: "Contemporary romance, historical romance, rom-coms, women's fiction with romantic elements",
    submission_req: "Query letter, first chapter",
    score: 72,
    normalized_score: 3.6,
    aala_member: "No",
    email: "david@westsidelit.com",
    website: "https://westsidelit.com/david-miller",
    location: "Los Angeles, CA",
    clients: "Amanda Rose, Chris Taylor",
    twitter_handle: "@davidmillerlit",
    twitter_url: "https://twitter.com/davidmillerlit",
    querytracker: "https://querytracker.net/agent/david-miller",
    sales: "25+ romance deals",
    dont_send: "No inspirational romance, no erotica",
    negatives: "New to agenting, smaller client list",
    extra_interest: "Seeking fresh rom-com voices",
    agent_id: "dm-006",
    status: "Open to queries",
  },
];

export function KanbanBoard() {
  const [cards, setCards] = useState<KanbanCardData[]>(INITIAL_CARDS);
  const [activeCard, setActiveCard] = useState<KanbanCardData | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCardData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleCardClick = (card: KanbanCardData) => {
    setSelectedCard(card);
  };

  const handleTogglePrepQuery = (cardId: string) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId
          ? { ...card, prepQueryLetterDone: !card.prepQueryLetterDone }
          : card
      )
    );
  };

  const getCardsForColumn = (columnId: string) => {
    return cards.filter((card) => card.columnId === columnId);
  };

  const findColumnByCardId = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    return card?.columnId;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find((c) => c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which columns the active and over items belong to
    const activeColumnId = findColumnByCardId(activeId);

    // Check if we're over a column or a card
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    const overColumnId = isOverColumn ? overId : findColumnByCardId(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    // Move card to new column
    setCards((prevCards) => {
      return prevCards.map((card) => {
        if (card.id === activeId) {
          return { ...card, columnId: overColumnId };
        }
        return card;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumnId = findColumnByCardId(activeId);
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    const overColumnId = isOverColumn ? overId : findColumnByCardId(overId);

    if (!activeColumnId || !overColumnId) return;

    // If in the same column, reorder
    if (activeColumnId === overColumnId && !isOverColumn) {
      setCards((prevCards) => {
        const columnCards = prevCards.filter((c) => c.columnId === activeColumnId);
        const otherCards = prevCards.filter((c) => c.columnId !== activeColumnId);

        const activeIndex = columnCards.findIndex((c) => c.id === activeId);
        const overIndex = columnCards.findIndex((c) => c.id === overId);

        const reorderedColumnCards = arrayMove(columnCards, activeIndex, overIndex);

        return [...otherCards, ...reorderedColumnCards];
      });
    }
  };

  return (
    <div className="overflow-x-auto pb-4 min-h-[80vh]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 min-w-fit p-4">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={getCardsForColumn(column.id)}
              onCardClick={handleCardClick}
              onTogglePrepQuery={handleTogglePrepQuery}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <KanbanCard card={activeCard} isDragOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Agent Detail Dialog */}
      <KanbanDialog
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        onTogglePrepQuery={handleTogglePrepQuery}
      />
    </div>
  );
}

export default KanbanBoard;
