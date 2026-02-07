import { LayoutDashboard } from "lucide-react";
import { KanbanBoard } from "./components/kanban-board";
import { KanbanMobile } from "./components/kanban-mobile";


export default function QueryDashboardPage() {

    return (
        <div className="md:py-6 py-0">
            <h1 className="text-xl md:text-[32px] font-semibold leading-tight ml-4 mb-4 flex items-center gap-4 text-accent">
                <LayoutDashboard className="w-10 h-10" />
                Query Dashboard
            </h1>
            {/* Desktop view */}
            <div className="hidden md:block">
                <KanbanBoard />
            </div>
            {/* Mobile view */}
            <div className="md:hidden flex flex-col overflow-hidden h-[calc(100vh-180px)]">
                <KanbanMobile />
            </div>
        </div>
    );
}
