import { LayoutDashboard } from "lucide-react";
import { KanbanBoard } from "./components/kanban-board";

export default function QueryDashboardPage() {
    return (
        <div className="py-6">
            <h1 className="text-4xl md:text-[32px] font-semibold leading-tight ml-4 flex items-center gap-4 text-accent">
                <LayoutDashboard className="w-10 h-10" />
                Query Dashboard
            </h1>
            <KanbanBoard />
        </div>
    );
}
