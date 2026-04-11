import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePageTitle } from "@/hooks/use-page-title";
import { Separator } from "@/components/ui/separator";
import { NotificationsDropdown } from "./notifications-dropdown";

export function SiteHeader() {
  const { title } = usePageTitle();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />
      <h1 className="text-sm font-bold tracking-tight uppercase text-muted-foreground/80">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <NotificationsDropdown />
        <ThemeToggle />
      </div>
    </header>
  );
}
