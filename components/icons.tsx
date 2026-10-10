import {
  AirVent,
  Bath,
  BedDouble,
  Bus,
  Car,
  CigaretteOff,
  CircleHelp,
  Coffee,
  ConciergeBell,
  Fence,
  Flame,
  Gamepad2,
  Gift,
  Heart,
  House,
  Leaf,
  LogIn,
  LogOut,
  Maximize,
  Mountain,
  PawPrint,
  Presentation,
  Refrigerator,
  ShoppingBasket,
  ShowerHead,
  SquareParking,
  Sun,
  TrainFront,
  Trees,
  Tv,
  Users,
  Utensils,
  Waves,
  Wifi,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/*
 * One icon set, one weight (brief: 24px grid, 1.5px stroke, round ends, no fills).
 * Content files refer to icons by these names. To offer a new icon to the
 * content files, add it here; https://lucide.dev lists everything available.
 */
export const iconMap = {
  ac: AirVent,
  balcony: Fence,
  basket: ShoppingBasket,
  bath: Bath,
  bed: BedDouble,
  bell: ConciergeBell,
  board: Presentation,
  car: Car,
  coffee: Coffee,
  flame: Flame,
  food: Utensils,
  fridge: Refrigerator,
  game: Gamepad2,
  gift: Gift,
  heart: Heart,
  help: CircleHelp,
  home: House,
  leaf: Leaf,
  login: LogIn,
  logout: LogOut,
  mountain: Mountain,
  noSmoking: CigaretteOff,
  parking: SquareParking,
  paw: PawPrint,
  pool: Waves,
  shower: ShowerHead,
  size: Maximize,
  sun: Sun,
  train: TrainFront,
  trees: Trees,
  tv: Tv,
  users: Users,
  van: Bus,
  wifi: Wifi,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;
export const iconNames = Object.keys(iconMap) as [IconName, ...IconName[]];

type IconProps = Omit<LucideProps, "ref"> & { name: IconName };

export function Icon({ name, size = 24, ...rest }: IconProps) {
  const Cmp = iconMap[name];
  return <Cmp size={size} strokeWidth={1.5} aria-hidden="true" {...rest} />;
}

type SvgProps = { size?: number; className?: string };

/* Line-style brand icons drawn on the same 24px grid (lucide has no brand icons). */
export function WhatsAppIcon({ size = 20, className }: SvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2L9 9.5z" />
    </svg>
  );
}

export function InstagramIcon({ size = 20, className }: SvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}
