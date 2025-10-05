import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function JoinSessionPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const joinSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest<{ sessionId: string }>(
        'POST',
        '/api/sessions/join',
        { code: code.toUpperCase(), name }
      );
    },
    onSuccess: (data) => {
      setLocation(`/participant/${data.sessionId}`);
    },
    onError: () => {
      toast({
        title: "세션 참가 실패",
        description: "세션 코드를 확인해주세요",
        variant: "destructive",
      });
    },
  });

  const handleJoin = () => {
    if (!code || code.length !== 6) {
      toast({
        title: "세션 코드를 입력해주세요",
        description: "6자리 코드를 입력하세요",
        variant: "destructive",
      });
      return;
    }
    if (!name.trim()) {
      toast({
        title: "이름을 입력해주세요",
        variant: "destructive",
      });
      return;
    }
    joinSessionMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">세션 참가</h1>
        </div>
      </header>

      <main className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>프레젠테이션 참가</CardTitle>
            <CardDescription>
              발표자로부터 받은 세션 코드를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">세션 코드</Label>
              <Input
                id="code"
                type="text"
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-wider"
                data-testid="input-code"
              />
              <p className="text-xs text-muted-foreground text-center">
                6자리 코드를 입력하세요
              </p>
            </div>

            <Button
              onClick={handleJoin}
              disabled={joinSessionMutation.isPending}
              className="w-full bg-participant hover:bg-participant/90 text-participant-foreground"
              size="lg"
              data-testid="button-join"
            >
              {joinSessionMutation.isPending ? "참가 중..." : "참가하기"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
