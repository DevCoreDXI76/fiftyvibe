type AdSlotVariant = "result" | "content";

const HEIGHT_BY_VARIANT: Record<AdSlotVariant, string> = {
  result: "h-[250px]",
  content: "h-[120px]",
};

export function AdSlot({ variant }: { variant: AdSlotVariant }) {
  return (
    <div
      className={`flex w-full items-center justify-center rounded border border-dashed border-steel/50 bg-steel/5 text-sm text-navy/50 ${HEIGHT_BY_VARIANT[variant]}`}
    >
      광고 영역
    </div>
  );
}
