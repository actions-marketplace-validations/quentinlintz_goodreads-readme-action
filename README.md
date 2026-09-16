# Goodreads README Action

Automatically update your profile README with any of your public [Goodreads](https://goodreads.com) shelves!

## Why

This action is for developers who read a lot (like myself). It uses the RSS feed associated with a Goodreads profile to pull shelf data and replaces _part_ of your profile README automatically. It's currently experimental -- see the section below.

## Milestone 0

The goal of this milestone is to update _my_ "Currently Reading" and "Recently Read" profile README sections with linked books, authors, and optional star ratings. Each invocation will handle one shelf and the workflow will commit both sections together after both succeed.

It's important that the surrounding profile README content is preserved when your workflow makes the commit. A valid, empty shelf clears old books. A failed update from an action leaves the section untouched.

For now, I will defer covers, custom templates, and other quality-of-life things that would make this more usable by others. This first milestone will focus on my own preferences.

## Behavior

Here's a selection of RSS examples and their rendered output for a visual of how this action should behave. I'm using part of my [Read](https://www.goodreads.com/review/list_rss/160841838?shelf=read) shelf's RSS response as an example here. These are by default sorted by most recently added first (on top).

### Multiple books

Shelf RSS:

```xml
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <item>
      <title>A Gentleman in Moscow</title>
      <book_id>45695810</book_id>
      <author_name>Amor Towles</author_name>
      <user_rating>3</user_rating>
      <user_read_at><![CDATA[Tue, 1 Sep 2026 00:00:00 +0000]]></user_read_at>
      <user_date_added><![CDATA[Sun, 06 Sep 2026 14:21:57 -0700]]></user_date_added>
    </item>
    <item>
      <title>Great Songwriting Techniques</title>
      <book_id>39704081</book_id>
      <author_name>Jack Perricone</author_name>
      <user_rating></user_rating>
      <user_read_at><![CDATA[Sun, 30 Aug 2026 00:00:00 +0000]]></user_read_at>
      <user_date_added><![CDATA[Sun, 30 Aug 2026 16:33:46 -0700]]></user_date_added>
    </item>
  </channel>
</rss>
```

Profile README:

```markdown
<!-- GOODREADS-LIST:START -->

- [A Gentleman in Moscow](https://www.goodreads.com/book/show/45695810), Amor Towles ★★★☆☆
- [Great Songwriting Techniques](https://www.goodreads.com/book/show/39704081), Jack Perricone

<!-- GOODREADS-LIST:END -->
```

The stars are omitted if the book does not have a user rating or if the user hasn't enabled it. The default ordering is most-recently added at the top.

### Empty shelf

Shelf RSS:

```xml
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
  </channel>
</rss>
```

Profile README:

```markdown
<!-- GOODREADS-LIST:START -->

Shelf is empty
<!-- GOODREADS-LIST:END -->
```

### Bad input

If we make a request with an invalid...

- **user id**: we can expect a `404 Not Found` HTTP response.
- **shelf name**: Goodreads will fall back to the "read" shelf, so we must check the shelf names match somehow.

In either case, this action will report an error and preserve the existing section.
