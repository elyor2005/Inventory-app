import { NextRequest } from "next/server";
import enMessages from "@/messages/en.json";
import uzMessages from "@/messages/uz.json";

const messages: Record<string, any> = {
  en: enMessages,
  uz: uzMessages,
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const data = messages[locale] || messages.en;

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600, immutable",
    },
  });
}
