import dayjs from "dayjs";
import { JSX } from "react";

import { Log } from "@/types/log";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type LogCardProps = {
  log: Log;
};

function getDescription(description: string | null): string {
  if (!description) {
    return "No description provided";
  }

  try {
    return JSON.stringify(JSON.parse(description), undefined, 2);
  } catch {
    return description;
  }
}

export default function LogCard({ log }: LogCardProps): JSX.Element {
  const formattedDate = dayjs(log.createdAt).format("MMM D, YYYY h:mm A");

  const description = getDescription(log.description);

  return (
    <Card key={log.id} className="bg-neutral-800">
      <CardHeader className="flex flex-col space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">
          {log.title}
        </CardTitle>
        <div className="text-muted-foreground text-xs">{formattedDate}</div>
      </CardHeader>
      <CardContent>
        <pre className="text-muted-foreground overflow-x-auto rounded-md bg-neutral-900 p-4 text-sm whitespace-pre-wrap">
          {description}
        </pre>
      </CardContent>
    </Card>
  );
}
