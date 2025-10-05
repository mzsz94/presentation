import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import { storage } from "./storage";
import { insertSessionSchema, insertParticipantSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface WebSocketClient extends WebSocket {
  sessionId?: string;
  role?: 'presenter' | 'participant';
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const sessionClients = new Map<string, Set<WebSocketClient>>();

  wss.on('connection', (ws: WebSocketClient) => {
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'join') {
          ws.sessionId = data.sessionId;
          ws.role = data.role;

          if (!sessionClients.has(data.sessionId)) {
            sessionClients.set(data.sessionId, new Set());
          }
          sessionClients.get(data.sessionId)!.add(ws);

          // Get current session state
          const session = await storage.getSession(data.sessionId);
          
          // Send current slide to joining client
          if (session) {
            ws.send(JSON.stringify({
              type: 'slideChange',
              slideIndex: session.currentSlide,
            }));
          }

          // Send current participants to presenter
          if (data.role === 'presenter') {
            const participants = await storage.getParticipantsBySession(data.sessionId);
            ws.send(JSON.stringify({
              type: 'participants',
              participants,
            }));
          }

          // Notify presenter of new participant
          if (data.role === 'participant') {
            const participants = await storage.getParticipantsBySession(data.sessionId);
            const clients = sessionClients.get(data.sessionId);
            if (clients) {
              clients.forEach((client) => {
                if (client.role === 'presenter' && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'participants',
                    participants,
                  }));
                }
              });
            }
          }
        }

        if (data.type === 'slideChange') {
          await storage.updateSessionSlide(data.sessionId, data.slideIndex);

          const clients = sessionClients.get(data.sessionId);
          if (clients) {
            clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'slideChange',
                  slideIndex: data.slideIndex,
                }));
              }
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (ws.sessionId) {
        const clients = sessionClients.get(ws.sessionId);
        if (clients) {
          clients.delete(ws);
          if (clients.size === 0) {
            sessionClients.delete(ws.sessionId);
          }
        }
      }
    });
  });

  // Create session with slides
  app.post('/api/sessions', upload.array('slides'), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No slides uploaded' });
      }

      const code = generateSessionCode();
      const presenterId = 'presenter-' + Date.now();

      const session = await storage.createSession({
        code,
        presenterId,
        currentSlide: 0,
      });

      // Save slides as base64 data URLs
      const orders = req.body.orders ? JSON.parse(`[${req.body.orders}]`) : [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = file.buffer.toString('base64');
        const imageUrl = `data:${file.mimetype};base64,${base64}`;
        
        await storage.createSlide({
          sessionId: session.id,
          imageUrl,
          order: orders[i] || i,
        });
      }

      res.json({
        sessionId: session.id,
        code: session.code,
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ message: 'Failed to create session' });
    }
  });

  // Join session
  app.post('/api/sessions/join', async (req, res) => {
    try {
      const { code, name } = req.body;
      
      if (!code || !name) {
        return res.status(400).json({ message: 'Code and name are required' });
      }

      const session = await storage.getSessionByCode(code);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      await storage.addParticipant({
        sessionId: session.id,
        name,
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error('Join session error:', error);
      res.status(500).json({ message: 'Failed to join session' });
    }
  });

  // Get session
  app.get('/api/sessions/:id', async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get session' });
    }
  });

  // Get slides
  app.get('/api/sessions/:id/slides', async (req, res) => {
    try {
      const slides = await storage.getSlidesBySession(req.params.id);
      res.json(slides);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get slides' });
    }
  });

  return httpServer;
}
