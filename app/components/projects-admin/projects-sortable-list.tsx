"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableProjectCard } from "./sortable-project-card";
import type { AdminProject } from "./types";

interface ProjectsSortableListProps {
  projects: AdminProject[];
  onReorder: (projects: AdminProject[]) => void;
  onEdit: (project: AdminProject) => void;
  onDelete: (project: AdminProject) => void;
}

export function ProjectsSortableList({
  projects,
  onReorder,
  onEdit,
  onDelete,
}: ProjectsSortableListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(projects, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={projects.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {projects.map((project, index) => (
            <SortableProjectCard
              key={project.id}
              project={project}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
