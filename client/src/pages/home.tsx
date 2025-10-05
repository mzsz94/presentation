import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Presentation, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">실시간 프레젠테이션</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              슬라이드를 실시간으로 공유하세요
            </h2>
            <p className="text-lg text-muted-foreground">
              프로젝터 없이도 참여자들과 프레젠테이션을 동기화할 수 있습니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-presenter/10 flex items-center justify-center mb-4">
                  <Presentation className="w-6 h-6 text-presenter" />
                </div>
                <CardTitle>발표자로 시작</CardTitle>
                <CardDescription>
                  슬라이드를 업로드하고 세션을 생성하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/create">
                  <Button 
                    className="w-full bg-presenter hover:bg-presenter/90 text-presenter-foreground" 
                    size="lg"
                    data-testid="button-create-session"
                  >
                    세션 생성하기
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-participant/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-participant" />
                </div>
                <CardTitle>참여자로 입장</CardTitle>
                <CardDescription>
                  세션 코드를 입력하여 프레젠테이션에 참여하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/join">
                  <Button 
                    className="w-full bg-participant hover:bg-participant/90 text-participant-foreground" 
                    size="lg"
                    data-testid="button-join-session"
                  >
                    세션 참가하기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
