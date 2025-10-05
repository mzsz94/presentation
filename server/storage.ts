import { 
  type Session, 
  type InsertSession,
  type Slide,
  type InsertSlide,
  type Participant,
  type InsertParticipant
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Session methods
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getSessionByCode(code: string): Promise<Session | undefined>;
  updateSessionSlide(id: string, slideIndex: number): Promise<void>;

  // Slide methods
  createSlide(slide: InsertSlide): Promise<Slide>;
  getSlidesBySession(sessionId: string): Promise<Slide[]>;

  // Participant methods
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipantsBySession(sessionId: string): Promise<Participant[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private slides: Map<string, Slide>;
  private participants: Map<string, Participant>;

  constructor() {
    this.sessions = new Map();
    this.slides = new Map();
    this.participants = new Map();
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionByCode(code: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(
      (session) => session.code === code
    );
  }

  async updateSessionSlide(id: string, slideIndex: number): Promise<void> {
    const session = this.sessions.get(id);
    if (session) {
      session.currentSlide = slideIndex;
      this.sessions.set(id, session);
    }
  }

  async createSlide(insertSlide: InsertSlide): Promise<Slide> {
    const id = randomUUID();
    const slide: Slide = {
      ...insertSlide,
      id,
    };
    this.slides.set(id, slide);
    return slide;
  }

  async getSlidesBySession(sessionId: string): Promise<Slide[]> {
    return Array.from(this.slides.values())
      .filter((slide) => slide.sessionId === sessionId)
      .sort((a, b) => a.order - b.order);
  }

  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = randomUUID();
    const participant: Participant = {
      ...insertParticipant,
      id,
      joinedAt: new Date(),
    };
    this.participants.set(id, participant);
    return participant;
  }

  async getParticipantsBySession(sessionId: string): Promise<Participant[]> {
    return Array.from(this.participants.values())
      .filter((participant) => participant.sessionId === sessionId)
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
  }
}

export const storage = new MemStorage();
