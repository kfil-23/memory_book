import { Info, Star } from "lucide-react";
import type { SectionIcon } from "../types";

const IMAGE_ICON_MAP: Partial<Record<SectionIcon, string>> = {
  FileText: "icons/main-info.svg",
  Shield: "icons/service.svg",
  Medal: "icons/awards.svg",
  Folder: "icons/archive.svg",
};

const LUCIDE_ICON_MAP = { Info, Star };

export function SectionIconRenderer({
  icon,
  size = 40,
  className,
}: {
  icon: SectionIcon;
  size?: number;
  className?: string;
}) {
  const imageSrc = IMAGE_ICON_MAP[icon];
  if (imageSrc) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}${imageSrc}`}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={className}
      />
    );
  }

  const Icon = LUCIDE_ICON_MAP[icon as keyof typeof LUCIDE_ICON_MAP] ?? Star;
  return (
    <Icon
      size={size}
      strokeWidth={1.75}
      aria-hidden="true"
      className={className}
    />
  );
}
