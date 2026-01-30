'use client';

import { useAuth, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, orderBy, query, updateDoc, where, Timestamp } from 'firebase/firestore';
import { Bell, Calendar, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

type Reminder = {
  id: string;
  task: string;
  dueDate: Timestamp;
  category: 'Crops' | 'Animals' | 'General';
  priority: 'High' | 'Medium' | 'Low';
  isCompleted: boolean;
};

export default function RemindersPage() {
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const remindersQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'reminders'),
      where('isCompleted', '==', false),
      orderBy('dueDate', 'asc')
    );
  }, [user, firestore]);

  const { data: reminders, isLoading } = useCollection<Reminder>(remindersQuery);

  const handleMarkAsDone = async (reminderId: string) => {
    if (!user || !firestore) return;
    const reminderRef = doc(firestore, 'users', user.uid, 'reminders', reminderId);
    try {
      await updateDoc(reminderRef, { isCompleted: true });
      toast({
        title: 'Task Completed!',
        description: 'The reminder has been marked as done.',
      });
    } catch (error) {
      console.error('Error completing reminder:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the reminder. Please try again.',
      });
    }
  };
  
  const getDueDateString = (dueDate: Date) => {
    const now = new Date();
    if (dueDate < now) {
      return `${formatDistanceToNow(dueDate, { addSuffix: true })} (Overdue)`;
    }
    return formatDistanceToNow(dueDate, { addSuffix: true });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold font-headline tracking-tight">
          <Bell className="h-8 w-8 text-primary"/>
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
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : reminders && reminders.length > 0 ? (
              reminders.map((reminder) => (
                <div key={reminder.id} className="flex flex-col sm:flex-row items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-card">
                  <div className="mt-1">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{reminder.task}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4"/>
                            <span className={reminder.dueDate.toDate() < new Date() ? 'text-destructive font-semibold' : ''}>
                              {getDueDateString(reminder.dueDate.toDate())} on {format(reminder.dueDate.toDate(), 'PPP')}
                            </span>
                        </div>
                        <Badge variant="outline">{reminder.category}</Badge>
                        <Badge 
                           variant={reminder.priority === 'High' ? 'destructive' : reminder.priority === 'Medium' ? 'secondary' : 'outline'}
                        >
                            {reminder.priority} Priority
                        </Badge>
                    </div>
                  </div>
                  <div className="ml-auto mt-2 sm:mt-0">
                    <Button onClick={() => handleMarkAsDone(reminder.id)} size="sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Mark as Done</span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                <p>No upcoming reminders. Your farm is all caught up!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
