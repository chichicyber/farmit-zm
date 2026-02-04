'use client';

import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useAuth,
  useDoc,
} from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PlusCircle, Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';
import { useLanguage } from '@/contexts/language-context';

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'farmer' | 'student' | 'user';
};

type CurrentUser = {
  role: string;
};

const addUserSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['farmer', 'student', 'user', 'admin']),
});

const userRoles = ['farmer', 'student', 'user', 'admin'];
const filterRoles = ['All', ...userRoles];

export default function AdminPage() {
  const { t } = useLanguage();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  const addUserForm = useForm<z.infer<typeof addUserSchema>>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user',
    },
  });

  const onAddUserSubmit = async (values: z.infer<typeof addUserSchema>) => {
    const getSecondaryApp = () => {
      const existingApp = getApps().find(
        (app) => app.name === 'secondary-user-creation'
      );
      if (existingApp) {
        return existingApp;
      }
      return initializeApp(firebaseConfig, 'secondary-user-creation');
    };

    const secondaryApp = getSecondaryApp();
    const tempAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth,
        values.email,
        values.password
      );
      const newUser = userCredential.user;

      if (firestore) {
        await setDoc(doc(firestore, 'users', newUser.uid), {
          uid: newUser.uid,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: values.role,
        });

        toast({
          title: t('admin.userCreatedToast.title'),
          description: t('admin.userCreatedToast.description', {
            email: values.email,
          }),
        });
        addUserForm.reset();
        setIsAddUserDialogOpen(false);
      } else {
        throw new Error('Firestore is not available.');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        variant: 'destructive',
        title: t('admin.userCreateErrorToast.title'),
        description:
          error.code === 'auth/email-already-in-use'
            ? t('admin.userCreateErrorToast.emailInUse')
            : error.message || t('admin.userCreateErrorToast.unknownError'),
      });
    }
  };

  const currentUserRef = useMemoFirebase(() => {
    if (!auth.currentUser?.uid || !firestore) return null;
    return doc(firestore, 'users', auth.currentUser.uid);
  }, [auth.currentUser, firestore]);

  const { data: currentUser, isLoading: isAuthLoading } =
    useDoc<CurrentUser>(currentUserRef);

  const isAdmin =
    currentUser?.role === 'admin' ||
    auth.currentUser?.email === 'henrychemba@gmail.com';

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [isAdmin, isAuthLoading, router]);

  const usersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const filteredUsers = users?.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    const roleMatch =
      filterRole === 'All' ||
      user.role === filterRole ||
      (filterRole === 'admin' && user.email === 'henrychemba@gmail.com');

    const searchMatch =
      fullName.includes(searchLower) || email.includes(searchLower);

    return roleMatch && searchMatch;
  });

  if (isAuthLoading || !isAdmin) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold font-headline tracking-tight">
            <Shield className="h-8 w-8 text-primary" />{' '}
            {t('admin.title')}
          </h1>
          <p className="text-muted-foreground">{t('admin.description')}</p>
        </div>

        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle /> {t('admin.addNewUserButton')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('admin.addUserDialog.title')}</DialogTitle>
              <DialogDescription>
                {t('admin.addUserDialog.description')}
              </DialogDescription>
            </DialogHeader>
            <Form {...addUserForm}>
              <form
                onSubmit={addUserForm.handleSubmit(onAddUserSubmit)}
                className="space-y-4 py-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addUserForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.addUserDialog.firstNameLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              'admin.addUserDialog.firstNamePlaceholder'
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={addUserForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.addUserDialog.lastNameLabel')}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t(
                              'admin.addUserDialog.lastNamePlaceholder'
                            )}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={addUserForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.addUserDialog.emailLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t(
                            'admin.addUserDialog.emailPlaceholder'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.addUserDialog.passwordLabel')}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addUserForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.addUserDialog.roleLabel')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                'admin.addUserDialog.rolePlaceholder'
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userRoles.map((role) => (
                            <SelectItem
                              key={role}
                              value={role}
                              className="capitalize"
                            >
                              {t(`roles.${role}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      {t('common.cancel')}
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={addUserForm.formState.isSubmitting}
                  >
                    {addUserForm.formState.isSubmitting
                      ? t('admin.addUserDialog.creatingButton')
                      : t('admin.addUserDialog.createUserButton')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('admin.allUsersCard.title')}</CardTitle>
              <CardDescription>
                {t('admin.allUsersCard.description')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin.allUsersCard.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue
                    placeholder={t('admin.allUsersCard.filterPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filterRoles.map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className="capitalize"
                    >
                      {role === 'All' ? t('common.all') : t(`roles.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.usersTable.nameHeader')}</TableHead>
                  <TableHead>{t('admin.usersTable.emailHeader')}</TableHead>
                  <TableHead>{t('admin.usersTable.roleHeader')}</TableHead>
                  <TableHead className="text-right">
                    {t('admin.usersTable.actionsHeader')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  </>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const displayRole =
                      user.email === 'henrychemba@gmail.com'
                        ? 'admin'
                        : user.role;
                    return (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              displayRole === 'admin'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {t(`roles.${displayRole}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/users/${user.id}`}>
                              {t('admin.usersTable.viewAccountButton')}
                            </Link>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="ml-2"
                          >
                            {t('admin.usersTable.editButton')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {t('admin.usersTable.noUsersFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    