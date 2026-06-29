"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { Division } from "@/lib/divisions";
import { cn } from "@/lib/cn";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const divisionTabClass = cn(
  "h-full flex-1 rounded-xl px-4 py-2 text-sm font-medium text-muted shadow-none transition-all",
  "data-[active]:bg-surface data-[active]:font-semibold data-[active]:text-foreground data-[active]:shadow-sm",
);

export function parseDivisionParam(value: string | null): Division {
  return value === "elite" ? "elite" : "strider";
}

export function DivisionSubTabs({
  defaultDivision = "strider",
}: {
  defaultDivision?: Division;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeDivision = parseDivisionParam(
    searchParams.get("division") ?? defaultDivision,
  );

  function selectDivision(division: Division) {
    const params = new URLSearchParams(searchParams.toString());
    if (division === "strider") {
      params.delete("division");
    } else {
      params.set("division", division);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <Tabs
      onValueChange={(value) => selectDivision(parseDivisionParam(value))}
      value={activeDivision}
    >
      <TabsList className="grid h-11 w-full grid-cols-2 rounded-2xl bg-black/[0.06] p-1">
        <TabsTrigger className={divisionTabClass} value="strider">
          Striders
        </TabsTrigger>
        <TabsTrigger className={divisionTabClass} value="elite">
          Elite
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function useActiveDivision(defaultDivision: Division = "strider"): Division {
  const searchParams = useSearchParams();
  return parseDivisionParam(searchParams.get("division") ?? defaultDivision);
}
