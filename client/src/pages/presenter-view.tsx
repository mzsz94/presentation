import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Users, Copy, ArrowLeft } from "lucide-react";
import type { Session, Slide, Participant } from "@shared/schema";

export default function PresenterView() {
  const [, params] = useRoute("/presenter/:sessionId");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const sessionId = params?.sessionId;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const { data: session } = useQuery<Session>({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId,
  });

  const { data: slides = [] } = useQuery<Slide[]>({
    queryKey: ['/api/sessions', sessionId, 'slides'],
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (session) {
      setCurrentSlide(session.currentSlide);
    }
  }, [session]);

  useEffect(() => {
    if (!sessionId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocket = new WebSocket(`${protocol}//${window.location.host}/ws`);

    websocket.onopen = () => {
      websocket.send(JSON.stringify({
        type: 'join',
        sessionId,
        role: 'presenter',
      }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'participants') {
        setParticipants(data.participants);
      }
      
      if (data.type === 'slideChange') {
        setCurrentSlide(data.slideIndex);
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [sessionId]);

  const handlePrevious = () => {
    if (currentSlide > 0) {
      const newSlide = currentSlide - 1;
      setCurrentSlide(newSlide);
      ws?.send(JSON.stringify({
        type: 'slideChange',
        sessionId,
        slideIndex: newSlide,
      }));
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      const newSlide = currentSlide + 1;
      setCurrentSlide(newSlide);
      ws?.send(JSON.stringify({
        type: 'slideChange',
        sessionId,
        slideIndex: newSlide,
      }));
    }
  };

  const copySessionCode = () => {
    if (session?.code) {
      navigator.clipboard.writeText(session.code);
      toast({
        title: "복사 완료",
        description: "세션 코드가 클립보드에 복사되었습니다",
      });
    }
  };

  if (!session || slides.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-presenter/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">발표자 모드</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="outline" 
                  className="font-mono bg-presenter/10 border-presenter"
                  data-testid="text-session-code"
                >
                  {session.code}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={copySessionCode}
                  data-testid="button-copy-code"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold" data-testid="text-participant-count">
              {participants.length}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-5xl">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-6">
              <img
                src={slides[currentSlide]?.imageUrl}
                alt={`Slide ${currentSlide + 1}`}
                className="w-full h-full object-contain"
                data-testid="image-current-slide"
              />
              <div className="absolute top-4 right-4 backdrop-blur-md bg-black/30 text-white px-3 py-1 rounded-full text-sm">
                {currentSlide + 1} / {slides.length}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSlide === 0}
                className="w-14 h-14 rounded-full"
                data-testid="button-previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <div className="text-center px-4">
                <p className="text-sm text-muted-foreground">슬라이드 {currentSlide + 1}</p>
              </div>
              <Button
                size="lg"
                onClick={handleNext}
                disabled={currentSlide === slides.length - 1}
                className="w-14 h-14 rounded-full bg-presenter hover:bg-presenter/90 text-presenter-foreground"
                data-testid="button-next"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">참여자 목록</h2>
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              아직 참여자가 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <Card key={participant.id} className="p-3" data-testid={`participant-${index}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-participant/20 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{participant.name}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
