import { zodResolver } from "@hookform/resolvers/zod";
import { JSX, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_SYSTEM_PROMPT } from "@/hooks/use-message";

const formSchema = z.object({
  systemPrompt: z.string().min(1, "System prompt is required"),
});

type FormValues = z.infer<typeof formSchema>;

type EditSystemPromptFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (systemPrompt: string) => void;
  systemPrompt: string;
};

export default function EditSystemPromptForm({
  isOpen,
  onClose,
  onSubmit,
  systemPrompt,
}: EditSystemPromptFormProps): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt,
    },
  });

  const handleSubmit = (values: FormValues): void => {
    setIsSubmitting(true);

    try {
      onSubmit(values.systemPrompt.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit System Prompt</DialogTitle>
              <DialogDescription>
                Modify the system prompt that guides the AI's behavior.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Enter system prompt..."
                        className="min-h-[200px]"
                        {...field}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  form.reset({
                    systemPrompt: DEFAULT_SYSTEM_PROMPT,
                  });
                }}
                disabled={isSubmitting}
              >
                Reset to default
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
