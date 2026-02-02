import { KanbanBoard } from "./components/kanban-board";

export default function QueryDashboardPage() {
    return (
        <div className="py-6">
            <h1 className="text-2xl font-bold text-accent px-4 mb-0">
                Query Dashboard
            </h1>
            <KanbanBoard />
        </div>
    );
}
