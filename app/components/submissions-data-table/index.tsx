"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Eye,
  Mail,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { SubmissionDetailDialog } from "./submission-detail-dialog";

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface SubmissionsDataTableProps {
  data: ContactSubmission[];
  isLoading?: boolean;
  onDelete?: (ids: string[]) => Promise<void>;
}

export const SubmissionsDataTable = ({
  data,
  isLoading,
  onDelete,
}: SubmissionsDataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);

  const columns: ColumnDef<ContactSubmission>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Sélectionner tout"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner la ligne"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Nom",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="font-semibold text-white">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-gray-200">
          <Mail className="w-4 h-4 text-red-600 shrink-0" />
          <span className="lowercase truncate">{row.getValue("email")}</span>
        </div>
      ),
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const message = row.getValue("message") as string;
        return (
          <div className="max-w-md text-gray-200 truncate" title={message}>
            {message.replace(/\s+/g, " ")}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <div className="text-sm text-gray-300 whitespace-nowrap">
            {formatDate(date)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSubmission(row.original);
          }}
          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-600/10 transition-colors"
          aria-label="Voir le détail"
          title="Voir le détail"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map(
    (row) => (row.original as ContactSubmission).id,
  );

  const handleDelete = async () => {
    if (!onDelete || selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await onDelete(selectedIds);
      setRowSelection({});
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete([id]);
      setSelectedSubmission(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-300">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md border border-red-600/30 bg-gray-900/80 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-red-600/20">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-gray-200 font-semibold"
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer items-center justify-between gap-2 select-none hover:text-red-600 transition-colors",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          <span className="truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>
                          {{
                            asc: (
                              <ChevronUpIcon
                                className="shrink-0 text-red-600"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDownIcon
                                className="shrink-0 text-red-600"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-red-600/20 hover:bg-gray-800/70 data-[state=selected]:bg-gray-800/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-white">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-300"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && onDelete && (
          <motion.div
            key="action-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-3rem)] max-w-fit -translate-x-1/2 flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-red-600/30 bg-gray-900/95 backdrop-blur-sm shadow-lg"
          >
            <span className="text-sm text-gray-200">
              {selectedIds.length} message{selectedIds.length > 1 ? "s" : ""}{" "}
              sélectionné{selectedIds.length > 1 ? "s" : ""}
            </span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <SubmissionDetailDialog
        submission={selectedSubmission}
        isDeleting={isDeleting}
        onClose={() => setSelectedSubmission(null)}
        onDelete={onDelete ? handleDeleteSingle : undefined}
      />

      {table.getRowModel().rows?.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-300">
            {table.getFilteredSelectedRowModel().rows.length} sur{" "}
            {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-4 py-2 bg-gray-900 border border-red-600/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-600/40 transition-colors text-white"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-gray-300 text-sm">
              Page {table.getState().pagination.pageIndex + 1} sur{" "}
              {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-4 py-2 bg-gray-900 border border-red-600/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-600/40 transition-colors text-white"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
