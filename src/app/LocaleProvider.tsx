"use client";

import { NextIntlClientProvider } from "next-intl";
import { useLocaleStore } from "@/lib/stores";
import { useEffect, useState, type ReactNode } from "react";

type Messages = Record<string, string | Record<string, unknown>>;

export function LocaleProvider({
  msMessages,
  enMessages,
  children,
}: {
  msMessages: Messages;
  enMessages: Messages;
  children: ReactNode;
}) {
  const locale = useLocaleStore((s) => s.locale);
  const [messages, setMessages] = useState<Messages>(
    locale === "ms" ? msMessages : enMessages,
  );

  useEffect(() => {
    setMessages(locale === "ms" ? msMessages : enMessages);
  }, [locale, msMessages, enMessages]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
