"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;

  action?: "INSERT_REPLY" | null;
};

export function HelpDeskAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your Help Desk Assistant. How can I help you?",
    },
  ]);

  const [pending, setPending] = useState(false);
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, pending]);

  function insertReply(content: string) {
    window.dispatchEvent(
      new CustomEvent("helpdesk:insert-reply", {
        detail: {
          content,
        },
      }),
    );

    /*
     * Close the chatbot so the agent can immediately see and review the populated reply form.
     */
    setIsOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();

    if (!content || pending) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    setInput("");
    setPending(true);

    try {
      /*
       * Do not send the local welcome message
       * to the AI. It does not contain useful
       * conversation context.
       *
       * Also limit conversation history so
       * requests remain lightweight.
       */
      const conversation = updatedMessages
        .filter((message) => message.id !== "welcome")
        .slice(-12)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const response = await fetch("/api/ai/help-desk-assistant", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          messages: conversation,
          pathname,
        }),
      });

      const data = (await response.json()) as {
        reply?: string;

        action?: "INSERT_REPLY" | null;

        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error ?? "Unable to get a response.");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        action: data.action ?? null,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",

        content:
          error instanceof Error
            ? error.message
            : "The Help Desk Assistant is temporarily unavailable.",
      };

      setMessages((current) => [...current, assistantMessage]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Help Desk Assistant"
          className="fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none sm:right-6 sm:bottom-6 sm:size-15"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a10.5 10.5 0 0 1-4.42-.96L3 20l1.18-3.54A7.36 7.36 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"
            />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <section
          aria-label="Help Desk Assistant"
          className="fixed right-4 bottom-4 z-50 flex h-[min(620px,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-95 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:right-6 sm:bottom-6 sm:h-150"
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                  <span className="text-sm">✦</span>
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-gray-900">
                    Help Desk Assistant
                  </h2>

                  <p className="text-[11px] text-gray-500">AI-powered support</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Help Desk Assistant"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-5"
              >
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-md bg-slate-900 px-3.5 py-2.5 text-xs leading-5 text-white sm:text-sm"
                        : "max-w-[85%] rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2.5 text-xs leading-5 text-gray-700 sm:text-sm"
                    }
                  >
                    <p className="wrap-break-word whitespace-pre-wrap">{message.content}</p>
                    {message.role === "assistant" && message.action === "INSERT_REPLY" && (
                      <button
                        type="button"
                        onClick={() => insertReply(message.content)}
                        className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-slate-50 sm:text-sm"
                      >
                        Insert into Reply Box
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {pending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
                    <div className="flex gap-1">
                      <span className="size-1.5 rounded-full bg-gray-400" />
                      <span className="size-1.5 rounded-full bg-gray-400" />
                      <span className="size-1.5 rounded-full bg-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="shrink-0 border-t border-gray-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={1}
                maxLength={2000}
                placeholder="Ask about your help desk..."
                className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-xs text-black transition outline-none placeholder:text-gray-400 focus:border-slate-600 sm:text-sm"
              />

              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send message"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 14-7-4 14-3-6-7-1Z" />
                </svg>
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] leading-4 text-gray-400">
              AI responses may be inaccurate. Review important information before acting.
            </p>
          </form>
        </section>
      )}
    </>
  );
}
