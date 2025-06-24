"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { JSX } from "react";

import { LogResponse, logsApi } from "@/api/logs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import LogCard from "./log-card";

export default function LogViewer(): JSX.Element {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<LogResponse>({
      queryKey: ["logs"],
      queryFn: ({ pageParam }) => logsApi.findAll(pageParam as number),
      getNextPageParam: (lastPage) =>
        lastPage.nextCursor === 0 ? undefined : lastPage.nextCursor,
      initialPageParam: 0,
    });

  return (
    <div className="h-screen w-screen bg-neutral-900">
      <main className="mx-auto flex h-screen w-[min(90%,1000px)] flex-col items-center justify-center bg-neutral-900">
        <div className="flex h-full w-full flex-col p-4">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Personal AI Chatbot</h1>
            <Link href="/">
              <Button
                variant="outline"
                className="text-neutral-400 hover:text-white"
              >
                Back to Chat
              </Button>
            </Link>
          </div>

          <div className="h-[calc(100vh-12rem)] overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="space-y-4">
              {status === "error" && (
                <Card className="bg-neutral-800">
                  <CardHeader className="flex flex-col space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">
                      Error
                    </CardTitle>
                    <div className="text-muted-foreground text-xs">
                      Failed to load logs
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-muted-foreground overflow-x-auto rounded-md bg-neutral-900 p-4 text-sm">
                      Error loading logs. Please try refreshing the page.
                    </div>
                  </CardContent>
                </Card>
              )}

              {status === "pending" && (
                <Card className="bg-neutral-800">
                  <CardHeader className="flex flex-col space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">
                      Loading
                    </CardTitle>
                    <div className="text-muted-foreground text-xs">
                      Fetching logs
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center overflow-x-auto rounded-md bg-neutral-900 p-4 text-sm">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-600 border-t-white"></div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {status === "success" &&
                data.pages.map((page, i) => (
                  <div key={i} className="space-y-4">
                    {page.data.map((log) => (
                      <LogCard key={log.id} log={log} />
                    ))}
                  </div>
                ))}
            </div>
          </div>

          {hasNextPage && (
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="text-neutral-400 hover:text-white"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
