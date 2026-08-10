import {
  BookOpen,
  Braces,
  Database,
  FlaskConical,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Library,
  ListChecks,
  Rocket,
  ScrollText,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    title: "Learn",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Your training overview and next steps",
      },
      {
        href: "/learn",
        label: "Curriculum",
        icon: BookOpen,
        description: "Modules and lessons",
      },
      {
        href: "/challenges",
        label: "Challenges",
        icon: Trophy,
        description: "Coding challenges with hints and solutions",
      },
      {
        href: "/capstone",
        label: "Capstone",
        icon: GraduationCap,
        description: "Build the ShopEasy automation framework",
      },
    ],
  },
  {
    title: "Practice",
    items: [
      {
        href: "/playground",
        label: "Playwright Playground",
        icon: Braces,
        description: "Write Playwright code and watch a simulated browser",
      },
      {
        href: "/practice/registration",
        label: "Registration App",
        icon: ListChecks,
        description: "Dynamic-attribute form for locator practice",
      },
      {
        href: "/practice/shop",
        label: "ShopEasy",
        icon: Rocket,
        description: "Full e-commerce app for E2E practice",
      },
      {
        href: "/practice/sql",
        label: "SQL Lab",
        icon: Database,
        description: "Query sample QA data with an in-browser SQL engine",
      },
    ],
  },
  {
    title: "Reference",
    items: [
      {
        href: "/cheat-sheet",
        label: "Cheat Sheets",
        icon: ScrollText,
        description: "Playwright, locators, waiting, SQL and more",
      },
      {
        href: "/api-reference",
        label: "API Reference",
        icon: Library,
        description: "Page, Locator, Route, Expect and friends",
      },
      {
        href: "/which-api",
        label: "Which API?",
        icon: FlaskConical,
        description: "Decision helper for picking the right method",
      },
      {
        href: "/glossary",
        label: "Glossary",
        icon: BookOpen,
        description: "QA automation vocabulary",
      },
      {
        href: "/progress",
        label: "Progress",
        icon: Gauge,
        description: "Track completion across the platform",
      },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((g) => g.items);
