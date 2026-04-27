import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Bell, AlertCircle, Clock, Plus } from 'lucide-react';
import { Activity } from '@/src/types';
import { db } from '@/src/lib/firebase';
import { collectionGroup, onSnapshot, query, orderBy, where, doc, collection } from 'firebase/firestore';
import { format, isAfter, isBefore, addDays, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';

const QUOTES = [
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
  "No dejes que lo que no puedes hacer interfiera con lo que puedes hacer.",
  "La disciplina es el puente entre las metas y los logros.",
  "Cree en ti mismo y en todo lo que eres.",
  "El aprendizaje es un tesoro que seguirá a su dueño a todas partes.",
  "La perseverancia puede transformar el fracaso en un logro extraordinario.",
  "Tu talento determina lo que puedes hacer. Tu motivación determina cuánto estás dispuesto a hacer."
];

import { AddActivityDialog } from './AddActivityDialog';

interface MasterCalendarProps {
  userId: string;
}

export function MasterCalendar({ userId }: MasterCalendarProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userName, setUserName] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);
  const [now, setNow] = useState(new Date());
  const [customQuotes, setCustomQuotes] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;
    const path = `users/${userId}/quotes`;
    const unsubQuotes = onSnapshot(collection(db, path), (snap) => {
      setCustomQuotes(snap.docs.map(doc => doc.data().text));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubQuotes();
  }, [userId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const userPath = `users/${userId}`;
    const unsubUser = onSnapshot(doc(db, 'users', userId), (snap) => {
      if (snap.exists()) setUserName(snap.data().displayName?.split(' ')[0] || 'Estudiante');
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, userPath);
    });

    const q = query(
      collectionGroup(db, 'activities'), 
      where('userId', '==', userId),
      orderBy('dueDate', 'asc')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activities (collectionGroup)');
    });

    return () => {
      unsubUser();
      unsub();
    };
  }, [userId]);

  const getGreeting = () => {
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
    return `${greeting}, ${userName}`;
  };

  const getDailyQuote = () => {
    const quotesToUse = customQuotes.length > 0 ? customQuotes : QUOTES;
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return quotesToUse[dayOfYear % quotesToUse.length];
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const startDay = getDay(startOfMonth(currentMonth));
  const blanks = Array(startDay === 0 ? 6 : startDay - 1).fill(null);

  const allEvents = [
    ...activities.map(a => ({
      date: new Date(a.dueDate),
      title: a.title,
      type: a.isExam ? 'exam' : 'activity',
      career: a.careerId
    }))
  ];

  const alerts = activities.filter(a => 
    !a.completed &&
    (a.priority === 'high' || a.priority === 'medium') && 
    isAfter(new Date(a.dueDate), startOfDay(now)) &&
    isBefore(new Date(a.dueDate), addDays(now, 7)) // Show alerts for the next week
  );

  const notifications = activities.filter(a => 
    !a.completed &&
    isAfter(new Date(a.dueDate), startOfDay(now)) &&
    isBefore(new Date(a.dueDate), addDays(now, 7)) // 1 week before
  );

  return (
    <div className="flex flex-col gap-6 pb-24 px-6 pt-8">
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h2 className="text-secondary font-bold text-[10px] uppercase tracking-[0.2em]">{getGreeting()}</h2>
          <div className="border-l-2 border-[#bb86fc]/30 pl-3 mt-1 flex flex-col gap-1">
            <p className="text-muted-foreground text-[11px] italic leading-relaxed opacity-70 text-left max-w-[280px]">
              "{getDailyQuote()}"
            </p>
            <div className="flex flex-col items-start mt-1">
              <span className="text-[12px] font-black tracking-widest text-foreground uppercase">{format(now, 'hh:mm a')}</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{format(now, "eeee d 'de' MMMM", { locale: es })}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end opacity-0 pointer-events-none absolute right-0">
          <span className="text-lg font-black tracking-tighter text-foreground uppercase">{format(now, 'hh:mm a')}</span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{format(now, "eeee d 'de' MMMM", { locale: es })}</span>
        </div>
      </header>

      <div className="grid gap-6">
        <section className={cn(
          "bg-card border border-border rounded-[2rem] overflow-hidden transition-all duration-500",
          isExpanded ? "fixed inset-0 z-[60] m-0 rounded-none p-6 overflow-y-auto" : "p-5"
        )}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-primary" size={18} />
              <span className="text-[11px] font-black tracking-[0.1em] text-foreground uppercase">Calendario</span>
            </div>
            <div className="flex items-center gap-3">
              <AddActivityDialog 
                userId={userId} 
                trigger={
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10">
                    <Plus size={16} />
                  </Button>
                }
              />
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-7 text-[9px] font-bold uppercase tracking-widest">
                {isExpanded ? 'Cerrar' : 'Ampliar'}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
              <div key={d} className="text-center text-[9px] font-black text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => <div key={`blank-${i}`} />)}
            {daysInMonth.map(day => {
              const dayEvents = allEvents.filter(e => isSameDay(e.date, day));
              const isToday = isSameDay(day, now);
              
              return (
                <AddActivityDialog
                  key={day.toString()}
                  userId={userId}
                  defaultDate={format(day, "yyyy-MM-dd'T'HH:mm")}
                  nativeButton={false}
                  trigger={
                    <div className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-lg relative transition-colors cursor-pointer",
                      isToday ? "bg-primary text-background" : "hover:bg-muted/30"
                    )}>
                      <span className="text-[11px] font-bold">{format(day, 'd')}</span>
                      <div className="flex gap-0.5 mt-0.5">
                        {dayEvents.slice(0, 3).map((e, i) => (
                          <div key={i} className={cn(
                            "w-1 h-1 rounded-full",
                            e.type === 'exam' ? "bg-destructive" : e.type === 'google' ? "bg-secondary" : "bg-primary"
                          )} />
                        ))}
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>

          {isExpanded && (
            <div className="mt-8 flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Eventos del mes</h4>
              <div className="flex flex-col gap-3">
                {allEvents
                  .filter(e => isSameDay(e.date, currentMonth) || (isAfter(e.date, startOfMonth(currentMonth)) && isBefore(e.date, endOfMonth(currentMonth))))
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((e, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/20 border border-border/50">
                      <div className={cn(
                        "w-1 h-8 rounded-full",
                        e.type === 'exam' ? "bg-destructive" : e.type === 'google' ? "bg-secondary" : "bg-primary"
                      )} />
                      <div className="flex-1">
                        <p className="text-xs font-bold">{e.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">
                          {format(e.date, "d 'de' MMMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>

        {!isExpanded && (
          <>
            <section>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[11px] font-black tracking-[0.1em] text-muted-foreground uppercase">ALERTAS</span>
                <AddActivityDialog 
                  userId={userId} 
                  trigger={
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10">
                      <Plus size={16} />
                    </Button>
                  }
                />
              </div>
              
              <div className="flex flex-col gap-4">
                {alerts.length > 0 ? alerts.map(activity => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                    <div className={cn(
                      "w-1 h-8 rounded-full",
                      activity.priority === 'high' ? "bg-destructive" : "bg-orange-500"
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground">{activity.title}</p>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-secondary/10 text-secondary font-black uppercase">
                          {activity.careerId === 'ingles' ? 'Inglés' : 'Medicina'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {format(new Date(activity.dueDate), "eeee d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground italic">No hay alertas de prioridad.</p>
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-black tracking-[0.1em] text-muted-foreground uppercase">NOTIFICACIONES</span>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-4">
                {notifications.length > 0 ? notifications.map(activity => (
                  <div key={activity.id} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {activity.isExam ? 'Examen' : 'Actividad'} pronto: {activity.title} ({activity.careerId === 'ingles' ? 'Inglés' : 'Medicina'})
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">
                        {format(new Date(activity.dueDate), "eeee d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground italic">No hay notificaciones próximas.</p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
