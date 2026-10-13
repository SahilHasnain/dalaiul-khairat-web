import content from "@/data/dalail-content.json";

export async function GET() {
  return Response.json(content);
}
