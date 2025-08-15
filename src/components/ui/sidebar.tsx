import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SidebarTriggerProps = React.ComponentProps<typeof Button>;

export function SidebarTrigger({ ...props }: SidebarTriggerProps) {
  return (
    <Button variant="ghost" size="icon" {...props}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
