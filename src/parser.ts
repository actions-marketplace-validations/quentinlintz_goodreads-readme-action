import { z } from "zod";
import { XMLParser } from "fast-xml-parser";
import { SyntaxValidator } from "fast-xml-validator";

export const bookSchema = z.object({
  title: z.string().min(1),
  book_id: z.number().int().min(1),
  author_name: z.string().min(1),
  user_rating: z.number().int().min(0).max(5),
  user_read_at: z.string().optional(),
  user_date_added: z.string().optional(),
});
export type Book = z.infer<typeof bookSchema>;

const rssSchema = z.object({
  rss: z.object({
    channel: z.object({
      item: bookSchema,
    }),
  }),
});

export const parseXml = (xml: string): Book => {
  SyntaxValidator.validate(xml);
  const parser = new XMLParser();
  const parsedXml = parser.parse(xml) as unknown;
  const rssData = rssSchema.parse(parsedXml);
  return rssData.rss.channel.item;
};
