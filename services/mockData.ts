import { Venue, Event, UserRole, Notification } from '../types';

export const VENUES: Venue[] = [
  {
    id: 'v1',
    name: 'Grand Auditorium',
    capacity: 500,
    features: ['Projector', 'Sound System', 'Stage', 'AC'],
    image: 'https://picsum.photos/800/400?random=1'
  },
  {
    id: 'v2',
    name: 'Conference Hall A',
    capacity: 100,
    features: ['Projector', 'Whiteboard', 'Video Conf'],
    image: 'https://picsum.photos/800/400?random=2'
  },
  {
    id: 'v3',
    name: 'Innovation Lab',
    capacity: 50,
    features: ['Computers', '3D Printers', 'Smartboard'],
    image: 'https://picsum.photos/800/400?random=3'
  },
  {
    id: 'v4',
    name: 'Open Air Amphitheater',
    capacity: 1000,
    features: ['Outdoor', 'Stage', 'Lighting'],
    image: 'https://picsum.photos/800/400?random=4'
  }
];

// Initial seed data
const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'Annual Tech Symposium',
    organizer: 'John Doe',
    department: 'Computer Science',
    venueId: 'v1',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    description: 'A gathering of tech enthusiasts.',
    status: 'APPROVED',
    report: {
        attendance: 450,
        summary: "Great turnout, minor technical glitch with sound.",
        photos: [],
        submittedAt: new Date().toISOString(),
        status: 'APPROVED'
    }
  },
  {
    id: 'e2',
    title: 'Faculty Meeting',
    organizer: 'Dr. Smith',
    department: 'Administration',
    venueId: 'v2',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    startTime: '10:00',
    endTime: '12:00',
    description: 'Monthly review.',
    status: 'PENDING_HOD'
  }
];

// Simple in-memory storage simulation
class MockService {
  private events: Event[] = [...INITIAL_EVENTS];
  private notifications: Notification[] = [
    {
        id: 'n1',
        userId: 'Current User',
        message: 'Welcome to HelixFlow! Check your dashboard for updates.',
        type: 'INFO',
        read: false,
        createdAt: new Date().toISOString()
    }
  ];

  getVenues(): Venue[] {
    return VENUES;
  }

  getEvents(): Event[] {
    return this.events;
  }

  addEvent(event: Event): void {
    this.events.push(event);
  }

  updateEventStatus(eventId: string, status: Event['status']): void {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.status = status;
      
      // Notify Organizer
      this.addNotification({
          userId: event.organizer,
          message: `Your event "${event.title}" has been updated to: ${status.replace('PENDING_', 'Pending ').replace('_', ' ')}`,
          type: status === 'APPROVED' || status === 'COMPLETED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'INFO'
      });
    }
  }

  submitReport(eventId: string, report: any): void {
     const event = this.events.find(e => e.id === eventId);
     if(event) {
         event.report = {
             ...report,
             submittedAt: new Date().toISOString(),
             status: 'PENDING_REVIEW'
         };
         event.status = 'COMPLETED';
         
         this.addNotification({
             userId: event.organizer,
             message: `Report submitted for "${event.title}". Pending admin review.`,
             type: 'SUCCESS'
         });
     }
  }

  checkConflict(venueId: string, date: string, start: string, end: string): boolean {
    return this.events.some(e => {
      if (e.venueId !== venueId || e.date !== date || e.status === 'REJECTED') return false;
      // Check overlapping time ranges
      // (StartA <= EndB) and (EndA >= StartB)
      return (start < e.endTime) && (end > e.startTime);
    });
  }

  // Notification Methods
  getNotifications(userId: string): Notification[] {
      return this.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addNotification(n: Omit<Notification, 'id' | 'read' | 'createdAt'>): void {
      this.notifications.unshift({
          id: Math.random().toString(36).substr(2, 9),
          read: false,
          createdAt: new Date().toISOString(),
          ...n
      });
  }

  markAllRead(userId: string): void {
      this.notifications.forEach(n => {
          if (n.userId === userId) n.read = true;
      });
  }
}

export const mockService = new MockService();