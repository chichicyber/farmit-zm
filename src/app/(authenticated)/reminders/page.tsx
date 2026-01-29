import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Calendar, CheckCircle } from 'lucide-react';

type Reminder = {
  id: string;
  title: string;
  dueDate: string;
  category: 'Crops' | 'Animals' | 'General';
  priority: 'High' | 'Medium' | 'Low';
};

const mockReminders: Reminder[] = [
  {
    id: '1',
    title: 'Apply top-dressing fertilizer to Maize Field A',
    dueDate: 'In 2 days',
    category: 'Crops',
    priority: 'High',
  },
  {
    id: '2',
    title: 'Vaccinate cattle herd for ECF',
    dueDate: 'In 5 days',
    category: 'Animals',
    priority: 'High',
  },
  {
    id: '3',
    title: 'Scout Soyabeans Plot 3 for pests',
    dueDate: 'In 1 week',
    category: 'Crops',
    priority: 'Medium',
  },
  {
    id: '4',
    title: 'Order new batch of chick feed',
    dueDate: 'In 1 week',
    category: 'General',
    priority: 'Low',
  },
   {
    id: '5',
    title: 'Check and clean poultry waterers',
    dueDate: 'Tomorrow',
    category: 'Animals',
    priority: 'Medium',
  },
];

export default function RemindersPage() {
  const upcomingReminders = mockReminders.sort((a, b) => {
    // A more robust sorting would parse the dueDate
    if (a.dueDate.includes('Tomorrow')) return -1;
    if (b.dueDate.includes('Tomorrow')) return 1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Smart Reminders
        </h1>
        <p className="text-muted-foreground">
          Automatically generated tasks to keep your farm on track.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription>
            Here are your pending activities, prioritized for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingReminders.length > 0 ? (
              upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-card">
                  <div className="mt-1">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{reminder.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4"/>
                            <span>{reminder.dueDate}</span>
                        </div>
                        <Badge variant="outline">{reminder.category}</Badge>
                        <Badge 
                           variant={reminder.priority === 'High' ? 'destructive' : 'secondary'}
                        >
                            {reminder.priority} Priority
                        </Badge>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary/10">
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark as Done</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>No upcoming reminders. Your farm is all caught up!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
