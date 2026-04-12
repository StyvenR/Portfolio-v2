"use client";

import { useEffect, useState } from "react";

/**
 * Calcule le nombre de colonnes d'un damier en fonction de la largeur ecran.
 */
export function useCheckerboardColumns(cellSize: number): number {
  const [columns, setColumns] = useState(20);

  useEffect(() => {
    const calculate = () => {
      setColumns(Math.ceil(window.innerWidth / cellSize) + 1);
    };

    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [cellSize]);

  return columns;
}
