import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Dumbbell, GraduationCap, HelpCircle } from "lucide-react";
import { JSX, useEffect, useState } from "react";
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

const TEACHER_SYSTEM_PROMPT = `You are a knowledgeable and patient teacher. Your role is to guide and educate, never to write code directly. Instead, you should:
- Explain concepts clearly and thoroughly
- Break down complex topics into digestible parts
- Ask thought-provoking questions to encourage learning
- Provide examples and analogies to illustrate points
- Guide users to discover solutions themselves
- Offer constructive feedback and encouragement
- Share relevant resources and references when appropriate

Your goal is to help users develop their understanding and problem-solving skills.`;

const COACH_SYSTEM_PROMPT = `You are an encouraging and motivational coach. Your role is to:
- Provide positive reinforcement and encouragement
- Help users set and achieve their goals
- Offer practical advice and strategies
- Share motivational insights and perspectives
- Guide users through challenges with confidence
- Celebrate progress and achievements
- Help users develop resilience and perseverance

Your goal is to inspire and support users in their journey to success.`;

const formSchema = z.object({
  systemPrompt: z.string().min(1, "System prompt is required"),
});

type FormValues = z.infer<typeof formSchema>;

type Persona = "default" | "teacher" | "coach" | "custom";

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
  const [selectedPersona, setSelectedPersona] = useState<Persona>(() => {
    if (systemPrompt === DEFAULT_SYSTEM_PROMPT) {
      return "default";
    }
    if (systemPrompt === TEACHER_SYSTEM_PROMPT) {
      return "teacher";
    }
    if (systemPrompt === COACH_SYSTEM_PROMPT) {
      return "coach";
    }
    return "custom";
  });

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
      form.reset({ systemPrompt: values.systemPrompt.trim() });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePersonaSelect = (persona: Persona): void => {
    setSelectedPersona(persona);
    switch (persona) {
      case "default": {
        form.setValue("systemPrompt", DEFAULT_SYSTEM_PROMPT, {
          shouldDirty: true,
        });
        break;
      }
      case "teacher": {
        form.setValue("systemPrompt", TEACHER_SYSTEM_PROMPT, {
          shouldDirty: true,
        });
        break;
      }
      case "coach": {
        form.setValue("systemPrompt", COACH_SYSTEM_PROMPT, {
          shouldDirty: true,
        });
        break;
      }
      case "custom": {
        form.setValue("systemPrompt", "", { shouldDirty: true });
        break;
      }
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({ systemPrompt });
    }
  }, [isOpen, form, systemPrompt]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[75vw] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit System Prompt</DialogTitle>
              <DialogDescription>
                Choose a persona or customize the system prompt that guides the
                AI's behavior.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center gap-4 py-4">
              <Button
                type="button"
                variant={
                  selectedPersona === "default" ? "default" : "secondary"
                }
                size="icon"
                className="h-16 w-16 flex-col gap-2 rounded-full"
                onClick={() => handlePersonaSelect("default")}
              >
                <Bot className="h-6 w-6" />
                <span className="text-xs">Default</span>
              </Button>
              <Button
                type="button"
                variant={
                  selectedPersona === "teacher" ? "default" : "secondary"
                }
                size="icon"
                className="h-16 w-16 flex-col gap-2 rounded-full"
                onClick={() => handlePersonaSelect("teacher")}
              >
                <GraduationCap className="h-6 w-6" />
                <span className="text-xs">Teacher</span>
              </Button>
              <Button
                type="button"
                variant={selectedPersona === "coach" ? "default" : "secondary"}
                size="icon"
                className="h-16 w-16 flex-col gap-2 rounded-full"
                onClick={() => handlePersonaSelect("coach")}
              >
                <Dumbbell className="h-6 w-6" />
                <span className="text-xs">Coach</span>
              </Button>
              <Button
                type="button"
                variant={selectedPersona === "custom" ? "default" : "secondary"}
                size="icon"
                className="h-16 w-16 flex-col gap-2 rounded-full"
                onClick={() => handlePersonaSelect("custom")}
              >
                <HelpCircle className="h-6 w-6" />
                <span className="text-xs">Custom</span>
              </Button>
            </div>

            <div className="py-4">
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Enter system prompt..."
                        className="max-h-[200px] min-h-[120px] overflow-y-auto"
                        {...field}
                        autoFocus
                        disabled={selectedPersona !== "custom"}
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
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isDirty}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
