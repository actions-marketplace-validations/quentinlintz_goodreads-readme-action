import { z } from "zod";
import { XMLParser } from "fast-xml-parser";

export const BookSchema = z.object({
  title: z.string().min(1),
  book_id: z.number().int().min(1),
  author_name: z.string().min(1),
  user_rating: z.number().int().min(0).max(5),
  user_read_at: z.string().optional(),
  user_date_added: z.string().optional(),
});
export type Book = z.infer<typeof BookSchema>;

const RSSDataSchema = z.object({
  rss: z.object({
    channel: z.object({
      item: BookSchema,
    }),
  }),
});

export const parseXml = (xml: string): Book => {
  const parser = new XMLParser();
  const parsedXml = parser.parse(xml) as unknown;
  const rssData = RSSDataSchema.parse(parsedXml);
  return rssData.rss.channel.item;
};
