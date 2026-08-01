import type { EquipmentSlot, ItemEquipmentSlot, ItemInstance } from "@nightfall/contracts";

function glyphKind(item: ItemInstance): ItemEquipmentSlot | "scroll" | "supply" | "gear" {
  if (item.itemKind === "scroll") return "scroll";
  if (item.itemKind === "supply") return "supply";
  return item.mechanicSnapshot.equipmentSlot ?? "gear";
}

export function ItemGlyph({ item, large = false }: { item: ItemInstance; large?: boolean }) {
  const kind = glyphKind(item);
  return <span className={`item-glyph is-${kind}${large ? " is-large" : ""}`} aria-hidden="true">
    {kind === "mainHand" && <svg viewBox="0 0 24 24"><path d="M4 20 L14 4 L17 6 L7 22 Z" fill="currentColor" opacity=".85" /><path d="M14 4 L20 10 L17 13 L11 7 Z" fill="currentColor" opacity=".45" /></svg>}
    {kind === "offHand" && <svg viewBox="0 0 24 24"><path d="M6 18 V8 H18 V18 Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M9 8 V5 H15 V8" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>}
    {kind === "head" && <svg viewBox="0 0 24 24"><path d="M5 14 C5 8 8 5 12 5 C16 5 19 8 19 14 V18 H5 Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M4 18 H20" stroke="currentColor" strokeWidth="1.8" /></svg>}
    {kind === "body" && <svg viewBox="0 0 24 24"><path d="M8 4 H16 V20 H8 Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M6 9 H18 M6 15 H18" stroke="currentColor" strokeWidth="1.2" opacity=".6" /></svg>}
    {kind === "gloves" && <svg viewBox="0 0 24 24"><path d="M7 12 V7 C7 5 8 4 10 4 C11 4 12 5 12 6 V12 M12 12 V6 C12 4 13 3 15 3 C17 3 18 5 18 7 V14 H7 V12" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>}
    {kind === "legs" && <svg viewBox="0 0 24 24"><path d="M9 4 H15 V11 L17 20 H13 L12 11 L11 20 H7 L9 11 Z" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>}
    {kind === "feet" && <svg viewBox="0 0 24 24"><path d="M6 14 H18 V18 C18 19 17 20 15 20 H9 C7 20 6 19 6 18 Z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M8 14 V11 H11 V14 M11 14 V10 H14 V14 M14 14 V11 H17 V14" stroke="currentColor" strokeWidth="1.2" /></svg>}
    {kind === "relic" && <svg viewBox="0 0 24 24"><path d="M12 3 L15 10 H22 L16 14 L18 21 L12 17 L6 21 L8 14 L2 10 H9 Z" fill="currentColor" opacity=".75" /></svg>}
    {kind === "scroll" && <svg viewBox="0 0 24 24"><path d="M7 4 H17 C18 4 19 5 19 6 V20 C19 21 18 22 17 22 H7 C6 22 5 21 5 20 V6 C5 5 6 4 7 4 Z" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M8 8 H16 M8 12 H14" stroke="currentColor" strokeWidth="1.2" /></svg>}
    {kind === "supply" && <svg viewBox="0 0 24 24"><path d="M9 3 H15 L17 7 V19 C17 20 16 21 15 21 H9 C8 21 7 20 7 19 V7 Z" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M10 11 H14" stroke="currentColor" strokeWidth="1.4" /></svg>}
    {kind === "gear" && <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="2.5" fill="currentColor" opacity=".55" /></svg>}
  </span>;
}

export function SlotGlyph({ slot }: { slot: ItemEquipmentSlot | EquipmentSlot }) {
  const normalized = slot === "relic1" || slot === "relic2" ? "relic" : slot;
  const fake = {
    itemKind: "equipment",
    mechanicSnapshot: { equipmentSlot: normalized, modifiers: [] }
  } as unknown as ItemInstance;
  return <ItemGlyph item={fake} />;
}
