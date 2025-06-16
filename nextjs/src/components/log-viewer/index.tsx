"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Link from "next/link";
import { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Log } from "@/types/log";

type LogResponse = {
  data: Log[];
  nextCursor: number;
};

async function fetchLogs(cursor = 0): Promise<LogResponse> {
  const response = await fetch(
    `http://localhost:80/api/go/logs?cursor=${cursor}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch logs");
  }
  return response.json();
}

export default function LogViewer(): JSX.Element {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<LogResponse>({
      queryKey: ["logs"],
      queryFn: ({ pageParam }) => fetchLogs(pageParam as number),
      getNextPageParam: (lastPage) =>
        lastPage.nextCursor === 0 ? undefined : lastPage.nextCursor,
      initialPageParam: 0,
    });

  return (
    <div className="flex h-screen bg-neutral-900">
      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex h-full w-[90%] flex-col p-4 lg:w-[60%]">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">LocalGPT</h1>
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
                  <CardContent>
                    <div className="text-muted-foreground text-center">
                      Error loading logs
                    </div>
                  </CardContent>
                </Card>
              )}

              {status === "pending" && (
                <Card className="bg-neutral-800">
                  <CardContent>
                    <div className="text-muted-foreground text-center">
                      Loading...
                    </div>
                  </CardContent>
                </Card>
              )}

              {status === "success" &&
                data.pages.map((page, i) => (
                  <div key={i} className="space-y-4">
                    {page.data.map((log) => (
                      <Card key={log.id} className="bg-neutral-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-white">
                            {log.title}
                          </CardTitle>
                          <div className="text-muted-foreground text-xs">
                            {dayjs(log.createdAt).format("MMM D, YYYY h:mm A")}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-muted-foreground overflow-x-auto rounded-md bg-neutral-900 p-4 text-sm whitespace-pre-wrap">
                            {log.description
                              ? JSON.stringify(
                                  JSON.parse(log.description),
                                  undefined,
                                  2,
                                )
                              : "No description provided"}
                          </pre>
                        </CardContent>
                      </Card>
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
